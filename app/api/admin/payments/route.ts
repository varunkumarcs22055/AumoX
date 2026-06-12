import { NextResponse } from "next/server";
import {
  paymentsDb,
  invoicesDb,
  clientsDb,
  notificationsDb,
  invoiceTotal,
  newId,
  type Payment,
} from "@/lib/admin/db";
import { requireAdmin } from "@/lib/admin/guard";

async function isAuthed() {
  return (await requireAdmin()).ok;
}

/** Finance ledger: invoices + payments + computed totals. */
export async function GET() {
  if (!(await isAuthed())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const [invoices, payments, clients] = await Promise.all([
    invoicesDb.list(),
    paymentsDb.list(),
    clientsDb.list(),
  ]);
  const issued = invoices.filter((i) => i.status !== "draft");
  const billed = issued.reduce((s, i) => s + invoiceTotal(i), 0);
  const collected = payments.reduce((s, p) => s + p.amount, 0);
  return NextResponse.json({
    invoices,
    payments,
    clients: clients.map((c) => ({ id: c.id, company: c.company })),
    totals: { billed, collected, outstanding: Math.max(0, billed - collected) },
  });
}

/** Record a payment against an invoice; auto-marks the invoice paid when settled. */
export async function POST(req: Request) {
  if (!(await isAuthed())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = (await req.json()) as Partial<Payment>;
  if (!body.invoiceId || !body.amount || body.amount <= 0) {
    return NextResponse.json({ error: "Invoice and a positive amount are required" }, { status: 400 });
  }
  const invoices = await invoicesDb.list();
  const invoice = invoices.find((i) => i.id === body.invoiceId);
  if (!invoice) return NextResponse.json({ error: "Invoice not found" }, { status: 404 });

  const payment: Payment = {
    id: newId(),
    invoiceId: invoice.id,
    clientId: invoice.clientId,
    date: body.date || new Date().toISOString().slice(0, 10),
    amount: Math.round(Number(body.amount) * 100) / 100,
    currency: invoice.currency,
    method: (body.method || "Bank transfer").slice(0, 40),
    reference: body.reference?.slice(0, 120),
  };
  await paymentsDb.upsert(payment);

  // Ledger logic: paid in full → invoice flips to paid
  const paidSoFar = (await paymentsDb.listByInvoice(invoice.id)).reduce((s, p) => s + p.amount, 0);
  if (paidSoFar >= invoiceTotal(invoice) - 0.01 && invoice.status !== "paid") {
    await invoicesDb.upsert({ ...invoice, status: "paid" });
  }
  await notificationsDb.push({
    audience: `client:${invoice.clientId}`,
    type: "payment",
    message: `Payment of ${payment.currency} ${payment.amount.toLocaleString()} recorded for ${invoice.number}`,
    link: "/portal",
  });
  return NextResponse.json({ payment });
}

export async function DELETE(req: Request) {
  if (!(await isAuthed())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = (await req.json()) as { id?: string };
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });
  await paymentsDb.remove(id);
  return NextResponse.json({ ok: true });
}
