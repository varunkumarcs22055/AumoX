import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { expenseClaimsDb, employeesDb, notificationsDb, newId, type ExpenseClaim } from "@/lib/admin/db";
import { verifyStaffToken, STAFF_COOKIE } from "@/lib/admin/auth";

/** Staff submit an expense claim for admin approval. */
export async function POST(req: Request) {
  const c = await cookies();
  const r = await verifyStaffToken(c.get(STAFF_COOKIE)?.value);
  if (!r.ok) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const emp = await employeesDb.findById(r.employeeId);
  if (!emp || !emp.active) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = (await req.json()) as Partial<ExpenseClaim>;
  if (!body.description?.trim() || typeof body.amount !== "number" || body.amount <= 0) {
    return NextResponse.json({ error: "Description and a positive amount are required" }, { status: 400 });
  }
  const claim: ExpenseClaim = {
    id: newId(),
    employeeId: emp.id,
    date: (body.date || new Date().toISOString().slice(0, 10)).slice(0, 10),
    category: (body.category || "Other").slice(0, 60),
    description: body.description.trim().slice(0, 200),
    amount: Math.round(body.amount * 100) / 100,
    currency: (body.currency || "INR").slice(0, 8),
    receiptUrl: body.receiptUrl?.slice(0, 600),
    status: "pending",
    createdAt: new Date().toISOString(),
  };
  await expenseClaimsDb.upsert(claim);
  await notificationsDb.push({ audience: "admin", type: "claim", message: `${emp.name} submitted an expense claim: ${claim.currency} ${claim.amount} (${claim.category})`, link: "/admin/team" });
  return NextResponse.json({ claim });
}
