import { exportAllStores } from "@/lib/admin/db";
import { requireSuper } from "@/lib/admin/guard";
import { makeZip } from "@/lib/admin/zip";

// Full database export as a ZIP — MAIN ADMIN ONLY (requireSuper). Sub-admins
// get 401. Contains JSON (full fidelity, restorable) + CSV (Excel-friendly) for
// the business tables, plus a manifest. The ZIP includes sensitive data
// (password hashes, client PII) — it's the owner's backup, keep it safe.

const CSV_STORES = [
  "clients", "leads", "employees", "invoices", "payments", "expenses",
  "quotations", "projects", "attendance", "leaves", "payslips", "assets", "tasks",
];

function toCsv(rows: unknown): string {
  if (!Array.isArray(rows) || rows.length === 0) return "";
  const cols = Array.from(
    rows.reduce<Set<string>>((set, r) => {
      if (r && typeof r === "object") Object.keys(r).forEach((k) => set.add(k));
      return set;
    }, new Set())
  );
  const esc = (v: unknown) => {
    if (v === null || v === undefined) return "";
    const s = typeof v === "object" ? JSON.stringify(v) : String(v);
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const head = cols.join(",");
  const body = rows
    .map((r) => cols.map((c) => esc((r as Record<string, unknown>)?.[c])).join(","))
    .join("\n");
  return `${head}\n${body}`;
}

export async function GET() {
  if (!(await requireSuper()).ok) {
    return new Response("Unauthorized", { status: 401 });
  }

  const data = await exportAllStores();
  const stamp = new Date().toISOString().slice(0, 19).replace(/[:T]/g, "-");

  const files: { name: string; content: string }[] = [];

  // Manifest with per-store counts
  const counts: Record<string, number> = {};
  for (const [k, v] of Object.entries(data)) counts[k] = Array.isArray(v) ? v.length : v ? 1 : 0;
  files.push({
    name: "manifest.json",
    content: JSON.stringify(
      { app: "AUMOXO", exportedAt: new Date().toISOString(), stores: counts },
      null,
      2
    ),
  });

  // Full JSON per store (the source of truth for restore)
  for (const [k, v] of Object.entries(data)) {
    files.push({ name: `json/${k}.json`, content: JSON.stringify(v ?? null, null, 2) });
  }

  // CSV for the tabular business stores
  for (const k of CSV_STORES) {
    const csv = toCsv(data[k]);
    if (csv) files.push({ name: `csv/${k}.csv`, content: csv });
  }

  const zip = makeZip(files);
  return new Response(new Uint8Array(zip), {
    headers: {
      "Content-Type": "application/zip",
      "Content-Disposition": `attachment; filename="aumoxo-backup-${stamp}.zip"`,
      "Cache-Control": "no-store",
    },
  });
}
