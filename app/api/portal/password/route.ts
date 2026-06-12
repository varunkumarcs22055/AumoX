import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { clientsDb } from "@/lib/admin/db";
import { verifyClientToken, CLIENT_COOKIE, verifyPassword, hashPassword } from "@/lib/admin/auth";

/** Client changes their own password (requires the current one). */
export async function POST(req: Request) {
  const c = await cookies();
  const result = await verifyClientToken(c.get(CLIENT_COOKIE)?.value);
  if (!result.ok) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const client = await clientsDb.findById(result.clientId);
  if (!client || !client.active) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { current, next } = (await req.json()) as { current?: string; next?: string };
  if (!current || !next) return NextResponse.json({ error: "Both passwords are required" }, { status: 400 });
  if (next.length < 8) return NextResponse.json({ error: "New password must be at least 8 characters" }, { status: 400 });
  if (!(await verifyPassword(current, client.passwordHash))) {
    return NextResponse.json({ error: "Current password is incorrect" }, { status: 400 });
  }

  await clientsDb.upsert({ ...client, passwordHash: await hashPassword(next) });
  return NextResponse.json({ ok: true });
}
