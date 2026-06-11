"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Loader2,
  LogOut,
  CheckCircle2,
  Circle,
  CalendarDays,
  Target,
  MessageSquare,
  Sparkles,
  PauseCircle,
  Mail,
} from "lucide-react";
import { LogoMark } from "@/components/Logo";

type Phase = { name: string; status: "pending" | "in-progress" | "completed"; note?: string };
type Update = { id: string; date: string; title: string; body?: string };
type Project = {
  id: string;
  name: string;
  description?: string;
  status: "active" | "on-hold" | "completed";
  phases: Phase[];
  updates: Update[];
  startDate?: string;
  targetDate?: string;
};
type Me = {
  client: { company: string; name: string; email: string };
  projects: Project[];
};

function fmtDate(iso?: string) {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
  } catch {
    return iso;
  }
}

function progressOf(p: Project) {
  if (p.phases.length === 0) return 0;
  const done = p.phases.filter((x) => x.status === "completed").length;
  const half = p.phases.filter((x) => x.status === "in-progress").length * 0.5;
  return Math.round(((done + half) / p.phases.length) * 100);
}

function currentPhaseName(p: Project) {
  const active = p.phases.find((x) => x.status === "in-progress");
  if (active) return active.name;
  const next = p.phases.find((x) => x.status === "pending");
  if (p.phases.length && p.phases.every((x) => x.status === "completed")) return "Completed";
  return next ? next.name : "—";
}

const STATUS_BADGE: Record<Project["status"], { label: string; cls: string }> = {
  active:    { label: "Active",    cls: "border-green-400/40 text-green-300 bg-green-400/10" },
  "on-hold": { label: "On hold",   cls: "border-amber-400/40 text-amber-300 bg-amber-400/10" },
  completed: { label: "Completed", cls: "border-gold-400/40 text-gold-300 bg-gold-400/10" },
};

