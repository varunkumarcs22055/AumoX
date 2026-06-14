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
import { put, list, del } from "@vercel/blob";
import { PG_ENABLED, pgGet, pgSet } from "./pg";

// Storage priority: Postgres (Neon/Supabase — durable primary) → Vercel KV →
// Vercel Blob → in-memory Map (local dev only). A shared store is REQUIRED in
// production: serverless functions don't share memory, so without it the
// admin's writes are invisible to public page renders.
const mem = new Map<string, unknown>();
const KV_ENABLED =
  !!process.env.KV_REST_API_URL && !!process.env.KV_REST_API_TOKEN;
const BLOB_ENABLED = !!process.env.BLOB_READ_WRITE_TOKEN;

// Secret path segment so blob URLs (public-access) are unguessable.
const BLOB_PREFIX = process.env.BLOB_DB_PREFIX || "db";

/**
 * Versioned blob documents. Overwriting the SAME blob path serves stale
 * content from the CDN for up to ~60s — unacceptable for read-after-write
 * (admin saves, public page reads). Instead every write creates a NEW
 * immutable path `${key}-v${timestamp}.json`; reads resolve the newest
 * version (per-lambda cache or list()), so content under a URL never
 * changes and the CDN can never be stale.
 */
const verPrefix = (key: string) => `${BLOB_PREFIX}/${key}-v`;
const legacyPath = (key: string) => `${BLOB_PREFIX}/${key}.json`;
const versionOf = (pathname: string): number => {
  const m = pathname.match(/-v(\d+)\.json$/);
  return m ? Number(m[1]) : 0;
};
const blobCache = new Map<string, { url: string; version: number }>();

// Per-lambda short-TTL value cache. Collapses bursts of reads (a single
// force-dynamic page render reads several stores; e2e runs hammer them) into
// one blob round-trip per key per TTL window, slashing Blob "operations" usage.
// Writes refresh the entry (read-your-writes within the lambda); a fresh lambda
// has no cache and always reads live, so cross-function consistency is intact.
const valueCache = new Map<string, { value: unknown; at: number }>();
const VALUE_TTL_MS = 5000;

async function blobGet<T>(key: string): Promise<T | undefined> {
  try {
    const cached = blobCache.get(key);
    let best = cached;
    try {
      const { blobs } = await list({ prefix: verPrefix(key) });
      for (const b of blobs) {
        const v = versionOf(b.pathname);
        if (!best || v > best.version) best = { url: b.url, version: v };
      }
    } catch (e) {
      console.warn("[db] Blob list failed:", e);
    }
    // Migration: fall back to the legacy un-versioned document
    if (!best) {
      const { blobs } = await list({ prefix: legacyPath(key), limit: 1 });
      if (blobs.length === 0) return undefined;
      best = { url: blobs[0].url, version: 0 };
    }
    blobCache.set(key, best);
    const sep = best.url.includes("?") ? "&" : "?";
    const res = await fetch(`${best.url}${sep}r=${Date.now()}`, { cache: "no-store" });
    if (!res.ok) return undefined;
    return (await res.json()) as T;
  } catch (e) {
    console.warn("[db] Blob read failed:", e);
    return undefined;
  }
}

async function blobSet<T>(key: string, value: T): Promise<boolean> {
  try {
    const version = Date.now();
    const blob = await put(`${verPrefix(key)}${version}.json`, JSON.stringify(value), {
      access: "public",
      addRandomSuffix: false,
      contentType: "application/json",
    });
    blobCache.set(key, { url: blob.url, version });
    // Best-effort cleanup: keep the 3 newest versions, delete the rest.
    // Run only ~1 in 5 writes — the list()+del() calls are themselves billed
    // operations, so sampling keeps storage tidy without doubling write cost.
    if (Math.random() < 0.2) {
      try {
        const { blobs } = await list({ prefix: verPrefix(key) });
        const sorted = blobs
          .map((b) => ({ url: b.url, v: versionOf(b.pathname) }))
          .sort((a, b) => b.v - a.v);
        for (const old of sorted.slice(3)) {
          await del(old.url);
        }
      } catch {
        /* cleanup is non-critical */
      }
    }
    return true;
  } catch (e) {
    console.warn("[db] Blob write failed:", e);
    return false;
  }
}

