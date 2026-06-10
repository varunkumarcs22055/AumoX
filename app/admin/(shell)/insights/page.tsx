"use client";

import { useEffect, useState } from "react";
import { Plus, Edit2, Trash2, Check, X, RotateCcw, Eye, EyeOff, Loader2 } from "lucide-react";

type Insight = {
  id: string;
  title: string;
  tag: string;
  excerpt: string;
  date: string;
  readMin: number;
  author?: string;
  url?: string;
  published: boolean;
};

const TAGS = ["AI", "CRM", "Automation", "Software", "Cloud", "Security", "Strategy", "Industry", "Other"];

const newId = () => Math.random().toString(36).slice(2, 10);

export default function InsightsAdmin() {
  const [items, setItems] = useState<Insight[]>([]);
  const [editing, setEditing] = useState<Insight | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  async function load() {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/insights", { cache: "no-store" });
      const data = await res.json();
      setItems(data.items ?? []);
    } finally { setLoading(false); }
  }

  useEffect(() => { load(); }, []);

  function startNew() {
    setEditing({
      id: newId(),
      title: "", tag: "AI", excerpt: "",
      date: new Date().toISOString().slice(0, 10),
      readMin: 5, author: "", url: "", published: true,
    });
    setShowForm(true);
  }
  function startEdit(i: Insight) { setEditing({ ...i }); setShowForm(true); }
  function cancel() { setEditing(null); setShowForm(false); }

  async function save() {
    if (!editing) return;
    if (!editing.title.trim() || !editing.excerpt.trim()) {
      alert("Title and excerpt are required");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/admin/insights", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ item: editing }),
      });
      const data = await res.json();
      setItems(data.items ?? []);
      cancel();
    } finally { setSaving(false); }
  }

  async function togglePublished(i: Insight) {
    const updated = { ...i, published: !i.published };
    setItems((all) => all.map((x) => (x.id === i.id ? updated : x)));
    await fetch("/api/admin/insights", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ item: updated }),
    });
  }

  async function remove(i: Insight) {
    if (!confirm(`Delete article "${i.title}"?`)) return;
    await fetch("/api/admin/insights", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: i.id }),
    });
    load();
  }

  async function resetAll() {
    if (!confirm("Reset to default articles?")) return;
    await fetch("/api/admin/insights", {
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
          <div className="text-[11px] uppercase tracking-[0.3em] text-gold-400">Insights</div>
          <h1 className="mt-2 font-display text-4xl font-extralight text-ink-100">Articles</h1>
          <p className="mt-2 text-ink-300 font-light">Manage thought-leadership articles. Saved to the live database.</p>
        </div>
        <div className="flex gap-3">
          <a href="/insights" target="_blank" className="btn-ghost text-sm !py-2 !px-4">View public page</a>
          <button onClick={resetAll} className="btn-ghost text-sm !py-2 !px-4"><RotateCcw size={14} /> Reset</button>
          <button onClick={startNew} className="btn-gold text-sm !py-2 !px-4"><Plus size={16} /> New article</button>
        </div>
      </div>

      {showForm && editing && (
        <div className="mt-8 card p-6 gold-border">
          <h2 className="font-display text-xl font-light text-ink-100 mb-5">
            {items.find(i => i.id === editing.id) ? "Edit article" : "New article"}
          </h2>
          <div className="grid md:grid-cols-2 gap-5">
            <Field label="Title" className="md:col-span-2">
              <input className="input" value={editing.title} onChange={(e) => setEditing({ ...editing, title: e.target.value })} placeholder="How AI can reduce operational costs…" />
            </Field>
            <Field label="Tag">
              <select className="input" value={editing.tag} onChange={(e) => setEditing({ ...editing, tag: e.target.value })}>
                {TAGS.map(t => <option key={t}>{t}</option>)}
              </select>
            </Field>
            <Field label="Author">
              <input className="input" value={editing.author ?? ""} onChange={(e) => setEditing({ ...editing, author: e.target.value })} placeholder="Optional" />
            </Field>
            <Field label="Publish date">
              <input type="date" className="input" value={editing.date} onChange={(e) => setEditing({ ...editing, date: e.target.value })} />
            </Field>
            <Field label="Read time (minutes)">
              <input type="number" min={1} max={60} className="input" value={editing.readMin} onChange={(e) => setEditing({ ...editing, readMin: Number(e.target.value) })} />
            </Field>
            <Field label="Article link (Medium / Hashnode / LinkedIn…)" className="md:col-span-2">
              <input type="url" className="input" value={editing.url ?? ""} onChange={(e) => setEditing({ ...editing, url: e.target.value })} placeholder="https://medium.com/@aumoxo/your-article" />
            </Field>
            <Field label="Published" className="md:col-span-2">
              <label className="flex items-center gap-3 mt-2">
                <input type="checkbox" checked={editing.published} onChange={(e) => setEditing({ ...editing, published: e.target.checked })} className="h-5 w-5 accent-amber-500" />
                <span className="text-sm text-ink-200">{editing.published ? "Visible on site" : "Draft (hidden)"}</span>
              </label>
            </Field>
            <Field label="Excerpt" className="md:col-span-2">
              <textarea className="input min-h-[110px] resize-y" value={editing.excerpt} onChange={(e) => setEditing({ ...editing, excerpt: e.target.value })} />
            </Field>
          </div>
          <div className="mt-6 flex gap-3">
            <button onClick={save} disabled={saving} className="btn-gold text-sm !py-2 !px-4 disabled:opacity-60">
              {saving ? <><Loader2 size={16} className="animate-spin"/> Saving…</> : <><Check size={16} /> Save</>}
            </button>
            <button onClick={cancel} className="btn-ghost text-sm !py-2 !px-4"><X size={16} /> Cancel</button>
          </div>
        </div>
      )}

      <div className="mt-10 grid md:grid-cols-2 gap-4">
        {loading ? (
          <div className="card p-10 text-center text-ink-400 md:col-span-2">Loading…</div>
        ) : items.length === 0 ? (
          <div className="card p-10 text-center text-ink-400 md:col-span-2">No articles yet.</div>
        ) : items.map((i) => (
          <div key={i.id} className={`card p-6 flex flex-col ${i.published ? "" : "opacity-60"}`}>
            <div className="flex items-start justify-between gap-3">
              <span className="text-[11px] uppercase tracking-[0.3em] text-gold-400">{i.tag}</span>
              <button onClick={() => togglePublished(i)} className="text-ink-300 hover:text-gold-300" aria-label="Toggle published">
                {i.published ? <Eye size={16} /> : <EyeOff size={16} />}
              </button>
            </div>
            <h3 className="mt-3 text-lg font-light text-ink-100 leading-snug">{i.title}</h3>
            <p className="mt-2 text-sm text-ink-300 font-light leading-relaxed flex-1">{i.excerpt}</p>
            <div className="mt-4 flex items-center justify-between pt-4 border-t border-line text-xs text-ink-400">
              <span>{i.date} · {i.readMin} min · {i.author || "—"}</span>
              <div className="flex gap-1">
                <button onClick={() => startEdit(i)} className="p-1.5 rounded text-gold-300 hover:bg-gold-400/10" aria-label="Edit"><Edit2 size={14} /></button>
                <button onClick={() => remove(i)} className="p-1.5 rounded text-red-400 hover:bg-red-400/10" aria-label="Delete"><Trash2 size={14} /></button>
              </div>
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
