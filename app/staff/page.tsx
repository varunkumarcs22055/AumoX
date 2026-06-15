"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Loader2, LogOut, Clock, CalendarDays, ArrowRight, ArrowLeft,
  Bell, Receipt, BadgeCheck, Briefcase, Send, Printer, Lock, Coffee,
} from "lucide-react";
import { LogoMark } from "@/components/Logo";
import StaffExtras from "@/components/staff/StaffExtras";
import FirstLoginPasswordGate from "@/components/FirstLoginPasswordGate";
import { usePoll } from "@/lib/usePoll";

type Task = { id: string; title: string; projectId?: string; due?: string; status: "todo" | "in-progress" | "done" };
type Session = { in: string; out?: string };
type Brk = { type: string; start: string; end?: string };
type Attendance = { id: string; date: string; mode: "office" | "wfh"; sessions: Session[]; breaks: Brk[]; inAt?: string; outAt?: string };
type Leave = { id: string; from: string; to: string; days: number; reason?: string; status: string; requestedAt: string };
type Payslip = { id: string; number: string; month: string; gross: number; deductions: { label: string; amount: number }[]; net: number; notes?: string };
type Asset = { id: string; name: string; type: string; url?: string; issuedAt: string };
type Notif = { id: string; message: string; read: boolean; createdAt: string };
type Me = {
  employee: { id: string; name: string; email: string; designation?: string; joinedAt: string; shiftStart?: string; shiftEnd?: string; phone?: string; address?: string; emergencyContact?: string; photo?: string; role?: "member" | "manager" | "hr"; mustChangePassword?: boolean };
  tasks: Task[];
  projects: { id: string; name: string }[];
  attendance: Attendance[];
  today: Attendance | null;
  leaves: Leave[];
  leaveBalance: number;
  payslips: Payslip[];
  assets: Asset[];
  notifications: Notif[];
  announcements?: { id: string; title: string; body: string; pinned: boolean; createdAt: string; authorName: string }[];
  holidays?: { id: string; date: string; name: string }[];
  timeEntries?: { id: string; projectId?: string; date: string; hours: number; billable: boolean; note?: string; invoiced?: boolean }[];
  claims?: { id: string; date: string; category: string; description: string; amount: number; currency: string; status: string; receiptUrl?: string }[];
  directory?: { id: string; name: string; designation?: string; email: string; photo?: string }[];
  teams?: { id: string; name: string; isManager?: boolean; isHr?: boolean; manager?: { id: string; name: string; designation?: string; email?: string; photo?: string; role?: "member" | "manager" | "hr" } | null; hr?: { id: string; name: string; designation?: string; email?: string; photo?: string; role?: "member" | "manager" | "hr" } | null; members: { id: string; name: string; designation?: string; email?: string; photo?: string; role?: "member" | "manager" | "hr" }[] }[];
};

const BREAK_TYPES = ["Lunch", "Tea / coffee", "Short break", "Meeting", "Personal", "Prayer", "Other"];

