import { NextResponse } from "next/server";
import { messagesDb, clientsDb, notificationsDb } from "@/lib/admin/db";
import { requireAdmin } from "@/lib/admin/guard";

async function isAuthed() {
  return (await requireAdmin()).ok;
}

/**
 * GET            → thread summaries per client (last message + unread count)
 * GET ?clientId= → full thread for one client (marks it read for admin)
 */
export async function GET(req: Request) {
  if (!(await isAuthed())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const clientId = new URL(req.url).searchParams.get("clientId");

  const clients = await clientsDb.list();

  if (clientId) {
    const messages = await messagesDb.listByClient(clientId);
    await messagesDb.markRead(clientId, "admin");
    const client = clients.find((c) => c.id === clientId);
    return NextResponse.json({
      messages,
      client: client ? { id: client.id, company: client.company, name: client.name } : null,
    });
  }

  const all = await messagesDb.list();
  const threads = clients.map((c) => {
    const msgs = all.filter((m) => m.clientId === c.id);
    const last = msgs.reduce<typeof msgs[number] | null>(
      (best, m) => (!best || m.at > best.at ? m : best),
      null
    );
    return {
      clientId: c.id,
      company: c.company,
      name: c.name,
      lastMessage: last ? { body: last.body.slice(0, 120), at: last.at, from: last.from } : null,
      unread: msgs.filter((m) => m.from === "client" && !m.readByAdmin).length,
      total: msgs.length,
    };
  });
  // Active threads first (newest), then clients without messages
  threads.sort((a, b) => (b.lastMessage?.at || "").localeCompare(a.lastMessage?.at || ""));
  return NextResponse.json({ threads });
}

/** POST { clientId, body } → reply as the team; notifies the client. */
export async function POST(req: Request) {
  if (!(await isAuthed())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { clientId, body } = (await req.json()) as { clientId?: string; body?: string };
  if (!clientId || !body?.trim()) {
    return NextResponse.json({ error: "Client and message are required" }, { status: 400 });
  }
  const client = await clientsDb.findById(clientId);
  if (!client) return NextResponse.json({ error: "Client not found" }, { status: 404 });

  const msg = await messagesDb.push({
    clientId,
    from: "team",
    body: body.trim().slice(0, 2000),
  });
  await notificationsDb.push({
    audience: `client:${clientId}`,
    type: "message",
    message: `New message from the AUMOXO team: ${msg.body.slice(0, 80)}`,
    link: "/portal",
  });
  return NextResponse.json({ message: msg, messages: await messagesDb.listByClient(clientId) });
}
