import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { leadsDb, newId, type Lead, type LeadStage } from "@/lib/admin/db";
import { verifySessionToken, AUTH_COOKIE } from "@/lib/admin/auth";

async function isAuthed() {
  const c = await cookies();
  return (await verifySessionToken(c.get(AUTH_COOKIE)?.value)).ok;
}

const STAGES: LeadStage[] = ["new", "contacted", "qualified", "proposal", "won", "lost"];

export async function GET() {
  if (!(await isAuthed())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  return NextResponse.json({ leads: await leadsDb.list() });
}

export async function POST(req: Request) {
  if (!(await isAuthed())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = (await req.json()) as Partial<Lead>;

  if (!body.name?.trim()) {
    return NextResponse.json({ error: "Lead name is required" }, { status: 400 });
  }

  const lead: Lead = {
    id: body.id || newId(),
    createdAt: body.createdAt || new Date().toISOString(),
    name: body.name.trim().slice(0, 120),
    company: body.company?.slice(0, 160),
    email: body.email?.trim().toLowerCase().slice(0, 160),
    phone: body.phone?.slice(0, 40),
    source: body.source?.slice(0, 60),
    service: body.service?.slice(0, 120),
    value: typeof body.value === "number" && body.value >= 0 ? body.value : undefined,
    currency: (body.currency || "INR").slice(0, 8),
    stage: STAGES.includes(body.stage as LeadStage) ? (body.stage as LeadStage) : "new",
    notes: body.notes?.slice(0, 2000),
    nextFollowUp: body.nextFollowUp?.slice(0, 10),
  };
  await leadsDb.upsert(lead);
  return NextResponse.json({ lead, leads: await leadsDb.list() });
}

export async function DELETE(req: Request) {
  if (!(await isAuthed())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = (await req.json()) as { id?: string };
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });
  await leadsDb.remove(id);
  return NextResponse.json({ ok: true });
}
