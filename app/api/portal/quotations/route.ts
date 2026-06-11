import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { quotationsDb, clientsDb, notificationsDb } from "@/lib/admin/db";
import { verifyClientToken, CLIENT_COOKIE } from "@/lib/admin/auth";

/** Client accepts or declines a quotation from their portal. */
export async function POST(req: Request) {
  const c = await cookies();
  const result = await verifyClientToken(c.get(CLIENT_COOKIE)?.value);
  if (!result.ok) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const client = await clientsDb.findById(result.clientId);
  if (!client || !client.active) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await req.json()) as { id?: string; action?: "accept" | "decline" };
  if (!body.id || !["accept", "decline"].includes(body.action || "")) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const all = await quotationsDb.list();
  const q = all.find((x) => x.id === body.id);
  // Clients can only act on their own, sent quotations
  if (!q || q.clientId !== client.id) {
    return NextResponse.json({ error: "Quotation not found" }, { status: 404 });
  }
  if (q.status !== "sent") {
    return NextResponse.json({ error: "This quotation can no longer be changed" }, { status: 400 });
  }
  if (q.validUntil && new Date(q.validUntil) < new Date()) {
    await quotationsDb.upsert({ ...q, status: "expired" });
    return NextResponse.json({ error: "This quotation has expired" }, { status: 400 });
  }

  const status = body.action === "accept" ? ("accepted" as const) : ("declined" as const);
  await quotationsDb.upsert({ ...q, status, respondedAt: new Date().toISOString() });
  await notificationsDb.push({
    audience: "admin",
    type: "quotation",
    message: `${client.company} ${status} quotation ${q.number}`,
    link: "/admin/quotations",
  });
  return NextResponse.json({ ok: true, status });
}
