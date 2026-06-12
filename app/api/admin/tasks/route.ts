import { NextResponse } from "next/server";
import {
  tasksDb,
  projectsDb,
  employeesDb,
  notificationsDb,
  newId,
  type Task,
  type TaskStatus,
} from "@/lib/admin/db";
import { requireAdmin } from "@/lib/admin/guard";

async function isAuthed() {
  return (await requireAdmin()).ok;
}

const STATUSES: TaskStatus[] = ["todo", "in-progress", "done"];

export async function GET() {
  if (!(await isAuthed())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const [tasks, projects, employees] = await Promise.all([
    tasksDb.list(),
    projectsDb.list(),
    employeesDb.list(),
  ]);
  return NextResponse.json({
    tasks,
    projects: projects.map((p) => ({ id: p.id, name: p.name })),
    employees: employees.filter((e) => e.active).map((e) => ({ id: e.id, name: e.name })),
  });
}

export async function POST(req: Request) {
  if (!(await isAuthed())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = (await req.json()) as Partial<Task>;
  if (!body.title?.trim()) {
    return NextResponse.json({ error: "Task title is required" }, { status: 400 });
  }
  const isNew = !body.id;
  let assignee = body.assignee?.slice(0, 60);
  if (body.assigneeId) {
    const emp = await employeesDb.findById(body.assigneeId);
    if (emp) assignee = emp.name;
  }
  const task: Task = {
    id: body.id || newId(),
    createdAt: body.createdAt || new Date().toISOString(),
    title: body.title.trim().slice(0, 200),
    projectId: body.projectId || undefined,
    assignee,
    assigneeId: body.assigneeId || undefined,
    due: body.due?.slice(0, 10),
    status: STATUSES.includes(body.status as TaskStatus) ? (body.status as TaskStatus) : "todo",
  };
  await tasksDb.upsert(task);
  if (isNew && task.assigneeId) {
    await notificationsDb.push({
      audience: `staff:${task.assigneeId}`,
      type: "task",
      message: `New task assigned: ${task.title}`,
      link: "/staff",
    });
  }
  return NextResponse.json({ task, tasks: await tasksDb.list() });
}

export async function DELETE(req: Request) {
  if (!(await isAuthed())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = (await req.json()) as { id?: string };
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });
  await tasksDb.remove(id);
  return NextResponse.json({ ok: true });
}
