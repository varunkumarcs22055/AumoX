import { NextResponse } from "next/server";
import { notificationsDb } from "@/lib/admin/db";
import { requireAdmin } from "@/lib/admin/guard";

async function isAuthed() {
  return (await requireAdmin()).ok;
}

export async function GET() {
  if (!(await isAuthed())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const notifications = await notificationsDb.listFor("admin");
  return NextResponse.json({
    notifications,
    unread: notifications.filter((n) => !n.read).length,
  });
}

export async function POST() {
  if (!(await isAuthed())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  await notificationsDb.markAllRead("admin");
  return NextResponse.json({ ok: true });
}
