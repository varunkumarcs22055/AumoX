import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { settingsDb, type CompanySettings } from "@/lib/admin/db";
import { verifySessionToken, AUTH_COOKIE } from "@/lib/admin/auth";

async function isAuthed() {
  const c = await cookies();
  return (await verifySessionToken(c.get(AUTH_COOKIE)?.value)).ok;
}

export async function GET() {
  if (!(await isAuthed())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  return NextResponse.json({ settings: await settingsDb.get() });
}

/** Settings affect only the NEXT documents — issued serials never change. */
export async function POST(req: Request) {
  if (!(await isAuthed())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = (await req.json()) as Partial<CompanySettings>;
  const current = await settingsDb.get();
  const updated: CompanySettings = {
    prefix: (body.prefix || current.prefix).replace(/[^A-Z0-9]/gi, "").slice(0, 5).toUpperCase() || "AMX",
    gstDefault: Math.min(50, Math.max(0, Number(body.gstDefault ?? current.gstDefault) || 0)),
    dueDays: Math.min(180, Math.max(0, Number(body.dueDays ?? current.dueDays) || 0)),
    terms: body.terms !== undefined ? String(body.terms).slice(0, 1000) : current.terms,
    bankDetails: body.bankDetails !== undefined ? String(body.bankDetails).slice(0, 500) : current.bankDetails,
    annualLeave: Math.min(60, Math.max(0, Number(body.annualLeave ?? current.annualLeave) || 0)),
  };
  await settingsDb.set(updated);
  return NextResponse.json({ settings: updated });
}
