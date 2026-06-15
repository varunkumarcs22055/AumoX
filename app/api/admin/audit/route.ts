import { NextResponse } from "next/server";
import { auditDb } from "@/lib/admin/db";
import { requireSuper } from "@/lib/admin/guard";
import { logActorAction } from "@/lib/admin/audit";

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

/**
 * Prune the activity log — main (super) admin only. Keeps storage from growing
 * unbounded. Supported modes (JSON body):
 *   { mode: "all" }                    → wipe the whole log
 *   { mode: "ids", ids: string[] }     → delete the selected entries
 *   { mode: "before", before: ISO }    → delete everything strictly older than a date
 *   { mode: "day", day: "YYYY-MM-DD" } → delete one calendar day
 *
 * The purge itself is recorded (one tiny entry) so the log can never be wiped
 * silently — an audit trail you can erase without trace isn't an audit trail.
 */
export async function DELETE(req: Request) {
  const guard = await requireSuper();
  if (!guard.ok) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: { mode?: string; ids?: unknown; before?: unknown; day?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  let removed = 0;
  let detail = "";

  switch (body.mode) {
    case "all":
      removed = await auditDb.clear();
      detail = `Cleared the entire activity log (${removed} entr${removed === 1 ? "y" : "ies"})`;
      break;

    case "ids": {
      const ids = Array.isArray(body.ids) ? body.ids.filter((x): x is string => typeof x === "string") : [];
      if (ids.length === 0) {
        return NextResponse.json({ error: "No entries selected" }, { status: 400 });
      }
      removed = await auditDb.removeIds(ids);
      detail = `Deleted ${removed} selected activity entr${removed === 1 ? "y" : "ies"}`;
      break;
    }

    case "before": {
      const before = typeof body.before === "string" ? body.before : "";
      const iso = before.length === 10 ? `${before}T00:00:00.000Z` : before; // accept YYYY-MM-DD
      if (!iso || Number.isNaN(Date.parse(iso))) {
        return NextResponse.json({ error: "Invalid date" }, { status: 400 });
      }
      removed = await auditDb.removeBefore(iso);
      detail = `Deleted ${removed} activity entr${removed === 1 ? "y" : "ies"} older than ${before.slice(0, 10)}`;
      break;
    }

    case "day": {
      const day = typeof body.day === "string" ? body.day.slice(0, 10) : "";
      if (!/^\d{4}-\d{2}-\d{2}$/.test(day)) {
        return NextResponse.json({ error: "Invalid day" }, { status: 400 });
      }
      removed = await auditDb.removeDay(day);
      detail = `Deleted ${removed} activity entr${removed === 1 ? "y" : "ies"} from ${day}`;
      break;
    }

    default:
      return NextResponse.json({ error: "Unknown mode" }, { status: 400 });
  }

  // Record who purged the log (only the owner can reach here), unless nothing
  // was removed.
  if (removed > 0) {
    await logActorAction("super", "Owner", "purge", "audit", detail);
  }

  return NextResponse.json({ ok: true, removed });
}
