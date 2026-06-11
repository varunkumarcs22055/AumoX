import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import {
  employeesDb,
  attendanceDb,
  leavesDb,
  payslipsDb,
  assetsDb,
  notificationsDb,
  nextDocNumber,
  newId,
} from "@/lib/admin/db";
import { verifySessionToken, AUTH_COOKIE } from "@/lib/admin/auth";

async function isAuthed() {
  const c = await cookies();
  return (await verifySessionToken(c.get(AUTH_COOKIE)?.value)).ok;
}

export async function GET() {
  if (!(await isAuthed())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const [employees, attendance, leaves, payslips, assets] = await Promise.all([
    employeesDb.list(),
    attendanceDb.list(),
    leavesDb.list(),
    payslipsDb.list(),
    assetsDb.list(),
  ]);
  return NextResponse.json({
    employees: employees.map((e) => ({
      id: e.id,
      name: e.name,
      designation: e.designation,
      salaryMonthly: e.salaryMonthly,
      active: e.active,
    })),
    attendance: attendance.slice(0, 300),
    leaves,
    payslips,
    assets,
  });
}

export async function POST(req: Request) {
  if (!(await isAuthed())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = (await req.json()) as {
    action:
      | "leave-approve"
      | "leave-reject"
      | "payslip-generate"
      | "payslip-delete"
      | "asset-issue"
      | "asset-delete";
    id?: string;
    employeeId?: string;
    month?: string;
    gross?: number;
    deductions?: { label: string; amount: number }[];
    notes?: string;
    name?: string;
    type?: string;
    url?: string;
  };

  // ----- Leave approval flow -----
  if (body.action === "leave-approve" || body.action === "leave-reject") {
    const all = await leavesDb.list();
    const leave = all.find((l) => l.id === body.id);
    if (!leave) return NextResponse.json({ error: "Leave not found" }, { status: 404 });
    const status = body.action === "leave-approve" ? ("approved" as const) : ("rejected" as const);
    await leavesDb.upsert({ ...leave, status });
    await notificationsDb.push({
      audience: `staff:${leave.employeeId}`,
      type: "leave",
      message: `Your leave (${leave.from} → ${leave.to}) was ${status}`,
      link: "/staff",
    });
    return NextResponse.json({ ok: true });
  }

  // ----- Payroll -----
  if (body.action === "payslip-generate") {
    if (!body.employeeId || !body.month) {
      return NextResponse.json({ error: "Employee and month required" }, { status: 400 });
    }
    const emp = await employeesDb.findById(body.employeeId);
    if (!emp) return NextResponse.json({ error: "Employee not found" }, { status: 404 });
    const gross = typeof body.gross === "number" ? body.gross : emp.salaryMonthly || 0;
    const deductions = (body.deductions || [])
      .filter((d) => d && typeof d.label === "string")
      .map((d) => ({ label: d.label.slice(0, 60), amount: Math.max(0, Number(d.amount) || 0) }));
    const net = Math.max(0, gross - deductions.reduce((s, d) => s + d.amount, 0));
    const slip = {
      id: newId(),
      number: await nextDocNumber("PS"),
      employeeId: emp.id,
      month: body.month.slice(0, 7),
      gross,
      deductions,
      net,
      generatedAt: new Date().toISOString(),
      notes: body.notes?.slice(0, 300),
    };
    await payslipsDb.upsert(slip);
    await notificationsDb.push({
      audience: `staff:${emp.id}`,
      type: "payroll",
      message: `Payslip ${slip.number} for ${slip.month} is available`,
      link: "/staff",
    });
    return NextResponse.json({ payslip: slip });
  }
  if (body.action === "payslip-delete") {
    if (!body.id) return NextResponse.json({ error: "Missing id" }, { status: 400 });
    await payslipsDb.remove(body.id);
    return NextResponse.json({ ok: true });
  }

  // ----- Assets -----
  if (body.action === "asset-issue") {
    if (!body.employeeId || !body.name?.trim()) {
      return NextResponse.json({ error: "Employee and asset name required" }, { status: 400 });
    }
    const asset = {
      id: newId(),
      employeeId: body.employeeId,
      name: body.name.trim().slice(0, 120),
      type: (body.type || "document").slice(0, 30),
      url: body.url,
      issuedAt: new Date().toISOString(),
    };
    await assetsDb.upsert(asset);
    await notificationsDb.push({
      audience: `staff:${body.employeeId}`,
      type: "asset",
      message: `Issued to you: ${asset.name}`,
      link: "/staff",
    });
    return NextResponse.json({ asset });
  }
  if (body.action === "asset-delete") {
    if (!body.id) return NextResponse.json({ error: "Missing id" }, { status: 400 });
    await assetsDb.remove(body.id);
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ error: "Unknown action" }, { status: 400 });
}
