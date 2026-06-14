"use client";

import { useEffect, useState } from "react";
import {
  Plus, Trash2, Check, X, Loader2, KeyRound, Copy, User, ExternalLink, BadgeCheck,
} from "lucide-react";

type Employee = {
  id: string; name: string; email: string; designation?: string;
  joinedAt: string; salaryMonthly?: number; active: boolean;
  shiftStart?: string; shiftEnd?: string;
};
type Leave = { id: string; employeeId: string; from: string; to: string; days: number; reason?: string; status: string; requestedAt: string };
type Session = { in: string; out?: string };
type Brk = { type: string; start: string; end?: string };
type Attendance = { id: string; employeeId: string; date: string; mode: string; sessions?: Session[]; breaks?: Brk[]; inAt?: string; outAt?: string };
type Payslip = { id: string; number: string; employeeId: string; month: string; gross: number; net: number };
type Asset = { id: string; employeeId: string; name: string; type: string; issuedAt: string };

type Tab = "employees" | "leaves" | "attendance" | "payroll" | "assets";

function genPassword() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789";
  let pw = "";
  const arr = new Uint32Array(12);
  crypto.getRandomValues(arr);
  for (let i = 0; i < 12; i++) pw += chars[arr[i] % chars.length];
  return pw;
}
const t = (iso?: string) => (iso ? new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "—");
const fmtShift = (hhmm?: string) => {
  if (!hhmm) return null;
  const [h, m] = hhmm.split(":").map(Number);
  if (isNaN(h)) return hhmm;
  return `${h % 12 || 12}:${String(m || 0).padStart(2, "0")} ${h >= 12 ? "PM" : "AM"}`;
};
const fmtDur = (ms: number) => {
  if (ms <= 0) return "0m";
  const mins = Math.round(ms / 60000), h = Math.floor(mins / 60), m = mins % 60;
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
};
function attTotals(a: Attendance) {
  const now = Date.now();
  const dur = (x: string, y?: string) => Math.max(0, (y ? new Date(y).getTime() : now) - new Date(x).getTime());
  const sessions = a.sessions ?? (a.inAt ? [{ in: a.inAt, out: a.outAt }] : []);
  const breaks = a.breaks ?? [];
  const grossMs = sessions.reduce((s, x) => s + dur(x.in, x.out), 0);
  const breakMs = breaks.reduce((s, x) => s + dur(x.start, x.end), 0);
  return { sessions, breaks, grossMs, breakMs, netMs: Math.max(0, grossMs - breakMs) };
}

