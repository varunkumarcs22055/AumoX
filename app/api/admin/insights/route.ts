import { NextResponse } from "next/server";
import { insightsDb, type Insight } from "@/lib/admin/db";
import { requireAdmin } from "@/lib/admin/guard";
import { logAdminAction } from "@/lib/admin/audit";

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
    await logAdminAction("reset", "insight", "Reset insights to defaults");
    return NextResponse.json({ items: await insightsDb.list() });
  }
  if (!body.item) return NextResponse.json({ error: "Missing item" }, { status: 400 });
  const existed = (await insightsDb.list()).some((i) => i.id === body.item!.id);
  await insightsDb.upsert(body.item);
  await logAdminAction(existed ? "update" : "create", "insight", `${existed ? "Updated" : "Published"} insight "${body.item.title}"${body.item.published === false ? " (draft)" : ""}`);
  return NextResponse.json({ items: await insightsDb.list() });
}

export async function DELETE(req: Request) {
  if (!(await isAuthed())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await req.json();
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });
  const existing = (await insightsDb.list()).find((i) => i.id === id);
  await insightsDb.remove(id);
  await logAdminAction("delete", "insight", `Deleted insight "${existing?.title ?? id}"`);
  return NextResponse.json({ items: await insightsDb.list() });
}
