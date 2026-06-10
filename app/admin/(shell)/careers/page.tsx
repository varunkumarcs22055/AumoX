"use client";

import { useEffect, useState } from "react";
import { Plus, Edit2, Trash2, Check, X, RotateCcw, MapPin, Loader2 } from "lucide-react";

type Job = {
  id: string;
  title: string;
  team: string;
  location: string;
  type: string;
  level: string;
  description?: string;
  active: boolean;
};

const TYPES = ["Full-time", "Part-time", "Contract", "Internship"];
const LEVELS = ["Junior", "Mid", "Mid–Senior", "Senior", "Staff", "Principal", "Lead", "Manager", "Director"];

const newId = () => Math.random().toString(36).slice(2, 10);

export default function CareersAdmin() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [editing, setEditing] = useState<Job | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  async function load() {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/jobs", { cache: "no-store" });
      const data = await res.json();
      setJobs(data.jobs ?? []);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  function startNew() {
    setEditing({
      id: newId(),
      title: "", team: "", location: "",
      type: "Full-time", level: "Senior",
      description: "", active: true,
    });
    setShowForm(true);
  }
  function startEdit(j: Job) { setEditing({ ...j }); setShowForm(true); }
  function cancel() { setEditing(null); setShowForm(false); }

  async function saveJob() {
    if (!editing) return;
    if (!editing.title.trim() || !editing.team.trim()) {
      alert("Title and team are required");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/admin/jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ job: editing }),
      });
      const data = await res.json();
      setJobs(data.jobs ?? []);
      cancel();
    } finally { setSaving(false); }
  }

  async function toggleActive(j: Job) {
    const updated = { ...j, active: !j.active };
    setJobs((all) => all.map((x) => (x.id === j.id ? updated : x)));
    await fetch("/api/admin/jobs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ job: updated }),
    });
  }

  async function remove(j: Job) {
    if (!confirm(`Delete role "${j.title}"?`)) return;
    await fetch("/api/admin/jobs", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: j.id }),
    });
    load();
  }

  async function resetAll() {
    if (!confirm("Reset to default jobs? Your edits will be lost.")) return;
    await fetch("/api/admin/jobs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reset: true }),
    });
    load();
  }

  return (
    <div>
      <div className="flex items-end justify-between flex-wrap gap-4">
        <div>
          <div className="text-[11px] uppercase tracking-[0.3em] text-gold-400">Careers</div>
          <h1 className="mt-2 font-display text-4xl font-extralight text-ink-100">Open Roles</h1>
          <p className="mt-2 text-ink-300 font-light">Manage roles shown on the public /careers page. Saved to the live database.</p>
        </div>
        <div className="flex gap-3">
          <a href="/careers" target="_blank" className="btn-ghost text-sm !py-2 !px-4">
            View public page
          </a>
          <button onClick={resetAll} className="btn-ghost text-sm !py-2 !px-4">
            <RotateCcw size={14} /> Reset
          </button>
          <button onClick={startNew} className="btn-gold text-sm !py-2 !px-4">
            <Plus size={16} /> New role
          </button>
        </div>
      </div>

      {showForm && editing && (
        <div className="mt-8 card p-6 gold-border">
          <h2 className="font-display text-xl font-light text-ink-100 mb-5">
            {jobs.find(j => j.id === editing.id) ? "Edit role" : "New role"}
          </h2>
          <div className="grid md:grid-cols-2 gap-5">
            <Field label="Title"><input className="input" value={editing.title} onChange={(e) => setEditing({ ...editing, title: e.target.value })} placeholder="Senior Cloud Architect" /></Field>
            <Field label="Team"><input className="input" value={editing.team} onChange={(e) => setEditing({ ...editing, team: e.target.value })} placeholder="Cloud & Infrastructure" /></Field>
            <Field label="Location"><input className="input" value={editing.location} onChange={(e) => setEditing({ ...editing, location: e.target.value })} placeholder="Remote · Global" /></Field>
            <Field label="Type">
              <select className="input" value={editing.type} onChange={(e) => setEditing({ ...editing, type: e.target.value })}>
                {TYPES.map(t => <option key={t}>{t}</option>)}
              </select>
            </Field>
            <Field label="Level">
              <select className="input" value={editing.level} onChange={(e) => setEditing({ ...editing, level: e.target.value })}>
                {LEVELS.map(l => <option key={l}>{l}</option>)}
              </select>
            </Field>
            <Field label="Active (shown on site)">
              <label className="flex items-center gap-3 mt-2">
                <input type="checkbox" checked={editing.active} onChange={(e) => setEditing({ ...editing, active: e.target.checked })} className="h-5 w-5 accent-amber-500" />
                <span className="text-sm text-ink-200">{editing.active ? "Visible" : "Hidden"}</span>
              </label>
            </Field>
          </div>
          <Field label="Description (optional)" className="mt-5">
            <textarea className="input min-h-[100px] resize-y" value={editing.description ?? ""} onChange={(e) => setEditing({ ...editing, description: e.target.value })} />
          </Field>
          <div className="mt-6 flex gap-3">
            <button onClick={saveJob} disabled={saving} className="btn-gold text-sm !py-2 !px-4 disabled:opacity-60">
              {saving ? <><Loader2 size={16} className="animate-spin"/> Saving…</> : <><Check size={16} /> Save</>}
            </button>
            <button onClick={cancel} className="btn-ghost text-sm !py-2 !px-4"><X size={16} /> Cancel</button>
          </div>
        </div>
      )}

      <div className="mt-10 space-y-3">
        {loading ? (
          <div className="card p-10 text-center text-ink-400">Loading…</div>
        ) : jobs.length === 0 ? (
          <div className="card p-10 text-center text-ink-400">No roles yet — click &quot;New role&quot; to add one.</div>
        ) : jobs.map((j) => (
          <div key={j.id} className={`card p-5 grid md:grid-cols-[2fr_1fr_auto_auto] items-center gap-4 ${j.active ? "" : "opacity-60"}`}>
            <div>
              <div className="text-ink-100 font-light text-lg">{j.title}</div>
              <div className="text-[11px] uppercase tracking-[0.2em] text-ink-400 mt-1">
                {j.team} · {j.level} · {j.type}
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm text-ink-300">
              <MapPin size={14} className="text-gold-400" />
              {j.location}
            </div>
            <button onClick={() => toggleActive(j)} className={`text-xs uppercase tracking-[0.2em] px-3 py-1.5 rounded-full border transition-colors ${j.active ? "border-green-400/40 text-green-300 hover:bg-green-400/10" : "border-ink-400/40 text-ink-400 hover:bg-bg-elevated"}`}>
              {j.active ? "Active" : "Hidden"}
            </button>
            <div className="flex gap-2">
              <button onClick={() => startEdit(j)} className="p-2 rounded-lg text-gold-300 hover:bg-gold-400/10" aria-label="Edit"><Edit2 size={16} /></button>
              <button onClick={() => remove(j)} className="p-2 rounded-lg text-red-400 hover:bg-red-400/10" aria-label="Delete"><Trash2 size={16} /></button>
            </div>
          </div>
        ))}
      </div>
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
