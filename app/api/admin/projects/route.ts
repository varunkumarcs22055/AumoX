import { NextResponse } from "next/server";
import {
  projectsDb,
  clientsDb,
  teamsDb,
  notificationsDb,
  newId,
  DEFAULT_PHASES,
  type Project,
  type ProjectPhase,
  type PhaseStatus,
} from "@/lib/admin/db";
import { requireAdmin } from "@/lib/admin/guard";
import { logAdminAction } from "@/lib/admin/audit";

async function isAuthed() {
  return (await requireAdmin()).ok;
}

const PHASE_STATUSES: PhaseStatus[] = ["pending", "in-progress", "completed"];

function sanitizePhases(input: unknown): ProjectPhase[] {
  if (!Array.isArray(input) || input.length === 0) return [...DEFAULT_PHASES];
  return input
    .filter((p): p is ProjectPhase => !!p && typeof p.name === "string")
    .map((p) => ({
      name: p.name.slice(0, 60),
      status: PHASE_STATUSES.includes(p.status) ? p.status : "pending",
      ...(p.note ? { note: String(p.note).slice(0, 300) } : {}),
    }));
}

export async function GET() {
  if (!(await isAuthed())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const [projects, clients, teams] = await Promise.all([projectsDb.list(), clientsDb.list(), teamsDb.list()]);
  return NextResponse.json({
    projects,
    clients: clients.map((c) => ({ id: c.id, company: c.company, name: c.name })),
    teams: teams.map((t) => ({ id: t.id, name: t.name })),
  });
}

export async function POST(req: Request) {
  if (!(await isAuthed())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = (await req.json()) as Partial<Project> & {
    addUpdate?: { title: string; body?: string };
    removeUpdateId?: string;
  };

  // Operating on an existing project
  if (body.id) {
    const all = await projectsDb.list();
    const existing = all.find((p) => p.id === body.id);
    if (!existing) return NextResponse.json({ error: "Project not found" }, { status: 404 });

    const updated: Project = {
      ...existing,
      ...(body.name ? { name: String(body.name).slice(0, 120) } : {}),
      ...(body.description !== undefined ? { description: String(body.description).slice(0, 1000) } : {}),
      ...(body.clientId ? { clientId: body.clientId } : {}),
      ...(body.status ? { status: body.status } : {}),
      ...(body.phases ? { phases: sanitizePhases(body.phases) } : {}),
      ...(body.startDate !== undefined ? { startDate: body.startDate } : {}),
      ...(body.targetDate !== undefined ? { targetDate: body.targetDate } : {}),
      ...(body.teamId !== undefined ? { teamId: body.teamId || undefined } : {}),
    };
    if (body.addUpdate?.title?.trim()) {
      updated.updates = [
        {
          id: newId(),
          date: new Date().toISOString(),
          title: body.addUpdate.title.trim().slice(0, 160),
          ...(body.addUpdate.body ? { body: body.addUpdate.body.slice(0, 2000) } : {}),
        },
        ...existing.updates,
      ];
    }
    if (body.removeUpdateId) {
      updated.updates = updated.updates.filter((u) => u.id !== body.removeUpdateId);
    }
    await projectsDb.upsert(updated);
    if (body.addUpdate?.title?.trim()) {
      await notificationsDb.push({
        audience: `client:${updated.clientId}`,
        type: "update",
        message: `${updated.name}: ${body.addUpdate.title.trim().slice(0, 120)}`,
        link: "/portal",
      });
      await logAdminAction("update", "project", `Posted update on "${updated.name}": ${body.addUpdate.title.trim().slice(0, 80)}`);
    } else {
      await logAdminAction("update", "project", `Updated project "${updated.name}" (status: ${updated.status})`);
    }
    return NextResponse.json({ project: updated });
  }

  // Create new
  if (!body.name?.trim() || !body.clientId) {
    return NextResponse.json({ error: "Project name and client are required" }, { status: 400 });
  }
  const client = await clientsDb.findById(body.clientId);
  if (!client) return NextResponse.json({ error: "Client not found" }, { status: 400 });

  const project: Project = {
    id: newId(),
    clientId: body.clientId,
    name: body.name.trim().slice(0, 120),
    description: body.description ? String(body.description).slice(0, 1000) : undefined,
    status: body.status ?? "active",
    phases: sanitizePhases(body.phases),
    updates: [],
    startDate: body.startDate,
    targetDate: body.targetDate,
    teamId: body.teamId || undefined,
  };
  await projectsDb.upsert(project);
  await logAdminAction("create", "project", `Created project "${project.name}" for ${client.company}`);
  return NextResponse.json({ project });
}

export async function DELETE(req: Request) {
  if (!(await isAuthed())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = (await req.json()) as { id?: string };
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });
  const all = await projectsDb.list();
  const existing = all.find((p) => p.id === id);
  await projectsDb.remove(id);
  await logAdminAction("delete", "project", `Deleted project "${existing?.name ?? id}"`);
  return NextResponse.json({ ok: true });
}
