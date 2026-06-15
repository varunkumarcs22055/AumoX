import { NextResponse } from "next/server";
import { holidaysDb, newId } from "@/lib/admin/db";
import { requireAdmin } from "@/lib/admin/guard";
import { logAdminAction } from "@/lib/admin/audit";

async function isAuthed() { return (await requireAdmin()).ok; }

export async function GET() {
  if (!(await isAuthed())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  return NextResponse.json({ holidays: await holidaysDb.list() });
}

export async function POST(req: Request) {
  if (!(await isAuthed())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { date, name } = (await req.json()) as { date?: string; name?: string };
  if (!date || !name?.trim()) return NextResponse.json({ error: "Date and name are required" }, { status: 400 });
  await holidaysDb.upsert({ id: newId(), date: date.slice(0, 10), name: name.trim().slice(0, 100) });
  await logAdminAction("create", "holiday", `Added holiday "${name.trim()}" (${date})`);
  return NextResponse.json({ holidays: await holidaysDb.list() });
}

export async function DELETE(req: Request) {
  if (!(await isAuthed())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = (await req.json()) as { id?: string };
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });
  await holidaysDb.remove(id);
  return NextResponse.json({ holidays: await holidaysDb.list() });
}
