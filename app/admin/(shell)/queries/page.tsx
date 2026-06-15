"use client";

import { useEffect, useState } from "react";
import {
  Mail,
  Phone,
  Building2,
  Calendar,
  Clock,
  DollarSign,
  Trash2,
  Check,
  Eye,
  EyeOff,
  RefreshCw,
  Inbox,
  Loader2,
  Send,
} from "lucide-react";

type Query = {
  id: string;
  receivedAt: string;
  name: string;
  email: string;
  company?: string;
  phone?: string;
  service: string;
  timeline?: string;
  budget?: string;
  message: string;
  read: boolean;
  status?: "new" | "reviewing" | "next-phase" | "rejected" | "closed";
  replies?: { body: string; at: string }[];
};

const STATUS_META: Record<NonNullable<Query["status"]>, { label: string; cls: string }> = {
  new: { label: "New", cls: "border-sky-400/40 text-sky-300" },
  reviewing: { label: "Reviewing", cls: "border-amber-400/40 text-amber-300" },
  "next-phase": { label: "Next phase ✓", cls: "border-green-400/40 text-green-300" },
  rejected: { label: "Rejected", cls: "border-red-400/40 text-red-400" },
  closed: { label: "Closed", cls: "border-ink-400/40 text-ink-400" },
};

