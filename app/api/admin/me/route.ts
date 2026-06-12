import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin/guard";

/** Who am I — lets the admin UI show/hide super-admin-only sections. */
export async function GET() {
  const g = await requireAdmin();
  if (!g.ok) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  return NextResponse.json({ role: g.role, name: g.name ?? "Owner" });
}
