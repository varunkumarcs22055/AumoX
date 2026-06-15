import { NextResponse } from "next/server";
import { expenseClaimsDb, employeesDb, expensesDb, notificationsDb, newId, type Expense } from "@/lib/admin/db";
import { requireAdmin } from "@/lib/admin/guard";
import { logAdminAction } from "@/lib/admin/audit";

async function isAuthed() { return (await requireAdmin()).ok; }

export async function GET() {
  if (!(await isAuthed())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const [claims, employees] = await Promise.all([expenseClaimsDb.list(), employeesDb.list()]);
  return NextResponse.json({ claims, employees: employees.map((e) => ({ id: e.id, name: e.name })) });
}

/** Approve (posts to the Finance ledger) or reject a claim. */
export async function POST(req: Request) {
  if (!(await isAuthed())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id, action } = (await req.json()) as { id?: string; action?: "approve" | "reject" };
  if (!id || !["approve", "reject"].includes(action || "")) return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  const all = await expenseClaimsDb.list();
  const claim = all.find((c) => c.id === id);
  if (!claim) return NextResponse.json({ error: "Claim not found" }, { status: 404 });
  if (claim.status !== "pending") return NextResponse.json({ error: "Already decided" }, { status: 400 });

  claim.status = action === "approve" ? "approved" : "rejected";
  claim.decidedAt = new Date().toISOString();
  await expenseClaimsDb.upsert(claim);

  const emp = await employeesDb.findById(claim.employeeId);
  if (action === "approve") {
    // Post to the Finance ledger as a real expense
    const expense: Expense = {
      id: newId(),
      date: claim.date,
      category: claim.category,
      description: `Reimbursement — ${emp?.name ?? "staff"}: ${claim.description}`,
      amount: claim.amount,
      currency: claim.currency,
      reference: `CLAIM-${claim.id}`,
    };
    await expensesDb.upsert(expense);
  }
  await notificationsDb.push({ audience: `staff:${claim.employeeId}`, type: "claim", message: `Your expense claim (${claim.currency} ${claim.amount}) was ${claim.status}`, link: "/staff" });
  await logAdminAction("claim", "expense-claim", `${claim.status === "approved" ? "Approved" : "Rejected"} ${emp?.name ?? "staff"}'s ${claim.currency} ${claim.amount} claim`);
  return NextResponse.json({ claim });
}