export default function QueriesAdmin() {
  const [queries, setQueries] = useState<Query[]>([]);
  const [filter, setFilter] = useState<"all" | "unread">("all");
  const [loading, setLoading] = useState(true);
  const [openId, setOpenId] = useState<string | null>(null);
  const [replyId, setReplyId] = useState<string | null>(null);
  const [replySubject, setReplySubject] = useState("");
  const [replyText, setReplyText] = useState("");
  const [replyBusy, setReplyBusy] = useState(false);
  const [replyMsg, setReplyMsg] = useState<{ ok: boolean; text: string } | null>(null);

  function startReply(q: Query) {
    if (replyId === q.id) { setReplyId(null); return; }
    setReplyId(q.id);
    setReplySubject(`Re: your enquiry — AUMOXO`);
    setReplyText(`Hi ${q.name.split(" ")[0] || q.name},\n\nThanks for reaching out to AUMOXO.\n\n`);
    setReplyMsg(null);
  }

  async function sendReply(q: Query) {
    if (!replyText.trim()) { setReplyMsg({ ok: false, text: "Write a message first." }); return; }
    setReplyBusy(true);
    setReplyMsg(null);
    try {
      const res = await fetch("/api/admin/email/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subject: replySubject || "Re: your enquiry — AUMOXO", message: replyText, emails: [q.email] }),
      });
      const d = await res.json();
      if (!res.ok) { setReplyMsg({ ok: false, text: d.error || "Failed to send." }); return; }
      setReplyMsg({ ok: true, text: `Reply sent to ${q.email} from hello@aumoxo.tech.` });
      // Record the reply on the query so it's visible later
      const replies = [...(q.replies || []), { body: replyText, at: new Date().toISOString() }];
      patch(q.id, { read: true, replies, status: q.status && q.status !== "new" ? q.status : "reviewing" });
      setReplyText("");
    } finally { setReplyBusy(false); }
  }

  function setStatus(q: Query, status: Query["status"]) {
    patch(q.id, { status });
  }

  async function load() {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/queries", { cache: "no-store" });
      const data = await res.json();
      setQueries(data.queries ?? []);
    } catch {
      setQueries([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function patch(id: string, patch: Partial<Query>) {
    await fetch("/api/admin/queries", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, patch }),
    });
    setQueries((q) => q.map((x) => (x.id === id ? { ...x, ...patch } : x)));
  }

  async function remove(id: string) {
    if (!confirm("Delete this query? This cannot be undone.")) return;
    await fetch("/api/admin/queries", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    setQueries((q) => q.filter((x) => x.id !== id));
  }

  const visible = filter === "unread" ? queries.filter((q) => !q.read) : queries;
  const unreadCount = queries.filter((q) => !q.read).length;

  return (
    <div>
      <div className="flex items-end justify-between flex-wrap gap-4">
        <div>
          <div className="text-[11px] uppercase tracking-[0.3em] text-gold-400">Inbox</div>
          <h1 className="mt-2 font-display text-4xl font-extralight text-ink-100">
            Customer Queries
          </h1>
          <p className="mt-2 text-ink-300 font-light">
            Contact form submissions from your visitors. {unreadCount > 0 && (
              <span className="text-gold-300">{unreadCount} unread</span>
            )}
          </p>
        </div>
        <div className="flex gap-3 items-center">
          <button
            onClick={() => setFilter(filter === "all" ? "unread" : "all")}
            className="btn-ghost text-sm !py-2 !px-4"
          >
            {filter === "all" ? `Show unread (${unreadCount})` : "Show all"}
          </button>
          <button onClick={load} className="btn-ghost text-sm !py-2 !px-4">
            <RefreshCw size={14} /> Refresh
          </button>
        </div>
      </div>

      {loading ? (
        <div className="mt-12 text-center text-ink-400">Loading…</div>
      ) : visible.length === 0 ? (
        <div className="mt-12 card p-12 text-center">
          <Inbox size={32} className="mx-auto text-gold-400 mb-4" />
          <h3 className="text-lg font-light text-ink-100">
            {filter === "unread" ? "All caught up." : "No queries yet."}
          </h3>
          <p className="mt-2 text-sm text-ink-300 font-light">
            {filter === "unread"
              ? "Switch to 'Show all' to view previously-read messages."
              : "When visitors submit the contact form, they'll appear here."}
          </p>
        </div>
      ) : (
        <div className="mt-10 space-y-3">
          {visible.map((q) => {
            const open = openId === q.id;
            return (
              <div
                key={q.id}
                className={`card overflow-hidden transition-all ${
                  q.read ? "opacity-75" : ""
                }`}
              >
                <button
                  type="button"
                  onClick={() => {
                    setOpenId(open ? null : q.id);
                    if (!q.read) patch(q.id, { read: true });
                  }}
                  className="w-full text-left p-5 flex items-start gap-4 hover:bg-bg-elevated transition-colors"
                >
                  <div
                    className={`mt-1 shrink-0 h-2.5 w-2.5 rounded-full ${
                      q.read ? "bg-ink-400/40" : "bg-gold-400 animate-pulse"
                    }`}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline justify-between gap-4 flex-wrap">
                      <div className="text-ink-100 font-medium">
                        {q.name}{" "}
                        {q.company && (
                          <span className="text-ink-400 font-light">· {q.company}</span>
                        )}
                      </div>
                      <div className="text-xs text-ink-400">
                        {new Date(q.receivedAt).toLocaleString()}
                      </div>
                    </div>
                    <div className="mt-1 flex items-center gap-2 flex-wrap">
                      <span className="text-[11px] uppercase tracking-[0.2em] text-gold-400">
                        {q.service} {q.timeline ? `· ${q.timeline}` : ""} {q.budget ? `· ${q.budget}` : ""}
                      </span>
                      {q.status && q.status !== "new" && (
                        <span className={`text-[9px] uppercase tracking-[0.18em] px-2 py-0.5 rounded-full border ${STATUS_META[q.status].cls}`}>{STATUS_META[q.status].label}</span>
                      )}
                    </div>
                    <p className="mt-2 text-sm text-ink-300 font-light line-clamp-2">
                      {q.message}
                    </p>
                  </div>
                </button>

                {open && (
                  <div className="px-5 pb-5 border-t border-line bg-bg-base/40">
                    <div className="grid md:grid-cols-2 gap-4 mt-4 text-sm">
                      <Detail icon={Mail}      label="Email"    value={
                        <a href={`mailto:${q.email}`} className="text-gold-300 hover:underline">{q.email}</a>
                      } />
                      {q.phone &&    <Detail icon={Phone}     label="Phone"    value={q.phone} />}
                      {q.company &&  <Detail icon={Building2} label="Company"  value={q.company} />}
                      {q.timeline && <Detail icon={Clock}     label="Timeline" value={q.timeline} />}
                      {q.budget &&   <Detail icon={DollarSign} label="Budget"  value={q.budget} />}
                      <Detail icon={Calendar} label="Received" value={new Date(q.receivedAt).toLocaleString()} />
                    </div>
                    <div className="mt-5">
                      <div className="text-[11px] uppercase tracking-[0.25em] text-ink-400 mb-2">Message</div>
                      <div className="p-4 bg-bg-base rounded-lg text-sm text-ink-200 font-light whitespace-pre-wrap leading-relaxed">
                        {q.message}
                      </div>
                    </div>

                    {/* Status / decision */}
                    <div className="mt-5">
                      <div className="text-[11px] uppercase tracking-[0.25em] text-ink-400 mb-2">Status / decision</div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className={`text-[10px] uppercase tracking-[0.2em] px-2.5 py-1 rounded-full border ${STATUS_META[q.status || "new"].cls}`}>
                          {STATUS_META[q.status || "new"].label}
                        </span>
                        <span className="text-ink-500">→</span>
                        <button onClick={() => setStatus(q, "reviewing")} className="text-xs px-3 py-1.5 rounded-full border border-amber-400/40 text-amber-300 hover:bg-amber-400/10">Reviewing</button>
                        <button onClick={() => setStatus(q, "next-phase")} className="text-xs px-3 py-1.5 rounded-full border border-green-400/40 text-green-300 hover:bg-green-400/10">Accept · next phase</button>
                        <button onClick={() => setStatus(q, "rejected")} className="text-xs px-3 py-1.5 rounded-full border border-red-400/40 text-red-400 hover:bg-red-400/10">Reject</button>
                        <button onClick={() => setStatus(q, "closed")} className="text-xs px-3 py-1.5 rounded-full border border-line text-ink-400 hover:bg-bg-elevated">Close</button>
                      </div>
                    </div>

                    {/* What we've replied */}
                    {(q.replies?.length ?? 0) > 0 && (
                      <div className="mt-5">
                        <div className="text-[11px] uppercase tracking-[0.25em] text-ink-400 mb-2">What we replied ({q.replies!.length})</div>
                        <div className="space-y-2">
                          {q.replies!.map((r, i) => (
                            <div key={i} className="p-3 rounded-lg bg-gold-400/5 border border-gold-400/20 text-sm text-ink-200 font-light">
                              <p className="whitespace-pre-wrap">{r.body}</p>
                              <div className="mt-1 text-[10px] text-ink-400">Sent {new Date(r.at).toLocaleString()}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="mt-5 flex items-center gap-3">
                      <button
                        onClick={() => startReply(q)}
                        className="btn-gold text-sm !py-2 !px-4"
                      >
                        <Mail size={14} /> {replyId === q.id ? "Close reply" : "Reply"}
                      </button>
                      <button
                        onClick={() => patch(q.id, { read: !q.read })}
                        className="btn-ghost text-sm !py-2 !px-4"
                      >
                        {q.read ? (<><EyeOff size={14}/> Mark unread</>) : (<><Check size={14}/> Mark read</>)}
                      </button>
                      <button
                        onClick={() => remove(q.id)}
                        className="ml-auto inline-flex items-center gap-2 text-sm text-red-400 hover:text-red-300"
                      >
                        <Trash2 size={14}/> Delete
                      </button>
                    </div>

                    {/* Inline reply — sent from hello@aumoxo.tech via Resend */}
                    {replyId === q.id && (
                      <div className="mt-4 border-t border-line pt-4">
                        <div className="text-[11px] uppercase tracking-[0.25em] text-gold-400 mb-2">
                          Reply to {q.email}
                        </div>
                        <input
                          className="input mb-2"
                          value={replySubject}
                          onChange={(e) => setReplySubject(e.target.value)}
                          placeholder="Subject"
                        />
                        <textarea
                          className="input min-h-[160px] resize-y"
                          value={replyText}
                          onChange={(e) => setReplyText(e.target.value)}
                          placeholder="Write your reply…"
                        />
                        <div className="mt-3 flex items-center gap-3 flex-wrap">
                          <button onClick={() => sendReply(q)} disabled={replyBusy} className="btn-gold text-sm !py-2 !px-4 disabled:opacity-60">
                            {replyBusy ? <><Loader2 size={14} className="animate-spin" /> Sending…</> : <><Send size={14} /> Send from hello@aumoxo.tech</>}
                          </button>
                          {replyMsg && <span className={`text-sm ${replyMsg.ok ? "text-green-300" : "text-red-400"}`}>{replyMsg.text}</span>}
                        </div>
                        <p className="mt-2 text-xs text-ink-500">Sent as a branded AUMOXO email, directly from the panel — no need to open Gmail.</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function Detail({
  icon: Icon, label, value,
}: { icon: any; label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-start gap-3">
      <div className="shrink-0 grid h-8 w-8 place-items-center rounded-md border border-gold-400/30 bg-gold-400/5 text-gold-300">
        <Icon size={14} />
      </div>
      <div className="min-w-0">
        <div className="text-[10px] uppercase tracking-[0.25em] text-ink-400">{label}</div>
        <div className="text-ink-100 mt-0.5 break-words">{value}</div>
      </div>
    </div>
  );
}
