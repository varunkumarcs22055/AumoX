import { NextResponse } from "next/server";
import { ticketsDb, clientsDb, notificationsDb, newId, type TicketStatus, type TicketPriority } from "@/lib/admin/db";
import { requireAdmin } from "@/lib/admin/guard";
import { logAdminAction } from "@/lib/admin/audit";
import { sendBroadcastEmail } from "@/lib/admin/email";

async function isAuthed() { return (await requireAdmin()).ok; }

const STATUSES: TicketStatus[] = ["open", "in-progress", "resolved", "closed"];
const PRIORITIES: TicketPriority[] = ["low", "normal", "high", "urgent"];

export async function GET() {
  if (!(await isAuthed())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const [tickets, clients] = await Promise.all([ticketsDb.list(), clientsDb.list()]);
  return NextResponse.json({
    tickets: tickets.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)),
    clients: clients.map((c) => ({ id: c.id, company: c.company, email: c.email })),
  });
}

export async function POST(req: Request) {
  if (!(await isAuthed())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = (await req.json()) as { id?: string; reply?: string; status?: TicketStatus; priority?: TicketPriority };
  if (!body.id) return NextResponse.json({ error: "Missing ticket id" }, { status: 400 });
  const all = await ticketsDb.list();
  const t = all.find((x) => x.id === body.id);
  if (!t) return NextResponse.json({ error: "Ticket not found" }, { status: 404 });
  const now = new Date().toISOString();

  if (body.reply?.trim()) {
    t.replies.push({ id: newId(), from: "team", body: body.reply.trim().slice(0, 4000), at: now, authorName: "AUMOXO Support" });
    if (t.status === "open") t.status = "in-progress";
    t.updatedAt = now;
    await notificationsDb.push({ audience: `client:${t.clientId}`, type: "ticket", message: `Support replied on ${t.number}`, link: "/portal" });
    const client = await clientsDb.findById(t.clientId);
    if (client) {
      await sendBroadcastEmail(client.email, `Re: ${t.subject} (${t.number})`, `${body.reply.trim()}\n\nView and reply in your portal: https://aumoxo.tech/client`);
    }
    await logAdminAction("ticket", "ticket", `Replied to ticket ${t.number}`);
  }
  if (body.status && STATUSES.includes(body.status)) { t.status = body.status; t.updatedAt = now; await logAdminAction("status", "ticket", `Ticket ${t.number} → ${body.status}`); }
  if (body.priority && PRIORITIES.includes(body.priority)) { t.priority = body.priority; t.updatedAt = now; }

  await ticketsDb.upsert(t);
  return NextResponse.json({ ticket: t });
}

export async function DELETE(req: Request) {
  if (!(await isAuthed())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = (await req.json()) as { id?: string };
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });
  const existing = (await ticketsDb.list()).find((t) => t.id === id);
  await ticketsDb.remove(id);
  await logAdminAction("delete", "ticket", `Deleted ticket ${existing?.number ?? id}`);
  return NextResponse.json({ ok: true });
}
