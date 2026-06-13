import { NextResponse } from "next/server";
import { adminsDb, newId, type AdminUser } from "@/lib/admin/db";
import { hashPassword } from "@/lib/admin/auth";
import { requireSuper } from "@/lib/admin/guard";
import { logAdminAction } from "@/lib/admin/audit";

// Only the main (super) admin — the one with the master password —
// can see, create, disable or remove other admin accounts.

function pub(a: AdminUser) {
  const { passwordHash: _ph, ...rest } = a;
  return rest;
}

function genPassword() {
  const words = ["Nova", "Crest", "Atlas", "Orion", "Vega", "Zephyr", "Aurum", "Delta", "Lyra", "Sage"];
  const pick = () => words[Math.floor(Math.random() * words.length)];
  return `${pick()}-${pick()}-${Math.floor(1000 + Math.random() * 9000)}#`;
}

export async function GET() {
  if (!(await requireSuper()).ok) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const admins = await adminsDb.list();
  return NextResponse.json({ admins: admins.map(pub) });
}

export async function POST(req: Request) {
  if (!(await requireSuper()).ok) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = (await req.json()) as {
    id?: string;
    name?: string;
    email?: string;
    active?: boolean;
    resetPassword?: boolean;
  };

  // Update / deactivate / reset password on an existing admin
  if (body.id) {
    const existing = await adminsDb.findById(body.id);
    if (!existing) return NextResponse.json({ error: "Admin not found" }, { status: 404 });
    let password: string | undefined;
    const updated: AdminUser = {
      ...existing,
      ...(body.name ? { name: body.name.trim().slice(0, 80) } : {}),
      ...(body.active !== undefined ? { active: body.active } : {}),
    };
    if (body.resetPassword) {
      password = genPassword();
      updated.passwordHash = await hashPassword(password);
    }
    await adminsDb.upsert(updated);
    const what =
      body.resetPassword ? `Reset password for admin ${updated.name}`
      : body.active === false ? `Disabled admin ${updated.name}`
      : body.active === true ? `Enabled admin ${updated.name}`
      : `Updated admin ${updated.name}`;
    await logAdminAction("admin", "admin-account", what);
    return NextResponse.json({ admin: pub(updated), ...(password ? { password } : {}) });
  }

  // Create a new sub-admin — password generated, returned exactly once
  if (!body.name?.trim() || !body.email?.trim()) {
    return NextResponse.json({ error: "Name and email are required" }, { status: 400 });
  }
  const email = body.email.trim().toLowerCase();
  if (await adminsDb.findByEmail(email)) {
    return NextResponse.json({ error: "An admin with this email already exists" }, { status: 400 });
  }
  const password = genPassword();
  const admin: AdminUser = {
    id: newId(),
    name: body.name.trim().slice(0, 80),
    email,
    passwordHash: await hashPassword(password),
    createdAt: new Date().toISOString(),
    active: true,
  };
  await adminsDb.upsert(admin);
  await logAdminAction("create", "admin-account", `Created admin account ${admin.name} (${admin.email})`);
  return NextResponse.json({ admin: pub(admin), password });
}

export async function DELETE(req: Request) {
  if (!(await requireSuper()).ok) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = (await req.json()) as { id?: string };
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });
  const existing = await adminsDb.findById(id);
  await adminsDb.remove(id);
  await logAdminAction("delete", "admin-account", `Removed admin account ${existing?.name ?? id}`);
  return NextResponse.json({ ok: true });
}
