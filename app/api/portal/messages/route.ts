import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { messagesDb, clientsDb, notificationsDb } from "@/lib/admin/db";
import { verifyClientToken, CLIENT_COOKIE } from "@/lib/admin/auth";

async function getClient() {
  const c = await cookies();
  const result = await verifyClientToken(c.get(CLIENT_COOKIE)?.value);
  if (!result.ok) return null;
  const client = await clientsDb.findById(result.clientId);
  if (!client || !client.active) return null;
  return client;
}

/** The client's own conversation thread with the AUMOXO team. */
export async function GET() {
  const client = await getClient();
  if (!client) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const messages = await messagesDb.listByClient(client.id);
  // Opening the thread marks the team's messages as read
  await messagesDb.markRead(client.id, "client");
  return NextResponse.json({ messages });
}

export async function POST(req: Request) {
  const client = await getClient();
  if (!client) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { body } = (await req.json()) as { body?: string };
  if (!body?.trim()) return NextResponse.json({ error: "Message cannot be empty" }, { status: 400 });

  const msg = await messagesDb.push({
    clientId: client.id,
    from: "client",
    body: body.trim().slice(0, 2000),
  });
  await notificationsDb.push({
    audience: "admin",
    type: "message",
    message: `New message from ${client.company}: ${msg.body.slice(0, 80)}`,
    link: "/admin/messages",
  });
  return NextResponse.json({ message: msg, messages: await messagesDb.listByClient(client.id) });
}
