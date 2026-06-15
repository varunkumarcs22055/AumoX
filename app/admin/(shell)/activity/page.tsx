"use client";

import { useCallback, useEffect, useState } from "react";
import {
  ShieldCheck, RefreshCw, Search, Lock, Loader2,
  UserCog, Users, Briefcase, Globe, Cog,
  Trash2, CheckSquare, Square, X,
} from "lucide-react";

type Entry = {
  id: string;
  at: string;
  actorType: "super" | "admin" | "client" | "staff" | "visitor" | "system";
  actorName: string;
  action: string;
  entity: string;
  detail?: string;
};
type Report = { entries: Entry[]; total: number; todayCount: number; entities: string[] };

const ACTOR_META: Record<Entry["actorType"], { label: string; cls: string; icon: typeof UserCog }> = {
  super:   { label: "Owner",   cls: "border-gold-400/50 text-gold-300 bg-gold-400/10", icon: ShieldCheck },
  admin:   { label: "Admin",   cls: "border-sky-400/40 text-sky-300 bg-sky-400/10",   icon: UserCog },
  staff:   { label: "Staff",   cls: "border-indigo-400/40 text-indigo-300 bg-indigo-400/10", icon: Briefcase },
  client:  { label: "Client",  cls: "border-green-400/40 text-green-300 bg-green-400/10", icon: Users },
  visitor: { label: "Visitor", cls: "border-ink-400/40 text-ink-300 bg-ink-400/10",    icon: Globe },
  system:  { label: "System",  cls: "border-ink-400/40 text-ink-400 bg-ink-400/5",     icon: Cog },
};

const ACTORS: (Entry["actorType"] | "all")[] = ["all", "super", "admin", "staff", "client", "visitor"];

function fmt(iso: string) {
  try {
    return new Date(iso).toLocaleString("en-US", {
      month: "short", day: "numeric", hour: "numeric", minute: "2-digit",
    });
  } catch { return iso; }
}

function dayLabel(iso: string) {
  const d = new Date(iso);
  const today = new Date();
  const yest = new Date(); yest.setDate(today.getDate() - 1);
  if (d.toDateString() === today.toDateString()) return "Today";
  if (d.toDateString() === yest.toDateString()) return "Yesterday";
  return d.toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" });
}

