import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import {
  employeesDb,
  tasksDb,
  projectsDb,
  attendanceDb,
  leavesDb,
  payslipsDb,
  assetsDb,
  notificationsDb,
  settingsDb,
  normalizeAttendance,
  announcementsDb,
  holidaysDb,
  timeEntriesDb,
  expenseClaimsDb,
} from "@/lib/admin/db";
import { verifyStaffToken, STAFF_COOKIE } from "@/lib/admin/auth";

export async function GET() {
  const c = await cookies();
  const result = await verifyStaffToken(c.get(STAFF_COOKIE)?.value);
  if (!result.ok) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const emp = await employeesDb.findById(result.employeeId);
  if (!emp || !emp.active) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const [tasks, projects, attendance, leaves, payslips, assets, notifications, settings, announcements, holidays, allTime, claims, allEmployees] =
    await Promise.all([
      tasksDb.list(),
      projectsDb.list(),
      attendanceDb.list(),
      leavesDb.list(),
      payslipsDb.listByEmployee(emp.id),
      assetsDb.listByEmployee(emp.id),
      notificationsDb.listFor(`staff:${emp.id}`),
      settingsDb.get(),
      announcementsDb.forAudience("staff"),
      holidaysDb.list(),
      timeEntriesDb.listByEmployee(emp.id),
      expenseClaimsDb.listByEmployee(emp.id),
      employeesDb.list(),
    ]);

  const myTasks = tasks.filter(
    (t) => t.assigneeId === emp.id || (t.assignee && t.assignee.toLowerCase() === emp.name.toLowerCase())
  );
  const myAttendance = attendance
    .filter((a) => a.employeeId === emp.id)
    .slice(0, 60)
    .map(normalizeAttendance);
  const myLeaves = leaves.filter((l) => l.employeeId === emp.id);
  const usedDays = myLeaves
    .filter((l) => l.status === "approved")
    .reduce((s, l) => s + l.days, 0);

  const today = new Date().toISOString().slice(0, 10);
  const todayRow = myAttendance.find((a) => a.date === today);

  return NextResponse.json({
    employee: {
      id: emp.id,
      name: emp.name,
      email: emp.email,
      designation: emp.designation,
      joinedAt: emp.joinedAt,
      shiftStart: emp.shiftStart,
      shiftEnd: emp.shiftEnd,
      phone: emp.phone,
      address: emp.address,
      emergencyContact: emp.emergencyContact,
      photo: emp.photo,
    },
    announcements,
    holidays: holidays.filter((h) => h.date >= today).slice(0, 12),
    timeEntries: allTime.sort((a, b) => b.date.localeCompare(a.date)).slice(0, 200),
    claims: claims.sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
    directory: allEmployees
      .filter((e) => e.active)
      .map((e) => ({ id: e.id, name: e.name, designation: e.designation, email: e.email, photo: e.photo })),
    tasks: myTasks,
    projects: projects.map((p) => ({ id: p.id, name: p.name })),
    attendance: myAttendance,
    today: todayRow ?? null,
    leaves: myLeaves,
    leaveBalance: Math.max(0, settings.annualLeave - usedDays),
    payslips,
    assets,
    notifications,
  });
}
