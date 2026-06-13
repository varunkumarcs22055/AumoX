"use client";

import { useEffect, useRef, useState } from "react";
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
  Receipt,
  FileText,
  Download,
  Bell,
  ThumbsUp,
  ThumbsDown,
  Printer,
  Send,
  Lock,
} from "lucide-react";
import { LogoMark } from "@/components/Logo";
import { printDocument } from "@/lib/print-doc";

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
type PortalInvoice = {
  id: string;
  number: string;
  issueDate: string;
  dueDate?: string;
  currency: string;
  status: "sent" | "paid" | "overdue";
  total: number;
  items: { description: string; qty: number; rate: number }[];
  taxPercent?: number;
  notes?: string;
};
type PortalQuotation = {
  id: string;
  number: string;
  projectName?: string;
  issueDate: string;
  validUntil?: string;
  currency: string;
  items: { description: string; qty: number; rate: number }[];
  taxPercent?: number;
  discountPercent?: number;
  terms?: string;
  status: "sent" | "accepted" | "declined" | "expired";
  total: number;
};
type PortalFile = { id: string; projectId: string; name: string; url: string; size: number; uploadedAt: string };
type Notif = { id: string; message: string; read: boolean; createdAt: string };
type PortalTask = { id: string; projectId: string; title: string; status: "todo" | "in-progress" | "done"; due?: string };
type Me = {
  client: { company: string; name: string; email: string };
  projects: Project[];
  invoices?: PortalInvoice[];
  quotations?: PortalQuotation[];
  files?: PortalFile[];
  notifications?: Notif[];
  tasks?: PortalTask[];
  bankDetails?: string;
};

const QUO_BADGE: Record<PortalQuotation["status"], string> = {
  sent:     "border-sky-400/40 text-sky-300 bg-sky-400/10",
  accepted: "border-green-400/40 text-green-300 bg-green-400/10",
  declined: "border-red-400/40 text-red-400 bg-red-400/10",
  expired:  "border-amber-400/40 text-amber-300 bg-amber-400/10",
};

function fmtSize(bytes: number) {
  if (bytes > 1024 * 1024) return (bytes / 1024 / 1024).toFixed(1) + " MB";
  return Math.max(1, Math.round(bytes / 1024)) + " KB";
}

function moneySym(cur: string) {
  return cur === "INR" ? "₹" : cur === "USD" ? "$" : cur === "EUR" ? "€" : cur + " ";
}

const INV_BADGE: Record<PortalInvoice["status"], string> = {
  sent:    "border-sky-400/40 text-sky-300 bg-sky-400/10",
  paid:    "border-green-400/40 text-green-300 bg-green-400/10",
  overdue: "border-red-400/40 text-red-400 bg-red-400/10",
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

type ThreadMsg = { id: string; from: "client" | "team"; body: string; at: string };

function fmtTime(iso: string) {
  try {
    return new Date(iso).toLocaleString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });
  } catch {
    return iso;
  }
}

