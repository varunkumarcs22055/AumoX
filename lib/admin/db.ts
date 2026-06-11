/**
 * Admin DB layer — Vercel KV (Redis) when env vars are present,
 * with a safe in-memory fallback for local development.
 *
 * To enable on Vercel:
 *   1. Project → Storage → Create → KV
 *   2. Connect to project (env vars are auto-injected)
 *   3. Redeploy
 *
 * All admin pages call these helpers via /api/admin/* — no client-side
 * DB access, so localStorage stays for UX only.
 */

import { kv } from "@vercel/kv";
import { put, list } from "@vercel/blob";

// Storage priority: KV (if configured) → Vercel Blob (production default)
// → in-memory Map (local dev only). Blob/KV are REQUIRED in production:
// serverless functions don't share memory, so without shared storage the
// admin's writes are invisible to public page renders.
const mem = new Map<string, unknown>();
const KV_ENABLED =
  !!process.env.KV_REST_API_URL && !!process.env.KV_REST_API_TOKEN;
const BLOB_ENABLED = !!process.env.BLOB_READ_WRITE_TOKEN;

// Secret path segment so blob URLs (public-access) are unguessable.
const BLOB_PREFIX = process.env.BLOB_DB_PREFIX || "db";
const blobPath = (key: string) => `${BLOB_PREFIX}/${key}.json`;
const blobUrlCache = new Map<string, string>();

async function blobGet<T>(key: string): Promise<T | undefined> {
  try {
    let url = blobUrlCache.get(key);
    if (!url) {
      const { blobs } = await list({ prefix: blobPath(key), limit: 1 });
      if (blobs.length === 0) return undefined;
      url = blobs[0].url;
      blobUrlCache.set(key, url);
    }
    // Cache-busting query forces the blob CDN to revalidate — reads stay fresh.
    const res = await fetch(`${url}?v=${Date.now()}`, { cache: "no-store" });
    if (!res.ok) return undefined;
    return (await res.json()) as T;
  } catch (e) {
    console.warn("[db] Blob read failed:", e);
    return undefined;
  }
}

async function blobSet<T>(key: string, value: T): Promise<boolean> {
  try {
    const blob = await put(blobPath(key), JSON.stringify(value), {
      access: "public",
      addRandomSuffix: false,
      allowOverwrite: true,
      cacheControlMaxAge: 60,
      contentType: "application/json",
    });
    blobUrlCache.set(key, blob.url);
    return true;
  } catch (e) {
    console.warn("[db] Blob write failed:", e);
    return false;
  }
}

async function getValue<T>(key: string, fallback: T): Promise<T> {
  if (KV_ENABLED) {
    try {
      const v = await kv.get<T>(key);
      return (v as T) ?? fallback;
    } catch (e) {
      console.warn("[db] KV.get failed:", e);
    }
  }
  if (BLOB_ENABLED) {
    const v = await blobGet<T>(key);
    return v ?? fallback;
  }
  return (mem.get(key) as T) ?? fallback;
}

async function setValue<T>(key: string, value: T): Promise<void> {
  if (KV_ENABLED) {
    try {
      await kv.set(key, value);
      return;
    } catch (e) {
      console.warn("[db] KV.set failed:", e);
    }
  }
  if (BLOB_ENABLED) {
    if (await blobSet(key, value)) return;
  }
  mem.set(key, value);
}

// ---------- Types ----------
export type Query = {
  id: string;
  receivedAt: string; // ISO
  name: string;
  email: string;
  company?: string;
  phone?: string;
  service: string;
  timeline?: string;
  budget?: string;
  message: string;
  read: boolean;
};

export type Job = {
  id: string;
  title: string;
  team: string;
  location: string;
  type: string;
  level: string;
  description?: string;
  active: boolean;
};

export type Insight = {
  id: string;
  title: string;
  tag: string;
  excerpt: string;
  date: string;
  readMin: number;
  author?: string;
  /** External article URL (Medium, Hashnode, LinkedIn, …) — cards link here */
  url?: string;
  published: boolean;
};

export type SiteStats = {
  countries: number;
  clients: number;
  engineers: number;
  uptime: number;
};

// ---------- Queries (contact submissions) ----------
const Q_KEY = "queries";

