"use client";

import { useEffect, useState } from "react";
import {
  Plus, Trash2, Check, X, Loader2, ChevronDown, ChevronUp, Send, ExternalLink,
} from "lucide-react";

type PhaseStatus = "pending" | "in-progress" | "completed";
type Phase = { name: string; status: PhaseStatus; note?: string };
type Update = { id: string; date: string; title: string; body?: string };
type Project = {
  id: string;
  clientId: string;
  name: string;
  description?: string;
  status: "active" | "on-hold" | "completed";
  phases: Phase[];
  updates: Update[];
  startDate?: string;
  targetDate?: string;
  teamId?: string;
};
type ClientLite = { id: string; company: string; name: string };
type TeamLite = { id: string; name: string };

const PHASE_STATUSES: { v: PhaseStatus; label: string }[] = [
  { v: "pending", label: "Pending" },
  { v: "in-progress", label: "In progress" },
  { v: "completed", label: "Completed" },
];

export default function ProjectsAdmin() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [clients, setClients] = useState<ClientLite[]>([]);
  const [teams, setTeams] = useState<TeamLite[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [openId, setOpenId] = useState<string | null>(null);
  const [form, setForm] = useState({ name: "", clientId: "", description: "", startDate: "", targetDate: "", teamId: "" });
  const [updateDraft, setUpdateDraft] = useState({ title: "", body: "" });
  const [error, setError] = useState("");

  async function load() {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/projects", { cache: "no-store" });
      const data = await res.json();
      setProjects(data.projects ?? []);
      setClients(data.clients ?? []);
      setTeams(data.teams ?? []);
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => { load(); }, []);

  const clientName = (id: string) => clients.find((c) => c.id === id)?.company ?? "Unknown client";
  const teamName = (id?: string) => (id ? teams.find((t) => t.id === id)?.name : undefined);

  async function setProjectTeam(p: Project, teamId: string) {
    setProjects((all) => all.map((x) => (x.id === p.id ? { ...x, teamId: teamId || undefined } : x)));
    await fetch("/api/admin/projects", {
      method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: p.id, teamId }),
    });
  }

  async function createProject() {
    setError("");
    if (!form.name.trim() || !form.clientId) {
      setError("Project name and client are required.");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/admin/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "Failed to create project."); return; }
      setShowForm(false);
      setForm({ name: "", clientId: "", description: "", startDate: "", targetDate: "", teamId: "" });
      load();
    } finally {
      setSaving(false);
    }
  }

  async function patch(p: Project, patchBody: Record<string, unknown>) {
    const res = await fetch("/api/admin/projects", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: p.id, ...patchBody }),
    });
    if (res.ok) {
      const { project } = await res.json();
      setProjects((all) => all.map((x) => (x.id === project.id ? project : x)));
    }
  }

  function setPhaseStatus(p: Project, idx: number, status: PhaseStatus) {
    const phases = p.phases.map((ph, i) => (i === idx ? { ...ph, status } : ph));
    setProjects((all) => all.map((x) => (x.id === p.id ? { ...x, phases } : x)));
    patch(p, { phases });
  }

  async function postUpdate(p: Project) {
    if (!updateDraft.title.trim()) return;
    setSaving(true);
    try {
      await patch(p, { addUpdate: updateDraft });
      setUpdateDraft({ title: "", body: "" });
    } finally {
      setSaving(false);
    }
  }

  async function removeProject(p: Project) {
    if (!confirm(`Delete project "${p.name}"? The client will no longer see it.`)) return;
    await fetch("/api/admin/projects", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: p.id }),
    });
    load();
  }

  return (
    <div>
      <div className="flex items-end justify-between flex-wrap gap-4">
        <div>
          <div className="text-[11px] uppercase tracking-[0.3em] text-gold-400">Projects</div>
          <h1 className="mt-2 font-display text-4xl font-extralight text-ink-100">Client Projects</h1>
          <p className="mt-2 text-ink-300 font-light">
            Everything you set here is live in the client&apos;s portal — phases, progress and updates.
          </p>
        </div>
        <div className="flex gap-3">
          <a href="/portal/login" target="_blank" className="btn-ghost text-sm !py-2 !px-4">
            <ExternalLink size={14} /> View portal
          </a>
          <button
            onClick={() => { setShowForm(true); setError(""); }}
            className="btn-gold text-sm !py-2 !px-4"
            disabled={clients.length === 0}
          >
            <Plus size={16} /> New project
          </button>
        </div>
      </div>

      {clients.length === 0 && !loading && (
        <div className="mt-8 card p-6 text-sm text-ink-300 font-light">
          Create a client first (Admin → Clients) — projects are always assigned to a client.
        </div>
      )}

      {/* New project form */}
      {showForm && (
        <div className="mt-8 card p-6 gold-border">
          <h2 className="font-display text-xl font-light text-ink-100 mb-5">New project</h2>
          <div className="grid md:grid-cols-2 gap-5">
            <Field label="Project name">
              <input className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Acme CRM Platform" />
            </Field>
            <Field label="Client">
              <select className="input" value={form.clientId} onChange={(e) => setForm({ ...form, clientId: e.target.value })}>
                <option value="">Select client…</option>
                {clients.map((c) => <option key={c.id} value={c.id}>{c.company}</option>)}
              </select>
            </Field>
            <Field label="Start date">
              <input type="date" className="input" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} />
            </Field>
            <Field label="Target date">
              <input type="date" className="input" value={form.targetDate} onChange={(e) => setForm({ ...form, targetDate: e.target.value })} />
            </Field>
            <Field label="Assign to team (internal)" className="md:col-span-2">
              <select className="input" value={form.teamId} onChange={(e) => setForm({ ...form, teamId: e.target.value })}>
                <option value="">— no team yet —</option>
                {teams.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
              <p className="mt-1.5 text-xs text-ink-500">Only this team will see the project in their workspace. Manage teams under Team / HR → Teams.</p>
            </Field>
            <Field label="Description (shown to client)" className="md:col-span-2">
              <textarea className="input min-h-[90px] resize-y" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Custom CRM with lead management, sales pipeline and reporting." />
            </Field>
          </div>
          {error && <p className="mt-4 text-sm text-red-400">{error}</p>}
          <div className="mt-6 flex gap-3">
            <button onClick={createProject} disabled={saving} className="btn-gold text-sm !py-2 !px-4 disabled:opacity-60">
              {saving ? <><Loader2 size={16} className="animate-spin" /> Creating…</> : <><Check size={16} /> Create project</>}
            </button>
            <button onClick={() => setShowForm(false)} className="btn-ghost text-sm !py-2 !px-4"><X size={16} /> Cancel</button>
          </div>
        </div>
      )}

      {/* Projects list */}
      <div className="mt-10 space-y-4">
        {loading ? (
          <div className="card p-10 text-center text-ink-400">Loading…</div>
        ) : projects.length === 0 ? (
          <div className="card p-10 text-center text-ink-400">No projects yet.</div>
        ) : projects.map((p) => {
          const open = openId === p.id;
          const done = p.phases.filter((x) => x.status === "completed").length;
          return (
            <div key={p.id} className="card gold-border overflow-hidden">
              {/* Row header */}
              <button
                onClick={() => setOpenId(open ? null : p.id)}
                className="w-full p-5 lg:p-6 flex items-center justify-between gap-4 text-left"
              >
                <div className="flex-1 min-w-0">
                  <div className="text-ink-100 font-light text-lg truncate">{p.name}</div>
                  <div className="text-[11px] uppercase tracking-[0.2em] text-ink-400 mt-1">
                    {clientName(p.clientId)} · {p.status} · {done}/{p.phases.length} phases · {p.updates.length} updates{teamName(p.teamId) ? ` · 👥 ${teamName(p.teamId)}` : ""}
                  </div>
                </div>
                {open ? <ChevronUp size={18} className="text-gold-400 shrink-0" /> : <ChevronDown size={18} className="text-gold-400 shrink-0" />}
              </button>

              {open && (
                <div className="border-t border-line p-5 lg:p-6 space-y-8">
                  {/* Team assignment */}
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="text-[11px] uppercase tracking-[0.25em] text-ink-400">Delivery team:</span>
                    <select className="input !py-1.5 !px-3 text-sm !w-auto" value={p.teamId || ""} onChange={(e) => setProjectTeam(p, e.target.value)}>
                      <option value="">— no team —</option>
                      {teams.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
                    </select>
                    <span className="text-xs text-ink-500">Only this team sees the project in their workspace.</span>
                  </div>
                  {/* Status + delete */}
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="text-[11px] uppercase tracking-[0.25em] text-ink-400">Project status:</span>
                    {(["active", "on-hold", "completed"] as const).map((s) => (
                      <button
                        key={s}
                        onClick={() => patch(p, { status: s })}
                        className={`text-xs uppercase tracking-[0.15em] px-3 py-1.5 rounded-full border transition-colors ${
                          p.status === s
                            ? "border-gold-400 text-gold-300 bg-gold-400/10"
                            : "border-line text-ink-400 hover:text-gold-300"
                        }`}
                      >
                        {s}
                      </button>
                    ))}
                    <button onClick={() => removeProject(p)} className="ml-auto p-2 rounded-lg text-red-400 hover:bg-red-400/10" aria-label="Delete project">
                      <Trash2 size={16} />
                    </button>
                  </div>

                  {/* Phase editor */}
                  <div>
                    <div className="text-[11px] uppercase tracking-[0.3em] text-gold-400 mb-4">Phases</div>
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      {p.phases.map((ph, i) => (
                        <div key={ph.name + i} className="rounded-lg border border-line p-4 bg-bg-base">
                          <div className="text-sm text-ink-100 font-light">{String(i + 1).padStart(2, "0")} · {ph.name}</div>
                          <select
                            className="input mt-2 !py-2 text-sm"
                            value={ph.status}
                            onChange={(e) => setPhaseStatus(p, i, e.target.value as PhaseStatus)}
                          >
                            {PHASE_STATUSES.map((s) => <option key={s.v} value={s.v}>{s.label}</option>)}
                          </select>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Post update */}
                  <div>
                    <div className="text-[11px] uppercase tracking-[0.3em] text-gold-400 mb-4">Post an update</div>
                    <div className="grid gap-3">
                      <input
                        className="input"
                        placeholder="Update title — e.g. Design system approved, development started"
                        value={updateDraft.title}
                        onChange={(e) => setUpdateDraft({ ...updateDraft, title: e.target.value })}
                      />
                      <textarea
                        className="input min-h-[80px] resize-y"
                        placeholder="Details the client should know (optional)"
                        value={updateDraft.body}
                        onChange={(e) => setUpdateDraft({ ...updateDraft, body: e.target.value })}
                      />
                      <button onClick={() => postUpdate(p)} disabled={saving || !updateDraft.title.trim()} className="btn-gold text-sm !py-2 !px-4 self-start disabled:opacity-60">
                        <Send size={14} /> Publish to client portal
                      </button>
                    </div>
                  </div>

                  {/* Existing updates */}
                  {p.updates.length > 0 && (
                    <div>
                      <div className="text-[11px] uppercase tracking-[0.3em] text-gold-400 mb-4">Published updates</div>
                      <ul className="space-y-3">
                        {p.updates.map((u) => (
                          <li key={u.id} className="flex items-start justify-between gap-4 rounded-lg border border-line p-4 bg-bg-base">
                            <div>
                              <div className="text-xs text-ink-400">{new Date(u.date).toLocaleString()}</div>
                              <div className="mt-1 text-sm text-ink-100 font-light">{u.title}</div>
                              {u.body && <p className="mt-1 text-xs text-ink-300 font-light whitespace-pre-wrap">{u.body}</p>}
                            </div>
                            <button
                              onClick={() => patch(p, { removeUpdateId: u.id })}
                              className="p-1.5 rounded text-red-400 hover:bg-red-400/10 shrink-0"
                              aria-label="Delete update"
                            >
                              <Trash2 size={14} />
                            </button>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
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
