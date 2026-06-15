import { NextResponse } from "next/server";
import { announcementsDb, notificationsDb, newId, type Announcement } from "@/lib/admin/db";
import { requireAdmin } from "@/lib/admin/guard";
import { logAdminAction } from "@/lib/admin/audit";

async function authed() { return await requireAdmin(); }

export async function GET() {
  if (!(await authed()).ok) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  return NextResponse.json({ announcements: await announcementsDb.list() });
}

export async function POST(req: Request) {
  const g = await authed();
  if (!g.ok) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = (await req.json()) as Partial<Announcement>;
  if (!body.title?.trim() || !body.body?.trim()) return NextResponse.json({ error: "Title and message are required" }, { status: 400 });
  const aud = ["staff", "clients", "all"].includes(body.audience || "") ? body.audience! : "staff";
  const ann: Announcement = {
    id: body.id || newId(),
    title: body.title.trim().slice(0, 160),
    body: body.body.trim().slice(0, 4000),
    audience: aud,
    pinned: !!body.pinned,
    createdAt: body.createdAt || new Date().toISOString(),
    authorName: g.role === "admin" ? g.name || "Admin" : "Owner",
  };
  await announcementsDb.upsert(ann);
  // Notify the relevant audiences in-app
  if (aud === "staff" || aud === "all") await notificationsDb.push({ audience: "admin", type: "announcement", message: `Announcement posted: ${ann.title}`, link: "/admin/announcements" });
  await logAdminAction(body.id ? "update" : "create", "announcement", `${body.id ? "Updated" : "Posted"} announcement "${ann.title}" (${aud})`);
  return NextResponse.json({ announcement: ann, announcements: await announcementsDb.list() });
}

export async function DELETE(req: Request) {
  if (!(await authed()).ok) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = (await req.json()) as { id?: string };
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });
  await announcementsDb.remove(id);
  await logAdminAction("delete", "announcement", `Deleted an announcement`);
  return NextResponse.json({ ok: true });
}
