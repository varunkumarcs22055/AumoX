/* One-time migration: copy every store from Vercel Blob into Postgres.
   Only useful if the Blob store is readable (un-suspended). Run with both:
     BLOB_READ_WRITE_TOKEN=... BLOB_DB_PREFIX=... \
     node scripts/migrate-blob-to-pg.js "<postgres-connection-string>"

   It reads the newest version of each known store key from Blob and upserts
   it into the kv table, so no admin-created data is lost in the switch. */
const conn = process.argv[2] || process.env.DATABASE_URL;
if (!conn) { console.error("Pass the Postgres connection string"); process.exit(1); }
const TOKEN = process.env.BLOB_READ_WRITE_TOKEN;
const PREFIX = process.env.BLOB_DB_PREFIX || "db";
if (!TOKEN) { console.error("Set BLOB_READ_WRITE_TOKEN (and BLOB_DB_PREFIX)"); process.exit(1); }

const { Pool } = require("pg");
const { list } = require("@vercel/blob");

// Every store key used by lib/admin/db.ts
const KEYS = [
  "queries", "jobs", "insights", "site-stats", "clients", "projects", "leads",
  "invoices", "tasks", "company-settings", "doc-counters", "employees",
  "attendance", "leaves", "payslips", "assets", "quotations", "payments",
  "notifications", "project-files", "expenses", "messages", "admin-users", "audit-log",
];

const versionOf = (p) => { const m = p.match(/-v(\d+)\.json$/); return m ? Number(m[1]) : 0; };

(async () => {
  const pool = new Pool({ connectionString: conn, ssl: conn.includes("sslmode=disable") ? false : { rejectUnauthorized: false }, max: 2 });
  await pool.query("CREATE TABLE IF NOT EXISTS kv (key text PRIMARY KEY, value jsonb NOT NULL, updated_at timestamptz NOT NULL DEFAULT now())");
  let migrated = 0;
  for (const key of KEYS) {
    try {
      let best = null;
      const { blobs } = await list({ prefix: `${PREFIX}/${key}-v`, token: TOKEN });
      for (const b of blobs) { const v = versionOf(b.pathname); if (!best || v > best.v) best = { url: b.url, v }; }
      if (!best) {
        const leg = await list({ prefix: `${PREFIX}/${key}.json`, limit: 1, token: TOKEN });
        if (leg.blobs.length) best = { url: leg.blobs[0].url, v: 0 };
      }
      if (!best) { console.log(`-- ${key}: (empty)`); continue; }
      const res = await fetch(`${best.url}?r=${Date.now()}`, { cache: "no-store" });
      if (!res.ok) { console.log(`-- ${key}: fetch ${res.status}`); continue; }
      const value = await res.json();
      await pool.query("INSERT INTO kv (key, value) VALUES ($1, $2::jsonb) ON CONFLICT (key) DO UPDATE SET value = $2::jsonb, updated_at = now()", [key, JSON.stringify(value)]);
      const n = Array.isArray(value) ? value.length : 1;
      console.log(`OK ${key}: ${n} record(s)`);
      migrated++;
    } catch (e) {
      console.log(`!! ${key}: ${e.message}`);
    }
  }
  console.log(`\nMigrated ${migrated} stores into Postgres.`);
  await pool.end();
})();