export const queriesDb = {
  list: () => getValue<Query[]>(Q_KEY, []),
  async add(input: Omit<Query, "id" | "receivedAt" | "read">): Promise<Query> {
    const all = await queriesDb.list();
    const q: Query = {
      ...input,
      id: Math.random().toString(36).slice(2, 12),
      receivedAt: new Date().toISOString(),
      read: false,
    };
    all.unshift(q);
    await setValue(Q_KEY, all.slice(0, 500)); // cap at 500
    return q;
  },
  async update(id: string, patch: Partial<Query>) {
    const all = await queriesDb.list();
    const i = all.findIndex((x) => x.id === id);
    if (i < 0) return null;
    all[i] = { ...all[i], ...patch };
    await setValue(Q_KEY, all);
    return all[i];
  },
  async remove(id: string) {
    const all = await queriesDb.list();
    await setValue(
      Q_KEY,
      all.filter((x) => x.id !== id)
    );
  },
  async stats() {
    const all = await queriesDb.list();
    return { total: all.length, unread: all.filter((q) => !q.read).length };
  },
};

// ---------- Jobs ----------
const J_KEY = "jobs";
const DEFAULT_JOBS: Job[] = [
  { id: "1", title: "Full-Stack Engineer (Next.js / Node)", team: "Engineering",          location: "Remote · India",  type: "Full-time",  level: "Mid–Senior", description: "Build client products end-to-end with Next.js, React and Node — from data model to pixel-perfect UI.", active: true },
  { id: "2", title: "AI Engineer",                          team: "AI & Automation",      location: "Remote · India",  type: "Full-time",  level: "Mid",        description: "Ship AI agents, chatbots and automation workflows on top of modern LLMs for real client use-cases.", active: true },
  { id: "3", title: "UI/UX Design Intern",                  team: "Design",               location: "Remote",          type: "Internship", level: "Junior",     description: "Work with the founders on design systems, prototypes and client-facing product design.", active: true },
];
export const jobsDb = {
  async list() {
    return getValue<Job[]>(J_KEY, DEFAULT_JOBS);
  },
  async saveAll(items: Job[]) { await setValue(J_KEY, items); },
  async upsert(job: Job) {
    const all = await jobsDb.list();
    const i = all.findIndex((j) => j.id === job.id);
    if (i >= 0) all[i] = job; else all.unshift(job);
    await setValue(J_KEY, all);
  },
  async remove(id: string) {
    const all = await jobsDb.list();
    await setValue(J_KEY, all.filter((j) => j.id !== id));
  },
  async reset() { await setValue(J_KEY, DEFAULT_JOBS); },
};

// ---------- Insights ----------
const I_KEY = "insights";
const DEFAULT_INSIGHTS: Insight[] = [
  { id: "1", title: "How AI can reduce operational costs across your business", tag: "AI",        excerpt: "Practical AI integrations that actually move the cost line.", date: "2026-06-01", readMin: 8,  published: true },
  { id: "2", title: "CRM vs spreadsheet management",                            tag: "CRM",       excerpt: "When the switch pays off — signals, costs, ROI.",              date: "2026-05-25", readMin: 7,  published: true },
  { id: "3", title: "Automating lead follow-ups using AI agents",               tag: "Automation",excerpt: "A working pattern for AI-driven sales follow-up loops.",       date: "2026-05-18", readMin: 9,  published: true },
];
export const insightsDb = {
  async list() {
    return getValue<Insight[]>(I_KEY, DEFAULT_INSIGHTS);
  },
  async saveAll(items: Insight[]) { await setValue(I_KEY, items); },
  async upsert(item: Insight) {
    const all = await insightsDb.list();
    const i = all.findIndex((x) => x.id === item.id);
    if (i >= 0) all[i] = item; else all.unshift(item);
    await setValue(I_KEY, all);
  },
  async remove(id: string) {
    const all = await insightsDb.list();
    await setValue(I_KEY, all.filter((x) => x.id !== id));
  },
  async reset() { await setValue(I_KEY, DEFAULT_INSIGHTS); },
};

// ---------- Stats ----------
const S_KEY = "stats";
const DEFAULT_STATS: SiteStats = { countries: 60, clients: 250, engineers: 1200, uptime: 99.99 };
export const statsDb = {
  get: () => getValue<SiteStats>(S_KEY, DEFAULT_STATS),
  save: (s: SiteStats) => setValue(S_KEY, s),
  reset: () => setValue(S_KEY, DEFAULT_STATS),
};

// ---------- Maintenance mode ----------
// Stored in Vercel Edge Config (not KV/memory): the flag must be shared
// across ALL serverless functions instantly. In-memory storage is isolated
// per function, so the admin toggle would never reach page renders.
const M_KEY = "maintenance";
export type Maintenance = { enabled: boolean; message?: string };
const DEFAULT_MAINTENANCE: Maintenance = { enabled: false };

