import { NextResponse } from "next/server";
import { maintenanceDb } from "@/lib/admin/db";
import { requireAdmin } from "@/lib/admin/guard";
import { logAdminAction } from "@/lib/admin/audit";

async function isAuthed() {
  return (await requireAdmin()).ok;
}

export async function GET() {
  // Public endpoint — used by the admin toggle to show current state.
  // Consistent read: must reflect a just-saved toggle immediately, so the
  // admin UI never shows a stale state after refresh.
  const m = await maintenanceDb.get({ consistent: true });
  return NextResponse.json({ maintenance: m });
}

export async function POST(req: Request) {
  if (!(await isAuthed()))
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = (await req.json()) as { enabled?: boolean; message?: string };
  const next = {
    enabled: !!body.enabled,
    message:
      typeof body.message === "string" ? body.message.slice(0, 400) : undefined,
  };
  try {
    await maintenanceDb.set(next);
  } catch (e) {
    console.error("[maintenance] write failed:", e);
    return NextResponse.json(
      { error: "Could not persist the maintenance flag. Try again." },
      { status: 502 }
    );
  }
  await logAdminAction("maintenance", "site", `Maintenance mode ${next.enabled ? "ENABLED" : "disabled"}`);
  return NextResponse.json({ maintenance: next });
}
