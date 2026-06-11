"use client";

import { useEffect, useState } from "react";
import { Plus, Trash2, Loader2, ArrowRight, ArrowLeft, CalendarDays, User } from "lucide-react";

type TaskStatus = "todo" | "in-progress" | "done";
type Task = {
  id: string;
  createdAt: string;
  title: string;
  projectId?: string;
  assignee?: string;
  due?: string;
  status: TaskStatus;
};
type ProjectLite = { id: string; name: string };

const COLS: { v: TaskStatus; label: string }[] = [
  { v: "todo", label: "To do" },
  { v: "in-progress", label: "In progress" },
  { v: "done", label: "Done" },
];

export default function TasksAdmin() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [projects, setProjects] = useState<ProjectLite[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [draft, setDraft] = useState({ title: "", projectId: "", assignee: "", due: "" });

  async function load() {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/tasks", { cache: "no-store" });
      const data = await res.json();
      setTasks(data.tasks ?? []);
      setProjects(data.projects ?? []);
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => { load(); }, []);

  async function addTask() {
    if (!draft.title.trim()) return;
    setSaving(true);
    try {
      const res = await fetch("/api/admin/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...draft, projectId: draft.projectId || undefined }),
      });
      const data = await res.json();
      setTasks(data.tasks ?? []);
      setDraft({ title: "", projectId: "", assignee: "", due: "" });
    } finally {
      setSaving(false);
    }
  }

  async function move(t: Task, dir: 1 | -1) {
    const order: TaskStatus[] = ["todo", "in-progress", "done"];
    const next = order[order.indexOf(t.status) + dir];
    if (!next) return;
    setTasks((all) => all.map((x) => (x.id === t.id ? { ...x, status: next } : x)));
    await fetch("/api/admin/tasks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...t, status: next }),
    });
  }

  async function remove(t: Task) {
    if (!confirm(`Delete task "${t.title}"?`)) return;
    await fetch("/api/admin/tasks", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: t.id }),
    });
    load();
  }

  const projectName = (id?: string) => projects.find((p) => p.id === id)?.name;

  return (
    <div>
      <div>
        <div className="text-[11px] uppercase tracking-[0.3em] text-gold-400">ERP · Operations</div>
        <h1 className="mt-2 font-display text-4xl font-extralight text-ink-100">Team Tasks</h1>
        <p className="mt-2 text-ink-300 font-light">
          Internal task board — visible only to the team, never to clients.
        </p>
      </div>

      {/* Quick add */}
      <div className="mt-8 card p-5 grid md:grid-cols-[2fr_1fr_1fr_auto_auto] gap-3 items-end">
        <Field label="Task">
          <input className="input !py-2" placeholder="e.g. Set up staging environment for Acme CRM" value={draft.title} onChange={(e) => setDraft({ ...draft, title: e.target.value })} onKeyDown={(e) => e.key === "Enter" && addTask()} />
        </Field>
        <Field label="Project (optional)">
          <select className="input !py-2" value={draft.projectId} onChange={(e) => setDraft({ ...draft, projectId: e.target.value })}>
            <option value="">—</option>
            {projects.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
        </Field>
        <Field label="Assignee">
          <input className="input !py-2" placeholder="Varun / Aditya / Prathamesh" value={draft.assignee} onChange={(e) => setDraft({ ...draft, assignee: e.target.value })} />
        </Field>
        <Field label="Due">
          <input type="date" className="input !py-2" value={draft.due} onChange={(e) => setDraft({ ...draft, due: e.target.value })} />
        </Field>
        <button onClick={addTask} disabled={saving || !draft.title.trim()} className="btn-gold text-sm !py-2.5 !px-4 disabled:opacity-60">
          {saving ? <Loader2 size={15} className="animate-spin" /> : <Plus size={15} />} Add
        </button>
      </div>

      {/* Board */}
      <div className="mt-10 grid md:grid-cols-3 gap-5">
        {COLS.map((col) => {
          const colTasks = tasks.filter((t) => t.status === col.v);
          return (
            <div key={col.v} className="rounded-2xl border border-line bg-bg-surface p-4">
              <div className="flex items-center justify-between px-2 mb-4">
                <span className="text-[11px] uppercase tracking-[0.3em] text-gold-400">{col.label}</span>
                <span className="text-xs text-ink-400">{colTasks.length}</span>
              </div>
              <div className="space-y-3 min-h-[60px]">
                {loading ? (
                  <div className="text-center text-xs text-ink-400 py-6">Loading…</div>
                ) : colTasks.length === 0 ? (
                  <div className="text-center text-xs text-ink-500 py-6">Empty</div>
                ) : colTasks.map((t) => {
                  const overdue = t.due && t.status !== "done" && new Date(t.due) < new Date();
                  return (
                    <div key={t.id} className={`card p-4 ${t.status === "done" ? "opacity-70" : ""}`}>
                      <div className={`text-sm font-light ${t.status === "done" ? "line-through text-ink-300" : "text-ink-100"}`}>
                        {t.title}
                      </div>
                      <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-ink-400">
                        {projectName(t.projectId) && <span className="text-gold-300">{projectName(t.projectId)}</span>}
                        {t.assignee && <span className="inline-flex items-center gap-1"><User size={11} /> {t.assignee}</span>}
                        {t.due && (
                          <span className={`inline-flex items-center gap-1 ${overdue ? "text-red-400" : ""}`}>
                            <CalendarDays size={11} /> {t.due}{overdue ? " !" : ""}
                          </span>
                        )}
                      </div>
                      <div className="mt-3 flex items-center justify-between">
                        <div className="flex gap-1">
                          {col.v !== "todo" && (
                            <button onClick={() => move(t, -1)} className="p-1.5 rounded text-ink-300 hover:text-gold-300 hover:bg-gold-400/10" aria-label="Move back">
                              <ArrowLeft size={14} />
                            </button>
                          )}
                          {col.v !== "done" && (
                            <button onClick={() => move(t, 1)} className="p-1.5 rounded text-gold-300 hover:bg-gold-400/10" aria-label="Move forward">
                              <ArrowRight size={14} />
                            </button>
                          )}
                        </div>
                        <button onClick={() => remove(t)} className="p-1.5 rounded text-red-400/70 hover:text-red-400 hover:bg-red-400/10" aria-label="Delete">
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="block text-[11px] uppercase tracking-[0.25em] text-ink-300 mb-2">{label}</span>
      {children}
    </label>
  );
}