export default function PortalPage() {
  const router = useRouter();
  const [me, setMe] = useState<Me | null>(null);
  const [loading, setLoading] = useState(true);
  const [thread, setThread] = useState<ThreadMsg[]>([]);
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const threadEndRef = useRef<HTMLDivElement>(null);
  const [pwForm, setPwForm] = useState({ current: "", next: "" });
  const [pwMsg, setPwMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [pwSaving, setPwSaving] = useState(false);

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
    fetch("/api/portal/messages", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => d?.messages && setThread(d.messages));
  }, [router]);

  useEffect(() => { threadEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [thread]);

  async function sendMessage() {
    if (!draft.trim()) return;
    setSending(true);
    try {
      const res = await fetch("/api/portal/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body: draft }),
      });
      const data = await res.json();
      if (res.ok) {
        setThread(data.messages ?? []);
        setDraft("");
      } else {
        alert(data.error ?? "Failed to send.");
      }
    } finally {
      setSending(false);
    }
  }

  async function changePassword() {
    setPwMsg(null);
    if (!pwForm.current || pwForm.next.length < 8) {
      setPwMsg({ ok: false, text: "Enter your current password and a new one (8+ characters)." });
      return;
    }
    setPwSaving(true);
    try {
      const res = await fetch("/api/portal/password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(pwForm),
      });
      const data = await res.json();
      if (!res.ok) {
        setPwMsg({ ok: false, text: data.error ?? "Failed to update password." });
      } else {
        setPwMsg({ ok: true, text: "Password updated." });
        setPwForm({ current: "", next: "" });
      }
    } finally {
      setPwSaving(false);
    }
  }

  function printInvoice(inv: PortalInvoice) {
    printDocument({
      kind: "INVOICE",
      number: inv.number,
      issueDate: inv.issueDate,
      dueDate: inv.dueDate,
      status: inv.status,
      billTo: { company: me!.client.company, name: me!.client.name, email: me!.client.email },
      currency: inv.currency,
      items: inv.items,
      taxPercent: inv.taxPercent,
      notes: inv.notes,
      bankDetails: me?.bankDetails,
    });
  }

  async function logout() {
    await fetch("/api/portal/logout", { method: "POST" });
    router.push("/portal/login");
  }

  async function respondQuotation(q: PortalQuotation, action: "accept" | "decline") {
    const verb = action === "accept" ? "Accept" : "Decline";
    if (!confirm(`${verb} quotation ${q.number}?`)) return;
    const res = await fetch("/api/portal/quotations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: q.id, action }),
    });
    if (!res.ok) {
      const d = await res.json();
      alert(d.error || "Action failed");
    }
    // refresh data
    const me2 = await fetch("/api/portal/me", { cache: "no-store" }).then((r) => r.json());
    setMe(me2);
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

                  {/* Work items — granular tasks the team is delivering */}
                  {(() => {
                    const projectTasks = (me.tasks ?? []).filter((t) => t.projectId === p.id);
                    if (projectTasks.length === 0) return null;
                    const order = { "in-progress": 0, todo: 1, done: 2 } as const;
                    const sorted = [...projectTasks].sort((a, b) => order[a.status] - order[b.status]);
                    const done = projectTasks.filter((t) => t.status === "done").length;
                    return (
                      <div className="p-8 lg:p-10 border-b border-line">
                        <div className="flex items-center justify-between mb-6">
                          <div className="text-[11px] uppercase tracking-[0.3em] text-gold-400">
                            Work items
                          </div>
                          <div className="text-xs text-ink-400">{done}/{projectTasks.length} done</div>
                        </div>
                        <ul className="space-y-2.5">
                          {sorted.map((t) => (
                            <li key={t.id} className="flex items-center gap-3">
                              {t.status === "done" ? (
                                <CheckCircle2 size={16} className="text-gold-400 shrink-0" />
                              ) : t.status === "in-progress" ? (
                                <span className="relative grid place-items-center h-4 w-4 shrink-0">
                                  <span className="absolute h-full w-full rounded-full border border-gold-400 animate-ping-slow" />
                                  <span className="h-2 w-2 rounded-full bg-gold-400" />
                                </span>
                              ) : (
                                <Circle size={16} className="text-ink-500 shrink-0" />
                              )}
                              <span className={`text-sm font-light flex-1 ${t.status === "done" ? "text-ink-400 line-through" : t.status === "in-progress" ? "text-gold-300" : "text-ink-200"}`}>
                                {t.title}
                              </span>
                              {t.status === "in-progress" && (
                                <span className="text-[10px] uppercase tracking-[0.2em] text-gold-400 shrink-0">In progress</span>
                              )}
                              {t.due && t.status !== "done" && (
                                <span className="text-[11px] text-ink-400 shrink-0">{fmtDate(t.due)}</span>
                              )}
                            </li>
                          ))}
                        </ul>
                      </div>
                    );
                  })()}

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

        {/* Alerts */}
        {(me.notifications?.length ?? 0) > 0 && (
          <div className="mt-12 card p-6 max-w-3xl">
            <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.3em] text-gold-400">
              <Bell size={13} /> Recent activity
            </div>
            <ul className="mt-4 space-y-2.5">
              {me.notifications!.slice(0, 6).map((n) => (
                <li key={n.id} className={`text-sm font-light ${n.read ? "text-ink-400" : "text-ink-100"}`}>
                  <span className="text-gold-400 mr-1.5">•</span>
                  {n.message}
                  <span className="text-ink-500 text-xs ml-2">{fmtDate(n.createdAt)}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Quotations — accept or decline */}
        {(me.quotations?.length ?? 0) > 0 && (
          <div className="mt-12">
            <div className="eyebrow">
              <span className="h-px w-8 bg-gold-400" />
              Quotations
            </div>
            <div className="mt-6 space-y-4 max-w-3xl">
              {me.quotations!.map((q) => (
                <div key={q.id} className="card p-6 gold-border">
                  <div className="flex flex-wrap items-center gap-4">
                    <div className="grid h-10 w-10 place-items-center rounded-lg border border-gold-400/30 bg-gold-400/5 text-gold-300 shrink-0">
                      <FileText size={16} />
                    </div>
                    <div className="flex-1 min-w-[160px]">
                      <div className="text-ink-100 font-light">{q.number}{q.projectName ? ` · ${q.projectName}` : ""}</div>
                      <div className="text-xs text-ink-400 mt-0.5">
                        Issued {fmtDate(q.issueDate)}{q.validUntil ? ` · valid till ${fmtDate(q.validUntil)}` : ""}
                      </div>
                    </div>
                    <div className="font-display text-xl font-light gold-text shrink-0">
                      {moneySym(q.currency)}{q.total.toLocaleString()}
                    </div>
                    <span className={`text-[10px] uppercase tracking-[0.2em] px-3 py-1 rounded-full border shrink-0 ${QUO_BADGE[q.status]}`}>
                      {q.status === "sent" ? "Awaiting your response" : q.status}
                    </span>
                  </div>
                  {/* Line items */}
                  <div className="mt-4 pt-4 border-t border-line">
                    <ul className="space-y-1.5">
                      {q.items.map((it, i) => (
                        <li key={i} className="flex justify-between text-sm font-light">
                          <span className="text-ink-200">{it.description} × {it.qty}</span>
                          <span className="text-ink-300">{moneySym(q.currency)}{(it.qty * it.rate).toLocaleString()}</span>
                        </li>
                      ))}
                    </ul>
                    <div className="mt-2 text-xs text-ink-400">
                      {(q.discountPercent || 0) > 0 ? `Discount ${q.discountPercent}% · ` : ""}
                      {(q.taxPercent || 0) > 0 ? `GST ${q.taxPercent}%` : ""}
                    </div>
                    {q.terms && <p className="mt-3 text-xs text-ink-400 font-light leading-relaxed">{q.terms}</p>}
                  </div>
                  {q.status === "sent" && (
                    <div className="mt-5 flex gap-3">
                      <button onClick={() => respondQuotation(q, "accept")} className="btn-gold !py-2 !px-5 text-sm">
                        <ThumbsUp size={14} /> Accept quotation
                      </button>
                      <button onClick={() => respondQuotation(q, "decline")} className="btn-ghost !py-2 !px-5 text-sm !text-red-400">
                        <ThumbsDown size={14} /> Decline
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Deliverables / file vault */}
        {(me.files?.length ?? 0) > 0 && (
          <div className="mt-12">
            <div className="eyebrow">
              <span className="h-px w-8 bg-gold-400" />
              Deliverables
            </div>
            <div className="mt-6 space-y-2.5 max-w-3xl">
              {me.files!.map((f) => (
                <a
                  key={f.id}
                  href={f.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="card p-4 flex items-center gap-4 group"
                >
                  <div className="grid h-10 w-10 place-items-center rounded-lg border border-gold-400/30 bg-gold-400/5 text-gold-300 shrink-0">
                    <Download size={15} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm text-ink-100 font-light truncate group-hover:text-gold-300 transition-colors">{f.name}</div>
                    <div className="text-xs text-ink-400 mt-0.5">
                      {me.projects.find((p) => p.id === f.projectId)?.name ?? "Project"} · {fmtSize(f.size)} · {fmtDate(f.uploadedAt)}
                    </div>
                  </div>
                </a>
              ))}
            </div>
          </div>
        )}

        {/* Invoices */}
        {(me.invoices?.length ?? 0) > 0 && (
          <div className="mt-12">
            <div className="eyebrow">
              <span className="h-px w-8 bg-gold-400" />
              Invoices
            </div>
            <div className="mt-6 space-y-3 max-w-3xl">
              {me.invoices!.map((inv) => (
                <div key={inv.id} className="card p-5 flex flex-wrap items-center gap-4">
                  <div className="grid h-10 w-10 place-items-center rounded-lg border border-gold-400/30 bg-gold-400/5 text-gold-300 shrink-0">
                    <Receipt size={16} />
                  </div>
                  <div className="flex-1 min-w-[160px]">
                    <div className="text-ink-100 font-light">{inv.number}</div>
                    <div className="text-xs text-ink-400 mt-0.5">
                      Issued {fmtDate(inv.issueDate)}
                      {inv.dueDate ? ` · Due ${fmtDate(inv.dueDate)}` : ""}
                    </div>
                  </div>
                  <div className="font-display text-xl font-light gold-text shrink-0">
                    {moneySym(inv.currency)}{inv.total.toLocaleString()}
                  </div>
                  <span className={`text-[10px] uppercase tracking-[0.2em] px-3 py-1 rounded-full border shrink-0 ${INV_BADGE[inv.status]}`}>
                    {inv.status === "sent" ? "Awaiting payment" : inv.status}
                  </span>
                  <button
                    onClick={() => printInvoice(inv)}
                    className="p-2 rounded-lg text-gold-300 hover:bg-gold-400/10 shrink-0"
                    aria-label="Download / print invoice"
                    title="Download as PDF"
                  >
                    <Printer size={16} />
                  </button>
                </div>
              ))}
            </div>
            {me.bankDetails && me.invoices!.some((i) => i.status !== "paid") && (
              <div className="mt-4 card p-5 max-w-3xl text-sm text-ink-300 font-light whitespace-pre-wrap">
                <span className="block text-[10px] uppercase tracking-[0.25em] text-gold-400 mb-2">Payment details</span>
                {me.bankDetails}
              </div>
            )}
          </div>
        )}

        {/* Messages — direct thread with the team */}
        <div className="mt-12 max-w-3xl">
          <div className="eyebrow">
            <span className="h-px w-8 bg-gold-400" />
            Messages
          </div>
          <div className="mt-6 card gold-border overflow-hidden flex flex-col">
            <div className="px-6 py-4 border-b border-line flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="grid h-9 w-9 place-items-center rounded-lg border border-gold-400/30 bg-gold-400/5 text-gold-300 shrink-0">
                  <MessageSquare size={16} />
                </div>
                <div>
                  <div className="text-sm text-ink-100 font-light">Your AUMOXO team</div>
                  <div className="text-xs text-ink-400">Replies within one working day</div>
                </div>
              </div>
              <a href="mailto:hello@aumoxo.tech" className="text-xs text-ink-400 hover:text-gold-300 transition-colors inline-flex items-center gap-1.5">
                <Mail size={13} /> hello@aumoxo.tech
              </a>
            </div>
            <div className="p-5 space-y-3 max-h-[380px] overflow-y-auto">
              {thread.length === 0 ? (
                <p className="text-sm text-ink-400 font-light text-center py-6">
                  No messages yet — ask us anything about your project.
                </p>
              ) : thread.map((m) => (
                <div key={m.id} className={`flex ${m.from === "client" ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm font-light leading-relaxed ${
                    m.from === "client"
                      ? "bg-gold-400/15 border border-gold-400/30 text-ink-100"
                      : "bg-bg-elevated border border-line text-ink-200"
                  }`}>
                    <p className="whitespace-pre-wrap">{m.body}</p>
                    <div className="mt-1 text-[10px] text-ink-400">
                      {m.from === "team" ? "AUMOXO · " : ""}{fmtTime(m.at)}
                    </div>
                  </div>
                </div>
              ))}
              <div ref={threadEndRef} />
            </div>
            <div className="p-4 border-t border-line flex gap-2">
              <textarea
                className="input !py-2.5 flex-1 resize-none"
                rows={1}
                placeholder="Write a message to the team…"
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
              />
              <button onClick={sendMessage} disabled={sending || !draft.trim()} className="btn-gold !py-2.5 !px-4 text-sm disabled:opacity-50">
                {sending ? <Loader2 size={15} className="animate-spin" /> : <Send size={15} />}
              </button>
            </div>
          </div>
        </div>

        {/* Account security */}
        <div className="mt-12 card p-6 max-w-3xl">
          <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.3em] text-gold-400">
            <Lock size={13} /> Account security
          </div>
          <div className="mt-4 grid sm:grid-cols-[1fr_1fr_auto] gap-3 items-end">
            <label className="block">
              <span className="block text-[11px] uppercase tracking-[0.25em] text-ink-300 mb-2">Current password</span>
              <input type="password" className="input !py-2" value={pwForm.current} onChange={(e) => setPwForm({ ...pwForm, current: e.target.value })} autoComplete="current-password" />
            </label>
            <label className="block">
              <span className="block text-[11px] uppercase tracking-[0.25em] text-ink-300 mb-2">New password (8+ chars)</span>
              <input type="password" className="input !py-2" value={pwForm.next} onChange={(e) => setPwForm({ ...pwForm, next: e.target.value })} autoComplete="new-password" />
            </label>
            <button onClick={changePassword} disabled={pwSaving} className="btn-gold text-sm !py-2.5 !px-5 disabled:opacity-60">
              {pwSaving ? <Loader2 size={14} className="animate-spin" /> : <Lock size={14} />} Update
            </button>
          </div>
          {pwMsg && <p className={`mt-3 text-sm ${pwMsg.ok ? "text-green-300" : "text-red-400"}`}>{pwMsg.text}</p>}
        </div>
      </main>
    </div>
  );
}
