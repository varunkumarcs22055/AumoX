import { NextResponse } from "next/server";
import { queriesDb } from "@/lib/admin/db";
import { requireAdmin } from "@/lib/admin/guard";

async function isAuthed() {
  return (await requireAdmin()).ok;
}

export async function GET() {
  if (!(await isAuthed())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const queries = await queriesDb.list();
  return NextResponse.json({ queries });
}

export async function PATCH(req: Request) {
  if (!(await isAuthed())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id, patch } = await req.json();
  if (!id || !patch) return NextResponse.json({ error: "Bad request" }, { status: 400 });
  const updated = await queriesDb.update(id, patch);
  if (!updated) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ query: updated });
}

export async function DELETE(req: Request) {
  if (!(await isAuthed())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await req.json();
  if (!id) return NextResponse.json({ error: "Bad request" }, { status: 400 });
  await queriesDb.remove(id);
  return NextResponse.json({ ok: true });
}
