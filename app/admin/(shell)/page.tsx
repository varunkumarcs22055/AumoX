"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Briefcase, BookOpen, Settings, ArrowUpRight, Database, AlertCircle } from "lucide-react";
import { jobsStore, insightsStore } from "@/lib/admin/store";

export default function AdminDashboard() {
  const [counts, setCounts] = useState({ jobsActive: 0, jobsTotal: 0, insightsPublished: 0, insightsTotal: 0 });

  useEffect(() => {
    const jobs = jobsStore.list();
    const insights = insightsStore.list();
    setCounts({
      jobsActive: jobs.filter((j) => j.active).length,
      jobsTotal: jobs.length,
      insightsPublished: insights.filter((i) => i.published).length,
      insightsTotal: insights.length,
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

      {/* Status banner */}
      <div className="mt-8 card p-5 flex items-start gap-4 gold-border">
        <Database className="text-gold-400 shrink-0" size={20} />
        <div className="text-sm text-ink-300 font-light leading-relaxed">
          <span className="text-ink-100 font-medium">Storage:</span> Local browser only (MVP).
          Changes you make here are saved to <code className="text-gold-300">localStorage</code>.
          When the DB is wired in, this layer swaps to API calls automatically — UI unchanged.
        </div>
      </div>

      {/* Tiles */}
      <div className="mt-10 grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <DashCard
          href="/admin/careers"
          icon={Briefcase}
          title="Careers"
          stat={`${counts.jobsActive} active · ${counts.jobsTotal} total`}
          desc="Add, edit, archive or delete job openings shown on /careers."
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
          stat="Stats · Contact"
          desc="Edit the hero stats and contact email destination."
        />
      </div>

      {/* Next-up notes */}
      <div className="mt-10 card p-6">
        <div className="flex items-center gap-2 text-gold-400 text-[11px] uppercase tracking-[0.3em]">
          <AlertCircle size={14} /> Coming next
        </div>
        <ul className="mt-4 grid md:grid-cols-2 gap-3 text-sm text-ink-300 font-light">
          <li className="flex items-start gap-2"><span className="text-gold-400">◆</span> Wire to Vercel KV / Postgres so edits go live for all visitors</li>
          <li className="flex items-start gap-2"><span className="text-gold-400">◆</span> Manage services, products, partners</li>
          <li className="flex items-start gap-2"><span className="text-gold-400">◆</span> Image uploads (Vercel Blob / S3)</li>
          <li className="flex items-start gap-2"><span className="text-gold-400">◆</span> Multi-user accounts + audit log</li>
        </ul>
      </div>
    </div>
  );
}

function DashCard({
  href, icon: Icon, title, stat, desc,
}: {
  href: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  title: string;
  stat: string;
  desc: string;
}) {
  return (
    <Link href={href} className="card p-7 gold-border group block">
      <div className="flex items-start justify-between">
        <div className="grid h-11 w-11 place-items-center rounded-lg border border-gold-400/30 bg-gold-400/5 text-gold-300">
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
