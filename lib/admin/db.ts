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

// In-memory fallback — only used when KV is not configured (local dev)
const mem = new Map<string, unknown>();
const KV_ENABLED =
  !!process.env.KV_REST_API_URL && !!process.env.KV_REST_API_TOKEN;

async function getValue<T>(key: string, fallback: T): Promise<T> {
  if (KV_ENABLED) {
    try {
      const v = await kv.get<T>(key);
      return (v as T) ?? fallback;
    } catch (e) {
      console.warn("[db] KV.get failed, using memory:", e);
    }
  }
  return (mem.get(key) as T) ?? fallback;
}

async function setValue<T>(key: string, value: T): Promise<void> {
  if (KV_ENABLED) {
    try {
      await kv.set(key, value);
      return;
    } catch (e) {
      console.warn("[db] KV.set failed, using memory:", e);
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
const M_KEY = "maintenance";
export type Maintenance = { enabled: boolean; message?: string };
const DEFAULT_MAINTENANCE: Maintenance = { enabled: false };
export const maintenanceDb = {
  get: () => getValue<Maintenance>(M_KEY, DEFAULT_MAINTENANCE),
  set: (m: Maintenance) => setValue(M_KEY, m),
};

export const newId = () => Math.random().toString(36).slice(2, 10);
