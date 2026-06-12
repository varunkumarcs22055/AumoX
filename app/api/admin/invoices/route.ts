import { NextResponse } from "next/server";
import {
  invoicesDb,
  clientsDb,
  projectsDb,
  notificationsDb,
  settingsDb,
  nextDocNumber,
  newId,
  type Invoice,
  type InvoiceItem,
  type InvoiceStatus,
} from "@/lib/admin/db";
import { requireAdmin } from "@/lib/admin/guard";

async function isAuthed() {
  return (await requireAdmin()).ok;
}

const STATUSES: InvoiceStatus[] = ["draft", "sent", "paid", "overdue"];

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
  const [invoices, clients, projects] = await Promise.all([
    invoicesDb.list(),
    clientsDb.list(),
    projectsDb.list(),
  ]);
  return NextResponse.json({
    invoices,
    clients: clients.map((c) => ({ id: c.id, company: c.company })),
    projects: projects.map((p) => ({ id: p.id, name: p.name, clientId: p.clientId })),
  });
}

export async function POST(req: Request) {
  if (!(await isAuthed())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = (await req.json()) as Partial<Invoice>;

  // Quick status change for an existing invoice
  if (body.id) {
    const all = await invoicesDb.list();
    const existing = all.find((i) => i.id === body.id);
    if (!existing) return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
    const updated: Invoice = {
      ...existing,
      ...(body.status && STATUSES.includes(body.status) ? { status: body.status } : {}),
      ...(body.items ? { items: sanitizeItems(body.items) } : {}),
      ...(body.dueDate !== undefined ? { dueDate: body.dueDate } : {}),
      ...(body.notes !== undefined ? { notes: String(body.notes).slice(0, 1000) } : {}),
      ...(body.taxPercent !== undefined ? { taxPercent: Math.max(0, Number(body.taxPercent) || 0) } : {}),
    };
    await invoicesDb.upsert(updated);
    return NextResponse.json({ invoice: updated });
  }

  // Create
  if (!body.clientId) return NextResponse.json({ error: "Client is required" }, { status: 400 });
  const client = await clientsDb.findById(body.clientId);
  if (!client) return NextResponse.json({ error: "Client not found" }, { status: 400 });
  const items = sanitizeItems(body.items);
  if (items.length === 0) {
    return NextResponse.json({ error: "At least one line item is required" }, { status: 400 });
  }

  const settings = await settingsDb.get();
  const defaultDue = new Date();
  defaultDue.setDate(defaultDue.getDate() + settings.dueDays);
  const invoice: Invoice = {
    id: newId(),
    number: await nextDocNumber("IN"),
    clientId: body.clientId,
    projectId: body.projectId || undefined,
    issueDate: body.issueDate || new Date().toISOString().slice(0, 10),
    dueDate: body.dueDate || defaultDue.toISOString().slice(0, 10),
    currency: (body.currency || "INR").slice(0, 8),
    items,
    taxPercent: body.taxPercent !== undefined ? Math.max(0, Number(body.taxPercent) || 0) : settings.gstDefault,
    notes: body.notes ? String(body.notes).slice(0, 1000) : settings.terms,
    status: body.status && STATUSES.includes(body.status) ? body.status : "draft",
  };
  await invoicesDb.upsert(invoice);
  if (invoice.status === "sent") {
    await notificationsDb.push({
      audience: `client:${invoice.clientId}`,
      type: "invoice",
      message: `New invoice ${invoice.number} has been issued`,
      link: "/portal",
    });
  }
  return NextResponse.json({ invoice });
}

export async function DELETE(req: Request) {
  if (!(await isAuthed())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = (await req.json()) as { id?: string };
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });
  await invoicesDb.remove(id);
  return NextResponse.json({ ok: true });
}
