import { NextResponse } from "next/server";
import { teamsDb, employeesDb, newId, type Team } from "@/lib/admin/db";
import { requireAdmin } from "@/lib/admin/guard";
import { logAdminAction } from "@/lib/admin/audit";

async function isAuthed() {
  return (await requireAdmin()).ok;
}

export async function GET() {
  if (!(await isAuthed())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const [teams, employees] = await Promise.all([teamsDb.list(), employeesDb.list()]);
  return NextResponse.json({
    teams,
    // Lightweight roster for the team builder (active employees only)
    employees: employees
      .filter((e) => e.active)
      .map((e) => ({ id: e.id, name: e.name, designation: e.designation, role: e.role ?? "member" })),
  });
}

export async function POST(req: Request) {
  if (!(await isAuthed())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = (await req.json()) as Partial<Team>;
  if (!body.name?.trim()) {
    return NextResponse.json({ error: "Team name is required" }, { status: 400 });
  }
  const all = await teamsDb.list();
  const existing = body.id ? all.find((t) => t.id === body.id) : undefined;

  // De-dupe + drop the manager/hr ids out of the plain member list.
  const memberIds = Array.from(new Set((body.memberIds ?? []).filter(Boolean)))
    .filter((id) => id !== body.managerId && id !== body.hrId);

  const team: Team = {
    id: body.id || newId(),
    name: body.name.trim().slice(0, 80),
    managerId: body.managerId || undefined,
    hrId: body.hrId || undefined,
    memberIds,
    createdAt: existing?.createdAt || new Date().toISOString(),
  };
  await teamsDb.upsert(team);
  await logAdminAction(existing ? "update" : "create", "team", `${existing ? "Updated" : "Created"} team "${team.name}" (${memberIds.length} member(s))`);
  return NextResponse.json({ team, teams: await teamsDb.list() });
}

export async function DELETE(req: Request) {
  if (!(await isAuthed())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = (await req.json()) as { id?: string };
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });
  const existing = await teamsDb.findById(id);
  await teamsDb.remove(id);
  await logAdminAction("delete", "team", `Deleted team "${existing?.name ?? id}"`);
  return NextResponse.json({ ok: true });
}
