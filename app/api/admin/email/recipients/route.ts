import { NextResponse } from "next/server";
import { clientsDb, employeesDb, subscribersDb } from "@/lib/admin/db";
import { requireAdmin } from "@/lib/admin/guard";
import { emailEnabled } from "@/lib/admin/email";

/** Audiences for the broadcast composer. Any admin (normal or main) may use it. */
export async function GET() {
  if (!(await requireAdmin()).ok) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const [clients, employees, subscribers] = await Promise.all([
    clientsDb.list(),
    employeesDb.list(),
    subscribersDb.list(),
  ]);
  return NextResponse.json({
    emailConfigured: emailEnabled(),
    clients: clients.map((c) => ({ id: c.id, name: c.name || c.company, email: c.email, active: c.active })),
    employees: employees.map((e) => ({ id: e.id, name: e.name, email: e.email, active: e.active })),
    subscribers: subscribers.map((s) => ({ id: s.id, name: "", email: s.email })),
  });
}
