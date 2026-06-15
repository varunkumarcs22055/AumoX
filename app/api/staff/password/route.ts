import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { employeesDb } from "@/lib/admin/db";
import { verifyStaffToken, STAFF_COOKIE, verifyPassword, hashPassword } from "@/lib/admin/auth";
import { logActorAction } from "@/lib/admin/audit";

/** Staff change their own password (requires the current one). */
export async function POST(req: Request) {
  const c = await cookies();
  const result = await verifyStaffToken(c.get(STAFF_COOKIE)?.value);
  if (!result.ok) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const employee = await employeesDb.findById(result.employeeId);
  if (!employee || !employee.active) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { current, next } = (await req.json()) as { current?: string; next?: string };
  if (!current || !next) return NextResponse.json({ error: "Both passwords are required" }, { status: 400 });
  if (next.length < 8) return NextResponse.json({ error: "New password must be at least 8 characters" }, { status: 400 });
  if (!(await verifyPassword(current, employee.passwordHash))) {
    return NextResponse.json({ error: "Current password is incorrect" }, { status: 400 });
  }

  await employeesDb.upsert({ ...employee, passwordHash: await hashPassword(next), mustChangePassword: false });
  await logActorAction("staff", employee.name, "password", "session", `${employee.name} changed their password`);
  return NextResponse.json({ ok: true });
}
