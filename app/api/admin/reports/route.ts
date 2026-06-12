import { NextResponse } from "next/server";
import {
  leadsDb,
  projectsDb,
  tasksDb,
  invoicesDb,
  paymentsDb,
  expensesDb,
  employeesDb,
  leavesDb,
  invoiceTotal,
  type LeadStage,
} from "@/lib/admin/db";
import { requireAdmin } from "@/lib/admin/guard";

async function isAuthed() {
  return (await requireAdmin()).ok;
}

/** Business analytics — everything computed server-side from the live stores. */
export async function GET() {
  if (!(await isAuthed())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const [leads, projects, tasks, invoices, payments, expenses, employees, leaves] =
    await Promise.all([
      leadsDb.list(),
      projectsDb.list(),
      tasksDb.list(),
      invoicesDb.list(),
      paymentsDb.list(),
      expensesDb.list(),
      employeesDb.list(),
      leavesDb.list(),
    ]);

  // --- Monthly money flow, last 6 months: billed / collected / spent ---
  const months: { month: string; label: string; billed: number; collected: number; spent: number }[] = [];
  const now = new Date();
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    months.push({
      month: key,
      label: d.toLocaleDateString("en-US", { month: "short" }),
      billed: 0,
      collected: 0,
      spent: 0,
    });
  }
  const bucket = (date: string) => months.find((m) => date?.startsWith(m.month));
  for (const inv of invoices) {
    if (inv.status === "draft") continue;
    const b = bucket(inv.issueDate);
    if (b) b.billed += invoiceTotal(inv);
  }
  for (const p of payments) {
    const b = bucket(p.date);
    if (b) b.collected += p.amount;
  }
  for (const e of expenses) {
    const b = bucket(e.date);
    if (b) b.spent += e.amount;
  }
  for (const m of months) {
    m.billed = Math.round(m.billed);
    m.collected = Math.round(m.collected);
    m.spent = Math.round(m.spent);
  }

  // --- Ledger totals ---
  const issued = invoices.filter((i) => i.status !== "draft");
  const billed = issued.reduce((s, i) => s + invoiceTotal(i), 0);
  const collected = payments.reduce((s, p) => s + p.amount, 0);
  const spent = expenses.reduce((s, e) => s + e.amount, 0);

  // --- CRM funnel ---
  const STAGES: LeadStage[] = ["new", "contacted", "qualified", "proposal", "won", "lost"];
  const funnel = STAGES.map((stage) => ({
    stage,
    count: leads.filter((l) => l.stage === stage).length,
    value: leads.filter((l) => l.stage === stage).reduce((s, l) => s + (l.value || 0), 0),
  }));
  const pipelineValue = funnel
    .filter((f) => !["won", "lost"].includes(f.stage))
    .reduce((s, f) => s + f.value, 0);

  // --- Invoice aging (unpaid, by days overdue) ---
  const today = new Date();
  const aging = { current: 0, d1_30: 0, d31_60: 0, d60plus: 0 };
  for (const inv of issued.filter((i) => i.status !== "paid")) {
    const total = invoiceTotal(inv);
    const paid = payments.filter((p) => p.invoiceId === inv.id).reduce((s, p) => s + p.amount, 0);
    const due = Math.max(0, total - paid);
    if (due <= 0) continue;
    const overdueDays = inv.dueDate
      ? Math.floor((today.getTime() - new Date(inv.dueDate).getTime()) / 86400000)
      : 0;
    if (overdueDays <= 0) aging.current += due;
    else if (overdueDays <= 30) aging.d1_30 += due;
    else if (overdueDays <= 60) aging.d31_60 += due;
    else aging.d60plus += due;
  }

  // --- Delivery & team ---
  const projectMix = {
    active: projects.filter((p) => p.status === "active").length,
    onHold: projects.filter((p) => p.status === "on-hold").length,
    completed: projects.filter((p) => p.status === "completed").length,
  };
  const taskMix = {
    todo: tasks.filter((t) => t.status === "todo").length,
    inProgress: tasks.filter((t) => t.status === "in-progress").length,
    done: tasks.filter((t) => t.status === "done").length,
  };
  const activeStaff = employees.filter((e) => e.active);
  const hr = {
    headcount: activeStaff.length,
    monthlyPayroll: activeStaff.reduce((s, e) => s + (e.salaryMonthly || 0), 0),
    pendingLeaves: leaves.filter((l) => l.status === "pending").length,
  };

  return NextResponse.json({
    months,
    totals: {
      billed: Math.round(billed),
      collected: Math.round(collected),
      outstanding: Math.round(Math.max(0, billed - collected)),
      spent: Math.round(spent),
      net: Math.round(collected - spent),
    },
    funnel,
    pipelineValue: Math.round(pipelineValue),
    aging: {
      current: Math.round(aging.current),
      d1_30: Math.round(aging.d1_30),
      d31_60: Math.round(aging.d31_60),
      d60plus: Math.round(aging.d60plus),
    },
    projectMix,
    taskMix,
    hr,
  });
}
