import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { attendanceDb, employeesDb, newId } from "@/lib/admin/db";
import { verifyStaffToken, STAFF_COOKIE } from "@/lib/admin/auth";
import { logActorAction } from "@/lib/admin/audit";

/** Clock in / clock out — one row per employee per day. */
export async function POST(req: Request) {
  const c = await cookies();
  const result = await verifyStaffToken(c.get(STAFF_COOKIE)?.value);
  if (!result.ok) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const emp = await employeesDb.findById(result.employeeId);
  if (!emp || !emp.active) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = (await req.json()) as { action?: "in" | "out"; mode?: "office" | "wfh" };
  const today = new Date().toISOString().slice(0, 10);
  const now = new Date().toISOString();
  const existing = await attendanceDb.today(emp.id);

  if (body.action === "in") {
    if (existing?.inAt) {
      return NextResponse.json({ error: "Already clocked in today" }, { status: 400 });
    }
    const row = existing ?? {
      id: newId(),
      employeeId: emp.id,
      date: today,
      mode: body.mode === "wfh" ? ("wfh" as const) : ("office" as const),
    };
    await attendanceDb.upsert({ ...row, inAt: now, mode: body.mode === "wfh" ? "wfh" : "office" });
    await logActorAction("staff", emp.name, "clock-in", "attendance", `${emp.name} clocked in (${body.mode === "wfh" ? "WFH" : "office"})`);
    return NextResponse.json({ ok: true, row: await attendanceDb.today(emp.id) });
  }

  if (body.action === "out") {
    if (!existing?.inAt) {
      return NextResponse.json({ error: "Clock in first" }, { status: 400 });
    }
    if (existing.outAt) {
      return NextResponse.json({ error: "Already clocked out today" }, { status: 400 });
    }
    await attendanceDb.upsert({ ...existing, outAt: now });
    await logActorAction("staff", emp.name, "clock-out", "attendance", `${emp.name} clocked out`);
    return NextResponse.json({ ok: true, row: await attendanceDb.today(emp.id) });
  }

  return NextResponse.json({ error: "Invalid action" }, { status: 400 });
}
