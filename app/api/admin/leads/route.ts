import { NextResponse } from "next/server";
import { leadsDb, clientsDb, newId, type Lead, type LeadStage, type Client } from "@/lib/admin/db";
import { hashPassword } from "@/lib/admin/auth";
import { requireAdmin } from "@/lib/admin/guard";
import { logAdminAction } from "@/lib/admin/audit";

async function isAuthed() {
  return (await requireAdmin()).ok;
}

const STAGES: LeadStage[] = ["new", "contacted", "qualified", "proposal", "won", "lost"];

export async function GET() {
  if (!(await isAuthed())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  return NextResponse.json({ leads: await leadsDb.list() });
}

// Human-friendly generated password, e.g. "Nova-Crest-4821#"
function genPassword() {
  const words = ["Nova", "Crest", "Atlas", "Orion", "Vega", "Zephyr", "Aurum", "Delta", "Lyra", "Sage"];
  const pick = () => words[Math.floor(Math.random() * words.length)];
  return `${pick()}-${pick()}-${Math.floor(1000 + Math.random() * 9000)}#`;
}

export async function POST(req: Request) {
  if (!(await isAuthed())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = (await req.json()) as Partial<Lead> & { action?: "convert" };

  // One-click conversion: lead → client login (the CRM → ERP handoff)
  if (body.action === "convert" && body.id) {
    const all = await leadsDb.list();
    const lead = all.find((l) => l.id === body.id);
    if (!lead) return NextResponse.json({ error: "Lead not found" }, { status: 404 });
    if (!lead.email) {
      return NextResponse.json({ error: "Add an email to this lead first — it becomes the client login." }, { status: 400 });
    }
    const existing = await clientsDb.findByEmail(lead.email);
    if (existing) {
      // Already a client — just mark the lead won
      await leadsDb.upsert({ ...lead, stage: "won" });
      await logAdminAction("convert", "lead", `Marked lead "${lead.name}" won (already a client)`);
      return NextResponse.json({ converted: true, alreadyClient: true, clientId: existing.id, leads: await leadsDb.list() });
    }
    const password = genPassword();
    const client: Client = {
      id: newId(),
      company: (lead.company || lead.name).slice(0, 160),
      name: lead.name,
      email: lead.email,
      passwordHash: await hashPassword(password),
      createdAt: new Date().toISOString(),
      active: true,
    };
    await clientsDb.upsert(client);
    await leadsDb.upsert({ ...lead, stage: "won" });
    await logAdminAction("convert", "lead", `Converted lead "${lead.name}" → client ${client.company} (${client.email})`);
    // Password is returned exactly once — share it with the client securely
    return NextResponse.json({
      converted: true,
      client: { id: client.id, company: client.company, email: client.email },
      password,
      leads: await leadsDb.list(),
    });
  }

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
  const isUpdate = Boolean(body.id);
  await leadsDb.upsert(lead);
  await logAdminAction(isUpdate ? "update" : "create", "lead", `${isUpdate ? "Updated" : "Added"} lead "${lead.name}"${lead.company ? ` · ${lead.company}` : ""} (stage: ${lead.stage})`);
  return NextResponse.json({ lead, leads: await leadsDb.list() });
}

export async function DELETE(req: Request) {
  if (!(await isAuthed())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = (await req.json()) as { id?: string };
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });
  const all = await leadsDb.list();
  const existing = all.find((l) => l.id === id);
  await leadsDb.remove(id);
  await logAdminAction("delete", "lead", `Deleted lead "${existing?.name ?? id}"`);
  return NextResponse.json({ ok: true });
}
