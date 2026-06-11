import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { tasksDb, projectsDb, newId, type Task, type TaskStatus } from "@/lib/admin/db";
import { verifySessionToken, AUTH_COOKIE } from "@/lib/admin/auth";

async function isAuthed() {
  const c = await cookies();
  return (await verifySessionToken(c.get(AUTH_COOKIE)?.value)).ok;
}

const STATUSES: TaskStatus[] = ["todo", "in-progress", "done"];

export async function GET() {
  if (!(await isAuthed())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const [tasks, projects] = await Promise.all([tasksDb.list(), projectsDb.list()]);
  return NextResponse.json({
    tasks,
    projects: projects.map((p) => ({ id: p.id, name: p.name })),
  });
}

export async function POST(req: Request) {
  if (!(await isAuthed())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = (await req.json()) as Partial<Task>;
  if (!body.title?.trim()) {
    return NextResponse.json({ error: "Task title is required" }, { status: 400 });
  }
  const task: Task = {
    id: body.id || newId(),
    createdAt: body.createdAt || new Date().toISOString(),
    title: body.title.trim().slice(0, 200),
    projectId: body.projectId || undefined,
    assignee: body.assignee?.slice(0, 60),
    due: body.due?.slice(0, 10),
    status: STATUSES.includes(body.status as TaskStatus) ? (body.status as TaskStatus) : "todo",
  };
  await tasksDb.upsert(task);
  return NextResponse.json({ task, tasks: await tasksDb.list() });
}

export async function DELETE(req: Request) {
  if (!(await isAuthed())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = (await req.json()) as { id?: string };
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });
  await tasksDb.remove(id);
  return NextResponse.json({ ok: true });
}
