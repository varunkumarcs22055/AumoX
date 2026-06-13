import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import {
  clientsDb,
  projectsDb,
  invoicesDb,
  quotationsDb,
  filesDb,
  notificationsDb,
  settingsDb,
  tasksDb,
  invoiceTotal,
  quotationTotal,
} from "@/lib/admin/db";
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

  const [projects, invoices, quotations, allFiles, notifications, settings, allTasks] = await Promise.all([
    projectsDb.listByClient(client.id),
    invoicesDb.listByClient(client.id), // drafts excluded
    quotationsDb.listByClient(client.id), // drafts excluded
    filesDb.list(),
    notificationsDb.listFor(`client:${client.id}`),
    settingsDb.get(),
    tasksDb.list(),
  ]);

  const projectIds = new Set(projects.map((p) => p.id));
  const files = allFiles.filter((f) => projectIds.has(f.projectId));

  // Tasks tied to the client's projects — clients see WHAT the team is doing
  // (title, status, due) but never internal assignee names.
  const tasks = allTasks
    .filter((t) => t.projectId && projectIds.has(t.projectId))
    .map((t) => ({
      id: t.id,
      projectId: t.projectId,
      title: t.title,
      status: t.status,
      due: t.due,
    }));

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
      taxPercent: i.taxPercent,
      notes: i.notes,
    })),
    quotations: quotations.map((q) => ({
      id: q.id,
      number: q.number,
      projectName: q.projectName,
      issueDate: q.issueDate,
      validUntil: q.validUntil,
      currency: q.currency,
      items: q.items,
      taxPercent: q.taxPercent,
      discountPercent: q.discountPercent,
      terms: q.terms,
      status: q.status,
      total: quotationTotal(q),
    })),
    files: files.map((f) => ({
      id: f.id,
      projectId: f.projectId,
      name: f.name,
      url: f.url,
      size: f.size,
      uploadedAt: f.uploadedAt,
    })),
    notifications,
    tasks,
    bankDetails: settings.bankDetails || "",
  });
}
