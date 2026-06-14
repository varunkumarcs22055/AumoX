/* One-time (or periodic) reconcile: copy every kv row from Supabase → Neon so
   the standby is a complete mirror, not just for writes since it was connected.
   Run: node scripts/sync-supabase-to-neon.js "<supabase-url>" "<neon-url>" */
const { Pool } = require("pg");
const SRC = process.argv[2];
const DST = process.argv[3];
if (!SRC || !DST) { console.error("Usage: node sync-supabase-to-neon.js <supabaseUrl> <neonUrl>"); process.exit(1); }
const mk = (c) => new Pool({ connectionString: c, ssl: c.includes("sslmode=disable") ? false : { rejectUnauthorized: false }, max: 2 });

(async () => {
  const src = mk(SRC), dst = mk(DST);
  await dst.query("CREATE TABLE IF NOT EXISTS kv (key text PRIMARY KEY, value jsonb NOT NULL, updated_at timestamptz NOT NULL DEFAULT now())");
  const { rows } = await src.query("SELECT key, value FROM kv");
  console.log(`Source (Supabase) has ${rows.length} stores. Copying → Neon…`);
  let n = 0;
  for (const r of rows) {
    await dst.query(
      "INSERT INTO kv (key, value, updated_at) VALUES ($1, $2::jsonb, now()) ON CONFLICT (key) DO UPDATE SET value = $2::jsonb, updated_at = now()",
      [r.key, JSON.stringify(r.value)]
    );
    const count = Array.isArray(r.value) ? r.value.length : 1;
    console.log(`  ${r.key}: ${count} record(s)`);
    n++;
  }
  const dstCount = await dst.query("SELECT count(*) FROM kv");
  console.log(`\nDone. Copied ${n} stores. Neon now has ${dstCount.rows[0].count} stores.`);
  await src.end(); await dst.end();
})().catch((e) => { console.error("FAILED:", e.message); process.exit(1); });