async function getValue<T>(key: string, fallback: T): Promise<T> {
  if (PG_ENABLED) {
    try {
      // Postgres is strongly consistent and cheap — always read fresh.
      return (await pgGet<T>(key)) ?? fallback;
    } catch (e) {
      console.warn("[db] Postgres get failed:", e);
    }
  }
  if (KV_ENABLED) {
    try {
      const v = await kv.get<T>(key);
      return (v as T) ?? fallback;
    } catch (e) {
      console.warn("[db] KV.get failed:", e);
    }
  }
  if (BLOB_ENABLED) {
    const cached = valueCache.get(key);
    if (cached && Date.now() - cached.at < VALUE_TTL_MS) {
      return (cached.value as T) ?? fallback;
    }
    const v = await blobGet<T>(key);
    valueCache.set(key, { value: v, at: Date.now() });
    return v ?? fallback;
  }
  return (mem.get(key) as T) ?? fallback;
}

// Every persisted store key (maintenance lives in Edge Config, not here).
export const ALL_STORE_KEYS = [
  "queries", "jobs", "insights", "stats", "clients", "projects", "leads",
  "invoices", "tasks", "company-settings", "doc-counters", "employees",
  "attendance", "leaves", "payslips", "assets", "quotations", "payments",
  "notifications", "admin-users", "audit-log", "expenses", "messages",
  "project-files", "solutions", "subscribers", "sent-emails", "custom-contacts",
] as const;

/** Full snapshot of every store — powers the owner's backup export. */
export async function exportAllStores(): Promise<Record<string, unknown>> {
  const out: Record<string, unknown> = {};
  for (const key of ALL_STORE_KEYS) {
    out[key] = await getValue<unknown>(key, null);
  }
  return out;
}

async function setValue<T>(key: string, value: T): Promise<void> {
  if (PG_ENABLED) {
    try {
      await pgSet(key, value);
      return;
    } catch (e) {
      console.warn("[db] Postgres set failed:", e);
    }
  }
  if (KV_ENABLED) {
    try {
      await kv.set(key, value);
      return;
    } catch (e) {
      console.warn("[db] KV.set failed:", e);
    }
  }
  if (BLOB_ENABLED) {
    if (await blobSet(key, value)) {
      valueCache.set(key, { value, at: Date.now() }); // read-your-writes
      return;
    }
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
  /** Cloudinary cover image URL */
  image?: string;
  published: boolean;
};

// ---------- Solutions / Work showcase (images + videos) ----------
export type SolutionMedia = { type: "image" | "video"; url: string };
export type Solution = {
  id: string;
  title: string;
  category: string;       // "AI" | "CRM" | "Web" | "Mobile" | "Automation" | "Design" | …
  summary: string;        // one-liner
  description: string;    // longer body
  coverImage?: string;    // Cloudinary URL
  media: SolutionMedia[]; // gallery of images + videos
  tags: string[];
  link?: string;          // live site / case study URL
  order: number;          // lower = shown first
  published: boolean;
  createdAt: string;
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

// ---------- Solutions / Work showcase ----------
const SOL_KEY = "solutions";
export const solutionsDb = {
  list: () => getValue<Solution[]>(SOL_KEY, []),
  async upsert(s: Solution) {
    const all = await solutionsDb.list();
    const i = all.findIndex((x) => x.id === s.id);
    if (i >= 0) all[i] = s; else all.unshift(s);
    await setValue(SOL_KEY, all);
  },
  async remove(id: string) {
    const all = await solutionsDb.list();
    await setValue(SOL_KEY, all.filter((x) => x.id !== id));
  },
};

// ---------- Newsletter subscribers ----------
export type Subscriber = { id: string; email: string; createdAt: string };
const SUB_KEY = "subscribers";
export const subscribersDb = {
  list: () => getValue<Subscriber[]>(SUB_KEY, []),
  async add(email: string): Promise<boolean> {
    const e = email.trim().toLowerCase();
    const all = await subscribersDb.list();
    if (all.some((s) => s.email === e)) return false; // already subscribed
    all.unshift({ id: newId(), email: e, createdAt: new Date().toISOString() });
    await setValue(SUB_KEY, all.slice(0, 50000));
    return true;
  },
  async remove(id: string) {
    const all = await subscribersDb.list();
    await setValue(SUB_KEY, all.filter((s) => s.id !== id));
  },
};

// ---------- Saved custom email contacts (reusable address book) ----------
export type CustomContact = { id: string; name: string; email: string; createdAt: string };
const CC_KEY = "custom-contacts";
export const customContactsDb = {
  list: () => getValue<CustomContact[]>(CC_KEY, []),
  /** Add (or update the name of) a contact. Returns true if newly added. */
  async add(name: string, email: string): Promise<boolean> {
    const e = email.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e)) return false;
    const all = await customContactsDb.list();
    const i = all.findIndex((c) => c.email === e);
    if (i >= 0) {
      if (name.trim() && all[i].name !== name.trim()) { all[i] = { ...all[i], name: name.trim() }; await setValue(CC_KEY, all); }
      return false;
    }
    all.unshift({ id: newId(), name: name.trim(), email: e, createdAt: new Date().toISOString() });
    await setValue(CC_KEY, all.slice(0, 10000));
    return true;
  },
  async remove(id: string) {
    const all = await customContactsDb.list();
    await setValue(CC_KEY, all.filter((c) => c.id !== id));
  },
};

