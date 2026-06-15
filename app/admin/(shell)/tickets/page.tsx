"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { LifeBuoy, Send, Loader2, Trash2, RefreshCw } from "lucide-react";

type Reply = { id: string; from: "client" | "team"; body: string; at: string; authorName?: string };
type Ticket = {
  id: string; number: string; clientId: string; subject: string; category: string;
  priority: "low" | "normal" | "high" | "urgent";
  status: "open" | "in-progress" | "resolved" | "closed";
  replies: Reply[]; createdAt: string; updatedAt: string;
};
type ClientLite = { id: string; company: string; email: string };

const STATUS_CLS: Record<Ticket["status"], string> = {
  open: "border-sky-400/40 text-sky-300", "in-progress": "border-amber-400/40 text-amber-300",
  resolved: "border-green-400/40 text-green-300", closed: "border-ink-400/40 text-ink-400",
};
const PRIO_CLS: Record<Ticket["priority"], string> = {
  low: "text-ink-400", normal: "text-sky-300", high: "text-amber-300", urgent: "text-red-400",
};
const fmt = (iso: string) => { try { return new Date(iso).toLocaleString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" }); } catch { return iso; } };

export default function TicketsAdmin() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [clients, setClients] = useState<ClientLite[]>([]);
  const [activeId, setActiveId] = useState<string>("");
  const [filter, setFilter] = useState<"all" | Ticket["status"]>("all");
  const [reply, setReply] = useState("");
  const [busy, setBusy] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  async function load() {
    const data = await fetch("/api/admin/tickets", { cache: "no-store" }).then((r) => r.json());
    setTickets(data.tickets ?? []);
    setClients(data.clients ?? []);
  }
  useEffect(() => { load(); }, []);

  const company = (id: string) => clients.find((c) => c.id === id)?.company ?? "Unknown";
  const visible = useMemo(() => filter === "all" ? tickets : tickets.filter((t) => t.status === filter), [tickets, filter]);
  const active = tickets.find((t) => t.id === activeId);
  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [active?.replies.length]);

  async function patch(body: Record<string, unknown>) {
    setBusy(true);
    try {
      const res = await fetch("/api/admin/tickets", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: activeId, ...body }) });
      const d = await res.json();
      if (res.ok) { setTickets((all) => all.map((t) => (t.id === activeId ? d.ticket : t))); if (body.reply) setReply(""); }
    } finally { setBusy(false); }
  }
  async function remove(t: Ticket) {
    if (!confirm(`Delete ticket ${t.number}?`)) return;
    await fetch("/api/admin/tickets", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: t.id }) });
    if (activeId === t.id) setActiveId("");
    load();
  }

  const counts = { open: tickets.filter((t) => t.status === "open").length };

  return (
    <div>
      <div className="flex items-end justify-between flex-wrap gap-4">
        <div>
          <div className="text-[11px] uppercase tracking-[0.3em] text-gold-400">Support · Helpdesk</div>
          <h1 className="mt-2 font-display text-4xl font-extralight text-ink-100">Tickets</h1>
          <p className="mt-2 text-ink-300 font-light">Client support requests — reply, set priority and resolve. {counts.open > 0 && <span className="text-gold-300">{counts.open} open</span>}</p>
        </div>
        <button onClick={load} className="btn-ghost text-sm !py-2 !px-4"><RefreshCw size={14} /> Refresh</button>
      </div>

      <div className="mt-6 flex flex-wrap gap-2">
        {(["all", "open", "in-progress", "resolved", "closed"] as const).map((s) => (
          <button key={s} onClick={() => setFilter(s)} className={`text-xs uppercase tracking-[0.15em] px-3 py-1.5 rounded-full border transition-colors ${filter === s ? "border-gold-400 text-gold-300 bg-gold-400/10" : "border-line text-ink-400 hover:text-gold-300"}`}>
            {s} ({s === "all" ? tickets.length : tickets.filter((t) => t.status === s).length})
          </button>
        ))}
      </div>

      <div className="mt-6 grid lg:grid-cols-[360px_1fr] gap-5 items-start">
        <div className="space-y-2 max-h-[600px] overflow-y-auto pr-1">
          {visible.length === 0 ? <div className="card p-8 text-center text-ink-400 text-sm">No tickets.</div> : visible.map((t) => (
            <button key={t.id} onClick={() => setActiveId(t.id)} className={`w-full text-left card p-4 ${activeId === t.id ? "gold-border bg-gold-400/5" : "hover:bg-bg-elevated"}`}>
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs text-gold-400">{t.number}</span>
                <span className={`text-[10px] uppercase tracking-wider ${PRIO_CLS[t.priority]}`}>{t.priority}</span>
              </div>
              <div className="text-sm text-ink-100 font-light mt-1 truncate">{t.subject}</div>
              <div className="text-xs text-ink-400 mt-1 flex items-center justify-between">
                <span className="truncate">{company(t.clientId)}</span>
                <span className={`text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full border ${STATUS_CLS[t.status]}`}>{t.status}</span>
              </div>
            </button>
          ))}
        </div>

        <div className="card overflow-hidden flex flex-col min-h-[500px]">
          {!active ? (
            <div className="flex-1 grid place-items-center text-ink-400 p-10 text-center"><div><LifeBuoy size={28} className="mx-auto text-gold-400" /><p className="mt-3 text-sm font-light">Select a ticket to view the conversation.</p></div></div>
          ) : (
            <>
              <div className="px-5 py-4 border-b border-line flex items-start justify-between gap-3 flex-wrap">
                <div>
                  <div className="text-ink-100 font-light">{active.subject}</div>
                  <div className="text-xs text-ink-400 mt-0.5">{active.number} · {company(active.clientId)} · {active.category}</div>
                </div>
                <div className="flex items-center gap-2">
                  <select className="input !py-1.5 !px-2 text-xs !w-auto" value={active.priority} onChange={(e) => patch({ priority: e.target.value })}>
                    {(["low", "normal", "high", "urgent"] as const).map((p) => <option key={p} value={p}>{p}</option>)}
                  </select>
                  <select className="input !py-1.5 !px-2 text-xs !w-auto" value={active.status} onChange={(e) => patch({ status: e.target.value })}>
                    {(["open", "in-progress", "resolved", "closed"] as const).map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                  <button onClick={() => remove(active)} className="p-2 rounded text-red-400 hover:bg-red-400/10"><Trash2 size={14} /></button>
                </div>
              </div>
              <div className="flex-1 overflow-y-auto p-5 space-y-3 max-h-[420px]">
                {active.replies.length === 0 ? <p className="text-sm text-ink-400 text-center py-8">No messages in this ticket yet.</p> : active.replies.map((r) => (
                  <div key={r.id} className={`flex ${r.from === "team" ? "justify-end" : "justify-start"}`}>
                    <div className={`max-w-[78%] rounded-2xl px-4 py-2.5 text-sm font-light ${r.from === "team" ? "bg-gold-400/15 border border-gold-400/30 text-ink-100" : "bg-bg-elevated border border-line text-ink-200"}`}>
                      <p className="whitespace-pre-wrap">{r.body}</p>
                      <div className="mt-1 text-[10px] text-ink-400">{r.authorName} · {fmt(r.at)}</div>
                    </div>
                  </div>
                ))}
                <div ref={endRef} />
              </div>
              <div className="p-4 border-t border-line flex gap-2">
                <textarea rows={1} className="input !py-2.5 flex-1 resize-none" placeholder="Reply to the client…" value={reply} onChange={(e) => setReply(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); if (reply.trim()) patch({ reply }); } }} />
                <button onClick={() => reply.trim() && patch({ reply })} disabled={busy || !reply.trim()} className="btn-gold !py-2.5 !px-4 text-sm disabled:opacity-50">{busy ? <Loader2 size={15} className="animate-spin" /> : <Send size={15} />}</button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
