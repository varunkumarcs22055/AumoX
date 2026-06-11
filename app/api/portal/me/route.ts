import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { clientsDb, projectsDb, invoicesDb, invoiceTotal } from "@/lib/admin/db";
import { verifyClientToken, CLIENT_COOKIE } from "@/lib/admin/auth";

/**
 * Returns the logged-in client's profile, their projects (phases, progress,
 * update timeline) and their issued invoices. Client auth only.
 */
export async function GET() {
  const c = await cookies();
  const result = await verifyClientToken(c.get(CLIENT_COOKIE)?.value);
  if (!result.ok) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const client = await clientsDb.findById(result.clientId);
  if (!client || !client.active) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const [projects, invoices] = await Promise.all([
    projectsDb.listByClient(client.id),
    invoicesDb.listByClient(client.id), // drafts excluded
  ]);

  return NextResponse.json({
    client: { company: client.company, name: client.name, email: client.email },
    projects,
    invoices: invoices.map((i) => ({
      id: i.id,
      number: i.number,
      issueDate: i.issueDate,
      dueDate: i.dueDate,
      currency: i.currency,
      status: i.status,
      total: invoiceTotal(i),
      items: i.items,
      notes: i.notes,
    })),
  });
}
