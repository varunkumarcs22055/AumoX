import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { ticketsDb, clientsDb, notificationsDb, newId, nextDocNumber, type Ticket, type TicketPriority } from "@/lib/admin/db";
import { verifyClientToken, CLIENT_COOKIE } from "@/lib/admin/auth";
import { notifyTeam } from "@/lib/admin/email";

async function getClient() {
  const c = await cookies();
  const r = await verifyClientToken(c.get(CLIENT_COOKIE)?.value);
  if (!r.ok) return null;
  const client = await clientsDb.findById(r.clientId);
  return client && client.active ? client : null;
}

const PRIORITIES: TicketPriority[] = ["low", "normal", "high", "urgent"];

export async function GET() {
  const client = await getClient();
  if (!client) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  return NextResponse.json({ tickets: await ticketsDb.listByClient(client.id) });
}

export async function POST(req: Request) {
  const client = await getClient();
  if (!client) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = (await req.json()) as { id?: string; subject?: string; category?: string; priority?: string; body?: string };
  const now = new Date().toISOString();

  // Reply to an existing ticket
  if (body.id) {
    const all = await ticketsDb.list();
    const t = all.find((x) => x.id === body.id && x.clientId === client.id);
    if (!t) return NextResponse.json({ error: "Ticket not found" }, { status: 404 });
    if (!body.body?.trim()) return NextResponse.json({ error: "Message required" }, { status: 400 });
    t.replies.push({ id: newId(), from: "client", body: body.body.trim().slice(0, 4000), at: now, authorName: client.name || client.company });
    if (t.status === "resolved" || t.status === "closed") t.status = "open";
    t.updatedAt = now;
    await ticketsDb.upsert(t);
    await notificationsDb.push({ audience: "admin", type: "ticket", message: `${client.company} replied on ${t.number}`, link: "/admin/tickets" });
    return NextResponse.json({ ticket: t });
  }

  // Create a new ticket
  if (!body.subject?.trim()) return NextResponse.json({ error: "Subject is required" }, { status: 400 });
  const ticket: Ticket = {
    id: newId(),
    number: await nextDocNumber("TK"),
    clientId: client.id,
    subject: body.subject.trim().slice(0, 160),
    category: (body.category || "General").slice(0, 40),
    priority: PRIORITIES.includes(body.priority as TicketPriority) ? (body.priority as TicketPriority) : "normal",
    status: "open",
    replies: body.body?.trim()
      ? [{ id: newId(), from: "client", body: body.body.trim().slice(0, 4000), at: now, authorName: client.name || client.company }]
      : [],
    createdAt: now,
    updatedAt: now,
  };
  await ticketsDb.upsert(ticket);
  await notificationsDb.push({ audience: "admin", type: "ticket", message: `New ticket ${ticket.number} from ${client.company}: ${ticket.subject}`, link: "/admin/tickets" });
  await notifyTeam(`New support ticket ${ticket.number}`, [`${client.company} raised a ${ticket.priority} ticket: <b>${ticket.subject}</b>`, `Category: ${ticket.category}`]);
  return NextResponse.json({ ticket });
}
