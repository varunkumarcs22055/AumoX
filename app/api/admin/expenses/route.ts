import { NextResponse } from "next/server";
import { expensesDb, newId, type Expense } from "@/lib/admin/db";
import { requireAdmin } from "@/lib/admin/guard";

async function isAuthed() {
  return (await requireAdmin()).ok;
}

export async function GET() {
  if (!(await isAuthed())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const expenses = await expensesDb.list();
  const totalSpent = expenses.reduce((s, e) => s + e.amount, 0);
  return NextResponse.json({ expenses, totalSpent });
}

export async function POST(req: Request) {
  if (!(await isAuthed())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = (await req.json()) as Partial<Expense>;

  if (!body.description?.trim()) {
    return NextResponse.json({ error: "Description is required" }, { status: 400 });
  }
  if (typeof body.amount !== "number" || body.amount <= 0) {
    return NextResponse.json({ error: "Amount must be a positive number" }, { status: 400 });
  }

  const expense: Expense = {
    id: body.id || newId(),
    date: (body.date || new Date().toISOString().slice(0, 10)).slice(0, 10),
    category: (body.category || "Other").slice(0, 60),
    description: body.description.trim().slice(0, 200),
    amount: Math.round(body.amount * 100) / 100,
    currency: (body.currency || "INR").slice(0, 8),
    vendor: body.vendor?.slice(0, 120),
    reference: body.reference?.slice(0, 120),
  };
  await expensesDb.upsert(expense);
  return NextResponse.json({ expense, expenses: await expensesDb.list() });
}

export async function DELETE(req: Request) {
  if (!(await isAuthed())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = (await req.json()) as { id?: string };
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });
  await expensesDb.remove(id);
  return NextResponse.json({ ok: true });
}
