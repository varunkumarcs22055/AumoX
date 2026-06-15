"use client";

import { useEffect, useRef, useState } from "react";
import { LifeBuoy, Plus, Send, Loader2, X } from "lucide-react";

type Reply = { id: string; from: "client" | "team"; body: string; at: string; authorName?: string };
type Ticket = {
  id: string; number: string; subject: string; category: string;
  priority: "low" | "normal" | "high" | "urgent";
  status: "open" | "in-progress" | "resolved" | "closed";
  replies: Reply[]; createdAt: string; updatedAt: string;
};

const STATUS_CLS: Record<Ticket["status"], string> = {
  open: "border-sky-400/40 text-sky-300 bg-sky-400/10", "in-progress": "border-amber-400/40 text-amber-300 bg-amber-400/10",
  resolved: "border-green-400/40 text-green-300 bg-green-400/10", closed: "border-ink-400/40 text-ink-400 bg-ink-400/10",
};
const fmt = (iso: string) => { try { return new Date(iso).toLocaleString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" }); } catch { return iso; } };

export default function PortalSupport() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [openId, setOpenId] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({ subject: "", category: "Technical", priority: "normal", body: "" });
  const [reply, setReply] = useState("");
  const [busy, setBusy] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  function load() {
    fetch("/api/portal/tickets", { cache: "no-store" }).then((r) => (r.ok ? r.json() : null)).then((d) => d?.tickets && setTickets(d.tickets));
  }
  useEffect(() => { load(); }, []);
  const active = tickets.find((t) => t.id === openId);
  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [active?.replies.length]);

  async function create() {
    if (!form.subject.trim()) return;
    setBusy(true);
    try {
      const d = await fetch("/api/portal/tickets", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) }).then((r) => r.json());
      if (d.ticket) { setTickets((t) => [d.ticket, ...t]); setForm({ subject: "", category: "Technical", priority: "normal", body: "" }); setCreating(false); setOpenId(d.ticket.id); }
    } finally { setBusy(false); }
  }
  async function sendReply() {
    if (!reply.trim() || !active) return;
    setBusy(true);
    try {
      const d = await fetch("/api/portal/tickets", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: active.id, body: reply }) }).then((r) => r.json());
      if (d.ticket) { setTickets((all) => all.map((t) => (t.id === active.id ? d.ticket : t))); setReply(""); }
    } finally { setBusy(false); }
  }

  return (
    <div className="mt-12 max-w-3xl">
      <div className="flex items-center justify-between">
        <div className="eyebrow"><span className="h-px w-8 bg-gold-400" /> Support</div>
        <button onClick={() => setCreating((v) => !v)} className="btn-gold !py-2 !px-4 text-sm"><Plus size={14} /> New ticket</button>
      </div>

      {creating && (
        <div className="mt-5 card p-5 gold-border">
          <div className="grid sm:grid-cols-[2fr_1fr_1fr] gap-3">
            <input className="input !py-2" placeholder="Subject" value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} />
            <select className="input !py-2" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>{["Technical", "Billing", "General", "Feature request"].map((c) => <option key={c}>{c}</option>)}</select>
            <select className="input !py-2" value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })}>{["low", "normal", "high", "urgent"].map((p) => <option key={p} value={p}>{p}</option>)}</select>
          </div>
          <textarea className="input mt-3 min-h-[100px] resize-y" placeholder="Describe your issue or request…" value={form.body} onChange={(e) => setForm({ ...form, body: e.target.value })} />
          <div className="mt-3 flex gap-2">
            <button onClick={create} disabled={busy || !form.subject.trim()} className="btn-gold text-sm !py-2 !px-4 disabled:opacity-60">{busy ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />} Submit</button>
            <button onClick={() => setCreating(false)} className="btn-ghost text-sm !py-2 !px-4"><X size={14} /> Cancel</button>
          </div>
        </div>
      )}

      <div className="mt-5 space-y-2">
        {tickets.length === 0 && !creating && <div className="card p-6 text-center text-ink-400 text-sm">No tickets yet. Raise one and our team will respond.</div>}
        {tickets.map((t) => (
          <div key={t.id} className="card overflow-hidden">
            <button onClick={() => setOpenId(openId === t.id ? null : t.id)} className="w-full text-left p-4 flex items-center gap-3 hover:bg-bg-elevated transition-colors">
              <LifeBuoy size={16} className="text-gold-400 shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="text-sm text-ink-100 font-light truncate">{t.subject}</div>
                <div className="text-xs text-ink-400">{t.number} · {t.category}</div>
              </div>
              <span className={`text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full border shrink-0 ${STATUS_CLS[t.status]}`}>{t.status}</span>
            </button>
            {openId === t.id && (
              <div className="border-t border-line">
                <div className="p-4 space-y-3 max-h-[340px] overflow-y-auto">
                  {t.replies.map((r) => (
                    <div key={r.id} className={`flex ${r.from === "client" ? "justify-end" : "justify-start"}`}>
                      <div className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm font-light ${r.from === "client" ? "bg-gold-400/15 border border-gold-400/30 text-ink-100" : "bg-bg-elevated border border-line text-ink-200"}`}>
                        <p className="whitespace-pre-wrap">{r.body}</p>
                        <div className="mt-1 text-[10px] text-ink-400">{r.from === "team" ? "AUMOXO · " : ""}{fmt(r.at)}</div>
                      </div>
                    </div>
                  ))}
                  <div ref={endRef} />
                </div>
                {t.status !== "closed" && (
                  <div className="p-3 border-t border-line flex gap-2">
                    <textarea rows={1} className="input !py-2 flex-1 resize-none" placeholder="Reply…" value={reply} onChange={(e) => setReply(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendReply(); } }} />
                    <button onClick={sendReply} disabled={busy || !reply.trim()} className="btn-gold !py-2 !px-3 text-sm disabled:opacity-50">{busy ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}</button>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
