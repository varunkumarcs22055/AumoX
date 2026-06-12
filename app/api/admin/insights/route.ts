import { NextResponse } from "next/server";
import { insightsDb, type Insight } from "@/lib/admin/db";
import { requireAdmin } from "@/lib/admin/guard";

async function isAuthed() {
  return (await requireAdmin()).ok;
}

export async function GET() {
  if (!(await isAuthed())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const items = await insightsDb.list();
  return NextResponse.json({ items });
}

export async function POST(req: Request) {
  if (!(await isAuthed())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = (await req.json()) as { item?: Insight; reset?: boolean };
  if (body.reset) {
    await insightsDb.reset();
    return NextResponse.json({ items: await insightsDb.list() });
  }
  if (!body.item) return NextResponse.json({ error: "Missing item" }, { status: 400 });
  await insightsDb.upsert(body.item);
  return NextResponse.json({ items: await insightsDb.list() });
}

export async function DELETE(req: Request) {
  if (!(await isAuthed())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await req.json();
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });
  await insightsDb.remove(id);
  return NextResponse.json({ items: await insightsDb.list() });
}
