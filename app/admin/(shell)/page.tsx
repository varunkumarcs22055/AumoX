"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Briefcase, BookOpen, Settings, ArrowUpRight, Database, AlertCircle, Inbox, Users, FolderKanban, TrendingUp, Receipt, ListChecks, type LucideIcon } from "lucide-react";
import MaintenanceToggle from "@/components/admin/MaintenanceToggle";

export default function AdminDashboard() {
  const [counts, setCounts] = useState({
    jobsActive: 0, jobsTotal: 0,
    insightsPublished: 0, insightsTotal: 0,
    queriesTotal: 0, queriesUnread: 0,
  });

  useEffect(() => {
    Promise.all([
      fetch("/api/admin/jobs", { cache: "no-store" }).then((r) => r.json()).catch(() => ({ jobs: [] })),
      fetch("/api/admin/insights", { cache: "no-store" }).then((r) => r.json()).catch(() => ({ items: [] })),
      fetch("/api/admin/queries", { cache: "no-store" }).then((r) => r.json()).catch(() => ({ queries: [] })),
    ]).then(([jobs, insights, queries]) => {
      const j = (jobs.jobs ?? []) as { active: boolean }[];
      const i = (insights.items ?? []) as { published: boolean }[];
      const q = (queries.queries ?? []) as { read: boolean }[];
      setCounts({
        jobsActive: j.filter((x) => x.active).length,
        jobsTotal: j.length,
        insightsPublished: i.filter((x) => x.published).length,
        insightsTotal: i.length,
        queriesTotal: q.length,
        queriesUnread: q.filter((x) => !x.read).length,
      });
    });
  }, []);

  return (
    <div>
      <div className="flex items-end justify-between flex-wrap gap-4">
        <div>
          <div className="text-[11px] uppercase tracking-[0.3em] text-gold-400">Dashboard</div>
          <h1 className="mt-2 font-display text-4xl font-extralight text-ink-100">Welcome back.</h1>
          <p className="mt-2 text-ink-300 font-light">Manage day-to-day content for AUMOXO from one place.</p>
        </div>
      </div>

      <div className="mt-8">
        <MaintenanceToggle />
      </div>

      <div className="mt-6 card p-5 flex items-start gap-4 gold-border">
        <Database className="text-gold-400 shrink-0" size={20} />
        <div className="text-sm text-ink-300 font-light leading-relaxed">
          <span className="text-ink-100 font-medium">Storage:</span> Vercel KV (Redis).
          Edits here update the live site for every visitor. If KV isn&apos;t enabled yet
          (Project → Storage → Create → KV), the API falls back to in-memory storage
          and resets between deploys.
        </div>
      </div>

      <div className="mt-10 grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <DashCard
          href="/admin/queries"
          icon={Inbox}
          title="Inbox · Customer Queries"
          stat={`${counts.queriesUnread} unread · ${counts.queriesTotal} total`}
          desc="Read, reply to and manage every contact form submission your site receives."
          highlight={counts.queriesUnread > 0}
        />
        <DashCard
          href="/admin/leads"
          icon={TrendingUp}
          title="CRM · Leads"
          stat="Pipeline & deals"
          desc="Track opportunities from first contact to won — stages, value, follow-ups."
        />
        <DashCard
          href="/admin/invoices"
          icon={Receipt}
          title="ERP · Invoices"
          stat="Billing"
          desc="Issue invoices, track paid/outstanding. Clients see them in the portal."
        />
        <DashCard
          href="/admin/tasks"
          icon={ListChecks}
          title="ERP · Tasks"
          stat="Team board"
          desc="Internal to-do board for the team across projects."
        />
        <DashCard
          href="/admin/clients"
          icon={Users}
          title="Clients"
          stat="Portal accounts"
          desc="Create client logins for the project portal and manage access."
        />
        <DashCard
          href="/admin/projects"
          icon={FolderKanban}
          title="Projects"
          stat="Phases · Updates"
          desc="Track delivery phases and publish updates clients see live."
        />
        <DashCard
          href="/admin/careers"
          icon={Briefcase}
          title="Careers"
          stat={`${counts.jobsActive} active · ${counts.jobsTotal} total`}
          desc="Add, edit, archive or delete job openings."
        />
        <DashCard
          href="/admin/insights"
          icon={BookOpen}
          title="Insights"
          stat={`${counts.insightsPublished} published · ${counts.insightsTotal} total`}
          desc="Publish and manage thought-leadership articles."
        />
        <DashCard
          href="/admin/settings"
          icon={Settings}
          title="Site settings"
          stat="Hero stats · Server config"
          desc="Edit the hero stats and view env-managed config."
        />
      </div>

      <div className="mt-10 card p-6">
        <div className="flex items-center gap-2 text-gold-400 text-[11px] uppercase tracking-[0.3em]">
          <AlertCircle size={14} /> Coming next
        </div>
        <ul className="mt-4 grid md:grid-cols-2 gap-3 text-sm text-ink-300 font-light">
          <li className="flex items-start gap-2"><span className="text-gold-400">◆</span> Page content editor (services / industries / solutions copy)</li>
          <li className="flex items-start gap-2"><span className="text-gold-400">◆</span> Multi-user accounts with audit log</li>
          <li className="flex items-start gap-2"><span className="text-gold-400">◆</span> Image upload (Vercel Blob)</li>
          <li className="flex items-start gap-2"><span className="text-gold-400">◆</span> Email digest of new queries</li>
        </ul>
      </div>
    </div>
  );
}

function DashCard({
  href, icon: Icon, title, stat, desc, highlight = false,
}: {
  href: string;
  icon: LucideIcon;
  title: string;
  stat: string;
  desc: string;
  highlight?: boolean;
}) {
  return (
    <Link href={href} className={`card p-7 gold-border group block ${highlight ? "ring-2 ring-gold-400/40" : ""}`}>
      <div className="flex items-start justify-between">
        <div className={`grid h-11 w-11 place-items-center rounded-lg border ${highlight ? "border-gold-400 bg-gold-400/15" : "border-gold-400/30 bg-gold-400/5"} text-gold-300`}>
          <Icon size={18} />
        </div>
        <ArrowUpRight size={18} className="text-gold-400 group-hover:translate-x-1 transition-transform" />
      </div>
      <h3 className="mt-5 text-lg font-light text-ink-100">{title}</h3>
      <div className="mt-1 text-xs text-gold-400 uppercase tracking-[0.2em]">{stat}</div>
      <p className="mt-3 text-sm text-ink-300 font-light leading-relaxed">{desc}</p>
    </Link>
  );
}
