import { NextResponse } from "next/server";
import { statsDb, type SiteStats } from "@/lib/admin/db";
import { requireAdmin } from "@/lib/admin/guard";

async function isAuthed() {
  return (await requireAdmin()).ok;
}

export async function GET() {
  if (!(await isAuthed())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const stats = await statsDb.get();
  return NextResponse.json({ stats });
}

export async function POST(req: Request) {
  if (!(await isAuthed())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = (await req.json()) as { stats?: SiteStats; reset?: boolean };
  if (body.reset) {
    await statsDb.reset();
    return NextResponse.json({ stats: await statsDb.get() });
  }
  if (!body.stats) return NextResponse.json({ error: "Missing stats" }, { status: 400 });
  await statsDb.save(body.stats);
  return NextResponse.json({ stats: await statsDb.get() });
}
