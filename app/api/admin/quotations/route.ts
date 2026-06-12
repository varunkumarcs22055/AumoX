import { NextResponse } from "next/server";
import {
  quotationsDb,
  invoicesDb,
  clientsDb,
  notificationsDb,
  settingsDb,
  nextDocNumber,
  newId,
  quotationTotal,
  type Quotation,
  type QuotationStatus,
  type InvoiceItem,
} from "@/lib/admin/db";
import { requireAdmin } from "@/lib/admin/guard";

async function isAuthed() {
  return (await requireAdmin()).ok;
}

const STATUSES: QuotationStatus[] = ["draft", "sent", "accepted", "declined", "expired"];

function sanitizeItems(input: unknown): InvoiceItem[] {
  if (!Array.isArray(input)) return [];
  return input
    .filter((it): it is InvoiceItem => !!it && typeof it.description === "string")
    .map((it) => ({
      description: it.description.slice(0, 200),
      qty: Math.max(0, Number(it.qty) || 0),
      rate: Math.max(0, Number(it.rate) || 0),
    }))
    .filter((it) => it.description.trim().length > 0);
}

export async function GET() {
  if (!(await isAuthed())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const [quotations, clients] = await Promise.all([quotationsDb.list(), clientsDb.list()]);
  return NextResponse.json({
    quotations,
    clients: clients.map((c) => ({ id: c.id, company: c.company })),
  });
}

export async function POST(req: Request) {
  if (!(await isAuthed())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = (await req.json()) as Partial<Quotation> & { convertToInvoice?: boolean };

  // ----- One-click convert: accepted quotation → invoice (copies data) -----
  if (body.id && body.convertToInvoice) {
    const all = await quotationsDb.list();
    const q = all.find((x) => x.id === body.id);
    if (!q) return NextResponse.json({ error: "Quotation not found" }, { status: 404 });
    if (q.invoiceId) return NextResponse.json({ error: "Already converted" }, { status: 400 });
    const settings = await settingsDb.get();
    const due = new Date();
    due.setDate(due.getDate() + settings.dueDays);
    const invoice = {
      id: newId(),
      number: await nextDocNumber("IN"),
      clientId: q.clientId,
      issueDate: new Date().toISOString().slice(0, 10),
      dueDate: due.toISOString().slice(0, 10),
      currency: q.currency,
      // Discount is baked into the copied line rates so the invoice matches the quote
      items:
        (q.discountPercent || 0) > 0
          ? q.items.map((it) => ({
              ...it,
              rate: Math.round(it.rate * (1 - (q.discountPercent || 0) / 100) * 100) / 100,
            }))
          : q.items,
      taxPercent: q.taxPercent,
      notes: q.terms || settings.terms,
      status: "sent" as const,
    };
    await invoicesDb.upsert(invoice);
    await quotationsDb.upsert({ ...q, invoiceId: invoice.id });
    await notificationsDb.push({
      audience: `client:${q.clientId}`,
      type: "invoice",
      message: `Invoice ${invoice.number} has been issued from quotation ${q.number}`,
      link: "/portal",
    });
    return NextResponse.json({ invoice, quotation: { ...q, invoiceId: invoice.id } });
  }

  // ----- Update existing -----
  if (body.id) {
    const all = await quotationsDb.list();
    const existing = all.find((x) => x.id === body.id);
    if (!existing) return NextResponse.json({ error: "Quotation not found" }, { status: 404 });
    const updated: Quotation = {
      ...existing,
      ...(body.items ? { items: sanitizeItems(body.items) } : {}),
      ...(body.status && STATUSES.includes(body.status) ? { status: body.status } : {}),
      ...(body.validUntil !== undefined ? { validUntil: body.validUntil } : {}),
      ...(body.taxPercent !== undefined ? { taxPercent: Math.max(0, Number(body.taxPercent) || 0) } : {}),
      ...(body.discountPercent !== undefined
        ? { discountPercent: Math.min(100, Math.max(0, Number(body.discountPercent) || 0)) }
        : {}),
      ...(body.terms !== undefined ? { terms: String(body.terms).slice(0, 1000) } : {}),
      ...(body.projectName !== undefined ? { projectName: String(body.projectName).slice(0, 120) } : {}),
    };
    await quotationsDb.upsert(updated);
    if (body.status === "sent" && existing.status === "draft") {
      await notificationsDb.push({
        audience: `client:${updated.clientId}`,
        type: "quotation",
        message: `New quotation ${updated.number} is awaiting your review`,
        link: "/portal",
      });
    }
    return NextResponse.json({ quotation: updated });
  }

  // ----- Create -----
  if (!body.clientId) return NextResponse.json({ error: "Client is required" }, { status: 400 });
  const client = await clientsDb.findById(body.clientId);
  if (!client) return NextResponse.json({ error: "Client not found" }, { status: 400 });
  const items = sanitizeItems(body.items);
  if (items.length === 0) {
    return NextResponse.json({ error: "At least one line item is required" }, { status: 400 });
  }
  const settings = await settingsDb.get();
  const quotation: Quotation = {
    id: newId(),
    number: await nextDocNumber("QT"),
    clientId: body.clientId,
    projectName: body.projectName ? String(body.projectName).slice(0, 120) : undefined,
    issueDate: new Date().toISOString().slice(0, 10),
    validUntil: body.validUntil || undefined,
    currency: (body.currency || "INR").slice(0, 8),
    items,
    taxPercent: body.taxPercent !== undefined ? Math.max(0, Number(body.taxPercent) || 0) : settings.gstDefault,
    discountPercent: Math.min(100, Math.max(0, Number(body.discountPercent) || 0)),
    terms: body.terms ? String(body.terms).slice(0, 1000) : settings.terms,
    status: "sent",
  };
  await quotationsDb.upsert(quotation);
  await notificationsDb.push({
    audience: `client:${quotation.clientId}`,
    type: "quotation",
    message: `New quotation ${quotation.number} (${quotation.currency} ${quotationTotal(quotation).toLocaleString()}) is awaiting your review`,
    link: "/portal",
  });
  return NextResponse.json({ quotation });
}

export async function DELETE(req: Request) {
  if (!(await isAuthed())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = (await req.json()) as { id?: string };
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });
  await quotationsDb.remove(id);
  return NextResponse.json({ ok: true });
}