export default function PortalPage() {
  const router = useRouter();
  const [me, setMe] = useState<Me | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/portal/me", { cache: "no-store" })
      .then(async (r) => {
        if (r.status === 401) {
          router.push("/portal/login");
          return null;
        }
        return r.json();
      })
      .then((d) => d && setMe(d))
      .finally(() => setLoading(false));
  }, [router]);

  async function logout() {
    await fetch("/api/portal/logout", { method: "POST" });
    router.push("/portal/login");
  }

  if (loading || !me) {
    return (
      <div className="min-h-screen bg-bg-base grid place-items-center text-ink-400">
        <div className="flex items-center gap-2 text-sm">
          <Loader2 size={16} className="animate-spin" /> Loading your portal…
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg-base">
      {/* Top bar */}
      <header className="sticky top-0 z-40 bg-bg-base/85 backdrop-blur-xl border-b border-line">
        <div className="container-x h-[72px] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <LogoMark size={40} />
            <div>
              <div className="text-sm font-medium tracking-wider text-ink-100">AUMOXO</div>
              <div className="text-[10px] uppercase tracking-[0.3em] text-gold-400">Client Portal</div>
            </div>
          </div>
          <div className="flex items-center gap-5">
            <div className="hidden sm:block text-right">
              <div className="text-sm text-ink-100">{me.client.company}</div>
              <div className="text-xs text-ink-400">{me.client.email}</div>
            </div>
            <button
              onClick={logout}
              className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-ink-300 hover:text-red-400 transition-colors"
            >
              <LogOut size={14} /> Sign out
            </button>
          </div>
        </div>
      </header>

      <main className="container-x py-12 lg:py-16">
        {/* Welcome */}
        <div className="mb-12">
          <div className="eyebrow">
            <span className="h-px w-8 bg-gold-400" />
            Project Dashboard
          </div>
          <h1 className="mt-4 font-display text-4xl lg:text-5xl font-extralight text-ink-100">
            Welcome{me.client.name ? `, ${me.client.name.split(" ")[0]}` : ""}.
          </h1>
          <p className="mt-3 text-ink-300 font-light">
            Live status of {me.projects.length === 1 ? "your project" : "your projects"} with AUMOXO —
            updated by the team as work progresses.
          </p>
        </div>

        {/* Projects */}
        {me.projects.length === 0 ? (
          <div className="card p-12 gold-border text-center max-w-2xl">
            <Sparkles size={28} className="text-gold-400 mx-auto" />
            <h2 className="mt-4 font-display text-2xl font-light text-ink-100">
              Your project is being set up.
            </h2>
            <p className="mt-3 text-ink-300 font-light">
              The AUMOXO team will publish your project here shortly. If you believe
              something is missing, contact your project lead.
            </p>
          </div>
        ) : (
          <div className="space-y-10">
            {me.projects.map((p) => {
              const pct = progressOf(p);
              const badge = STATUS_BADGE[p.status];
              return (
                <section key={p.id} className="card gold-border overflow-hidden">
                  {/* Project header */}
                  <div className="p-8 lg:p-10 border-b border-line">
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-3 flex-wrap">
                          <h2 className="font-display text-3xl font-extralight text-ink-100">{p.name}</h2>
                          <span className={`text-[10px] uppercase tracking-[0.25em] px-3 py-1 rounded-full border ${badge.cls}`}>
                            {p.status === "on-hold" && <PauseCircle size={10} className="inline mr-1 -mt-0.5" />}
                            {badge.label}
                          </span>
                        </div>
                        {p.description && (
                          <p className="mt-3 text-ink-300 font-light max-w-2xl leading-relaxed">{p.description}</p>
                        )}
                      </div>
                      <div className="text-right shrink-0">
                        <div className="font-display text-4xl font-extralight gold-text">{pct}%</div>
                        <div className="text-[10px] uppercase tracking-[0.25em] text-ink-400 mt-1">complete</div>
                      </div>
                    </div>

                    {/* Progress bar */}
                    <div className="mt-6 h-1.5 rounded-full bg-bg-elevated overflow-hidden">
                      <div
                        className="h-full rounded-full bg-gold-gradient transition-all duration-700"
                        style={{ width: `${pct}%` }}
                      />
                    </div>

                    <div className="mt-4 flex flex-wrap gap-x-8 gap-y-2 text-xs text-ink-400">
                      <span className="inline-flex items-center gap-1.5">
                        <CalendarDays size={13} className="text-gold-400" /> Started {fmtDate(p.startDate)}
                      </span>
                      <span className="inline-flex items-center gap-1.5">
                        <Target size={13} className="text-gold-400" /> Target {fmtDate(p.targetDate)}
                      </span>
                      <span className="inline-flex items-center gap-1.5 text-gold-300">
                        <Sparkles size={13} /> Current phase: {currentPhaseName(p)}
                      </span>
                    </div>
                  </div>

                  {/* Phase tracker */}
                  <div className="p-8 lg:p-10 border-b border-line">
                    <div className="text-[11px] uppercase tracking-[0.3em] text-gold-400 mb-6">
                      Delivery Phases
                    </div>
                    <ol className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-px overflow-hidden rounded-xl border border-line bg-line">
                      {p.phases.map((ph, i) => (
                        <li
                          key={ph.name + i}
                          className={`bg-bg-base p-5 ${ph.status === "in-progress" ? "bg-gold-400/5" : ""}`}
                        >
                          <div className="flex items-center gap-2">
                            {ph.status === "completed" ? (
                              <CheckCircle2 size={18} className="text-gold-400 shrink-0" />
                            ) : ph.status === "in-progress" ? (
                              <span className="relative grid place-items-center h-[18px] w-[18px] shrink-0">
                                <span className="absolute h-full w-full rounded-full border-2 border-gold-400 animate-ping opacity-40" />
                                <span className="h-2.5 w-2.5 rounded-full bg-gold-400" />
                              </span>
                            ) : (
                              <Circle size={18} className="text-ink-500 shrink-0" />
                            )}
                            <span className="text-[10px] uppercase tracking-[0.2em] text-ink-400">
                              {String(i + 1).padStart(2, "0")}
                            </span>
                          </div>
                          <div
                            className={`mt-3 text-sm font-light ${
                              ph.status === "completed"
                                ? "text-ink-100"
                                : ph.status === "in-progress"
                                ? "text-gold-300"
                                : "text-ink-400"
                            }`}
                          >
                            {ph.name}
                          </div>
                          {ph.note && (
                            <div className="mt-1.5 text-xs text-ink-400 font-light leading-snug">{ph.note}</div>
                          )}
                        </li>
                      ))}
                    </ol>
                  </div>

                  {/* Updates timeline */}
                  <div className="p-8 lg:p-10">
                    <div className="text-[11px] uppercase tracking-[0.3em] text-gold-400 mb-6">
                      Updates from the team
                    </div>
                    {p.updates.length === 0 ? (
                      <p className="text-sm text-ink-400 font-light">
                        No updates posted yet — the team will share progress here.
                      </p>
                    ) : (
                      <ol className="relative border-l border-line space-y-8 pl-6">
                        {p.updates.map((u) => (
                          <li key={u.id} className="relative">
                            <span className="absolute -left-[31px] top-1 grid h-2.5 w-2.5 place-items-center rounded-full bg-gold-400" />
                            <div className="text-xs text-ink-400">{fmtDate(u.date)}</div>
                            <div className="mt-1 text-ink-100 font-light">{u.title}</div>
                            {u.body && (
                              <p className="mt-1.5 text-sm text-ink-300 font-light leading-relaxed whitespace-pre-wrap">
                                {u.body}
                              </p>
                            )}
                          </li>
                        ))}
                      </ol>
                    )}
                  </div>
                </section>
              );
            })}
          </div>
        )}

        {/* Support card */}
        <div className="mt-12 card p-8 gold-border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 max-w-3xl">
          <div className="flex items-start gap-4">
            <div className="grid h-11 w-11 place-items-center rounded-lg border border-gold-400/30 bg-gold-400/5 text-gold-300 shrink-0">
              <MessageSquare size={18} />
            </div>
            <div>
              <h3 className="text-ink-100 font-light">Questions about your project?</h3>
              <p className="mt-1 text-sm text-ink-300 font-light">
                Your project lead replies within one working day.
              </p>
            </div>
          </div>
          <a href="mailto:hello@aumoxo.tech" className="btn-gold !py-2.5 !px-5 text-sm shrink-0">
            <Mail size={15} /> Contact us
          </a>
        </div>
      </main>
    </div>
  );
}
