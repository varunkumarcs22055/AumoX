/**
 * Admin data store — localStorage-backed for MVP.
 *
 * When the DB lands, swap these implementations to call /api/admin/<entity>
 * routes that talk to Postgres/Mongo/KV. The component-facing API
 * (loadAll/save/upsert/remove) stays identical so no UI changes are needed.
 */

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

const KEY = (entity: string) => `aumox_admin_${entity}`;

function load<T>(entity: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(KEY(entity));
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function save<T>(entity: string, value: T) {
  if (typeof window === "undefined") return;
  localStorage.setItem(KEY(entity), JSON.stringify(value));
}

// ---- Jobs ----
const DEFAULT_JOBS: Job[] = [
  { id: "1", title: "Senior Cloud Architect",      team: "Cloud & Infrastructure", location: "Remote · Global",    type: "Full-time", level: "Senior",    active: true },
  { id: "2", title: "Principal AI Engineer",       team: "AI & Data",              location: "Bangalore · Hybrid", type: "Full-time", level: "Principal", active: true },
  { id: "3", title: "Staff Platform Engineer",     team: "Engineering",            location: "Remote · EMEA",      type: "Full-time", level: "Staff",     active: true },
  { id: "4", title: "Cybersecurity Consultant",    team: "Security",               location: "London · Hybrid",    type: "Full-time", level: "Senior",    active: true },
  { id: "5", title: "Product Designer",            team: "Design",                 location: "Remote · Americas",  type: "Full-time", level: "Mid–Senior",active: true },
  { id: "6", title: "Engineering Manager",         team: "Digital Engineering",    location: "Singapore · Hybrid", type: "Full-time", level: "Manager",   active: true },
];

export const jobsStore = {
  list:  ()                  => load<Job[]>("jobs", DEFAULT_JOBS),
  saveAll: (jobs: Job[])     => save("jobs", jobs),
  upsert: (job: Job) => {
    const list = jobsStore.list();
    const i = list.findIndex(j => j.id === job.id);
    if (i >= 0) list[i] = job; else list.unshift(job);
    save("jobs", list);
  },
  remove: (id: string) => save("jobs", jobsStore.list().filter(j => j.id !== id)),
  reset: () => save("jobs", DEFAULT_JOBS),
};

// ---- Insights ----
const DEFAULT_INSIGHTS: Insight[] = [
  { id: "1", title: "The enterprise GenAI maturity model — five stages to value", tag: "GenAI",      excerpt: "After 80+ deployments, a clear pattern has emerged.", date: "2026-05-14", readMin: 12, author: "Anika Sharma",   published: true },
  { id: "2", title: "Multi-cloud FinOps: how leaders cut 40% in 90 days",         tag: "Cloud",      excerpt: "A practical playbook for cost takeout without slowdowns.", date: "2026-05-07", readMin: 9,  author: "David Okafor",   published: true },
  { id: "3", title: "Zero-trust beyond identity — the operating model shift",     tag: "Security",   excerpt: "Why identity alone isn't enough — and what to add.",    date: "2026-04-28", readMin: 11, author: "Priya Iyer",     published: true },
];

export const insightsStore = {
  list:  ()                     => load<Insight[]>("insights", DEFAULT_INSIGHTS),
  saveAll: (items: Insight[])   => save("insights", items),
  upsert: (item: Insight) => {
    const list = insightsStore.list();
    const i = list.findIndex(x => x.id === item.id);
    if (i >= 0) list[i] = item; else list.unshift(item);
    save("insights", list);
  },
  remove: (id: string) => save("insights", insightsStore.list().filter(i => i.id !== id)),
  reset: () => save("insights", DEFAULT_INSIGHTS),
};

// ---- Site Stats ----
const DEFAULT_STATS: SiteStats = { countries: 60, clients: 250, engineers: 1200, uptime: 99.99 };

export const statsStore = {
  get:  ()                       => load<SiteStats>("stats", DEFAULT_STATS),
  save: (s: SiteStats)           => save("stats", s),
  reset: () => save("stats", DEFAULT_STATS),
};

export const newId = () => Math.random().toString(36).slice(2, 10);