// ---------- Sent email history (broadcast composer) ----------
export type SentEmail = {
  id: string;
  subject: string;
  message: string;
  emails: string[];       // recipients (for reuse / resend)
  sent: number;
  failed: number;
  sentByType: string;     // "super" | "admin"
  sentByName: string;
  sentAt: string;
};
const SENT_KEY = "sent-emails";
export const sentEmailsDb = {
  list: () => getValue<SentEmail[]>(SENT_KEY, []),
  async push(e: Omit<SentEmail, "id" | "sentAt">) {
    const all = await sentEmailsDb.list();
    all.unshift({ ...e, id: newId(), sentAt: new Date().toISOString() });
    await setValue(SENT_KEY, all.slice(0, 500));
  },
  async remove(id: string) {
    const all = await sentEmailsDb.list();
    await setValue(SENT_KEY, all.filter((x) => x.id !== id));
  },
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

// ---------- CRM: leads pipeline ----------
export type LeadStage = "new" | "contacted" | "qualified" | "proposal" | "won" | "lost";
export type Lead = {
  id: string;
  createdAt: string;
  name: string;          // contact person
  company?: string;
  email?: string;
  phone?: string;
  source?: string;       // Website, Referral, LinkedIn, …
  service?: string;      // what they're interested in
  value?: number;        // expected deal value
  currency?: string;     // "INR" | "USD" | …
  stage: LeadStage;
  notes?: string;
  nextFollowUp?: string; // date (YYYY-MM-DD)
};

const L_KEY = "leads";

export const leadsDb = {
  list: () => getValue<Lead[]>(L_KEY, []),
  async upsert(lead: Lead) {
    const all = await leadsDb.list();
    const i = all.findIndex((l) => l.id === lead.id);
    if (i >= 0) all[i] = lead; else all.unshift(lead);
    await setValue(L_KEY, all);
  },
  async remove(id: string) {
    const all = await leadsDb.list();
    await setValue(L_KEY, all.filter((l) => l.id !== id));
  },
};

// ---------- ERP: invoices ----------
export type InvoiceStatus = "draft" | "sent" | "paid" | "overdue";
export type InvoiceItem = { description: string; qty: number; rate: number };
export type Invoice = {
  id: string;
  number: string;        // e.g. INV-2026-001
  clientId: string;
  projectId?: string;
  issueDate: string;     // YYYY-MM-DD
  dueDate?: string;
  currency: string;      // "INR" | "USD" | …
  items: InvoiceItem[];
  taxPercent?: number;
  notes?: string;
  status: InvoiceStatus;
};

export function invoiceTotal(inv: Invoice): number {
  const sub = inv.items.reduce((s, it) => s + (it.qty || 0) * (it.rate || 0), 0);
  return Math.round(sub * (1 + (inv.taxPercent || 0) / 100) * 100) / 100;
}

const INV_KEY = "invoices";

export const invoicesDb = {
  list: () => getValue<Invoice[]>(INV_KEY, []),
  async listByClient(clientId: string): Promise<Invoice[]> {
    const all = await invoicesDb.list();
    // Clients only ever see issued invoices — drafts stay internal
    return all.filter((i) => i.clientId === clientId && i.status !== "draft");
  },
  async upsert(inv: Invoice) {
    const all = await invoicesDb.list();
    const i = all.findIndex((x) => x.id === inv.id);
    if (i >= 0) all[i] = inv; else all.unshift(inv);
    await setValue(INV_KEY, all);
  },
  async remove(id: string) {
    const all = await invoicesDb.list();
    await setValue(INV_KEY, all.filter((x) => x.id !== id));
  },
};

// ---------- ERP: internal tasks ----------
export type TaskStatus = "todo" | "in-progress" | "done";
export type Task = {
  id: string;
  createdAt: string;
  title: string;
  projectId?: string;
  assignee?: string;     // display name (legacy / free text)
  assigneeId?: string;   // employee id — links the task to a staff login
  due?: string;          // YYYY-MM-DD
  status: TaskStatus;
};

const T_KEY = "tasks";

export const tasksDb = {
  list: () => getValue<Task[]>(T_KEY, []),
  async upsert(task: Task) {
    const all = await tasksDb.list();
    const i = all.findIndex((t) => t.id === task.id);
    if (i >= 0) all[i] = task; else all.unshift(task);
    await setValue(T_KEY, all);
  },
  async remove(id: string) {
    const all = await tasksDb.list();
    await setValue(T_KEY, all.filter((t) => t.id !== id));
  },
};

export const newId = () => Math.random().toString(36).slice(2, 10);

/* ============================================================
   AGENCY OS — company settings, document serials, employees/HR,
   quotations, payments/ledger, notifications, file vault.
   ============================================================ */

// ---------- Company settings (affects only the NEXT document) ----------
export type CompanySettings = {
  prefix: string;        // serial prefix, e.g. "AMX"
  gstDefault: number;    // default tax % on new docs
  dueDays: number;       // default payment terms
  terms?: string;        // printed on quotations/invoices
  bankDetails?: string;  // shown to clients on unpaid invoices (bank/UPI)
  annualLeave: number;   // leave allowance per employee per year
};
const SET_KEY = "company-settings";
const DEFAULT_SETTINGS: CompanySettings = {
  prefix: "AMX",
  gstDefault: 18,
  dueDays: 14,
  terms: "50% advance, balance on delivery. Prices exclusive of GST.",
  bankDetails: "",
  annualLeave: 18,
};
export const settingsDb = {
  get: () => getValue<CompanySettings>(SET_KEY, DEFAULT_SETTINGS),
  set: (s: CompanySettings) => setValue(SET_KEY, s),
};

// ---------- Immutable document serials: {PREFIX}{YY}{MM}{TYPE}{SEQ} ----------
// e.g. AMX2606IN001. Counters only ever increment — issued numbers never change.
const CTR_KEY = "doc-counters";
export async function nextDocNumber(type: "IN" | "QT" | "PS"): Promise<string> {
  const s = await settingsDb.get();
  const now = new Date();
  const yy = String(now.getFullYear()).slice(2);
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const counters = await getValue<Record<string, number>>(CTR_KEY, {});
  const key = `${yy}${mm}${type}`;
  const seq = (counters[key] || 0) + 1;
  counters[key] = seq;
  await setValue(CTR_KEY, counters);
  return `${s.prefix}${yy}${mm}${type}${String(seq).padStart(3, "0")}`;
}

// ---------- Employees (staff app users) ----------
export type Employee = {
  id: string;
  name: string;
  email: string;         // login (lowercase)
  passwordHash: string;
  designation?: string;  // e.g. "Full-Stack Engineer"
  joinedAt: string;      // YYYY-MM-DD
  salaryMonthly?: number;
  active: boolean;
  shiftStart?: string;   // HH:MM — admin-defined expected start
  shiftEnd?: string;     // HH:MM — admin-defined expected end
};
const E_KEY = "employees";
export const employeesDb = {
  list: () => getValue<Employee[]>(E_KEY, []),
  async findByEmail(email: string) {
    const all = await employeesDb.list();
    return all.find((e) => e.email === email.trim().toLowerCase());
  },
  async findById(id: string) {
    const all = await employeesDb.list();
    return all.find((e) => e.id === id);
  },
  async upsert(e: Employee) {
    const all = await employeesDb.list();
    const i = all.findIndex((x) => x.id === e.id);
    if (i >= 0) all[i] = e; else all.unshift(e);
    await setValue(E_KEY, all);
  },
  async remove(id: string) {
    const all = await employeesDb.list();
    await setValue(E_KEY, all.filter((x) => x.id !== id));
  },
};

// ---------- Attendance (multi-session clock in/out + breaks) ----------
export type AttendanceSession = { in: string; out?: string };       // ISO
export type AttendanceBreak = { type: string; start: string; end?: string }; // ISO
export type AttendanceRow = {
  id: string;
  employeeId: string;
  date: string;          // YYYY-MM-DD
  mode: "office" | "wfh";
  sessions: AttendanceSession[]; // can clock in/out multiple times a day
  breaks: AttendanceBreak[];     // typed break periods
  // Legacy single-shift fields — kept so old rows still read correctly
  inAt?: string;
  outAt?: string;
};

/** Upgrade legacy {inAt,outAt} rows to the sessions/breaks shape on read. */
export function normalizeAttendance(row: AttendanceRow): AttendanceRow {
  const sessions = Array.isArray(row.sessions)
    ? row.sessions
    : row.inAt
    ? [{ in: row.inAt, out: row.outAt }]
    : [];
  const breaks = Array.isArray(row.breaks) ? row.breaks : [];
  return { ...row, sessions, breaks };
}

/** Worked / break time for a day. Open intervals are measured up to `now`. */
export function attendanceTotals(row: AttendanceRow, now = Date.now()) {
  const r = normalizeAttendance(row);
  const dur = (a: string, b?: string) => Math.max(0, (b ? new Date(b).getTime() : now) - new Date(a).getTime());
  const grossMs = r.sessions.reduce((s, x) => s + dur(x.in, x.out), 0);
  const breakMs = r.breaks.reduce((s, x) => s + dur(x.start, x.end), 0);
  const firstIn = r.sessions[0]?.in;
  const lastOut = r.sessions.length && r.sessions[r.sessions.length - 1].out
    ? r.sessions[r.sessions.length - 1].out
    : undefined;
  return { grossMs, breakMs, netMs: Math.max(0, grossMs - breakMs), firstIn, lastOut };
}

const ATT_KEY = "attendance";
export const attendanceDb = {
  list: () => getValue<AttendanceRow[]>(ATT_KEY, []),
  async today(employeeId: string): Promise<AttendanceRow | undefined> {
    const all = await attendanceDb.list();
    const today = new Date().toISOString().slice(0, 10);
    const row = all.find((a) => a.employeeId === employeeId && a.date === today);
    return row ? normalizeAttendance(row) : undefined;
  },
  async upsert(row: AttendanceRow) {
    const all = await attendanceDb.list();
    const i = all.findIndex((a) => a.id === row.id);
    if (i >= 0) all[i] = row; else all.unshift(row);
    await setValue(ATT_KEY, all.slice(0, 5000));
  },
};

// ---------- Leave requests ----------
export type LeaveStatus = "pending" | "approved" | "rejected";
export type LeaveRequest = {
  id: string;
  employeeId: string;
  from: string;          // YYYY-MM-DD
  to: string;
  days: number;
  reason?: string;
  status: LeaveStatus;
  requestedAt: string;
};
const LV_KEY = "leaves";
export const leavesDb = {
  list: () => getValue<LeaveRequest[]>(LV_KEY, []),
  async upsert(l: LeaveRequest) {
    const all = await leavesDb.list();
    const i = all.findIndex((x) => x.id === l.id);
    if (i >= 0) all[i] = l; else all.unshift(l);
    await setValue(LV_KEY, all);
  },
};

// ---------- Payroll (payslips) ----------
export type Payslip = {
  id: string;
  number: string;        // AMX2606PS001
  employeeId: string;
  month: string;         // YYYY-MM
  gross: number;
  deductions: { label: string; amount: number }[];
  net: number;
  generatedAt: string;
  notes?: string;
};
const PSL_KEY = "payslips";
export const payslipsDb = {
  list: () => getValue<Payslip[]>(PSL_KEY, []),
  async listByEmployee(employeeId: string) {
    const all = await payslipsDb.list();
    return all.filter((p) => p.employeeId === employeeId);
  },
  async upsert(p: Payslip) {
    const all = await payslipsDb.list();
    const i = all.findIndex((x) => x.id === p.id);
    if (i >= 0) all[i] = p; else all.unshift(p);
    await setValue(PSL_KEY, all);
  },
  async remove(id: string) {
    const all = await payslipsDb.list();
    await setValue(PSL_KEY, all.filter((x) => x.id !== id));
  },
};

// ---------- Issued assets (ID cards, certificates, equipment) ----------
export type IssuedAsset = {
  id: string;
  employeeId: string;
  name: string;          // "Employee ID Card", "MacBook Air"
  type: string;          // "document" | "equipment" | "certificate"
  url?: string;          // optional file in the vault
  issuedAt: string;
};
const AST_KEY = "assets";
export const assetsDb = {
  list: () => getValue<IssuedAsset[]>(AST_KEY, []),
  async listByEmployee(employeeId: string) {
    const all = await assetsDb.list();
    return all.filter((a) => a.employeeId === employeeId);
  },
  async upsert(a: IssuedAsset) {
    const all = await assetsDb.list();
    const i = all.findIndex((x) => x.id === a.id);
    if (i >= 0) all[i] = a; else all.unshift(a);
    await setValue(AST_KEY, all);
  },
  async remove(id: string) {
    const all = await assetsDb.list();
    await setValue(AST_KEY, all.filter((x) => x.id !== id));
  },
};

// ---------- Quotations (Lead → Client → Quotation → Invoice) ----------
export type QuotationStatus = "draft" | "sent" | "accepted" | "declined" | "expired";
export type Quotation = {
  id: string;
  number: string;        // AMX2606QT001
  clientId: string;
  projectName?: string;
  issueDate: string;
  validUntil?: string;
  currency: string;
  items: InvoiceItem[];
  taxPercent?: number;
  discountPercent?: number;
  terms?: string;
  status: QuotationStatus;
  respondedAt?: string;
  invoiceId?: string;    // set when converted
};
export function quotationTotal(q: Quotation): number {
  const sub = q.items.reduce((s, it) => s + (it.qty || 0) * (it.rate || 0), 0);
  const afterDiscount = sub * (1 - (q.discountPercent || 0) / 100);
  return Math.round(afterDiscount * (1 + (q.taxPercent || 0) / 100) * 100) / 100;
}
const Q2_KEY = "quotations";
export const quotationsDb = {
  list: () => getValue<Quotation[]>(Q2_KEY, []),
  async listByClient(clientId: string) {
    const all = await quotationsDb.list();
    return all.filter((q) => q.clientId === clientId && q.status !== "draft");
  },
  async upsert(q: Quotation) {
    const all = await quotationsDb.list();
    const i = all.findIndex((x) => x.id === q.id);
    if (i >= 0) all[i] = q; else all.unshift(q);
    await setValue(Q2_KEY, all);
  },
  async remove(id: string) {
    const all = await quotationsDb.list();
    await setValue(Q2_KEY, all.filter((x) => x.id !== id));
  },
};

// ---------- Payments → ledger ----------
export type Payment = {
  id: string;
  invoiceId: string;
  clientId: string;
  date: string;          // YYYY-MM-DD
  amount: number;
  currency: string;
  method: string;        // "Bank transfer" | "UPI" | "Razorpay" | "Cash" | …
  reference?: string;
};
const PAY_KEY = "payments";
export const paymentsDb = {
  list: () => getValue<Payment[]>(PAY_KEY, []),
  async listByInvoice(invoiceId: string) {
    const all = await paymentsDb.list();
    return all.filter((p) => p.invoiceId === invoiceId);
  },
  async upsert(p: Payment) {
    const all = await paymentsDb.list();
    const i = all.findIndex((x) => x.id === p.id);
    if (i >= 0) all[i] = p; else all.unshift(p);
    await setValue(PAY_KEY, all);
  },
  async remove(id: string) {
    const all = await paymentsDb.list();
    await setValue(PAY_KEY, all.filter((x) => x.id !== id));
  },
};

// ---------- Notifications (event feed per audience) ----------
export type Notification = {
  id: string;
  audience: string;      // "admin" | `staff:${id}` | `client:${id}`
  type: string;          // "lead" | "quotation" | "payment" | "leave" | "task" | "update" | …
  message: string;
  link?: string;
  read: boolean;
  createdAt: string;
};
const N_KEY = "notifications";
export const notificationsDb = {
  list: () => getValue<Notification[]>(N_KEY, []),
  async listFor(audience: string) {
    const all = await notificationsDb.list();
    return all.filter((n) => n.audience === audience).slice(0, 50);
  },
  async push(n: Omit<Notification, "id" | "read" | "createdAt">) {
    const all = await notificationsDb.list();
    all.unshift({ ...n, id: newId(), read: false, createdAt: new Date().toISOString() });
    await setValue(N_KEY, all.slice(0, 500));
  },
  async markAllRead(audience: string) {
    const all = await notificationsDb.list();
    await setValue(
      N_KEY,
      all.map((n) => (n.audience === audience ? { ...n, read: true } : n))
    );
  },
};

// ---------- Admin users (sub-admins created by the main/super admin) ----------
// The super admin logs in with the master password (env) and manages these.
export type AdminUser = {
  id: string;
  name: string;
  email: string;         // login (lowercase)
  passwordHash: string;
  createdAt: string;
  active: boolean;
};
const ADM_KEY = "admin-users";
export const adminsDb = {
  list: () => getValue<AdminUser[]>(ADM_KEY, []),
  async findByEmail(email: string) {
    const all = await adminsDb.list();
    return all.find((a) => a.email === email.trim().toLowerCase());
  },
  async findById(id: string) {
    const all = await adminsDb.list();
    return all.find((a) => a.id === id);
  },
  async upsert(a: AdminUser) {
    const all = await adminsDb.list();
    const i = all.findIndex((x) => x.id === a.id);
    if (i >= 0) all[i] = a; else all.unshift(a);
    await setValue(ADM_KEY, all);
  },
  async remove(id: string) {
    const all = await adminsDb.list();
    await setValue(ADM_KEY, all.filter((x) => x.id !== id));
  },
};

// ---------- Audit log (append-only activity trail; super-admin only) ----------
export type AuditActor = "super" | "admin" | "client" | "staff" | "visitor" | "system";
export type AuditEntry = {
  id: string;
  at: string;            // ISO timestamp
  actorType: AuditActor;
  actorName: string;     // "Owner", sub-admin name, client company, employee name…
  action: string;        // create | update | delete | login | convert | payment | …
  entity: string;        // client | project | invoice | quotation | leave | …
  detail?: string;       // human sentence — "what was done and how"
};
const AUDIT_KEY = "audit-log";
export const auditDb = {
  list: () => getValue<AuditEntry[]>(AUDIT_KEY, []),
  async push(e: Omit<AuditEntry, "id" | "at">) {
    const all = await auditDb.list();
    all.unshift({ ...e, id: newId(), at: new Date().toISOString() });
    // Keep the most recent 600 events. The whole array is rewritten on every
    // action, so a tighter cap keeps each write small (cheaper storage ops).
    await setValue(AUDIT_KEY, all.slice(0, 600));
  },
};

// ---------- Expenses (money out — completes the ledger) ----------
export type Expense = {
  id: string;
  date: string;          // YYYY-MM-DD
  category: string;      // "Salaries" | "Software" | "Infrastructure" | "Marketing" | …
  description: string;
  amount: number;
  currency: string;
  vendor?: string;
  reference?: string;    // bill / txn id
};
const EXP_KEY = "expenses";
export const expensesDb = {
  list: () => getValue<Expense[]>(EXP_KEY, []),
  async upsert(e: Expense) {
    const all = await expensesDb.list();
    const i = all.findIndex((x) => x.id === e.id);
    if (i >= 0) all[i] = e; else all.unshift(e);
    await setValue(EXP_KEY, all);
  },
  async remove(id: string) {
    const all = await expensesDb.list();
    await setValue(EXP_KEY, all.filter((x) => x.id !== id));
  },
};

// ---------- Messages (client ↔ team conversation, one thread per client) ----------
export type Message = {
  id: string;
  clientId: string;
  from: "client" | "team";
  body: string;
  at: string;            // ISO
  readByClient: boolean;
  readByAdmin: boolean;
};
const MSG_KEY = "messages";
export const messagesDb = {
  list: () => getValue<Message[]>(MSG_KEY, []),
  async listByClient(clientId: string) {
    const all = await messagesDb.list();
    return all
      .filter((m) => m.clientId === clientId)
      .sort((a, b) => a.at.localeCompare(b.at));
  },
  async push(m: Omit<Message, "id" | "at" | "readByClient" | "readByAdmin">) {
    const all = await messagesDb.list();
    const msg: Message = {
      ...m,
      id: newId(),
      at: new Date().toISOString(),
      // sender has implicitly read their own message
      readByClient: m.from === "client",
      readByAdmin: m.from === "team",
    };
    all.unshift(msg);
    await setValue(MSG_KEY, all.slice(0, 2000));
    return msg;
  },
  async markRead(clientId: string, reader: "client" | "admin") {
    const all = await messagesDb.list();
    let changed = false;
    const next = all.map((m) => {
      if (m.clientId !== clientId) return m;
      if (reader === "client" && !m.readByClient) { changed = true; return { ...m, readByClient: true }; }
      if (reader === "admin" && !m.readByAdmin) { changed = true; return { ...m, readByAdmin: true }; }
      return m;
    });
    if (changed) await setValue(MSG_KEY, next);
  },
};

// ---------- Project file vault (deliverables) ----------
export type ProjectFile = {
  id: string;
  projectId: string;
  name: string;
  url: string;           // Vercel Blob URL
  size: number;          // bytes
  contentType: string;
  uploadedAt: string;
  uploadedBy: string;    // "AUMOXO Team"
};
const F_KEY = "project-files";
export const filesDb = {
  list: () => getValue<ProjectFile[]>(F_KEY, []),
  async listByProject(projectId: string) {
    const all = await filesDb.list();
    return all.filter((f) => f.projectId === projectId);
  },
  async upsert(f: ProjectFile) {
    const all = await filesDb.list();
    const i = all.findIndex((x) => x.id === f.id);
    if (i >= 0) all[i] = f; else all.unshift(f);
    await setValue(F_KEY, all);
  },
  async remove(id: string) {
    const all = await filesDb.list();
    await setValue(F_KEY, all.filter((x) => x.id !== id));
  },
};
