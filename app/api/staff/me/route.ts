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
  teamsDb,
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

  const [tasks, projects, attendance, leaves, payslips, assets, notifications, settings, announcements, holidays, allTime, claims, allEmployees, myTeams] =
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
      teamsDb.listForEmployee(emp.id),
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

  // ----- Team scoping: an employee only sees their own team(s), not everyone -----
  const empById = new Map(allEmployees.map((e) => [e.id, e]));
  const person = (id?: string) => {
    if (!id) return null;
    const e = empById.get(id);
    if (!e || !e.active) return null;
    return { id: e.id, name: e.name, designation: e.designation, email: e.officialEmail || e.email, photo: e.photo, role: e.role ?? "member" };
  };
  const teams = myTeams.map((t) => ({
    id: t.id,
    name: t.name,
    isManager: t.managerId === emp.id,
    isHr: t.hrId === emp.id,
    manager: person(t.managerId),
    hr: person(t.hrId),
    members: t.memberIds.map(person).filter(Boolean),
  }));
  // Directory = everyone across my team(s) (manager + HR + members), minus myself.
  const teammateIds = new Set<string>();
  for (const t of myTeams) {
    if (t.managerId) teammateIds.add(t.managerId);
    if (t.hrId) teammateIds.add(t.hrId);
    t.memberIds.forEach((id) => teammateIds.add(id));
  }
  teammateIds.delete(emp.id);
  const directory = [...teammateIds].map(person).filter(Boolean);
  // Projects scoped to my team(s). Before any team exists, fall back to all so
  // the timesheet picker isn't empty during rollout.
  const myTeamIds = new Set(myTeams.map((t) => t.id));
  const teamProjects = projects.filter((p) => p.teamId && myTeamIds.has(p.teamId));
  const projectsForMe = myTeams.length === 0 ? projects : teamProjects;

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
      role: emp.role ?? "member",
      mustChangePassword: !!emp.mustChangePassword,
    },
    announcements,
    holidays: holidays.filter((h) => h.date >= today).slice(0, 12),
    timeEntries: allTime.sort((a, b) => b.date.localeCompare(a.date)).slice(0, 200),
    claims: claims.sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
    teams,
    directory,
    tasks: myTasks,
    projects: projectsForMe.map((p) => ({ id: p.id, name: p.name })),
    attendance: myAttendance,
    today: todayRow ?? null,
    leaves: myLeaves,
    leaveBalance: Math.max(0, settings.annualLeave - usedDays),
    payslips,
    assets,
    notifications,
  });
}
