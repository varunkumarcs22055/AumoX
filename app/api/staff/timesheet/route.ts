import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { timeEntriesDb, employeesDb, newId, type TimeEntry } from "@/lib/admin/db";
import { verifyStaffToken, STAFF_COOKIE } from "@/lib/admin/auth";
import { logActorAction } from "@/lib/admin/audit";

async function getEmp() {
  const c = await cookies();
  const r = await verifyStaffToken(c.get(STAFF_COOKIE)?.value);
  if (!r.ok) return null;
  const e = await employeesDb.findById(r.employeeId);
  return e && e.active ? e : null;
}

export async function POST(req: Request) {
  const emp = await getEmp();
  if (!emp) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = (await req.json()) as Partial<TimeEntry>;
  if (!body.date || typeof body.hours !== "number" || body.hours <= 0 || body.hours > 24) {
    return NextResponse.json({ error: "Pick a date and hours (0–24)" }, { status: 400 });
  }
  const entry: TimeEntry = {
    id: newId(),
    employeeId: emp.id,
    projectId: body.projectId || undefined,
    date: body.date.slice(0, 10),
    hours: Math.round(body.hours * 100) / 100,
    billable: body.billable !== false,
    note: body.note?.slice(0, 300),
    invoiced: false,
    createdAt: new Date().toISOString(),
  };
  await timeEntriesDb.upsert(entry);
  await logActorAction("staff", emp.name, "timesheet", "timesheet", `${emp.name} logged ${entry.hours}h on ${entry.date}${entry.billable ? " (billable)" : ""}`);
  return NextResponse.json({ entry });
}

export async function DELETE(req: Request) {
  const emp = await getEmp();
  if (!emp) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = (await req.json()) as { id?: string };
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });
  const all = await timeEntriesDb.list();
  const entry = all.find((e) => e.id === id);
  // Staff can only delete their own, un-invoiced entries
  if (!entry || entry.employeeId !== emp.id) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (entry.invoiced) return NextResponse.json({ error: "This entry was already invoiced." }, { status: 400 });
  await timeEntriesDb.remove(id);
  return NextResponse.json({ ok: true });
}