export const maintenanceDb = {
  /**
   * opts.consistent — read the source of truth via the Vercel REST API
   * instead of the edge-distributed copy. Edge reads can lag a write by
   * several seconds; the admin UI must see its own writes immediately.
   */
  async get(opts?: { consistent?: boolean }): Promise<Maintenance> {
    const id = process.env.EDGE_CONFIG_ID;
    const token = process.env.VERCEL_API_TOKEN;
    const teamId = process.env.VERCEL_TEAM_ID;
    if (opts?.consistent && id && token) {
      try {
        const res = await fetch(
          `https://api.vercel.com/v1/edge-config/${id}/item/${M_KEY}${teamId ? `?teamId=${teamId}` : ""}`,
          { headers: { Authorization: `Bearer ${token}` }, cache: "no-store" }
        );
        if (res.ok) {
          const j = (await res.json()) as { value?: Maintenance };
          if (j?.value && typeof j.value.enabled === "boolean") return j.value;
        }
      } catch (e) {
        console.warn("[db] Edge Config consistent read failed:", e);
      }
    }
    if (process.env.EDGE_CONFIG) {
      try {
        const { get } = await import("@vercel/edge-config");
        const m = await get<Maintenance>(M_KEY);
        if (m && typeof m.enabled === "boolean") return m;
      } catch (e) {
        console.warn("[db] Edge Config read failed, falling back:", e);
      }
    }
    return getValue<Maintenance>(M_KEY, DEFAULT_MAINTENANCE);
  },
  async set(m: Maintenance): Promise<void> {
    const id = process.env.EDGE_CONFIG_ID;
    const token = process.env.VERCEL_API_TOKEN;
    const teamId = process.env.VERCEL_TEAM_ID;
    if (id && token) {
      const res = await fetch(
        `https://api.vercel.com/v1/edge-config/${id}/items${teamId ? `?teamId=${teamId}` : ""}`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            items: [{ operation: "upsert", key: M_KEY, value: m }],
          }),
        }
      );
      if (!res.ok) {
        throw new Error(`Edge Config write failed: ${res.status} ${await res.text()}`);
      }
      return;
    }
    await setValue(M_KEY, m);
  },
};

// ---------- Client portal: clients ----------
export type Client = {
  id: string;
  company: string;
  name: string;          // contact person
  email: string;         // login identifier (stored lowercase)
  passwordHash: string;  // PBKDF2 — never returned to the browser
  createdAt: string;
  active: boolean;
};

const C_KEY = "clients";

export const clientsDb = {
  list: () => getValue<Client[]>(C_KEY, []),
  async findByEmail(email: string): Promise<Client | undefined> {
    const all = await clientsDb.list();
    const e = email.trim().toLowerCase();
    return all.find((c) => c.email === e);
  },
  async findById(id: string): Promise<Client | undefined> {
    const all = await clientsDb.list();
    return all.find((c) => c.id === id);
  },
  async upsert(client: Client) {
    const all = await clientsDb.list();
    const i = all.findIndex((c) => c.id === client.id);
    if (i >= 0) all[i] = client; else all.unshift(client);
    await setValue(C_KEY, all);
  },
  async remove(id: string) {
    const all = await clientsDb.list();
    await setValue(C_KEY, all.filter((c) => c.id !== id));
  },
};

// ---------- Client portal: projects ----------
export type PhaseStatus = "pending" | "in-progress" | "completed";
export type ProjectPhase = { name: string; status: PhaseStatus; note?: string };
export type ProjectUpdate = {
  id: string;
  date: string; // ISO
  title: string;
  body?: string;
};
export type Project = {
  id: string;
  clientId: string;
  name: string;
  description?: string;
  status: "active" | "on-hold" | "completed";
  phases: ProjectPhase[];
  updates: ProjectUpdate[];
  startDate?: string;
  targetDate?: string;
};

export const DEFAULT_PHASES: ProjectPhase[] = [
  { name: "Discovery",   status: "pending" },
  { name: "Strategy",    status: "pending" },
  { name: "Design",      status: "pending" },
  { name: "Development", status: "pending" },
  { name: "Launch",      status: "pending" },
  { name: "Support",     status: "pending" },
];

const P_KEY = "projects";

export const projectsDb = {
  list: () => getValue<Project[]>(P_KEY, []),
  async listByClient(clientId: string): Promise<Project[]> {
    const all = await projectsDb.list();
    return all.filter((p) => p.clientId === clientId);
  },
  async upsert(project: Project) {
    const all = await projectsDb.list();
    const i = all.findIndex((p) => p.id === project.id);
    if (i >= 0) all[i] = project; else all.unshift(project);
    await setValue(P_KEY, all);
  },
  async remove(id: string) {
    const all = await projectsDb.list();
    await setValue(P_KEY, all.filter((p) => p.id !== id));
  },
};

export const newId = () => Math.random().toString(36).slice(2, 10);
