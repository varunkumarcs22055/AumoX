import { NextResponse } from "next/server";
import { customContactsDb } from "@/lib/admin/db";
import { requireAdmin } from "@/lib/admin/guard";

/** Saved custom email contacts (reusable address book). Any admin may manage. */
export async function GET() {
  if (!(await requireAdmin()).ok) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  return NextResponse.json({ contacts: await customContactsDb.list() });
}

export async function POST(req: Request) {
  if (!(await requireAdmin()).ok) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = (await req.json()) as { name?: string; email?: string; emails?: string[] };

  if (Array.isArray(body.emails)) {
    // Bulk add (no names)
    for (const e of body.emails.slice(0, 500)) await customContactsDb.add("", String(e));
  } else if (body.email?.trim()) {
    await customContactsDb.add(body.name || "", body.email);
  } else {
    return NextResponse.json({ error: "Email is required" }, { status: 400 });
  }
  return NextResponse.json({ contacts: await customContactsDb.list() });
}

export async function DELETE(req: Request) {
  if (!(await requireAdmin()).ok) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = (await req.json()) as { id?: string };
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });
  await customContactsDb.remove(id);
  return NextResponse.json({ ok: true });
}
