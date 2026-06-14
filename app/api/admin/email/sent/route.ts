import { NextResponse } from "next/server";
import { sentEmailsDb } from "@/lib/admin/db";
import { requireAdmin, requireSuper } from "@/lib/admin/guard";
import { logAdminAction } from "@/lib/admin/audit";

/** History of sent emails — any admin can view (and reuse). */
export async function GET() {
  if (!(await requireAdmin()).ok) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return NextResponse.json({ sent: await sentEmailsDb.list() });
}

/** Delete a sent-email record — MAIN ADMIN ONLY. */
export async function DELETE(req: Request) {
  if (!(await requireSuper()).ok) {
    return NextResponse.json({ error: "Only the main admin can delete sent emails." }, { status: 401 });
  }
  const { id } = (await req.json()) as { id?: string };
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });
  const existing = (await sentEmailsDb.list()).find((e) => e.id === id);
  await sentEmailsDb.remove(id);
  await logAdminAction("delete", "email", `Deleted sent email "${existing?.subject ?? id}"`);
  return NextResponse.json({ ok: true });
}
