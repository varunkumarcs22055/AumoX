import { NextResponse } from "next/server";
import { clientsDb, employeesDb, subscribersDb, customContactsDb } from "@/lib/admin/db";
import { requireAdmin } from "@/lib/admin/guard";
import { emailEnabled } from "@/lib/admin/email";

/** Audiences for the broadcast composer. Any admin (normal or main) may use it. */
export async function GET() {
  if (!(await requireAdmin()).ok) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const [clients, employees, subscribers, custom] = await Promise.all([
    clientsDb.list(),
    employeesDb.list(),
    subscribersDb.list(),
    customContactsDb.list(),
  ]);
  return NextResponse.json({
    emailConfigured: emailEnabled(),
    // Contact clients/employees on their official email (falls back to the login email)
    clients: clients.map((c) => ({ id: c.id, name: c.name || c.company, email: c.officialEmail || c.email, active: c.active })),
    employees: employees.map((e) => ({ id: e.id, name: e.name, email: e.officialEmail || e.email, active: e.active })),
    subscribers: subscribers.map((s) => ({ id: s.id, name: "", email: s.email })),
    custom: custom.map((c) => ({ id: c.id, name: c.name, email: c.email })),
  });
}
