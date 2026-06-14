import { NextResponse } from "next/server";
import { clientsDb, projectsDb, newId, type Client } from "@/lib/admin/db";
import { hashPassword } from "@/lib/admin/auth";
import { requireAdmin } from "@/lib/admin/guard";
import { logAdminAction } from "@/lib/admin/audit";
import { sendClientWelcome } from "@/lib/admin/email";

async function isAuthed() {
  return (await requireAdmin()).ok;
}

// Never expose password hashes to the browser
function pub(c: Client) {
  const { passwordHash: _ph, ...rest } = c;
  return rest;
}

export async function GET() {
  if (!(await isAuthed())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const clients = await clientsDb.list();
  return NextResponse.json({ clients: clients.map(pub) });
}

export async function POST(req: Request) {
  if (!(await isAuthed())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = (await req.json()) as {
    id?: string;
    company?: string;
    name?: string;
    email?: string;
    password?: string; // only on create / reset
    active?: boolean;
  };

  if (!body.company?.trim() || !body.email?.trim()) {
    return NextResponse.json({ error: "Company and email are required" }, { status: 400 });
  }
  const email = body.email.trim().toLowerCase();

  // Update existing
  if (body.id) {
    const existing = await clientsDb.findById(body.id);
    if (!existing) return NextResponse.json({ error: "Client not found" }, { status: 404 });
    const dupe = await clientsDb.findByEmail(email);
    if (dupe && dupe.id !== body.id) {
      return NextResponse.json({ error: "Another client already uses this email" }, { status: 400 });
    }
    const updated: Client = {
      ...existing,
      company: body.company.trim(),
      name: (body.name ?? existing.name).trim(),
      email,
      active: body.active ?? existing.active,
      ...(body.password ? { passwordHash: await hashPassword(body.password) } : {}),
    };
    await clientsDb.upsert(updated);
    await logAdminAction("update", "client", `Updated client ${updated.company}${body.password ? " (password reset)" : ""}`);
    return NextResponse.json({ client: pub(updated) });
  }

  // Create new
  if (!body.password || body.password.length < 8) {
    return NextResponse.json({ error: "Password must be at least 8 characters" }, { status: 400 });
  }
  if (await clientsDb.findByEmail(email)) {
    return NextResponse.json({ error: "A client with this email already exists" }, { status: 400 });
  }
  const client: Client = {
    id: newId(),
    company: body.company.trim(),
    name: (body.name ?? "").trim(),
    email,
    passwordHash: await hashPassword(body.password),
    createdAt: new Date().toISOString(),
    active: body.active ?? true,
  };
  await clientsDb.upsert(client);
  await logAdminAction("create", "client", `Created client ${client.company} (${client.email})`);
  // Branded welcome email with portal access (best-effort)
  const emailed = await sendClientWelcome({ company: client.company, name: client.name, email: client.email }, body.password);
  return NextResponse.json({ client: pub(client), welcomeEmailed: emailed });
}

export async function DELETE(req: Request) {
  if (!(await isAuthed())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = (await req.json()) as { id?: string };
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });
  const existing = await clientsDb.findById(id);
  await clientsDb.remove(id);
  // Remove the client's projects too — orphaned projects are invisible anyway
  const projects = await projectsDb.list();
  const removedProjects = projects.filter((p) => p.clientId === id);
  for (const p of removedProjects) {
    await projectsDb.remove(p.id);
  }
  await logAdminAction("delete", "client", `Deleted client ${existing?.company ?? id}${removedProjects.length ? ` and ${removedProjects.length} project(s)` : ""}`);
  return NextResponse.json({ ok: true });
}
