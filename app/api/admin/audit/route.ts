import { NextResponse } from "next/server";
import { auditDb } from "@/lib/admin/db";
import { requireSuper } from "@/lib/admin/guard";

/**
 * Full activity report — visible to the MAIN (super) admin only. Sub-admins
 * and every other audience get 401, so the "who did what" trail can never be
 * read (or tampered with) by the people it audits.
 *
 * Optional query params: ?actor=admin&entity=invoice&q=acme&limit=200
 */
export async function GET(req: Request) {
  if (!(await requireSuper()).ok) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const url = new URL(req.url);
  const actor = url.searchParams.get("actor");
  const entity = url.searchParams.get("entity");
  const q = url.searchParams.get("q")?.toLowerCase().trim();
  const limit = Math.min(1000, Math.max(1, Number(url.searchParams.get("limit")) || 300));

  let entries = await auditDb.list();
  if (actor && actor !== "all") entries = entries.filter((e) => e.actorType === actor);
  if (entity && entity !== "all") entries = entries.filter((e) => e.entity === entity);
  if (q) {
    entries = entries.filter(
      (e) =>
        e.actorName.toLowerCase().includes(q) ||
        e.entity.toLowerCase().includes(q) ||
        e.action.toLowerCase().includes(q) ||
        (e.detail || "").toLowerCase().includes(q)
    );
  }

  // Facets for the filter UI + headline counts
  const allEntries = await auditDb.list();
  const entities = Array.from(new Set(allEntries.map((e) => e.entity))).sort();
  const today = new Date().toISOString().slice(0, 10);
  const todayCount = allEntries.filter((e) => e.at.slice(0, 10) === today).length;

  return NextResponse.json({
    entries: entries.slice(0, limit),
    total: allEntries.length,
    todayCount,
    entities,
  });
}
