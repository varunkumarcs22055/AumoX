/* Verify a Postgres connection string works and the kv table is usable.
   Usage: node scripts/pg-check.js "postgresql://user:pass@host/db?sslmode=require" */
const conn = process.argv[2] || process.env.DATABASE_URL;
if (!conn) { console.error("Pass a connection string or set DATABASE_URL"); process.exit(1); }
const { Pool } = require("pg");
const pool = new Pool({
  connectionString: conn,
  ssl: conn.includes("sslmode=disable") ? false : { rejectUnauthorized: false },
  max: 2,
  connectionTimeoutMillis: 10000,
});
(async () => {
  try {
    const v = await pool.query("SELECT version()");
    console.log("Connected:", v.rows[0].version.split(",")[0]);
    await pool.query("CREATE TABLE IF NOT EXISTS kv (key text PRIMARY KEY, value jsonb NOT NULL, updated_at timestamptz NOT NULL DEFAULT now())");
    console.log("kv table ready");
    const probe = { ok: true, at: new Date().toISOString() };
    await pool.query("INSERT INTO kv (key, value) VALUES ($1, $2::jsonb) ON CONFLICT (key) DO UPDATE SET value = $2::jsonb", ["__pgcheck", JSON.stringify(probe)]);
    const r = await pool.query("SELECT value FROM kv WHERE key = $1", ["__pgcheck"]);
    console.log("Round-trip value:", JSON.stringify(r.rows[0].value));
    await pool.query("DELETE FROM kv WHERE key = $1", ["__pgcheck"]);
    const count = await pool.query("SELECT count(*) FROM kv");
    console.log("kv rows:", count.rows[0].count);
    console.log("\nPostgres is READY. Set this as DATABASE_URL in Vercel and redeploy.");
    process.exit(0);
  } catch (e) {
    console.error("FAILED:", e.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
})();