export default function TeamAdmin() {
  const [tab, setTab] = useState<Tab>("employees");
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [leaves, setLeaves] = useState<Leave[]>([]);
  const [attendance, setAttendance] = useState<Attendance[]>([]);
  const [payslips, setPayslips] = useState<Payslip[]>([]);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", designation: "", joinedAt: "", salaryMonthly: "", password: "", shiftStart: "", shiftEnd: "" });
  const [issued, setIssued] = useState<{ email: string; password: string; emailed?: boolean } | null>(null);
  const [copied, setCopied] = useState(false);
  const [slipForm, setSlipForm] = useState({ employeeId: "", month: new Date().toISOString().slice(0, 7), gross: "", deductions: "" });
  const [assetForm, setAssetForm] = useState({ employeeId: "", name: "", type: "document" });

  async function load() {
    setLoading(true);
    try {
      const [empRes, hrRes] = await Promise.all([
        fetch("/api/admin/employees", { cache: "no-store" }).then((r) => r.json()),
        fetch("/api/admin/hr", { cache: "no-store" }).then((r) => r.json()),
      ]);
      setEmployees(empRes.employees ?? []);
      setLeaves(hrRes.leaves ?? []);
      setAttendance(hrRes.attendance ?? []);
      setPayslips(hrRes.payslips ?? []);
      setAssets(hrRes.assets ?? []);
    } finally { setLoading(false); }
  }
  useEffect(() => { load(); }, []);

  const empName = (id: string) => employees.find((e) => e.id === id)?.name ?? "—";

  async function createEmployee() {
    setError("");
    if (!form.name.trim() || !form.email.trim() || form.password.length < 8) {
      setError("Name, email and a password of 8+ characters are required.");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/admin/employees", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          salaryMonthly: form.salaryMonthly ? Number(form.salaryMonthly) : undefined,
          joinedAt: form.joinedAt || undefined,
          shiftStart: form.shiftStart || undefined,
          shiftEnd: form.shiftEnd || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "Failed."); return; }
      setIssued({ email: form.email.trim().toLowerCase(), password: form.password, emailed: data.welcomeEmailed });
      setShowForm(false);
      load();
    } finally { setSaving(false); }
  }

  async function patchEmployee(e: Employee, patch: Record<string, unknown>) {
    await fetch("/api/admin/employees", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: e.id, name: e.name, email: e.email, ...patch }),
    });
    load();
  }

  async function resetPassword(e: Employee) {
    const pw = genPassword();
    if (!confirm(`Generate a new password for ${e.name}?`)) return;
    await patchEmployee(e, { password: pw });
    setIssued({ email: e.email, password: pw });
  }

  async function removeEmployee(e: Employee) {
    if (!confirm(`Delete ${e.name}'s account?`)) return;
    await fetch("/api/admin/employees", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: e.id }),
    });
    load();
  }

  async function hrAction(body: Record<string, unknown>) {
    setSaving(true);
    try {
      const res = await fetch("/api/admin/hr", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const d = await res.json();
        alert(d.error || "Action failed");
      }
      load();
    } finally { setSaving(false); }
  }

  function copyCreds() {
    if (!issued) return;
    navigator.clipboard.writeText(`AUMOXO Staff Workspace\nURL: https://aumoxo.tech/staff\nEmail: ${issued.email}\nPassword: ${issued.password}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  const TABS: { v: Tab; label: string }[] = [
    { v: "employees", label: `Employees (${employees.length})` },
    { v: "leaves", label: `Leaves (${leaves.filter((l) => l.status === "pending").length} pending)` },
    { v: "attendance", label: "Attendance" },
    { v: "payroll", label: "Payroll" },
    { v: "assets", label: "Assets" },
  ];

  return (
    <div>
      <div className="flex items-end justify-between flex-wrap gap-4">
        <div>
          <div className="text-[11px] uppercase tracking-[0.3em] text-gold-400">HRMS</div>
          <h1 className="mt-2 font-display text-4xl font-extralight text-ink-100">Team</h1>
          <p className="mt-2 text-ink-300 font-light">Employee accounts, attendance, leave, payroll and issued assets.</p>
        </div>
        <div className="flex gap-3">
          <a href="/staff/login" target="_blank" className="btn-ghost text-sm !py-2 !px-4"><ExternalLink size={14} /> Staff app</a>
          <button onClick={() => { setForm({ name: "", email: "", designation: "", joinedAt: "", salaryMonthly: "", password: genPassword(), shiftStart: "", shiftEnd: "" }); setError(""); setShowForm(true); setTab("employees"); }} className="btn-gold text-sm !py-2 !px-4">
            <Plus size={16} /> New employee
          </button>
        </div>
      </div>

      {issued && (
        <div className="mt-8 card p-6 ring-2 ring-gold-400/50">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <div className="text-[11px] uppercase tracking-[0.3em] text-gold-400">{issued.emailed ? "Credentials emailed to the employee" : "Share with the employee — shown only once"}</div>
              {issued.emailed && <div className="mt-2 text-xs text-green-300">✓ A welcome email with the workspace login was sent to {issued.email}.</div>}
              <div className="mt-3 font-mono text-sm text-ink-100 space-y-1">
                <div>Workspace: https://aumoxo.tech/staff</div>
                <div>Email: {issued.email}</div>
                <div>Password: {issued.password}</div>
              </div>
            </div>
            <div className="flex gap-2">
              <button onClick={copyCreds} className="btn-gold text-sm !py-2 !px-4"><Copy size={14} /> {copied ? "Copied!" : "Copy"}</button>
              <button onClick={() => setIssued(null)} className="btn-ghost text-sm !py-2 !px-4"><X size={14} /> Dismiss</button>
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="mt-8 flex flex-wrap gap-2">
        {TABS.map((x) => (
          <button key={x.v} onClick={() => setTab(x.v)} className={`text-xs uppercase tracking-[0.15em] px-3 py-1.5 rounded-full border transition-colors ${tab === x.v ? "border-gold-400 text-gold-300 bg-gold-400/10" : "border-line text-ink-400 hover:text-gold-300"}`}>
            {x.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="mt-8 card p-10 text-center text-ink-400">Loading…</div>
      ) : (
        <div className="mt-6">
          {/* EMPLOYEES */}
          {tab === "employees" && (
            <div className="space-y-3">
              {showForm && (
                <div className="card p-6 gold-border">
                  <h2 className="font-display text-xl font-light text-ink-100 mb-5">New employee</h2>
                  <div className="grid md:grid-cols-3 gap-4">
                    <Field label="Full name"><input className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Prathamesh" /></Field>
                    <Field label="Work email"><input type="email" className="input" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="prathamesh@aumoxo.tech" /><p className="mt-1.5 text-xs text-ink-500">Workspace login + password is emailed here from hello@aumoxo.tech.</p></Field>
                    <Field label="Designation"><input className="input" value={form.designation} onChange={(e) => setForm({ ...form, designation: e.target.value })} placeholder="Head of Engineering" /></Field>
                    <Field label="Joined"><input type="date" className="input" value={form.joinedAt} onChange={(e) => setForm({ ...form, joinedAt: e.target.value })} /></Field>
                    <Field label="Monthly salary (₹)"><input type="number" className="input" value={form.salaryMonthly} onChange={(e) => setForm({ ...form, salaryMonthly: e.target.value })} placeholder="50000" /></Field>
                    <Field label="Shift start"><input type="time" className="input" value={form.shiftStart} onChange={(e) => setForm({ ...form, shiftStart: e.target.value })} /></Field>
                    <Field label="Shift end"><input type="time" className="input" value={form.shiftEnd} onChange={(e) => setForm({ ...form, shiftEnd: e.target.value })} /></Field>
                    <Field label="Password">
                      <div className="flex gap-2">
                        <input className="input font-mono" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
                        <button type="button" onClick={() => setForm({ ...form, password: genPassword() })} className="btn-ghost text-xs !py-2 !px-3 shrink-0">↻</button>
                      </div>
                    </Field>
                  </div>
                  {error && <p className="mt-4 text-sm text-red-400">{error}</p>}
                  <div className="mt-5 flex gap-3">
                    <button onClick={createEmployee} disabled={saving} className="btn-gold text-sm !py-2 !px-4 disabled:opacity-60">
                      {saving ? <Loader2 size={15} className="animate-spin" /> : <Check size={15} />} Create
                    </button>
                    <button onClick={() => setShowForm(false)} className="btn-ghost text-sm !py-2 !px-4"><X size={15} /> Cancel</button>
                  </div>
                </div>
              )}
              {employees.length === 0 && !showForm ? (
                <div className="card p-10 text-center text-ink-400">No employees yet.</div>
              ) : employees.map((e) => (
                <div key={e.id} className={`card p-5 grid md:grid-cols-[2fr_2fr_auto_auto] items-center gap-4 ${e.active ? "" : "opacity-60"}`}>
                  <div className="flex items-center gap-3">
                    <div className="grid h-10 w-10 place-items-center rounded-lg border border-gold-400/30 bg-gold-400/5 text-gold-300 shrink-0"><User size={16} /></div>
                    <div>
                      <div className="text-ink-100 font-light">{e.name}</div>
                      <div className="text-xs text-ink-400">{e.designation || "—"} · since {e.joinedAt}</div>
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-ink-300">{e.email}{e.salaryMonthly ? ` · ₹${e.salaryMonthly.toLocaleString()}/mo` : ""}</div>
                    <div className="mt-1.5 flex items-center gap-2 text-xs text-ink-400">
                      <span className="uppercase tracking-[0.15em] text-[10px]">Shift</span>
                      <input type="time" defaultValue={e.shiftStart || ""} onBlur={(ev) => { if (ev.target.value !== (e.shiftStart || "")) patchEmployee(e, { shiftStart: ev.target.value }); }} className="input !py-1 !px-2 !w-auto text-xs" />
                      <span>–</span>
                      <input type="time" defaultValue={e.shiftEnd || ""} onBlur={(ev) => { if (ev.target.value !== (e.shiftEnd || "")) patchEmployee(e, { shiftEnd: ev.target.value }); }} className="input !py-1 !px-2 !w-auto text-xs" />
                    </div>
                  </div>
                  <button onClick={() => patchEmployee(e, { active: !e.active })} className={`text-xs uppercase tracking-[0.2em] px-3 py-1.5 rounded-full border transition-colors ${e.active ? "border-green-400/40 text-green-300 hover:bg-green-400/10" : "border-ink-400/40 text-ink-400"}`}>
                    {e.active ? "Active" : "Suspended"}
                  </button>
                  <div className="flex gap-2">
                    <button onClick={() => resetPassword(e)} className="p-2 rounded-lg text-gold-300 hover:bg-gold-400/10" title="Reset password"><KeyRound size={16} /></button>
                    <button onClick={() => removeEmployee(e)} className="p-2 rounded-lg text-red-400 hover:bg-red-400/10" title="Delete"><Trash2 size={16} /></button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* LEAVES */}
          {tab === "leaves" && (
            <div className="space-y-3">
              {leaves.length === 0 ? (
                <div className="card p-10 text-center text-ink-400">No leave requests.</div>
              ) : leaves.map((l) => (
                <div key={l.id} className="card p-5 flex flex-wrap items-center gap-4">
                  <div className="flex-1 min-w-[200px]">
                    <div className="text-ink-100 font-light">{empName(l.employeeId)}</div>
                    <div className="text-xs text-ink-400 mt-0.5">{l.from} → {l.to} · {l.days} day{l.days > 1 ? "s" : ""}{l.reason ? ` · ${l.reason}` : ""}</div>
                  </div>
                  {l.status === "pending" ? (
                    <div className="flex gap-2">
                      <button onClick={() => hrAction({ action: "leave-approve", id: l.id })} disabled={saving} className="btn-gold text-xs !py-1.5 !px-3">Approve</button>
                      <button onClick={() => hrAction({ action: "leave-reject", id: l.id })} disabled={saving} className="btn-ghost text-xs !py-1.5 !px-3 !text-red-400">Reject</button>
                    </div>
                  ) : (
                    <span className={`text-xs uppercase tracking-[0.2em] ${l.status === "approved" ? "text-green-300" : "text-red-400"}`}>{l.status}</span>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* ATTENDANCE */}
          {tab === "attendance" && (
            <div className="card overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-[10px] uppercase tracking-[0.2em] text-gold-400 border-b border-line">
                    <th className="p-4">Employee</th><th className="p-4">Date</th><th className="p-4">Sessions (in → out)</th><th className="p-4">Breaks</th><th className="p-4">Worked</th><th className="p-4">Mode</th>
                  </tr>
                </thead>
                <tbody>
                  {attendance.length === 0 ? (
                    <tr><td colSpan={6} className="p-8 text-center text-ink-400">No attendance records yet.</td></tr>
                  ) : attendance.slice(0, 60).map((a) => {
                    const tot = attTotals(a);
                    return (
                      <tr key={a.id} className="border-b border-line/50 text-ink-200 font-light align-top">
                        <td className="p-4">{empName(a.employeeId)}</td>
                        <td className="p-4 whitespace-nowrap">{a.date}</td>
                        <td className="p-4">
                          {tot.sessions.length === 0 ? "—" : tot.sessions.map((s, i) => (
                            <div key={i} className="whitespace-nowrap">{t(s.in)} → {s.out ? t(s.out) : <span className="text-green-300">ongoing</span>}</div>
                          ))}
                        </td>
                        <td className="p-4">
                          {tot.breaks.length === 0 ? <span className="text-ink-500">—</span> : tot.breaks.map((b, i) => (
                            <div key={i} className="whitespace-nowrap text-xs text-ink-400">{b.type} {fmtDur((b.end ? new Date(b.end).getTime() : Date.now()) - new Date(b.start).getTime())}</div>
                          ))}
                        </td>
                        <td className="p-4 whitespace-nowrap text-gold-300">{fmtDur(tot.netMs)}</td>
                        <td className="p-4 uppercase text-xs">{a.mode}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* PAYROLL */}
          {tab === "payroll" && (
            <div className="space-y-5">
              <div className="card p-5 grid md:grid-cols-[1fr_1fr_1fr_1.5fr_auto] gap-3 items-end">
                <Field label="Employee">
                  <select className="input !py-2" value={slipForm.employeeId} onChange={(e) => {
                    const emp = employees.find((x) => x.id === e.target.value);
                    setSlipForm({ ...slipForm, employeeId: e.target.value, gross: emp?.salaryMonthly ? String(emp.salaryMonthly) : slipForm.gross });
                  }}>
                    <option value="">Select…</option>
                    {employees.map((e) => <option key={e.id} value={e.id}>{e.name}</option>)}
                  </select>
                </Field>
                <Field label="Month"><input type="month" className="input !py-2" value={slipForm.month} onChange={(e) => setSlipForm({ ...slipForm, month: e.target.value })} /></Field>
                <Field label="Gross (₹)"><input type="number" className="input !py-2" value={slipForm.gross} onChange={(e) => setSlipForm({ ...slipForm, gross: e.target.value })} /></Field>
                <Field label="Deductions (label:amount, comma-sep)"><input className="input !py-2" placeholder="PF:1800, TDS:2000" value={slipForm.deductions} onChange={(e) => setSlipForm({ ...slipForm, deductions: e.target.value })} /></Field>
                <button
                  onClick={() => {
                    const deductions = slipForm.deductions.split(",").map((s) => s.trim()).filter(Boolean).map((s) => {
                      const [label, amount] = s.split(":");
                      return { label: (label || "").trim(), amount: Number(amount) || 0 };
                    });
                    hrAction({ action: "payslip-generate", employeeId: slipForm.employeeId, month: slipForm.month, gross: Number(slipForm.gross) || 0, deductions });
                  }}
                  disabled={saving || !slipForm.employeeId}
                  className="btn-gold text-sm !py-2.5 !px-4 disabled:opacity-60"
                >
                  Generate
                </button>
              </div>
              <div className="space-y-2">
                {payslips.length === 0 ? (
                  <div className="card p-8 text-center text-ink-400">No payslips generated.</div>
                ) : payslips.map((p) => (
                  <div key={p.id} className="card p-4 flex items-center gap-4">
                    <div className="flex-1">
                      <span className="text-ink-100 font-light">{p.number}</span>
                      <span className="text-xs text-ink-400 ml-3">{empName(p.employeeId)} · {p.month}</span>
                    </div>
                    <span className="text-gold-300 font-light">₹{p.net.toLocaleString()} net</span>
                    <button onClick={() => hrAction({ action: "payslip-delete", id: p.id })} className="p-1.5 rounded text-red-400 hover:bg-red-400/10"><Trash2 size={14} /></button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ASSETS */}
          {tab === "assets" && (
            <div className="space-y-5">
              <div className="card p-5 grid md:grid-cols-[1fr_1.5fr_1fr_auto] gap-3 items-end">
                <Field label="Employee">
                  <select className="input !py-2" value={assetForm.employeeId} onChange={(e) => setAssetForm({ ...assetForm, employeeId: e.target.value })}>
                    <option value="">Select…</option>
                    {employees.map((e) => <option key={e.id} value={e.id}>{e.name}</option>)}
                  </select>
                </Field>
                <Field label="Asset / document"><input className="input !py-2" placeholder="Employee ID Card / MacBook / Certificate" value={assetForm.name} onChange={(e) => setAssetForm({ ...assetForm, name: e.target.value })} /></Field>
                <Field label="Type">
                  <select className="input !py-2" value={assetForm.type} onChange={(e) => setAssetForm({ ...assetForm, type: e.target.value })}>
                    <option value="document">Document</option>
                    <option value="certificate">Certificate</option>
                    <option value="equipment">Equipment</option>
                  </select>
                </Field>
                <button onClick={() => hrAction({ action: "asset-issue", ...assetForm })} disabled={saving || !assetForm.employeeId || !assetForm.name.trim()} className="btn-gold text-sm !py-2.5 !px-4 disabled:opacity-60">
                  <BadgeCheck size={14} /> Issue
                </button>
              </div>
              <div className="space-y-2">
                {assets.length === 0 ? (
                  <div className="card p-8 text-center text-ink-400">Nothing issued yet.</div>
                ) : assets.map((a) => (
                  <div key={a.id} className="card p-4 flex items-center gap-4">
                    <div className="flex-1">
                      <span className="text-ink-100 font-light">{a.name}</span>
                      <span className="text-xs text-ink-400 ml-3">{empName(a.employeeId)} · {a.type} · {new Date(a.issuedAt).toLocaleDateString()}</span>
                    </div>
                    <button onClick={() => hrAction({ action: "asset-delete", id: a.id })} className="p-1.5 rounded text-red-400 hover:bg-red-400/10"><Trash2 size={14} /></button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function Field({ label, children, className = "" }: { label: string; children: React.ReactNode; className?: string }) {
  return (
    <label className={`block ${className}`}>
      <span className="block text-[11px] uppercase tracking-[0.25em] text-ink-300 mb-2">{label}</span>
      {children}
    </label>
  );
}
