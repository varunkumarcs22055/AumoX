import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import {
  clientsDb,
  invoicesDb,
  paymentsDb,
  notificationsDb,
  newId,
  invoiceTotal,
  type Payment,
} from "@/lib/admin/db";
import { verifyClientToken, CLIENT_COOKIE } from "@/lib/admin/auth";
import { verifySignature, fetchPayment } from "@/lib/admin/razorpay";
import { sendPaymentReceipt } from "@/lib/admin/email";
import { logActorAction } from "@/lib/admin/audit";

/**
 * Confirm a Razorpay payment. Verifies the signature (proves it really came
 * from Razorpay and matches our order), then records it in the same ledger the
 * admin uses, flips the invoice to paid when settled, notifies the team and
 * emails the client a receipt. Idempotent on the Razorpay payment id.
 */
export async function POST(req: Request) {
  const c = await cookies();
  const r = await verifyClientToken(c.get(CLIENT_COOKIE)?.value);
  if (!r.ok) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const client = await clientsDb.findById(r.clientId);
  if (!client || !client.active) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = (await req.json()) as {
    invoiceId?: string;
    razorpay_order_id?: string;
    razorpay_payment_id?: string;
    razorpay_signature?: string;
  };

  if (!verifySignature(body.razorpay_order_id || "", body.razorpay_payment_id || "", body.razorpay_signature || "")) {
    return NextResponse.json({ error: "Payment could not be verified." }, { status: 400 });
  }

  const invoices = await invoicesDb.list();
  const inv = invoices.find((i) => i.id === body.invoiceId && i.clientId === client.id && i.status !== "draft");
  if (!inv) return NextResponse.json({ error: "Invoice not found" }, { status: 404 });

  // Idempotency — if we already recorded this Razorpay payment, just succeed.
  const existing = await paymentsDb.listByInvoice(inv.id);
  if (existing.some((p) => p.reference === body.razorpay_payment_id)) {
    return NextResponse.json({ ok: true, status: inv.status, already: true });
  }

  // Trust the server-fetched amount, not anything from the browser.
  let amount = 0;
  try {
    const pay = await fetchPayment(body.razorpay_payment_id!);
    if (!["captured", "authorized"].includes(pay.status)) {
      return NextResponse.json({ error: "Payment not completed." }, { status: 400 });
    }
    amount = Math.round(pay.amount) / 100;
  } catch (e) {
    console.error("[pay/verify] fetch", e);
    return NextResponse.json({ error: "Could not confirm the payment with Razorpay." }, { status: 502 });
  }

  const payment: Payment = {
    id: newId(),
    invoiceId: inv.id,
    clientId: client.id,
    date: new Date().toISOString().slice(0, 10),
    amount,
    currency: inv.currency,
    method: "Razorpay",
    reference: body.razorpay_payment_id,
  };
  await paymentsDb.upsert(payment);

  const paidSoFar = (await paymentsDb.listByInvoice(inv.id)).reduce((s, p) => s + p.amount, 0);
  const settled = paidSoFar >= invoiceTotal(inv) - 0.01 && inv.status !== "paid";
  if (settled) await invoicesDb.upsert({ ...inv, status: "paid" });

  await notificationsDb.push({
    audience: "admin",
    type: "payment",
    message: `${client.company} paid ${payment.currency} ${amount.toLocaleString()} online for ${inv.number}${settled ? " — now PAID" : ""}`,
    link: "/admin/finance",
  });
  await logActorAction("client", client.company, "payment", "payment", `${client.company} paid ${payment.currency} ${amount.toLocaleString()} via Razorpay for ${inv.number}`);
  await sendPaymentReceipt({ company: client.company, email: client.email }, { currency: payment.currency, amount, method: "Razorpay" }, inv.number);

  return NextResponse.json({ ok: true, status: settled ? "paid" : inv.status, amount });
}
