import { NextResponse } from "next/server";
import { timeEntriesDb, employeesDb, projectsDb } from "@/lib/admin/db";
import { requireAdmin } from "@/lib/admin/guard";
import { logAdminAction } from "@/lib/admin/audit";

async function isAuthed() { return (await requireAdmin()).ok; }

export async function GET() {
  if (!(await isAuthed())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const [entries, employees, projects] = await Promise.all([timeEntriesDb.list(), employeesDb.list(), projectsDb.list()]);
  return NextResponse.json({
    entries,
    employees: employees.map((e) => ({ id: e.id, name: e.name })),
    projects: projects.map((p) => ({ id: p.id, name: p.name, clientId: p.clientId })),
  });
}

/** Mark a set of billable entries as invoiced (after billing them). */
export async function POST(req: Request) {
  if (!(await isAuthed())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { ids, invoiced } = (await req.json()) as { ids?: string[]; invoiced?: boolean };
  if (!Array.isArray(ids) || ids.length === 0) return NextResponse.json({ error: "No entries selected" }, { status: 400 });
  const all = await timeEntriesDb.list();
  let n = 0;
  for (const e of all) {
    if (ids.includes(e.id)) { e.invoiced = invoiced !== false; await timeEntriesDb.upsert(e); n++; }
  }
  await logAdminAction("update", "timesheet", `Marked ${n} time entr${n === 1 ? "y" : "ies"} as ${invoiced !== false ? "invoiced" : "not invoiced"}`);
  return NextResponse.json({ ok: true, updated: n });
}

export async function DELETE(req: Request) {
  if (!(await isAuthed())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = (await req.json()) as { id?: string };
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });
  await timeEntriesDb.remove(id);
  return NextResponse.json({ ok: true });
}
