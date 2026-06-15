"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { MessageSquare, Send, Loader2, RefreshCw } from "lucide-react";
import { usePoll } from "@/lib/usePoll";

type Thread = {
  clientId: string;
  company: string;
  name: string;
  lastMessage: { body: string; at: string; from: "client" | "team" } | null;
  unread: number;
  total: number;
};
type Msg = { id: string; from: "client" | "team"; body: string; at: string };

function fmtTime(iso: string) {
  try {
    return new Date(iso).toLocaleString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });
  } catch {
    return iso;
  }
}

export default function MessagesAdmin() {
  const [threads, setThreads] = useState<Thread[]>([]);
  const [active, setActive] = useState<string>("");
  const [messages, setMessages] = useState<Msg[]>([]);
  const [loading, setLoading] = useState(true);
  const [threadLoading, setThreadLoading] = useState(false);
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  async function loadThreads() {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/messages", { cache: "no-store" });
      const data = await res.json();
      setThreads(data.threads ?? []);
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => { loadThreads(); }, []);

  async function openThread(clientId: string) {
    setActive(clientId);
    setThreadLoading(true);
    try {
      const res = await fetch(`/api/admin/messages?clientId=${clientId}`, { cache: "no-store" });
      const data = await res.json();
      setMessages(data.messages ?? []);
      setThreads((all) => all.map((t) => (t.clientId === clientId ? { ...t, unread: 0 } : t)));
    } finally {
      setThreadLoading(false);
    }
  }

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  // Live: silently refresh the thread list + the open conversation so client
  // replies appear on their own — no manual refresh.
  const refresh = useCallback(async () => {
    const t = await fetch("/api/admin/messages", { cache: "no-store" }).then((r) => (r.ok ? r.json() : null)).catch(() => null);
    if (t?.threads) setThreads(t.threads);
    if (active) {
      const m = await fetch(`/api/admin/messages?clientId=${active}`, { cache: "no-store" }).then((r) => (r.ok ? r.json() : null)).catch(() => null);
      if (m?.messages) {
        setMessages((prev) => {
          const next = m.messages as Msg[];
          const same = prev.length === next.length && prev[prev.length - 1]?.id === next[next.length - 1]?.id;
          return same ? prev : next;
        });
      }
    }
  }, [active]);
  usePoll(refresh, 15000);

  async function send() {
    if (!draft.trim() || !active) return;
    setSending(true);
    try {
      const res = await fetch("/api/admin/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clientId: active, body: draft }),
      });
      const data = await res.json();
      if (res.ok) {
        setMessages(data.messages ?? []);
        setDraft("");
      } else {
        alert(data.error ?? "Failed to send.");
      }
    } finally {
      setSending(false);
    }
  }

  const activeThread = threads.find((t) => t.clientId === active);

  return (
    <div>
      <div className="flex items-end justify-between flex-wrap gap-4">
        <div>
          <div className="text-[11px] uppercase tracking-[0.3em] text-gold-400">Client Communication</div>
          <h1 className="mt-2 font-display text-4xl font-extralight text-ink-100">Messages</h1>
          <p className="mt-2 text-ink-300 font-light">
            Every client has a private thread with the team — replies appear
            instantly in their portal and notify them.
          </p>
        </div>
        <button onClick={() => { loadThreads(); if (active) openThread(active); }} className="btn-ghost text-sm !py-2 !px-4">
          <RefreshCw size={14} /> Refresh
        </button>
      </div>

      <div className="mt-8 grid lg:grid-cols-[320px_1fr] gap-5 items-start">
        {/* Thread list */}
        <div className="space-y-2">
          {loading ? (
            <div className="card p-8 text-center text-ink-400">Loading…</div>
          ) : threads.length === 0 ? (
            <div className="card p-8 text-center text-ink-400">No clients yet.</div>
          ) : threads.map((t) => (
            <button
              key={t.clientId}
              onClick={() => openThread(t.clientId)}
              className={`w-full text-left card p-4 transition-colors ${active === t.clientId ? "gold-border bg-gold-400/5" : "hover:bg-bg-elevated"}`}
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm text-ink-100 font-light truncate">{t.company}</span>
                {t.unread > 0 && (
                  <span className="shrink-0 grid place-items-center h-5 min-w-5 px-1.5 rounded-full bg-gold-400 text-bg-base text-[10px] font-semibold">
                    {t.unread}
                  </span>
                )}
              </div>
              <div className="mt-1 text-xs text-ink-400 truncate">
                {t.lastMessage
                  ? `${t.lastMessage.from === "team" ? "You: " : ""}${t.lastMessage.body}`
                  : "No messages yet — say hello"}
              </div>
            </button>
          ))}
        </div>

        {/* Conversation */}
        <div className="card overflow-hidden flex flex-col min-h-[480px]">
          {!active ? (
            <div className="flex-1 grid place-items-center text-ink-400 p-10 text-center">
              <div>
                <MessageSquare size={28} className="mx-auto text-gold-400" />
                <p className="mt-3 text-sm font-light">Select a client to open the conversation.</p>
              </div>
            </div>
          ) : (
            <>
              <div className="px-5 py-4 border-b border-line">
                <div className="text-ink-100 font-light">{activeThread?.company}</div>
                <div className="text-xs text-ink-400">{activeThread?.name}</div>
              </div>
              <div className="flex-1 overflow-y-auto p-5 space-y-3 max-h-[460px]">
                {threadLoading ? (
                  <div className="text-center text-ink-400 text-sm py-10">Loading…</div>
                ) : messages.length === 0 ? (
                  <div className="text-center text-ink-400 text-sm py-10">No messages yet — start the conversation.</div>
                ) : messages.map((m) => (
                  <div key={m.id} className={`flex ${m.from === "team" ? "justify-end" : "justify-start"}`}>
                    <div className={`max-w-[75%] rounded-2xl px-4 py-2.5 text-sm font-light leading-relaxed ${
                      m.from === "team"
                        ? "bg-gold-400/15 border border-gold-400/30 text-ink-100"
                        : "bg-bg-elevated border border-line text-ink-200"
                    }`}>
                      <p className="whitespace-pre-wrap">{m.body}</p>
                      <div className="mt-1 text-[10px] text-ink-400">{fmtTime(m.at)}</div>
                    </div>
                  </div>
                ))}
                <div ref={endRef} />
              </div>
              <div className="p-4 border-t border-line flex gap-2">
                <textarea
                  className="input !py-2.5 flex-1 resize-none"
                  rows={1}
                  placeholder="Write a reply…"
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}
                />
                <button onClick={send} disabled={sending || !draft.trim()} className="btn-gold !py-2.5 !px-4 text-sm disabled:opacity-50">
                  {sending ? <Loader2 size={15} className="animate-spin" /> : <Send size={15} />}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