export default function ActivityAdmin() {
  const [report, setReport] = useState<Report | null>(null);
  const [forbidden, setForbidden] = useState(false);
  const [loading, setLoading] = useState(true);
  const [actor, setActor] = useState<string>("all");
  const [entity, setEntity] = useState<string>("all");
  const [q, setQ] = useState("");

  // Pruning state
  const [selecting, setSelecting] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [olderThan, setOlderThan] = useState("");
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (actor !== "all") params.set("actor", actor);
      if (entity !== "all") params.set("entity", entity);
      if (q.trim()) params.set("q", q.trim());
      const res = await fetch(`/api/admin/audit?${params}`, { cache: "no-store" });
      if (res.status === 401) { setForbidden(true); return; }
      setReport(await res.json());
    } finally { setLoading(false); }
  }, [actor, entity, q]);

  // Send a prune request, then refresh + reset selection.
  const prune = useCallback(
    async (payload: Record<string, unknown>, confirmMsg: string) => {
      if (busy) return;
      if (!window.confirm(`${confirmMsg}\n\nThis cannot be undone.`)) return;
      setBusy(true);
      try {
        const res = await fetch("/api/admin/audit", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) { alert(data.error || "Could not delete entries."); return; }
        setSelected(new Set());
        setSelecting(false);
        await load();
      } finally { setBusy(false); }
    },
    [busy, load]
  );

  function toggleSelect(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  useEffect(() => {
    const t = setTimeout(load, q ? 300 : 0); // debounce search typing
    return () => clearTimeout(t);
  }, [load, q]);

  if (forbidden) {
    return (
      <div className="max-w-lg">
        <div className="card p-10 gold-border text-center">
          <Lock size={28} className="text-gold-400 mx-auto" />
          <h1 className="mt-4 font-display text-2xl font-light text-ink-100">Restricted</h1>
          <p className="mt-2 text-ink-300 font-light">
            The activity log is visible to the main admin only.
          </p>
        </div>
      </div>
    );
  }

  // Group entries by day for a clean report timeline
  const groups: { day: string; dateKey: string; items: Entry[] }[] = [];
  for (const e of report?.entries ?? []) {
    const day = dayLabel(e.at);
    const g = groups.find((x) => x.day === day);
    if (g) g.items.push(e); else groups.push({ day, dateKey: e.at.slice(0, 10), items: [e] });
  }

  return (
    <div>
      <div className="flex items-end justify-between flex-wrap gap-4">
        <div>
          <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.3em] text-gold-400">
            <ShieldCheck size={13} /> Main admin only
          </div>
          <h1 className="mt-2 font-display text-4xl font-extralight text-ink-100">Activity log</h1>
          <p className="mt-2 text-ink-300 font-light">
            Every action across the website, admin panel, portal and staff app —
            who did what, and when. Visible only to you.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => { setSelecting((v) => !v); setSelected(new Set()); }}
            className={`btn-ghost text-sm !py-2 !px-4 ${selecting ? "!border-gold-400/60 !text-gold-300" : ""}`}
          >
            {selecting ? <X size={14} /> : <CheckSquare size={14} />}
            {selecting ? "Cancel" : "Select"}
          </button>
          <button
            onClick={() => prune({ mode: "all" }, "Permanently delete the ENTIRE activity log?")}
            disabled={busy || (report?.total ?? 0) === 0}
            className="btn-ghost text-sm !py-2 !px-4 !border-red-400/40 !text-red-300 hover:!bg-red-400/10 disabled:opacity-40"
          >
            <Trash2 size={14} /> Clear all
          </button>
          <button onClick={load} className="btn-ghost text-sm !py-2 !px-4">
            <RefreshCw size={14} /> Refresh
          </button>
        </div>
      </div>

      {/* Headline counts */}
      <div className="mt-8 grid grid-cols-2 sm:grid-cols-3 gap-4">
        <div className="card p-5">
          <div className="text-[10px] uppercase tracking-[0.25em] text-ink-400">Events today</div>
          <div className="mt-2 font-display text-3xl font-extralight gold-text">{report?.todayCount ?? 0}</div>
        </div>
        <div className="card p-5">
          <div className="text-[10px] uppercase tracking-[0.25em] text-ink-400">Total recorded</div>
          <div className="mt-2 font-display text-3xl font-extralight text-ink-100">{report?.total ?? 0}</div>
        </div>
        <div className="card p-5">
          <div className="text-[10px] uppercase tracking-[0.25em] text-ink-400">Showing</div>
          <div className="mt-2 font-display text-3xl font-extralight text-ink-100">{report?.entries.length ?? 0}</div>
        </div>
      </div>

      {/* Filters */}
      <div className="mt-6 flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[220px]">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-400" />
          <input
            className="input !py-2 pl-9"
            placeholder="Search actor, action, detail…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </div>
        <select className="input !py-2 !w-auto" value={actor} onChange={(e) => setActor(e.target.value)}>
          {ACTORS.map((a) => <option key={a} value={a}>{a === "all" ? "All actors" : ACTOR_META[a as Entry["actorType"]].label}</option>)}
        </select>
        <select className="input !py-2 !w-auto" value={entity} onChange={(e) => setEntity(e.target.value)}>
          <option value="all">All areas</option>
          {(report?.entities ?? []).map((en) => <option key={en} value={en}>{en}</option>)}
        </select>
      </div>

      {/* Date-wise cleanup — prune everything before a chosen date to reclaim storage */}
      <div className="mt-3 flex flex-wrap items-center gap-2 text-sm">
        <span className="text-[11px] uppercase tracking-[0.2em] text-ink-400">Storage cleanup</span>
        <span className="text-ink-400">·</span>
        <span className="text-ink-300 font-light">Delete entries older than</span>
        <input
          type="date"
          value={olderThan}
          max={new Date().toISOString().slice(0, 10)}
          onChange={(e) => setOlderThan(e.target.value)}
          className="input !py-1.5 !w-auto"
        />
        <button
          onClick={() => prune(
            { mode: "before", before: olderThan },
            `Delete every activity entry recorded before ${olderThan}?`
          )}
          disabled={busy || !olderThan}
          className="btn-ghost text-sm !py-1.5 !px-3 !border-red-400/40 !text-red-300 hover:!bg-red-400/10 disabled:opacity-40"
        >
          <Trash2 size={13} /> Prune
        </button>
      </div>

      {/* Selection action bar */}
      {selecting && (
        <div className="mt-4 flex items-center justify-between gap-3 rounded-xl border border-gold-400/30 bg-gold-400/5 px-4 py-3">
          <div className="text-sm text-ink-200">
            {selected.size === 0 ? "Tap entries below to select them." : `${selected.size} selected`}
          </div>
          <button
            onClick={() => prune(
              { mode: "ids", ids: Array.from(selected) },
              `Delete ${selected.size} selected entr${selected.size === 1 ? "y" : "ies"}?`
            )}
            disabled={busy || selected.size === 0}
            className="btn-ghost text-sm !py-1.5 !px-3 !border-red-400/40 !text-red-300 hover:!bg-red-400/10 disabled:opacity-40"
          >
            {busy ? <Loader2 size={13} className="animate-spin" /> : <Trash2 size={13} />} Delete selected
          </button>
        </div>
      )}

      {/* Timeline */}
      <div className="mt-8">
        {loading && !report ? (
          <div className="card p-12 text-center text-ink-400"><Loader2 size={18} className="animate-spin inline mr-2" /> Loading activity…</div>
        ) : (report?.entries.length ?? 0) === 0 ? (
          <div className="card p-12 text-center text-ink-400">No activity matches these filters yet.</div>
        ) : (
          <div className="space-y-8">
            {groups.map((g) => (
              <div key={g.day}>
                <div className="flex items-center justify-between mb-3">
                  <div className="text-[11px] uppercase tracking-[0.3em] text-gold-400">{g.day}</div>
                  <button
                    onClick={() => prune(
                      { mode: "day", day: g.dateKey },
                      `Delete all ${g.items.length} entr${g.items.length === 1 ? "y" : "ies"} from ${g.day}?`
                    )}
                    disabled={busy}
                    className="text-[10px] uppercase tracking-widest text-ink-400 hover:text-red-300 inline-flex items-center gap-1 disabled:opacity-40"
                  >
                    <Trash2 size={11} /> Delete day
                  </button>
                </div>
                <div className="space-y-2">
                  {g.items.map((e) => {
                    const meta = ACTOR_META[e.actorType] ?? ACTOR_META.system;
                    const Icon = meta.icon;
                    const checked = selected.has(e.id);
                    return (
                      <div
                        key={e.id}
                        onClick={selecting ? () => toggleSelect(e.id) : undefined}
                        className={`card p-4 flex items-start gap-4 ${selecting ? "cursor-pointer" : ""} ${checked ? "ring-1 ring-gold-400/60" : ""}`}
                      >
                        {selecting && (
                          <button
                            onClick={(ev) => { ev.stopPropagation(); toggleSelect(e.id); }}
                            className="shrink-0 mt-0.5"
                            aria-label={checked ? "Deselect" : "Select"}
                          >
                            {checked ? <CheckSquare size={18} className="text-gold-300" /> : <Square size={18} className="text-ink-400" />}
                          </button>
                        )}
                        <div className={`shrink-0 grid h-9 w-9 place-items-center rounded-lg border ${meta.cls}`}>
                          <Icon size={15} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-sm text-ink-100 font-medium">{e.actorName}</span>
                            <span className={`text-[9px] uppercase tracking-[0.2em] px-2 py-0.5 rounded-full border ${meta.cls}`}>{meta.label}</span>
                            <span className="text-[10px] uppercase tracking-[0.18em] text-ink-400">{e.action} · {e.entity}</span>
                          </div>
                          {e.detail && <div className="mt-1 text-sm text-ink-300 font-light">{e.detail}</div>}
                        </div>
                        <div className="text-xs text-ink-400 shrink-0 whitespace-nowrap">{fmt(e.at)}</div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