function t(iso?: string) {
  if (!iso) return "—";
  return new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

// "17:00" → "5:00 PM"
function fmtShift(hhmm?: string) {
  if (!hhmm) return null;
  const [h, m] = hhmm.split(":").map(Number);
  if (isNaN(h)) return hhmm;
  const ampm = h >= 12 ? "PM" : "AM";
  const h12 = h % 12 || 12;
  return `${h12}:${String(m || 0).padStart(2, "0")} ${ampm}`;
}

function fmtDur(ms: number) {
  if (ms <= 0) return "0m";
  const mins = Math.round(ms / 60000);
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
}

// Mirror of attendanceTotals — open intervals measured to `now`.
function totalsOf(row: Attendance | null, now: number) {
  if (!row) return { netMs: 0, breakMs: 0, grossMs: 0 };
  const dur = (a: string, b?: string) => Math.max(0, (b ? new Date(b).getTime() : now) - new Date(a).getTime());
  const grossMs = (row.sessions || []).reduce((s, x) => s + dur(x.in, x.out), 0);
  const breakMs = (row.breaks || []).reduce((s, x) => s + dur(x.start, x.end), 0);
  return { grossMs, breakMs, netMs: Math.max(0, grossMs - breakMs) };
}

export default function StaffPage() {
  const router = useRouter();
  const [me, setMe] = useState<Me | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [mode, setMode] = useState<"office" | "wfh">("office");
  const [breakType, setBreakType] = useState(BREAK_TYPES[0]);
  const [nowTs, setNowTs] = useState(() => Date.now());
  const [leaveDraft, setLeaveDraft] = useState({ from: "", to: "", reason: "" });
  const [msg, setMsg] = useState("");
  const [pwForm, setPwForm] = useState({ current: "", next: "" });
  const [pwMsg, setPwMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [pwSaving, setPwSaving] = useState(false);

  async function changePassword() {
    setPwMsg(null);
    if (!pwForm.current || pwForm.next.length < 8) {
      setPwMsg({ ok: false, text: "Enter your current password and a new one (8+ characters)." });
      return;
    }
    setPwSaving(true);
    try {
      const res = await fetch("/api/staff/password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(pwForm),
      });
      const d = await res.json();
      if (!res.ok) {
        setPwMsg({ ok: false, text: d.error ?? "Failed to update password." });
      } else {
        setPwMsg({ ok: true, text: "Password updated." });
        setPwForm({ current: "", next: "" });
      }
    } finally {
      setPwSaving(false);
    }
  }

  const load = useCallback(() => {
    fetch("/api/staff/me", { cache: "no-store" })
      .then(async (r) => {
        if (r.status === 401) { router.push("/staff/login"); return null; }
        return r.json();
      })
      .then((d) => d && setMe(d))
      .finally(() => setLoading(false));
  }, [router]);
  useEffect(() => { load(); }, [load]);
  // Live: silently re-pull the workspace (tasks, announcements, notifications,
  // attendance) every 15s and on tab focus — no manual refresh needed.
  usePoll(load, 15000);

  // Tick once a minute so live "worked so far" totals stay current.
  useEffect(() => {
    const id = setInterval(() => setNowTs(Date.now()), 30000);
    return () => clearInterval(id);
  }, []);

  async function logout() {
    await fetch("/api/staff/logout", { method: "POST" });
    router.push("/staff/login");
  }

  async function clock(action: "in" | "out" | "break-start" | "break-end") {
    setBusy(true);
    setMsg("");
    try {
      const res = await fetch("/api/staff/clock", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, mode, breakType }),
      });
      const d = await res.json();
      if (!res.ok) setMsg(d.error || "Failed");
      else if (d.row) setMe((m) => (m ? { ...m, today: d.row } : m));
      else load();
    } finally { setBusy(false); }
  }

  async function moveTask(task: Task, dir: 1 | -1) {
    const order = ["todo", "in-progress", "done"] as const;
    const next = order[order.indexOf(task.status) + dir];
    if (!next) return;
    setMe((m) => m && { ...m, tasks: m.tasks.map((x) => (x.id === task.id ? { ...x, status: next } : x)) });
    await fetch("/api/staff/tasks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: task.id, status: next }),
    });
  }

  async function requestLeave() {
    if (!leaveDraft.from || !leaveDraft.to) { setMsg("Pick leave dates."); return; }
    setBusy(true);
    setMsg("");
    try {
      const res = await fetch("/api/staff/leave", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(leaveDraft),
      });
      const d = await res.json();
      if (!res.ok) { setMsg(d.error || "Failed"); return; }
      setLeaveDraft({ from: "", to: "", reason: "" });
      load();
    } finally { setBusy(false); }
  }

  function printPayslip(p: Payslip) {
    if (!me) return;
    const w = window.open("", "_blank", "width=720,height=900");
    if (!w) return;
    const ded = p.deductions.map((d) => `<tr><td>${d.label}</td><td style="text-align:right">− ₹${d.amount.toLocaleString()}</td></tr>`).join("");
    w.document.write(`<!doctype html><html><head><title>${p.number}</title><style>
      body{font-family:Inter,system-ui,sans-serif;margin:40px;color:#1a1a1a}
      .head{display:flex;justify-content:space-between;align-items:center;border-bottom:3px solid #C9A23A;padding-bottom:16px}
      h1{font-weight:300;letter-spacing:4px;margin:0}
      .tag{color:#9E7410;font-size:11px;letter-spacing:3px;text-transform:uppercase}
      table{width:100%;border-collapse:collapse;margin-top:24px}
      td,th{padding:10px 8px;border-bottom:1px solid #eee;font-size:14px;text-align:left}
      .net{font-size:20px;font-weight:600;color:#9E7410}
      .meta{margin-top:18px;font-size:13px;color:#555;line-height:1.7}
    </style></head><body>
      <div class="head"><div><h1>AUMOXO</h1><div class="tag">Payslip · ${p.number}</div></div>
      <div style="text-align:right;font-size:13px;color:#555">Month: <b>${p.month}</b><br/>Generated: ${new Date().toLocaleDateString()}</div></div>
      <div class="meta"><b>${me.employee.name}</b>${me.employee.designation ? " · " + me.employee.designation : ""}<br/>${me.employee.email}<br/>Joined: ${me.employee.joinedAt}</div>
      <table>
        <tr><th>Item</th><th style="text-align:right">Amount</th></tr>
        <tr><td>Gross salary</td><td style="text-align:right">₹${p.gross.toLocaleString()}</td></tr>
        ${ded}
        <tr><td class="net">Net pay</td><td class="net" style="text-align:right">₹${p.net.toLocaleString()}</td></tr>
      </table>
      ${p.notes ? `<p class="meta">${p.notes}</p>` : ""}
      <p class="meta">This is a system-generated payslip from AUMOXO. aumoxo.tech</p>
      <script>window.print()</script>
    </body></html>`);
    w.document.close();
  }

  if (loading || !me) {
    return (
      <div className="min-h-screen bg-bg-base grid place-items-center text-ink-400">
        <div className="flex items-center gap-2 text-sm"><Loader2 size={16} className="animate-spin" /> Loading workspace…</div>
      </div>
    );
  }

  const unread = me.notifications.filter((n) => !n.read).length;
  const today = me.today;
  const sessions = today?.sessions ?? [];
  const breaks = today?.breaks ?? [];
  const openSession = sessions.find((s) => !s.out);
  const openBreak = breaks.find((b) => !b.end);
  const working = !!openSession && !openBreak;
  const onBreak = !!openBreak;
  const hasStarted = sessions.length > 0;
  const totals = totalsOf(today, nowTs);
  const shift =
    me.employee.shiftStart || me.employee.shiftEnd
      ? `${fmtShift(me.employee.shiftStart) ?? "—"} – ${fmtShift(me.employee.shiftEnd) ?? "—"}`
      : null;

  const stateLabel = onBreak
    ? `On ${openBreak!.type.toLowerCase()} break since ${t(openBreak!.start)}`
    : working
    ? `Working since ${t(openSession!.in)} (${today?.mode})`
    : hasStarted
    ? `Clocked out · ${fmtDur(totals.netMs)} worked today`
    : "Not clocked in yet today.";

  return (
    <div className="min-h-screen bg-bg-base">
      {/* First-login: force a password change (temp password was emailed) */}
      <FirstLoginPasswordGate
        open={!!me.employee.mustChangePassword}
        endpoint="/api/staff/password"
        context="workspace"
        onDone={async () => { load(); }}
      />
      {/* Top bar */}
      <header className="sticky top-0 z-40 bg-bg-base/85 backdrop-blur-xl border-b border-line">
        <div className="container-x h-[72px] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <LogoMark size={40} />
            <div>
              <div className="text-sm font-medium tracking-wider text-ink-100">AUMOXO</div>
              <div className="text-[10px] uppercase tracking-[0.3em] text-gold-400">Staff Workspace</div>
            </div>
          </div>
          <div className="flex items-center gap-5">
            <div className="hidden sm:block text-right">
              <div className="text-sm text-ink-100">{me.employee.name}</div>
              <div className="text-xs text-ink-400">{me.employee.designation || me.employee.email}</div>
            </div>
            <button onClick={logout} className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-ink-300 hover:text-red-400 transition-colors">
              <LogOut size={14} /> Sign out
            </button>
          </div>
        </div>
      </header>

      <main className="container-x py-10 lg:py-14 space-y-10">
        {/* Clock + notifications row */}
        <div className="grid lg:grid-cols-[1.2fr_1fr] gap-6">
          {/* Attendance — multi-session + breaks */}
          <div className="card p-7 gold-border">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-start gap-4">
                <div className={`grid h-12 w-12 place-items-center rounded-lg border transition-colors ${onBreak ? "border-amber-400/60 bg-amber-400/10 text-amber-300" : working ? "border-green-400/60 bg-green-400/10 text-green-300" : "border-gold-400/30 bg-gold-400/5 text-gold-300"}`}>
                  {onBreak ? <Coffee size={20} /> : <Clock size={20} />}
                </div>
                <div>
                  <h2 className="text-lg font-light text-ink-100">Attendance</h2>
                  <p className="mt-1 text-sm text-ink-300 font-light">{stateLabel}</p>
                  {shift && (
                    <p className="mt-1 text-xs text-ink-400">
                      Your shift: <span className="text-gold-300">{shift}</span>
                    </p>
                  )}
                </div>
              </div>
              <div className="text-right shrink-0">
                <div className="font-display text-2xl font-extralight gold-text">{fmtDur(totals.netMs)}</div>
                <div className="text-[10px] uppercase tracking-[0.2em] text-ink-400">worked today{totals.breakMs > 0 ? ` · ${fmtDur(totals.breakMs)} break` : ""}</div>
              </div>
            </div>

            {/* Controls */}
            <div className="mt-5 flex flex-wrap items-center gap-3">
              {!working && !onBreak && (
                <>
                  <select className="input !py-2 !w-auto text-sm" value={mode} onChange={(e) => setMode(e.target.value as "office" | "wfh")}>
                    <option value="office">Office</option>
                    <option value="wfh">WFH</option>
                  </select>
                  <button onClick={() => clock("in")} disabled={busy} className="btn-gold text-sm !py-2 !px-5 disabled:opacity-60">
                    {busy ? <Loader2 size={14} className="animate-spin" /> : null}
                    {hasStarted ? "Clock in again" : "Clock in"}
                  </button>
                </>
              )}
              {working && (
                <>
                  <select className="input !py-2 !w-auto text-sm" value={breakType} onChange={(e) => setBreakType(e.target.value)}>
                    {BREAK_TYPES.map((b) => <option key={b} value={b}>{b}</option>)}
                  </select>
                  <button onClick={() => clock("break-start")} disabled={busy} className="btn-ghost text-sm !py-2 !px-4 disabled:opacity-60">
                    <Coffee size={14} /> Take break
                  </button>
                  <button onClick={() => clock("out")} disabled={busy} className="btn-gold text-sm !py-2 !px-5 disabled:opacity-60">Clock out</button>
                </>
              )}
              {onBreak && (
                <button onClick={() => clock("break-end")} disabled={busy} className="btn-gold text-sm !py-2 !px-5 disabled:opacity-60">
                  {busy ? <Loader2 size={14} className="animate-spin" /> : null} End break &amp; resume
                </button>
              )}
            </div>
            {msg && <p className="mt-3 text-sm text-red-400">{msg}</p>}

            {/* Today's sessions + breaks */}
            {(sessions.length > 0 || breaks.length > 0) && (
              <div className="mt-5 pt-5 border-t border-line grid sm:grid-cols-2 gap-5">
                <div>
                  <div className="text-[10px] uppercase tracking-[0.25em] text-gold-400 mb-2">Today&apos;s sessions</div>
                  <ul className="space-y-1.5">
                    {sessions.map((s, i) => (
                      <li key={i} className="text-sm text-ink-200 font-light flex items-center gap-2">
                        <span className="h-1.5 w-1.5 rounded-full bg-gold-400 shrink-0" />
                        {t(s.in)} → {s.out ? t(s.out) : <span className="text-green-300">ongoing</span>}
                        <span className="text-ink-500 text-xs ml-auto">{fmtDur((s.out ? new Date(s.out).getTime() : nowTs) - new Date(s.in).getTime())}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <div className="text-[10px] uppercase tracking-[0.25em] text-gold-400 mb-2">Breaks</div>
                  {breaks.length === 0 ? (
                    <p className="text-xs text-ink-500 font-light">No breaks taken.</p>
                  ) : (
                    <ul className="space-y-1.5">
                      {breaks.map((b, i) => (
                        <li key={i} className="text-sm text-ink-200 font-light flex items-center gap-2">
                          <Coffee size={12} className="text-amber-300 shrink-0" />
                          {b.type} · {t(b.start)}{b.end ? `–${t(b.end)}` : <span className="text-amber-300"> (ongoing)</span>}
                          <span className="text-ink-500 text-xs ml-auto">{fmtDur((b.end ? new Date(b.end).getTime() : nowTs) - new Date(b.start).getTime())}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            )}

            {/* Recent history with worked hours */}
            <div className="mt-5 pt-5 border-t border-line flex flex-wrap gap-2">
              {me.attendance.slice(0, 14).map((a) => {
                const tot = totalsOf(a, nowTs);
                return (
                  <span key={a.id} title={`${a.date} · ${fmtDur(tot.netMs)} worked · ${a.mode}`} className="text-[10px] px-2 py-1 rounded border border-line text-ink-400">
                    {a.date.slice(5)} · {fmtDur(tot.netMs)}
                  </span>
                );
              })}
              {me.attendance.length === 0 && <span className="text-xs text-ink-500">No attendance history yet.</span>}
            </div>
          </div>

          {/* Notifications */}
          <div className="card p-7">
            <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.3em] text-gold-400">
              <Bell size={13} /> Alerts {unread > 0 && <span className="text-ink-100">({unread} new)</span>}
            </div>
            <ul className="mt-4 space-y-3 max-h-[180px] overflow-y-auto">
              {me.notifications.length === 0 ? (
                <li className="text-sm text-ink-500 font-light">Nothing yet.</li>
              ) : me.notifications.slice(0, 10).map((n) => (
                <li key={n.id} className={`text-sm font-light ${n.read ? "text-ink-400" : "text-ink-100"}`}>
                  <span className="text-gold-400 mr-1.5">•</span>{n.message}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* My tasks */}
        <section>
          <div className="eyebrow"><span className="h-px w-8 bg-gold-400" />My Tasks</div>
          <div className="mt-5 grid md:grid-cols-3 gap-5">
            {(["todo", "in-progress", "done"] as const).map((col) => {
              const colTasks = me.tasks.filter((x) => x.status === col);
              return (
                <div key={col} className="rounded-2xl border border-line bg-bg-surface p-4">
                  <div className="flex items-center justify-between px-2 mb-3">
                    <span className="text-[11px] uppercase tracking-[0.3em] text-gold-400">
                      {col === "todo" ? "To do" : col === "in-progress" ? "In progress" : "Done"}
                    </span>
                    <span className="text-xs text-ink-400">{colTasks.length}</span>
                  </div>
                  <div className="space-y-2.5">
                    {colTasks.length === 0 ? (
                      <div className="text-center text-xs text-ink-500 py-4">Empty</div>
                    ) : colTasks.map((task) => (
                      <div key={task.id} className={`card p-4 ${col === "done" ? "opacity-70" : ""}`}>
                        <div className={`text-sm font-light ${col === "done" ? "line-through text-ink-300" : "text-ink-100"}`}>{task.title}</div>
                        <div className="mt-1.5 flex flex-wrap gap-x-4 text-[11px] text-ink-400">
                          {me.projects.find((p) => p.id === task.projectId)?.name && (
                            <span className="text-gold-300">{me.projects.find((p) => p.id === task.projectId)?.name}</span>
                          )}
                          {task.due && <span className="inline-flex items-center gap-1"><CalendarDays size={11} /> {task.due}</span>}
                        </div>
                        <div className="mt-2.5 flex gap-1">
                          {col !== "todo" && <button onClick={() => moveTask(task, -1)} className="p-1.5 rounded text-ink-300 hover:text-gold-300 hover:bg-gold-400/10"><ArrowLeft size={13} /></button>}
                          {col !== "done" && <button onClick={() => moveTask(task, 1)} className="p-1.5 rounded text-gold-300 hover:bg-gold-400/10"><ArrowRight size={13} /></button>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Leave + payroll + assets */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Leave */}
          <div className="card p-7">
            <div className="flex items-center justify-between">
              <div className="text-[11px] uppercase tracking-[0.3em] text-gold-400">Leave</div>
              <span className="text-xs text-ink-300">{me.leaveBalance} days left</span>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-2">
              <input type="date" className="input !py-2 text-sm" value={leaveDraft.from} onChange={(e) => setLeaveDraft({ ...leaveDraft, from: e.target.value })} />
              <input type="date" className="input !py-2 text-sm" value={leaveDraft.to} onChange={(e) => setLeaveDraft({ ...leaveDraft, to: e.target.value })} />
            </div>
            <input className="input !py-2 text-sm mt-2" placeholder="Reason (optional)" value={leaveDraft.reason} onChange={(e) => setLeaveDraft({ ...leaveDraft, reason: e.target.value })} />
            <button onClick={requestLeave} disabled={busy} className="btn-gold text-sm !py-2 !px-4 mt-3 disabled:opacity-60">
              <Send size={13} /> Request leave
            </button>
            <ul className="mt-4 pt-4 border-t border-line space-y-2 max-h-[140px] overflow-y-auto">
              {me.leaves.length === 0 ? (
                <li className="text-xs text-ink-500">No requests yet.</li>
              ) : me.leaves.map((l) => (
                <li key={l.id} className="flex items-center justify-between text-xs">
                  <span className="text-ink-300">{l.from} → {l.to} ({l.days}d)</span>
                  <span className={`uppercase tracking-wider ${l.status === "approved" ? "text-green-300" : l.status === "rejected" ? "text-red-400" : "text-amber-300"}`}>{l.status}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Payslips */}
          <div className="card p-7">
            <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.3em] text-gold-400">
              <Receipt size={13} /> Payslips
            </div>
            <ul className="mt-4 space-y-2.5">
              {me.payslips.length === 0 ? (
                <li className="text-xs text-ink-500">No payslips yet.</li>
              ) : me.payslips.map((p) => (
                <li key={p.id} className="flex items-center justify-between gap-2 rounded-lg border border-line p-3">
                  <div>
                    <div className="text-sm text-ink-100 font-light">{p.month} · {p.number}</div>
                    <div className="text-xs text-gold-300 mt-0.5">Net ₹{p.net.toLocaleString()}</div>
                  </div>
                  <button onClick={() => printPayslip(p)} className="btn-ghost text-xs !py-1.5 !px-3">
                    <Printer size={12} /> PDF
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Assets */}
          <div className="card p-7">
            <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.3em] text-gold-400">
              <BadgeCheck size={13} /> Issued to me
            </div>
            <ul className="mt-4 space-y-2.5">
              {me.assets.length === 0 ? (
                <li className="text-xs text-ink-500">Nothing issued yet.</li>
              ) : me.assets.map((a) => (
                <li key={a.id} className="rounded-lg border border-line p-3">
                  <div className="text-sm text-ink-100 font-light">{a.name}</div>
                  <div className="text-[11px] text-ink-400 mt-0.5">
                    {a.type} · {new Date(a.issuedAt).toLocaleDateString()}
                    {a.url && (
                      <>
                        {" · "}
                        <a href={a.url} target="_blank" rel="noopener noreferrer" className="text-gold-300 hover:text-gold-200">download</a>
                      </>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Self-service: announcements, timesheet, claims, profile, directory, holidays */}
        <StaffExtras me={me} reload={load} />

        {/* Account security */}
        <div className="card p-7 max-w-3xl">
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

        <div className="text-xs text-ink-500 font-light flex items-center gap-2">
          <Briefcase size={12} /> Workspace for AUMOXO team members. Questions? hello@aumoxo.tech
        </div>
      </main>
    </div>
  );
}
