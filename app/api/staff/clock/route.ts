import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { attendanceDb, employeesDb, normalizeAttendance, newId, type AttendanceRow } from "@/lib/admin/db";
import { verifyStaffToken, STAFF_COOKIE } from "@/lib/admin/auth";
import { logActorAction } from "@/lib/admin/audit";

type Action = "in" | "out" | "break-start" | "break-end";

/**
 * Attendance state machine. An employee can clock in and out multiple times a
 * day, and take typed breaks while clocked in. Their shift window is defined by
 * the admin; here they have the authority to mark presence and manage breaks.
 */
export async function POST(req: Request) {
  const c = await cookies();
  const result = await verifyStaffToken(c.get(STAFF_COOKIE)?.value);
  if (!result.ok) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const emp = await employeesDb.findById(result.employeeId);
  if (!emp || !emp.active) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = (await req.json()) as { action?: Action; mode?: "office" | "wfh"; breakType?: string };
  const action = body.action;
  const today = new Date().toISOString().slice(0, 10);
  const now = new Date().toISOString();

  // Load or create today's row
  let row = await attendanceDb.today(emp.id);
  if (!row) {
    row = {
      id: newId(),
      employeeId: emp.id,
      date: today,
      mode: body.mode === "wfh" ? "wfh" : "office",
      sessions: [],
      breaks: [],
    } as AttendanceRow;
  } else {
    row = normalizeAttendance(row);
  }

  const openSession = row.sessions.find((s) => !s.out);
  const openBreak = row.breaks.find((b) => !b.end);

  const fail = (msg: string) => NextResponse.json({ error: msg }, { status: 400 });

  if (action === "in") {
    if (openSession) return fail("You're already clocked in.");
    row.mode = body.mode === "wfh" ? "wfh" : "office";
    row.sessions.push({ in: now });
    await attendanceDb.upsert(row);
    await logActorAction("staff", emp.name, "clock-in", "attendance", `${emp.name} clocked in (${row.mode})`);
    return NextResponse.json({ ok: true, row: await attendanceDb.today(emp.id) });
  }

  if (action === "out") {
    if (!openSession) return fail("You're not clocked in.");
    if (openBreak) openBreak.end = now; // auto-end an open break on clock-out
    openSession.out = now;
    await attendanceDb.upsert(row);
    await logActorAction("staff", emp.name, "clock-out", "attendance", `${emp.name} clocked out`);
    return NextResponse.json({ ok: true, row: await attendanceDb.today(emp.id) });
  }

  if (action === "break-start") {
    if (!openSession) return fail("Clock in before taking a break.");
    if (openBreak) return fail("You're already on a break.");
    const type = (body.breakType || "Break").slice(0, 40);
    row.breaks.push({ type, start: now });
    await attendanceDb.upsert(row);
    await logActorAction("staff", emp.name, "break-start", "attendance", `${emp.name} started a ${type.toLowerCase()} break`);
    return NextResponse.json({ ok: true, row: await attendanceDb.today(emp.id) });
  }

  if (action === "break-end") {
    if (!openBreak) return fail("You're not on a break.");
    openBreak.end = now;
    await attendanceDb.upsert(row);
    await logActorAction("staff", emp.name, "break-end", "attendance", `${emp.name} ended their ${openBreak.type.toLowerCase()} break`);
    return NextResponse.json({ ok: true, row: await attendanceDb.today(emp.id) });
  }

  return fail("Invalid action");
}
