"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Plus, Trash2, Check, X, Loader2, Edit2, Mail, Phone, CalendarClock, TrendingUp, UserPlus, Copy,
} from "lucide-react";

type LeadStage = "new" | "contacted" | "qualified" | "proposal" | "won" | "lost";
type Lead = {
  id: string;
  createdAt: string;
  name: string;
  company?: string;
  email?: string;
  phone?: string;
  source?: string;
  service?: string;
  value?: number;
  currency?: string;
  stage: LeadStage;
  notes?: string;
  nextFollowUp?: string;
};

const STAGES: { v: LeadStage; label: string; cls: string }[] = [
  { v: "new",       label: "New",       cls: "border-sky-400/40 text-sky-300" },
  { v: "contacted", label: "Contacted", cls: "border-indigo-400/40 text-indigo-300" },
  { v: "qualified", label: "Qualified", cls: "border-amber-400/40 text-amber-300" },
  { v: "proposal",  label: "Proposal",  cls: "border-gold-400/50 text-gold-300" },
  { v: "won",       label: "Won",       cls: "border-green-400/40 text-green-300" },
  { v: "lost",      label: "Lost",      cls: "border-red-400/40 text-red-400" },
];

const SOURCES = ["Website", "Referral", "LinkedIn", "Cold outreach", "Event", "Other"];

const emptyLead = (): Lead => ({
  id: "",
  createdAt: "",
  name: "",
  company: "",
  email: "",
  phone: "",
  source: "Website",
  service: "",
  value: undefined,
  currency: "INR",
  stage: "new",
  notes: "",
  nextFollowUp: "",
});

function money(v?: number, cur = "INR") {
  if (!v) return "—";
  const sym = cur === "INR" ? "₹" : cur === "USD" ? "$" : cur === "EUR" ? "€" : cur + " ";
  return sym + v.toLocaleString();
}

