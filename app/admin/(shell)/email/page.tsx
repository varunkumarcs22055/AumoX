"use client";

import { useEffect, useState } from "react";
import { Mail, Send, Loader2, Search, Users, Briefcase, UserCheck, Check, X, AlertCircle, AtSign, Plus, Copy, Trash2, History } from "lucide-react";
import { usePagedList } from "@/lib/admin/usePagedList";
import Pagination from "@/components/admin/Pagination";

type Person = { id: string; name: string; email: string; active?: boolean };
type Recipients = { emailConfigured: boolean; clients: Person[]; employees: Person[]; subscribers: Person[]; custom: Person[] };
type Audience = "clients" | "employees" | "subscribers" | "custom";
type SentEmail = { id: string; subject: string; message: string; emails: string[]; sent: number; failed: number; sentByName: string; sentAt: string };

// Stable (module-scope) searchable-text extractors for usePagedList.
const personText = (p: Person) => `${p.name} ${p.email}`;
const sentText = (e: SentEmail) => `${e.subject} ${e.message} ${e.sentByName} ${e.emails.join(" ")}`;

const TABS: { v: Audience; label: string; icon: typeof Users }[] = [
  { v: "clients", label: "Clients", icon: Users },
  { v: "employees", label: "Employees", icon: Briefcase },
  { v: "subscribers", label: "Subscribers", icon: UserCheck },
  { v: "custom", label: "Custom", icon: AtSign },
];

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function EmailAdmin() {
  const [data, setData] = useState<Recipients | null>(null);
  const [tab, setTab] = useState<Audience>("clients");
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState<{ ok: boolean; text: string } | null>(null);
  const [customText, setCustomText] = useState("");
  const [newName, setNewName] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [history, setHistory] = useState<SentEmail[]>([]);
  const [historyQuery, setHistoryQuery] = useState("");
  const [isSuper, setIsSuper] = useState(false);

  function loadRecipients() {
    fetch("/api/admin/email/recipients", { cache: "no-store" }).then((r) => r.json()).then((d) => d.clients && setData(d));
  }
  function loadHistory() {
    fetch("/api/admin/email/sent", { cache: "no-store" }).then((r) => r.json()).then((d) => d.sent && setHistory(d.sent));
  }

  // Save a named custom contact (reusable), then select it.
  async function saveContact() {
    if (!EMAIL_RE.test(newEmail.trim())) { setResult({ ok: false, text: "Enter a valid email." }); return; }
    const email = newEmail.trim().toLowerCase();
    await fetch("/api/admin/email/contacts", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name: newName, email }) });
    setSelected((prev) => new Set(prev).add(email));
    setNewName(""); setNewEmail("");
    setResult({ ok: true, text: "Contact saved & selected." });
    loadRecipients();
  }

  async function removeContact(id: string, email: string) {
    if (!confirm("Remove this saved contact?")) return;
    await fetch("/api/admin/email/contacts", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }) });
    setSelected((prev) => { const n = new Set(prev); n.delete(email); return n; });
    loadRecipients();
  }

  function reuse(e: SentEmail) {
    setSubject(e.subject);
    setMessage(e.message);
    setSelected(new Set(e.emails));
    setResult({ ok: true, text: "Loaded into the composer — edit and send." });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function deleteSent(id: string) {
    if (!confirm("Delete this email from history?")) return;
    const res = await fetch("/api/admin/email/sent", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }) });
    if (res.ok) setHistory((h) => h.filter((x) => x.id !== id));
    else alert("Only the main admin can delete sent emails.");
  }

  async function addCustom() {
    const found = customText.split(/[\s,;]+/).map((e) => e.trim().toLowerCase()).filter((e) => EMAIL_RE.test(e));
    if (found.length === 0) { setResult({ ok: false, text: "No valid email addresses found." }); return; }
    await fetch("/api/admin/email/contacts", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ emails: found }) });
    setSelected((prev) => { const next = new Set(prev); found.forEach((e) => next.add(e)); return next; });
    setCustomText("");
    setResult({ ok: true, text: `Saved & added ${found.length} recipient(s).` });
    loadRecipients();
  }

  useEffect(() => {
    loadRecipients();
    fetch("/api/admin/me", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => setIsSuper(d?.role === "super"));
    loadHistory();
  }, []);

  const list: Person[] = data && tab !== "custom" ? data[tab] : [];
  // Recipient picker: dynamic search + pagination (10/page). `filtered` is the
  // full match set so "Select all" still covers every match, not just the page.
  const recipientPage = usePagedList(list, query, personText, 10);
  const filtered = recipientPage.filtered;

  // Recent sends: dynamic search across subject/body/sender/recipients + pages.
  const historyPage = usePagedList(history, historyQuery, sentText, 8);

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
      loadHistory();
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
                  <Icon size={13} /> {t.label}{t.v !== "custom" ? ` (${counts[t.v as "clients" | "employees" | "subscribers"]})` : ""}
                </button>
              );
            })}
          </div>

          {tab === "custom" ? (
            <div>
              {/* Save a named contact */}
              <span className="block text-[11px] uppercase tracking-[0.25em] text-ink-300 mb-2">Save a contact</span>
              <div className="grid grid-cols-[1fr_1.4fr_auto] gap-2">
                <input className="input !py-2" placeholder="Name (optional)" value={newName} onChange={(e) => setNewName(e.target.value)} />
                <input className="input !py-2" type="email" placeholder="email@example.com" value={newEmail} onChange={(e) => setNewEmail(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") saveContact(); }} />
                <button onClick={saveContact} className="btn-gold text-sm !py-2 !px-3"><Plus size={14} /> Save</button>
              </div>

              {/* Bulk paste */}
              <details className="mt-3">
                <summary className="text-xs text-gold-300 cursor-pointer hover:text-gold-200">Paste many emails at once</summary>
                <textarea className="input min-h-[90px] resize-y mt-2" placeholder={"a@x.com, b@y.com\nor one per line…"} value={customText} onChange={(e) => setCustomText(e.target.value)} />
                <button onClick={addCustom} className="btn-ghost text-xs !py-1.5 !px-3 mt-2"><Plus size={13} /> Save &amp; add all</button>
              </details>

              {/* Saved contacts list */}
              <div className="mt-4 flex items-center justify-between">
                <span className="text-[11px] uppercase tracking-[0.25em] text-ink-300">Saved contacts ({data?.custom.length ?? 0})</span>
                {(data?.custom.length ?? 0) > 0 && (
                  <button onClick={() => setSelected((prev) => { const n = new Set(prev); (data?.custom || []).forEach((c) => n.add(c.email)); return n; })} className="text-xs text-gold-300 hover:text-gold-200">Select all</button>
                )}
              </div>
              <div className="mt-2 max-h-[300px] overflow-y-auto space-y-1 pr-1">
                {!data || data.custom.length === 0 ? (
                  <div className="text-center text-ink-500 py-8 text-sm">No saved contacts yet.</div>
                ) : data.custom.map((p) => {
                  const on = selected.has(p.email);
                  return (
                    <div key={p.id} className={`flex items-center gap-3 px-3 py-2 rounded-lg border transition-colors ${on ? "border-gold-400/50 bg-gold-400/5" : "border-line"}`}>
                      <button onClick={() => toggle(p.email)} className="flex items-center gap-3 flex-1 min-w-0 text-left">
                        <span className={`grid place-items-center h-5 w-5 rounded border shrink-0 ${on ? "bg-gold-400 border-gold-400 text-black" : "border-ink-500"}`}>{on && <Check size={13} />}</span>
                        <span className="flex-1 min-w-0">
                          {p.name && <span className="text-sm text-ink-100 block truncate">{p.name}</span>}
                          <span className="text-xs text-ink-400 block truncate">{p.email}</span>
                        </span>
                      </button>
                      <button onClick={() => removeContact(p.id, p.email)} className="p-1.5 rounded text-red-400 hover:bg-red-400/10 shrink-0" title="Remove saved contact"><X size={13} /></button>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
          <>
          <div className="relative">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-400" />
            <input className="input !py-2 pl-9" placeholder="Search name or email…" value={query} onChange={(e) => setQuery(e.target.value)} />
          </div>

          <div className="mt-3 flex items-center justify-between text-xs">
            <button onClick={selectAllFiltered} className="text-gold-300 hover:text-gold-200">Select all ({filtered.length})</button>
            <button onClick={clearTabSelection} className="text-ink-400 hover:text-red-400">Clear this tab</button>
          </div>

          <div className="mt-3 space-y-1">
            {!data ? (
              <div className="text-center text-ink-400 py-10 text-sm">Loading…</div>
            ) : filtered.length === 0 ? (
              <div className="text-center text-ink-500 py-10 text-sm">{query ? `No ${tab} match “${query}”.` : `No ${tab} found.`}</div>
            ) : recipientPage.pageItems.map((p) => {
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
          <Pagination
            page={recipientPage.page}
            totalPages={recipientPage.totalPages}
            total={recipientPage.total}
            from={recipientPage.from}
            to={recipientPage.to}
            onPage={recipientPage.setPage}
            unit={tab}
          />
          </>
          )}
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

      {/* Sent history — reuse / edit / resend; delete is main-admin only */}
      <div className="mt-10">
        <div className="flex items-center justify-between flex-wrap gap-3 mb-4">
          <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.3em] text-gold-400">
            <History size={13} /> Recent sends{history.length > 0 ? ` (${history.length})` : ""}
          </div>
          {history.length > 0 && (
            <div className="relative w-full sm:w-80">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-400" />
              <input
                className="input !py-2 pl-9"
                placeholder="Search sent emails — subject, text, name or address…"
                value={historyQuery}
                onChange={(e) => setHistoryQuery(e.target.value)}
              />
              {historyQuery && (
                <button onClick={() => setHistoryQuery("")} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-ink-500 hover:text-red-400" aria-label="Clear search">
                  <X size={15} />
                </button>
              )}
            </div>
          )}
        </div>
        {history.length === 0 ? (
          <div className="card p-6 text-center text-ink-400 text-sm">No emails sent yet — your sent emails will appear here to reuse.</div>
        ) : historyPage.total === 0 ? (
          <div className="card p-6 text-center text-ink-400 text-sm">No sent emails match “{historyQuery}”.</div>
        ) : (
          <div className="space-y-2">
            {historyPage.pageItems.map((e) => (
              <div key={e.id} className="card p-4 flex items-start gap-4">
                <div className="flex-1 min-w-0">
                  <div className="text-sm text-ink-100 font-light">{e.subject}</div>
                  <div className="text-xs text-ink-400 mt-0.5 line-clamp-1">{e.message}</div>
                  <div className="text-[11px] text-ink-500 mt-1.5">
                    {new Date(e.sentAt).toLocaleString()} · {e.sent} sent{e.failed ? ` · ${e.failed} failed` : ""} · {e.emails.length} recipient{e.emails.length === 1 ? "" : "s"} · by {e.sentByName}
                  </div>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button onClick={() => reuse(e)} className="btn-ghost text-xs !py-1.5 !px-3" title="Load into composer to edit & resend">
                    <Copy size={13} /> Reuse
                  </button>
                  {isSuper && (
                    <button onClick={() => deleteSent(e.id)} className="p-2 rounded-lg text-red-400 hover:bg-red-400/10" title="Delete (main admin only)">
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
        {!isSuper && history.length > 0 && (
          <p className="mt-3 text-xs text-ink-500">Only the main admin can delete sent emails.</p>
        )}
      </div>
    </div>
  );
}
