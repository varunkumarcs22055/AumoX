import { NextResponse } from "next/server";
import { employeesDb, newId, type Employee } from "@/lib/admin/db";
import { hashPassword } from "@/lib/admin/auth";
import { requireAdmin } from "@/lib/admin/guard";
import { logAdminAction } from "@/lib/admin/audit";
import { sendEmployeeWelcome } from "@/lib/admin/email";

async function isAuthed() {
  return (await requireAdmin()).ok;
}

function pub(e: Employee) {
  const { passwordHash: _ph, ...rest } = e;
  return rest;
}

export async function GET() {
  if (!(await isAuthed())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const employees = await employeesDb.list();
  return NextResponse.json({ employees: employees.map(pub) });
}

export async function POST(req: Request) {
  if (!(await isAuthed())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = (await req.json()) as {
    id?: string;
    name?: string;
    email?: string;
    officialEmail?: string;
    designation?: string;
    joinedAt?: string;
    salaryMonthly?: number;
    password?: string;
    active?: boolean;
    shiftStart?: string;
    shiftEnd?: string;
  };
  const cleanTime = (v?: string) => (v && /^\d{2}:\d{2}$/.test(v) ? v : undefined);

  if (!body.name?.trim() || !body.email?.trim()) {
    return NextResponse.json({ error: "Name and login email are required" }, { status: 400 });
  }
  const email = body.email.trim().toLowerCase();
  const officialEmail = body.officialEmail?.trim().toLowerCase() || email;

  if (body.id) {
    const existing = await employeesDb.findById(body.id);
    if (!existing) return NextResponse.json({ error: "Employee not found" }, { status: 404 });
    const dupe = await employeesDb.findByEmail(email);
    if (dupe && dupe.id !== body.id) {
      return NextResponse.json({ error: "Email already in use" }, { status: 400 });
    }
    const updated: Employee = {
      ...existing,
      name: body.name.trim(),
      email,
      officialEmail: body.officialEmail !== undefined ? officialEmail : existing.officialEmail,
      designation: body.designation?.trim() || existing.designation,
      joinedAt: body.joinedAt || existing.joinedAt,
      salaryMonthly:
        typeof body.salaryMonthly === "number" ? body.salaryMonthly : existing.salaryMonthly,
      active: body.active ?? existing.active,
      shiftStart: body.shiftStart !== undefined ? cleanTime(body.shiftStart) : existing.shiftStart,
      shiftEnd: body.shiftEnd !== undefined ? cleanTime(body.shiftEnd) : existing.shiftEnd,
      ...(body.password ? { passwordHash: await hashPassword(body.password), mustChangePassword: true } : {}),
    };
    await employeesDb.upsert(updated);
    await logAdminAction("update", "employee", `Updated employee ${updated.name}${body.password ? " (password reset)" : ""}${body.active === false ? " — deactivated" : ""}`);
    return NextResponse.json({ employee: pub(updated) });
  }

  if (!body.password || body.password.length < 8) {
    return NextResponse.json({ error: "Password must be at least 8 characters" }, { status: 400 });
  }
  if (await employeesDb.findByEmail(email)) {
    return NextResponse.json({ error: "An employee with this email already exists" }, { status: 400 });
  }
  const employee: Employee = {
    id: newId(),
    name: body.name.trim(),
    email,
    officialEmail,
    passwordHash: await hashPassword(body.password),
    designation: body.designation?.trim(),
    joinedAt: body.joinedAt || new Date().toISOString().slice(0, 10),
    salaryMonthly: typeof body.salaryMonthly === "number" ? body.salaryMonthly : undefined,
    active: true,
    mustChangePassword: true, // emailed a temporary password → force a change on first login
    shiftStart: cleanTime(body.shiftStart),
    shiftEnd: cleanTime(body.shiftEnd),
  };
  await employeesDb.upsert(employee);
  await logAdminAction("create", "employee", `Added employee ${employee.name}${employee.designation ? ` (${employee.designation})` : ""}`);
  const emailed = await sendEmployeeWelcome({ name: employee.name, email: officialEmail, loginEmail: email, designation: employee.designation }, body.password);
  return NextResponse.json({ employee: pub(employee), welcomeEmailed: emailed, officialEmail });
}

export async function DELETE(req: Request) {
  if (!(await isAuthed())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = (await req.json()) as { id?: string };
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });
  const existing = await employeesDb.findById(id);
  await employeesDb.remove(id);
  await logAdminAction("delete", "employee", `Removed employee ${existing?.name ?? id}`);
  return NextResponse.json({ ok: true });
}
