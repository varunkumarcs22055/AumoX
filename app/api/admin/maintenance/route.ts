import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { maintenanceDb } from "@/lib/admin/db";
import { verifySessionToken, AUTH_COOKIE } from "@/lib/admin/auth";

async function isAuthed() {
  const c = await cookies();
  return (await verifySessionToken(c.get(AUTH_COOKIE)?.value)).ok;
}

export async function GET() {
  // Public endpoint — used by the site shell to decide whether to render
  // the maintenance page. No auth required to READ the flag.
  const m = await maintenanceDb.get();
  return NextResponse.json({ maintenance: m });
}

export async function POST(req: Request) {
  if (!(await isAuthed()))
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = (await req.json()) as { enabled?: boolean; message?: string };
  const next = {
    enabled: !!body.enabled,
    message:
      typeof body.message === "string" ? body.message.slice(0, 400) : undefined,
  };
  await maintenanceDb.set(next);
  return NextResponse.json({ maintenance: next });
}
