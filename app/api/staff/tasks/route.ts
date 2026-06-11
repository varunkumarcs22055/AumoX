import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { tasksDb, employeesDb, type TaskStatus } from "@/lib/admin/db";
import { verifyStaffToken, STAFF_COOKIE } from "@/lib/admin/auth";

const STATUSES: TaskStatus[] = ["todo", "in-progress", "done"];

/** Employee updates the status of a task assigned to them. */
export async function POST(req: Request) {
  const c = await cookies();
  const result = await verifyStaffToken(c.get(STAFF_COOKIE)?.value);
  if (!result.ok) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const emp = await employeesDb.findById(result.employeeId);
  if (!emp || !emp.active) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = (await req.json()) as { id?: string; status?: TaskStatus };
  if (!body.id || !body.status || !STATUSES.includes(body.status)) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
  const all = await tasksDb.list();
  const task = all.find((t) => t.id === body.id);
  if (!task) return NextResponse.json({ error: "Task not found" }, { status: 404 });

  const mine =
    task.assigneeId === emp.id ||
    (task.assignee && task.assignee.toLowerCase() === emp.name.toLowerCase());
  if (!mine) return NextResponse.json({ error: "Not your task" }, { status: 403 });

  await tasksDb.upsert({ ...task, status: body.status });
  return NextResponse.json({ ok: true });
}
