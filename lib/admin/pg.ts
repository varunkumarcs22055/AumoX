/**
 * Postgres key-value backend (Neon / Supabase / any Postgres).
 *
 * The whole admin data model is already a KV abstraction (getValue/setValue in
 * db.ts), so a single `kv (key text pk, value jsonb)` table backs every store
 * with zero domain changes. This is the durable, free-tier-friendly primary
 * store — it takes priority over Vercel Blob, which only exists as a fallback.
 *
 * Set ONE of these env vars to a (pooled) connection string to enable it:
 *   DATABASE_URL | POSTGRES_URL | POSTGRES_PRISMA_URL
 * Use the POOLED endpoint (Neon `-pooler` host, Supabase port 6543) so
 * serverless functions don't exhaust direct connections.
 */

const CONN =
  process.env.DATABASE_URL ||
  process.env.POSTGRES_URL ||
  process.env.POSTGRES_PRISMA_URL ||
  "";

export const PG_ENABLED = !!CONN;

// pg is loaded lazily so it's never bundled when no database is configured
// (and never pulled into any non-Node context).
type PgPool = {
  query: (text: string, params?: unknown[]) => Promise<{ rows: Array<{ value?: unknown }> }>;
};

let poolPromise: Promise<PgPool> | null = null;
async function getPool(): Promise<PgPool> {
  if (!poolPromise) {
    poolPromise = import("pg").then((mod) => {
      const pg = (mod as unknown as { default?: unknown }).default ?? mod;
      const Pool = (pg as { Pool: new (cfg: unknown) => PgPool }).Pool;
      return new Pool({
        connectionString: CONN,
        // Neon & Supabase require TLS; their certs are trusted but we don't
        // pin, so disable strict verification for the managed endpoint.
        ssl: CONN.includes("sslmode=disable") ? false : { rejectUnauthorized: false },
        max: 3,
        idleTimeoutMillis: 10_000,
        connectionTimeoutMillis: 10_000,
      });
    });
  }
  return poolPromise;
}

let ready: Promise<void> | null = null;
function ensureTable(): Promise<void> {
  if (!ready) {
    ready = getPool()
      .then((pool) =>
        pool.query(
          "CREATE TABLE IF NOT EXISTS kv (key text PRIMARY KEY, value jsonb NOT NULL, updated_at timestamptz NOT NULL DEFAULT now())"
        )
      )
      .then(() => undefined)
      .catch((e) => {
        ready = null; // let the next call retry table creation
        throw e;
      });
  }
  return ready;
}

export async function pgGet<T>(key: string): Promise<T | undefined> {
  await ensureTable();
  const pool = await getPool();
  const res = await pool.query("SELECT value FROM kv WHERE key = $1", [key]);
  // jsonb is already parsed to a JS value by the driver
  return (res.rows[0]?.value as T | undefined);
}

export async function pgSet<T>(key: string, value: T): Promise<void> {
  await ensureTable();
  const pool = await getPool();
  // Stringify + explicit ::jsonb cast — passing a JS array as a param would
  // otherwise be coerced to a Postgres array literal, not JSON.
  await pool.query(
    "INSERT INTO kv (key, value, updated_at) VALUES ($1, $2::jsonb, now()) " +
      "ON CONFLICT (key) DO UPDATE SET value = $2::jsonb, updated_at = now()",
    [key, JSON.stringify(value)]
  );
}
