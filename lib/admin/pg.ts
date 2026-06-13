/**
 * Postgres key-value backend (Supabase primary + optional Neon standby).
 *
 * The whole admin data model is a KV abstraction (getValue/setValue in db.ts),
 * so a single `kv (key text pk, value jsonb)` table backs every store with zero
 * domain changes.
 *
 * High availability: set a second connection string and every WRITE is mirrored
 * to both databases, while READS prefer the primary and fail over to the
 * standby. If one provider goes down (or a free project pauses), the app keeps
 * working on the other.
 *
 * Env vars (use POOLED endpoints for serverless):
 *   DATABASE_URL | POSTGRES_URL | POSTGRES_PRISMA_URL   (primary, e.g. Supabase)
 *   DATABASE_URL_SECONDARY                                (standby, e.g. Neon)
 */

const CONNS = [
  process.env.DATABASE_URL || process.env.POSTGRES_URL || process.env.POSTGRES_PRISMA_URL || "",
  process.env.DATABASE_URL_SECONDARY || "",
].filter(Boolean);

export const PG_ENABLED = CONNS.length > 0;
export const PG_POOL_COUNT = CONNS.length;

type PgPool = {
  query: (text: string, params?: unknown[]) => Promise<{ rows: Array<{ value?: unknown }> }>;
};

const pools: Array<Promise<PgPool> | null> = CONNS.map(() => null);
const ready: Array<Promise<void> | null> = CONNS.map(() => null);

async function getPool(i: number): Promise<PgPool> {
  if (!pools[i]) {
    const CONN = CONNS[i];
    pools[i] = import("pg").then((mod) => {
      const pg = (mod as unknown as { default?: unknown }).default ?? mod;
      const Pool = (pg as { Pool: new (cfg: unknown) => PgPool }).Pool;
      return new Pool({
        connectionString: CONN,
        ssl: CONN.includes("sslmode=disable") ? false : { rejectUnauthorized: false },
        max: 3,
        idleTimeoutMillis: 10_000,
        connectionTimeoutMillis: 10_000,
      });
    });
  }
  return pools[i]!;
}

function ensureTable(i: number): Promise<void> {
  if (!ready[i]) {
    ready[i] = getPool(i)
      .then((pool) =>
        pool.query(
          "CREATE TABLE IF NOT EXISTS kv (key text PRIMARY KEY, value jsonb NOT NULL, updated_at timestamptz NOT NULL DEFAULT now())"
        )
      )
      .then(() => undefined)
      .catch((e) => {
        ready[i] = null; // retry on next call
        throw e;
      });
  }
  return ready[i]!;
}

/** Read from the primary; fall over to the standby if the primary errors. */
export async function pgGet<T>(key: string): Promise<T | undefined> {
  let lastErr: unknown;
  for (let i = 0; i < CONNS.length; i++) {
    try {
      await ensureTable(i);
      const pool = await getPool(i);
      const res = await pool.query("SELECT value FROM kv WHERE key = $1", [key]);
      return res.rows[0]?.value as T | undefined;
    } catch (e) {
      lastErr = e; // try the next database
    }
  }
  throw lastErr ?? new Error("No Postgres connection configured");
}

/** Write to every configured database (mirror). Succeeds if at least one does. */
export async function pgSet<T>(key: string, value: T): Promise<void> {
  const json = JSON.stringify(value);
  const results = await Promise.allSettled(
    CONNS.map(async (_, i) => {
      await ensureTable(i);
      const pool = await getPool(i);
      await pool.query(
        "INSERT INTO kv (key, value, updated_at) VALUES ($1, $2::jsonb, now()) " +
          "ON CONFLICT (key) DO UPDATE SET value = $2::jsonb, updated_at = now()",
        [key, json]
      );
    })
  );
  if (results.every((r) => r.status === "rejected")) {
    throw (results[0] as PromiseRejectedResult).reason;
  }
}

/** Lightweight liveness check for each database — used by the keep-alive cron. */
export async function pgPing(): Promise<boolean[]> {
  const out: boolean[] = [];
  for (let i = 0; i < CONNS.length; i++) {
    try {
      await ensureTable(i);
      const pool = await getPool(i);
      await pool.query("SELECT 1");
      out.push(true);
    } catch {
      out.push(false);
    }
  }
  return out;
}
