"use client";

import { useEffect, useMemo, useState } from "react";
import { Mail, Send, Loader2, Search, Users, Briefcase, UserCheck, Check, X, AlertCircle } from "lucide-react";

type Person = { id: string; name: string; email: string; active?: boolean };
type Recipients = { emailConfigured: boolean; clients: Person[]; employees: Person[]; subscribers: Person[] };
type Audience = "clients" | "employees" | "subscribers";

const TABS: { v: Audience; label: string; icon: typeof Users }[] = [
  { v: "clients", label: "Clients", icon: Users },
  { v: "employees", label: "Employees", icon: Briefcase },
  { v: "subscribers", label: "Subscribers", icon: UserCheck },
];

export default function EmailAdmin() {
  const [data, setData] = useState<Recipients | null>(null);
  const [tab, setTab] = useState<Audience>("clients");
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState<{ ok: boolean; text: string } | null>(null);

  useEffect(() => {
    fetch("/api/admin/email/recipients", { cache: "no-store" })
      .then((r) => r.json())
      .then((d) => d.clients && setData(d));
  }, []);

  const list: Person[] = data ? data[tab] : [];
  const filtered = useMemo(
    () => list.filter((p) => `${p.name} ${p.email}`.toLowerCase().includes(query.toLowerCase())),
    [list, query]
  );

  function toggle(email: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(email) ? next.delete(email) : next.add(email);
      return next;
    });
  }
  function selectAllFiltered() {
    setSelected((prev) => {
      const next = new Set(prev);
      filtered.forEach((p) => next.add(p.email));
      return next;
    });
  }
  function clearTabSelection() {
    setSelected((prev) => {
      const next = new Set(prev);
      list.forEach((p) => next.delete(p.email));
      return next;
    });
  }

  async function send() {
    setResult(null);
    if (!subject.trim() || !message.trim()) { setResult({ ok: false, text: "Subject and message are required." }); return; }
    if (selected.size === 0) { setResult({ ok: false, text: "Select at least one recipient." }); return; }
    if (!confirm(`Send this email to ${selected.size} recipient(s)?`)) return;
    setSending(true);
    try {
      const res = await fetch("/api/admin/email/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subject, message, emails: Array.from(selected) }),
      });
      const d = await res.json();
      if (!res.ok) { setResult({ ok: false, text: d.error || "Failed to send." }); return; }
      setResult({ ok: true, text: `Sent to ${d.sent} recipient(s)${d.failed ? ` · ${d.failed} failed` : ""}.` });
      setSelected(new Set());
      setSubject("");
      setMessage("");
    } finally { setSending(false); }
  }

  const counts = data ? { clients: data.clients.length, employees: data.employees.length, subscribers: data.subscribers.length } : { clients: 0, employees: 0, subscribers: 0 };

  return (
    <div>
      <div className="flex items-end justify-between flex-wrap gap-4">
        <div>
          <div className="text-[11px] uppercase tracking-[0.3em] text-gold-400">Communications</div>
          <h1 className="mt-2 font-display text-4xl font-extralight text-ink-100">Send Email</h1>
          <p className="mt-2 text-ink-300 font-light">
            Compose and send a branded email to selected clients, employees or subscribers — sent from hello@aumoxo.tech.
          </p>
        </div>
      </div>

      {data && !data.emailConfigured && (
        <div className="mt-6 card p-4 flex items-center gap-3 border border-amber-400/30">
          <AlertCircle size={18} className="text-amber-400 shrink-0" />
          <span className="text-sm text-ink-300">Email isn&apos;t configured yet (RESEND_API_KEY). Sending will fail until it&apos;s set.</span>
        </div>
      )}

      <div className="mt-8 grid lg:grid-cols-[1.1fr_1fr] gap-6 items-start">
        {/* Recipients */}
        <div className="card p-5">
          <div className="flex flex-wrap gap-2 mb-4">
            {TABS.map((t) => {
              const Icon = t.icon;
              return (
                <button key={t.v} onClick={() => { setTab(t.v); setQuery(""); }} className={`inline-flex items-center gap-1.5 text-xs uppercase tracking-[0.15em] px-3 py-1.5 rounded-full border transition-colors ${tab === t.v ? "border-gold-400 text-gold-300 bg-gold-400/10" : "border-line text-ink-400 hover:text-gold-300"}`}>
                  <Icon size={13} /> {t.label} ({counts[t.v]})
                </button>
              );
            })}
          </div>

          <div className="relative">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-400" />
            <input className="input !py-2 pl-9" placeholder="Search name or email…" value={query} onChange={(e) => setQuery(e.target.value)} />
          </div>

          <div className="mt-3 flex items-center justify-between text-xs">
            <button onClick={selectAllFiltered} className="text-gold-300 hover:text-gold-200">Select all ({filtered.length})</button>
            <button onClick={clearTabSelection} className="text-ink-400 hover:text-red-400">Clear this tab</button>
          </div>

          <div className="mt-3 max-h-[420px] overflow-y-auto space-y-1 pr-1">
            {!data ? (
              <div className="text-center text-ink-400 py-10 text-sm">Loading…</div>
            ) : filtered.length === 0 ? (
              <div className="text-center text-ink-500 py-10 text-sm">No {tab} found.</div>
            ) : filtered.map((p) => {
              const on = selected.has(p.email);
              return (
                <button key={p.id} onClick={() => toggle(p.email)} className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg border text-left transition-colors ${on ? "border-gold-400/50 bg-gold-400/5" : "border-line hover:bg-bg-elevated"}`}>
                  <span className={`grid place-items-center h-5 w-5 rounded border shrink-0 ${on ? "bg-gold-400 border-gold-400 text-black" : "border-ink-500"}`}>{on && <Check size={13} />}</span>
                  <span className="flex-1 min-w-0">
                    {p.name && <span className="text-sm text-ink-100 block truncate">{p.name}</span>}
                    <span className="text-xs text-ink-400 block truncate">{p.email}</span>
                  </span>
                  {p.active === false && <span className="text-[10px] uppercase tracking-wider text-ink-500">inactive</span>}
                </button>
              );
            })}
          </div>
        </div>

        {/* Composer */}
        <div className="card p-6 gold-border">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.3em] text-gold-400">
              <Mail size={13} /> Compose
            </div>
            <span className="text-xs text-ink-300">{selected.size} selected</span>
          </div>

          {selected.size > 0 && (
            <div className="mb-4 flex flex-wrap gap-1.5 max-h-20 overflow-y-auto">
              {Array.from(selected).slice(0, 40).map((em) => (
                <span key={em} className="inline-flex items-center gap-1 text-[11px] bg-bg-elevated border border-line rounded-full pl-2.5 pr-1 py-0.5 text-ink-300">
                  {em}
                  <button onClick={() => toggle(em)} className="text-ink-500 hover:text-red-400"><X size={11} /></button>
                </span>
              ))}
              {selected.size > 40 && <span className="text-[11px] text-ink-400 self-center">+{selected.size - 40} more</span>}
            </div>
          )}

          <label className="block">
            <span className="block text-[11px] uppercase tracking-[0.25em] text-ink-300 mb-2">Subject</span>
            <input className="input" value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="A quick update from AUMOXO" />
          </label>
          <label className="block mt-4">
            <span className="block text-[11px] uppercase tracking-[0.25em] text-ink-300 mb-2">Message</span>
            <textarea className="input min-h-[200px] resize-y" value={message} onChange={(e) => setMessage(e.target.value)} placeholder={"Hi there,\n\nWrite your message here. Blank lines become paragraphs.\n\n— The AUMOXO team"} />
          </label>
          <p className="mt-2 text-xs text-ink-500">Your message is wrapped in the branded AUMOXO template automatically. Each person is emailed privately.</p>

          {result && (
            <p className={`mt-4 text-sm ${result.ok ? "text-green-300" : "text-red-400"}`}>{result.text}</p>
          )}

          <button onClick={send} disabled={sending || selected.size === 0} className="btn-gold mt-5 w-full disabled:opacity-50">
            {sending ? <><Loader2 size={16} className="animate-spin" /> Sending…</> : <><Send size={16} /> Send to {selected.size} recipient{selected.size === 1 ? "" : "s"}</>}
          </button>
        </div>
      </div>
    </div>
  );
}
