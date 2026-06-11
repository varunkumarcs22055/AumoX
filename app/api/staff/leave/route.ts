import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { leavesDb, employeesDb, notificationsDb, newId } from "@/lib/admin/db";
import { verifyStaffToken, STAFF_COOKIE } from "@/lib/admin/auth";

/** Employee submits a leave request (pending → admin approves/rejects). */
export async function POST(req: Request) {
  const c = await cookies();
  const result = await verifyStaffToken(c.get(STAFF_COOKIE)?.value);
  if (!result.ok) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const emp = await employeesDb.findById(result.employeeId);
  if (!emp || !emp.active) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = (await req.json()) as { from?: string; to?: string; reason?: string };
  if (!body.from || !body.to) {
    return NextResponse.json({ error: "From and to dates are required" }, { status: 400 });
  }
  const from = new Date(body.from);
  const to = new Date(body.to);
  if (isNaN(from.getTime()) || isNaN(to.getTime()) || to < from) {
    return NextResponse.json({ error: "Invalid date range" }, { status: 400 });
  }
  const days = Math.round((to.getTime() - from.getTime()) / 86_400_000) + 1;
  if (days > 60) return NextResponse.json({ error: "Range too long" }, { status: 400 });

  const leave = {
    id: newId(),
    employeeId: emp.id,
    from: body.from,
    to: body.to,
    days,
    reason: body.reason?.slice(0, 300),
    status: "pending" as const,
    requestedAt: new Date().toISOString(),
  };
  await leavesDb.upsert(leave);
  await notificationsDb.push({
    audience: "admin",
    type: "leave",
    message: `${emp.name} requested ${days} day${days > 1 ? "s" : ""} leave (${body.from} → ${body.to})`,
    link: "/admin/hr",
  });
  return NextResponse.json({ leave });
}