export default function LeadsAdmin() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Lead>(emptyLead());
  const [filter, setFilter] = useState<LeadStage | "all">("all");
  const [error, setError] = useState("");
  const [converting, setConverting] = useState("");
  const [creds, setCreds] = useState<{ company: string; email: string; password: string } | null>(null);

  async function load() {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/leads", { cache: "no-store" });
      const data = await res.json();
      setLeads(data.leads ?? []);
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => { load(); }, []);

  const pipeline = useMemo(() => {
    const open = leads.filter((l) => !["won", "lost"].includes(l.stage));
    const won = leads.filter((l) => l.stage === "won");
    return {
      openCount: open.length,
      openValue: open.reduce((s, l) => s + (l.value || 0), 0),
      wonCount: won.length,
      wonValue: won.reduce((s, l) => s + (l.value || 0), 0),
    };
  }, [leads]);

  const visible = filter === "all" ? leads : leads.filter((l) => l.stage === filter);

  async function save() {
    setError("");
    if (!editing.name.trim()) { setError("Lead name is required."); return; }
    setSaving(true);
    try {
      const res = await fetch("/api/admin/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...editing, id: editing.id || undefined }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "Failed to save."); return; }
      setLeads(data.leads ?? []);
      setShowForm(false);
    } finally {
      setSaving(false);
    }
  }

  async function setStage(l: Lead, stage: LeadStage) {
    setLeads((all) => all.map((x) => (x.id === l.id ? { ...x, stage } : x)));
    await fetch("/api/admin/leads", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...l, stage }),
    });
  }

  async function convert(l: Lead) {
    if (!l.email) { alert("Add an email to this lead first — it becomes the client login."); return; }
    if (!confirm(`Convert "${l.name}" into a client account? A portal login will be created for ${l.email}.`)) return;
    setConverting(l.id);
    try {
      const res = await fetch("/api/admin/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: l.id, action: "convert" }),
      });
      const data = await res.json();
      if (!res.ok) { alert(data.error ?? "Conversion failed."); return; }
      setLeads(data.leads ?? []);
      if (data.alreadyClient) {
        alert("This lead is already a client — marked as won.");
      } else if (data.password) {
        setCreds({ company: data.client.company, email: data.client.email, password: data.password });
      }
    } finally {
      setConverting("");
    }
  }

  async function remove(l: Lead) {
    if (!confirm(`Delete lead "${l.name}"?`)) return;
    await fetch("/api/admin/leads", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: l.id }),
    });
    load();
  }

  return (
    <div>
      <div className="flex items-end justify-between flex-wrap gap-4">
        <div>
          <div className="text-[11px] uppercase tracking-[0.3em] text-gold-400">CRM</div>
          <h1 className="mt-2 font-display text-4xl font-extralight text-ink-100">Leads Pipeline</h1>
          <p className="mt-2 text-ink-300 font-light">
            Track every opportunity from first contact to won. Use the green
            convert button to turn a lead into a client with a portal login in one click.
          </p>
        </div>
        <button onClick={() => { setEditing(emptyLead()); setError(""); setShowForm(true); }} className="btn-gold text-sm !py-2 !px-4">
          <Plus size={16} /> New lead
        </button>
      </div>

      {/* Pipeline summary */}
      <div className="mt-8 grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Stat label="Open leads" value={String(pipeline.openCount)} />
        <Stat label="Pipeline value" value={money(pipeline.openValue)} gold />
        <Stat label="Won deals" value={String(pipeline.wonCount)} />
        <Stat label="Won value" value={money(pipeline.wonValue)} gold />
      </div>

      {/* Credentials shown exactly once after a conversion */}
      {creds && (
        <div className="mt-8 card p-6 gold-border">
          <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.3em] text-gold-400">
            <UserPlus size={13} /> Client account created — share these credentials securely
          </div>
          <p className="mt-2 text-xs text-ink-400 font-light">
            This password is shown only once. The client signs in at aumoxo.tech/portal/login.
          </p>
          <div className="mt-4 grid sm:grid-cols-3 gap-3 text-sm">
            <div><span className="text-ink-400 text-xs block">Company</span><span className="text-ink-100">{creds.company}</span></div>
            <div><span className="text-ink-400 text-xs block">Login email</span><span className="text-ink-100">{creds.email}</span></div>
            <div><span className="text-ink-400 text-xs block">Password</span><span className="text-gold-300 font-mono">{creds.password}</span></div>
          </div>
          <div className="mt-4 flex gap-3">
            <button
              onClick={() => navigator.clipboard?.writeText(`Portal: https://aumoxo.tech/portal/login\nEmail: ${creds.email}\nPassword: ${creds.password}`)}
              className="btn-gold text-xs !py-2 !px-4"
            >
              <Copy size={13} /> Copy credentials
            </button>
            <button onClick={() => setCreds(null)} className="btn-ghost text-xs !py-2 !px-4">Done</button>
          </div>
        </div>
      )}

      {/* Lead form */}
      {showForm && (
        <div className="mt-8 card p-6 gold-border">
          <h2 className="font-display text-xl font-light text-ink-100 mb-5">
            {editing.id ? "Edit lead" : "New lead"}
          </h2>
          <div className="grid md:grid-cols-3 gap-5">
            <Field label="Contact name">
              <input className="input" value={editing.name} onChange={(e) => setEditing({ ...editing, name: e.target.value })} placeholder="Jane Doe" />
            </Field>
            <Field label="Company">
              <input className="input" value={editing.company ?? ""} onChange={(e) => setEditing({ ...editing, company: e.target.value })} placeholder="Acme Corp" />
            </Field>
            <Field label="Interested in">
              <input className="input" value={editing.service ?? ""} onChange={(e) => setEditing({ ...editing, service: e.target.value })} placeholder="CRM Platform" />
            </Field>
            <Field label="Email">
              <input type="email" className="input" value={editing.email ?? ""} onChange={(e) => setEditing({ ...editing, email: e.target.value })} />
            </Field>
            <Field label="Phone">
              <input className="input" value={editing.phone ?? ""} onChange={(e) => setEditing({ ...editing, phone: e.target.value })} />
            </Field>
            <Field label="Source">
              <select className="input" value={editing.source ?? "Website"} onChange={(e) => setEditing({ ...editing, source: e.target.value })}>
                {SOURCES.map((s) => <option key={s}>{s}</option>)}
              </select>
            </Field>
            <Field label="Expected value">
              <input type="number" min={0} className="input" value={editing.value ?? ""} onChange={(e) => setEditing({ ...editing, value: e.target.value === "" ? undefined : Number(e.target.value) })} placeholder="50000" />
            </Field>
            <Field label="Currency">
              <select className="input" value={editing.currency ?? "INR"} onChange={(e) => setEditing({ ...editing, currency: e.target.value })}>
                {["INR", "USD", "EUR", "GBP", "AED"].map((c) => <option key={c}>{c}</option>)}
              </select>
            </Field>
            <Field label="Next follow-up">
              <input type="date" className="input" value={editing.nextFollowUp ?? ""} onChange={(e) => setEditing({ ...editing, nextFollowUp: e.target.value })} />
            </Field>
            <Field label="Stage">
              <select className="input" value={editing.stage} onChange={(e) => setEditing({ ...editing, stage: e.target.value as LeadStage })}>
                {STAGES.map((s) => <option key={s.v} value={s.v}>{s.label}</option>)}
              </select>
            </Field>
            <Field label="Notes" className="md:col-span-2">
              <textarea className="input min-h-[60px] resize-y" value={editing.notes ?? ""} onChange={(e) => setEditing({ ...editing, notes: e.target.value })} />
            </Field>
          </div>
          {error && <p className="mt-4 text-sm text-red-400">{error}</p>}
          <div className="mt-6 flex gap-3">
            <button onClick={save} disabled={saving} className="btn-gold text-sm !py-2 !px-4 disabled:opacity-60">
              {saving ? <><Loader2 size={16} className="animate-spin" /> Saving…</> : <><Check size={16} /> Save lead</>}
            </button>
            <button onClick={() => setShowForm(false)} className="btn-ghost text-sm !py-2 !px-4"><X size={16} /> Cancel</button>
          </div>
        </div>
      )}

      {/* Stage filter */}
      <div className="mt-10 flex flex-wrap gap-2">
        <button onClick={() => setFilter("all")} className={`text-xs uppercase tracking-[0.15em] px-3 py-1.5 rounded-full border transition-colors ${filter === "all" ? "border-gold-400 text-gold-300 bg-gold-400/10" : "border-line text-ink-400 hover:text-gold-300"}`}>
          All ({leads.length})
        </button>
        {STAGES.map((s) => {
          const n = leads.filter((l) => l.stage === s.v).length;
          return (
            <button key={s.v} onClick={() => setFilter(s.v)} className={`text-xs uppercase tracking-[0.15em] px-3 py-1.5 rounded-full border transition-colors ${filter === s.v ? "border-gold-400 text-gold-300 bg-gold-400/10" : "border-line text-ink-400 hover:text-gold-300"}`}>
              {s.label} ({n})
            </button>
          );
        })}
      </div>

      {/* Leads list */}
      <div className="mt-6 space-y-3">
        {loading ? (
          <div className="card p-10 text-center text-ink-400">Loading…</div>
        ) : visible.length === 0 ? (
          <div className="card p-10 text-center text-ink-400">No leads here yet.</div>
        ) : visible.map((l) => {
          const stage = STAGES.find((s) => s.v === l.stage)!;
          const overdue = l.nextFollowUp && new Date(l.nextFollowUp) < new Date() && !["won", "lost"].includes(l.stage);
          return (
            <div key={l.id} className="card p-5">
              <div className="flex flex-wrap items-center gap-4">
                <div className="flex-1 min-w-[200px]">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-ink-100 font-light text-lg">{l.name}</span>
                    {l.company && <span className="text-ink-400 text-sm">· {l.company}</span>}
                    <span className={`text-[10px] uppercase tracking-[0.2em] px-2.5 py-0.5 rounded-full border ${stage.cls}`}>{stage.label}</span>
                  </div>
                  <div className="mt-1.5 flex flex-wrap gap-x-5 gap-y-1 text-xs text-ink-400">
                    {l.service && <span className="inline-flex items-center gap-1"><TrendingUp size={12} className="text-gold-400" /> {l.service}</span>}
                    {l.email && <span className="inline-flex items-center gap-1"><Mail size={12} className="text-gold-400" /> {l.email}</span>}
                    {l.phone && <span className="inline-flex items-center gap-1"><Phone size={12} className="text-gold-400" /> {l.phone}</span>}
                    {l.nextFollowUp && (
                      <span className={`inline-flex items-center gap-1 ${overdue ? "text-red-400" : ""}`}>
                        <CalendarClock size={12} className={overdue ? "text-red-400" : "text-gold-400"} />
                        Follow up {l.nextFollowUp}{overdue ? " (overdue)" : ""}
                      </span>
                    )}
                  </div>
                  {l.notes && <p className="mt-2 text-xs text-ink-300 font-light line-clamp-2">{l.notes}</p>}
                </div>
                <div className="text-right shrink-0">
                  <div className="font-display text-xl font-light gold-text">{money(l.value, l.currency)}</div>
                  <div className="text-[10px] uppercase tracking-[0.2em] text-ink-400">{l.source || "—"}</div>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <select
                    className="input !py-1.5 !px-2 text-xs !w-auto"
                    value={l.stage}
                    onChange={(e) => setStage(l, e.target.value as LeadStage)}
                  >
                    {STAGES.map((s) => <option key={s.v} value={s.v}>{s.label}</option>)}
                  </select>
                  {!["won", "lost"].includes(l.stage) && (
                    <button
                      onClick={() => convert(l)}
                      disabled={converting === l.id}
                      className="p-2 rounded-lg text-green-300 hover:bg-green-400/10 disabled:opacity-50"
                      aria-label="Convert to client"
                      title="Convert to client — creates a portal login"
                    >
                      {converting === l.id ? <Loader2 size={15} className="animate-spin" /> : <UserPlus size={15} />}
                    </button>
                  )}
                  <button onClick={() => { setEditing(l); setError(""); setShowForm(true); }} className="p-2 rounded-lg text-gold-300 hover:bg-gold-400/10" aria-label="Edit"><Edit2 size={15} /></button>
                  <button onClick={() => remove(l)} className="p-2 rounded-lg text-red-400 hover:bg-red-400/10" aria-label="Delete"><Trash2 size={15} /></button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function Stat({ label, value, gold = false }: { label: string; value: string; gold?: boolean }) {
  return (
    <div className="card p-5">
      <div className="text-[10px] uppercase tracking-[0.25em] text-ink-400">{label}</div>
      <div className={`mt-2 font-display text-2xl font-extralight ${gold ? "gold-text" : "text-ink-100"}`}>{value}</div>
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
