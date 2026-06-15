"use client";

import { useEffect, useState } from "react";
import { Plus, Edit2, Trash2, Check, X, Loader2, Eye, EyeOff, GripVertical, ExternalLink } from "lucide-react";
import MediaUpload from "@/components/admin/MediaUpload";

type Media = { type: "image" | "video"; url: string };
type Solution = {
  id: string;
  title: string;
  category: string;
  summary: string;
  description: string;
  problem?: string;
  approach?: string;
  outcome?: string;
  coverImage?: string;
  media: Media[];
  tags: string[];
  link?: string;
  order: number;
  published: boolean;
  createdAt: string;
};

const CATEGORIES = ["AI", "CRM", "Automation", "Web", "Mobile", "SaaS", "Design", "Other"];
const newId = () => Math.random().toString(36).slice(2, 10);

// Starter case studies (AUMOXO's real shipped projects). One-click seed below;
// edit or delete any of these afterwards like a normal solution.
const STARTER_PROJECTS: Array<Partial<Solution>> = [
  {
    title: "CollabCode",
    category: "SaaS",
    summary: "AI-powered collaborative development platform — teams code, review and innovate together in real time.",
    description: "",
    problem: "Distributed development teams needed one place to write and review code together in real time — with AI assistance — instead of juggling disconnected tools.",
    approach: "We built CollabCode: real-time, multi-user coding and review with AI-assisted development workflows, on a modern, scalable SaaS architecture deployed to the cloud.",
    outcome: "Improves developer productivity and streamlines collaborative software development with real-time collaboration and AI assistance.",
    tags: ["Real-time collaboration", "AI-assisted workflows", "SaaS architecture", "Cloud deployment"],
    link: "https://collab-code-rosy.vercel.app/",
    media: [],
    published: true,
  },
  {
    title: "Fine Dining — Restaurant Website",
    category: "Web",
    summary: "An elegant, fully responsive website for a fine-dining restaurant — menu, ambiance and reservations.",
    description: "",
    problem: "The restaurant needed a refined online presence that matched its premium dining experience and made it effortless for guests to explore the menu and get in touch.",
    approach: "We designed and built a fast, responsive website with an immersive hero, curated menu sections, a gallery and a clear reservation/contact flow — focused on atmosphere and mobile experience.",
    outcome: "A polished digital storefront that reflects the restaurant's brand and gives guests a smooth way to browse the menu and reach out.",
    tags: ["Next.js", "React", "Tailwind CSS", "Responsive design"],
    link: "https://fine-dining-restaurant-website-six.vercel.app/",
    media: [],
    published: true,
  },
];

const empty = (): Solution => ({
  id: newId(), title: "", category: "AI", summary: "", description: "",
  problem: "", approach: "", outcome: "",
  coverImage: undefined, media: [], tags: [], link: "", order: 0, published: true, createdAt: "",
});

export default function SolutionsAdmin() {
  const [items, setItems] = useState<Solution[]>([]);
  const [editing, setEditing] = useState<Solution | null>(null);
  const [tagsText, setTagsText] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  async function load() {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/solutions", { cache: "no-store" });
      const data = await res.json();
      setItems((data.solutions ?? []).sort((a: Solution, b: Solution) => a.order - b.order));
    } finally { setLoading(false); }
  }
  useEffect(() => { load(); }, []);

  function startNew() { const e = empty(); e.order = items.length; setEditing(e); setTagsText(""); setShowForm(true); }
  function startEdit(s: Solution) { setEditing({ ...s }); setTagsText((s.tags || []).join(", ")); setShowForm(true); }
  function cancel() { setEditing(null); setShowForm(false); }

  async function save() {
    if (!editing) return;
    if (!editing.title.trim()) { alert("Title is required"); return; }
    setSaving(true);
    try {
      const payload = { ...editing, tags: tagsText.split(",").map((t) => t.trim()).filter(Boolean) };
      const res = await fetch("/api/admin/solutions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) { alert(data.error ?? "Failed"); return; }
      setItems((data.solutions ?? []).sort((a: Solution, b: Solution) => a.order - b.order));
      cancel();
    } finally { setSaving(false); }
  }

  async function togglePublished(s: Solution) {
    const updated = { ...s, published: !s.published, tags: s.tags };
    setItems((all) => all.map((x) => (x.id === s.id ? updated : x)));
    await fetch("/api/admin/solutions", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(updated) });
  }

  async function remove(s: Solution) {
    if (!confirm(`Delete solution "${s.title}"?`)) return;
    await fetch("/api/admin/solutions", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: s.id }) });
    load();
  }

  // One-click: add AUMOXO's starter case studies (skips any already added by title).
  async function seedStarters() {
    const existing = new Set(items.map((i) => i.title.trim().toLowerCase()));
    const toAdd = STARTER_PROJECTS.filter((p) => !existing.has((p.title ?? "").trim().toLowerCase()));
    if (toAdd.length === 0) { alert("Your example projects are already added."); return; }
    if (!confirm(`Add ${toAdd.length} example project(s) to your public Solutions page? You can edit or delete them afterwards.`)) return;
    setSaving(true);
    try {
      let last: { solutions?: Solution[] } = {};
      for (const p of toAdd) {
        last = await fetch("/api/admin/solutions", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...p, id: newId(), order: items.length }),
        }).then((r) => r.json());
      }
      if (last.solutions) setItems(last.solutions.sort((a, b) => a.order - b.order));
      else load();
    } finally { setSaving(false); }
  }

  function addMedia(url: string, type: "image" | "video") {
    setEditing((e) => (e ? { ...e, media: [...e.media, { url, type }] } : e));
  }
  function removeMedia(idx: number) {
    setEditing((e) => (e ? { ...e, media: e.media.filter((_, i) => i !== idx) } : e));
  }

  return (
    <div>
      <div className="flex items-end justify-between flex-wrap gap-4">
        <div>
          <div className="text-[11px] uppercase tracking-[0.3em] text-gold-400">Showcase</div>
          <h1 className="mt-2 font-display text-4xl font-extralight text-ink-100">Solutions &amp; Work</h1>
          <p className="mt-2 text-ink-300 font-light">
            The work you&apos;ve built — with images and videos. Published items appear on the public Solutions page.
          </p>
        </div>
        <div className="flex gap-3 flex-wrap">
          <a href="/products" target="_blank" className="btn-ghost text-sm !py-2 !px-4"><ExternalLink size={14} /> View public page</a>
          <button onClick={seedStarters} disabled={saving} className="btn-ghost text-sm !py-2 !px-4 disabled:opacity-60" title="Add CollabCode + the restaurant site as ready-made case studies">
            <Plus size={14} /> Add my 2 projects
          </button>
          <button onClick={startNew} className="btn-gold text-sm !py-2 !px-4"><Plus size={16} /> New solution</button>
        </div>
      </div>

      {showForm && editing && (
        <div className="mt-8 card p-6 gold-border">
          <h2 className="font-display text-xl font-light text-ink-100 mb-5">
            {items.find((i) => i.id === editing.id) ? "Edit solution" : "New solution"}
          </h2>
          <div className="grid md:grid-cols-2 gap-5">
            <Field label="Title" className="md:col-span-2">
              <input className="input" value={editing.title} onChange={(e) => setEditing({ ...editing, title: e.target.value })} placeholder="Acme — AI Support Suite" />
            </Field>
            <Field label="Category">
              <select className="input" value={editing.category} onChange={(e) => setEditing({ ...editing, category: e.target.value })}>
                {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
              </select>
            </Field>
            <Field label="Display order (lower = first)">
              <input type="number" className="input" value={editing.order} onChange={(e) => setEditing({ ...editing, order: Number(e.target.value) })} />
            </Field>
            <Field label="Summary (one line)" className="md:col-span-2">
              <input className="input" value={editing.summary} onChange={(e) => setEditing({ ...editing, summary: e.target.value })} placeholder="A WhatsApp + web AI assistant that cut response time 80%." />
            </Field>
            <Field label="Description (intro paragraph)" className="md:col-span-2">
              <textarea className="input min-h-[90px] resize-y" value={editing.description} onChange={(e) => setEditing({ ...editing, description: e.target.value })} placeholder="A short overview of the project…" />
            </Field>

            <div className="md:col-span-2 grid md:grid-cols-3 gap-5 rounded-xl border border-line p-4 bg-bg-base/40">
              <div className="md:col-span-3 text-[11px] uppercase tracking-[0.3em] text-gold-400">Case study (Problem · Solution · Outcome)</div>
              <Field label="Problem">
                <textarea className="input min-h-[120px] resize-y" value={editing.problem ?? ""} onChange={(e) => setEditing({ ...editing, problem: e.target.value })} placeholder="The business challenge the client faced…" />
              </Field>
              <Field label="Solution">
                <textarea className="input min-h-[120px] resize-y" value={editing.approach ?? ""} onChange={(e) => setEditing({ ...editing, approach: e.target.value })} placeholder="What we built and how we solved it…" />
              </Field>
              <Field label="Outcome">
                <textarea className="input min-h-[120px] resize-y" value={editing.outcome ?? ""} onChange={(e) => setEditing({ ...editing, outcome: e.target.value })} placeholder="The measurable impact / result…" />
              </Field>
            </div>

            <Field label="Technologies (comma-separated)">
              <input className="input" value={tagsText} onChange={(e) => setTagsText(e.target.value)} placeholder="Next.js, OpenAI, WhatsApp, Postgres" />
            </Field>
            <Field label="Live link (optional)">
              <input type="url" className="input" value={editing.link ?? ""} onChange={(e) => setEditing({ ...editing, link: e.target.value })} placeholder="https://…" />
            </Field>

            <div className="md:col-span-2">
              <MediaUpload
                label="Cover image"
                accept="image"
                folder="aumoxo/solutions"
                value={editing.coverImage}
                valueType="image"
                onChange={(url) => setEditing({ ...editing, coverImage: url })}
                onClear={() => setEditing({ ...editing, coverImage: undefined })}
              />
            </div>

            {/* Media gallery */}
            <div className="md:col-span-2">
              <span className="block text-[11px] uppercase tracking-[0.25em] text-ink-300 mb-2">Gallery (images &amp; videos)</span>
              <div className="grid sm:grid-cols-3 gap-3">
                {editing.media.map((m, i) => (
                  <div key={i} className="relative rounded-xl overflow-hidden border border-line bg-bg-base">
                    {m.type === "video" ? (
                      <video src={m.url} className="w-full h-32 object-cover" muted playsInline controls />
                    ) : (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={m.url} alt="" className="w-full h-32 object-cover" />
                    )}
                    <button type="button" onClick={() => removeMedia(i)} className="absolute top-2 right-2 grid h-7 w-7 place-items-center rounded-lg bg-bg-base/80 backdrop-blur text-red-400 border border-red-400/30">
                      <X size={13} />
                    </button>
                    <span className="absolute bottom-2 left-2 text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded bg-bg-base/80 text-gold-300">{m.type}</span>
                  </div>
                ))}
                <MediaUpload accept="both" folder="aumoxo/solutions" onChange={addMedia} />
              </div>
            </div>

            <Field label="Published" className="md:col-span-2">
              <label className="flex items-center gap-3 mt-2">
                <input type="checkbox" checked={editing.published} onChange={(e) => setEditing({ ...editing, published: e.target.checked })} className="h-5 w-5 accent-amber-500" />
                <span className="text-sm text-ink-200">{editing.published ? "Visible on site" : "Draft (hidden)"}</span>
              </label>
            </Field>
          </div>
          <div className="mt-6 flex gap-3">
            <button onClick={save} disabled={saving} className="btn-gold text-sm !py-2 !px-4 disabled:opacity-60">
              {saving ? <><Loader2 size={16} className="animate-spin" /> Saving…</> : <><Check size={16} /> Save</>}
            </button>
            <button onClick={cancel} className="btn-ghost text-sm !py-2 !px-4"><X size={16} /> Cancel</button>
          </div>
        </div>
      )}

      <div className="mt-10 grid md:grid-cols-2 gap-4">
        {loading ? (
          <div className="card p-10 text-center text-ink-400 md:col-span-2">Loading…</div>
        ) : items.length === 0 ? (
          <div className="card p-10 text-center text-ink-400 md:col-span-2">No solutions yet — add your first piece of work.</div>
        ) : items.map((s) => (
          <div key={s.id} className={`card overflow-hidden flex flex-col ${s.published ? "" : "opacity-60"}`}>
            {s.coverImage ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={s.coverImage} alt="" className="h-40 w-full object-cover" />
            ) : s.media[0] ? (
              s.media[0].type === "video"
                ? <video src={s.media[0].url} className="h-40 w-full object-cover" muted playsInline />
                // eslint-disable-next-line @next/next/no-img-element
                : <img src={s.media[0].url} alt="" className="h-40 w-full object-cover" />
            ) : (
              <div className="h-40 w-full bg-gradient-to-br from-gold-400/15 to-bg-base grid place-items-center text-ink-500 text-xs">No media</div>
            )}
            <div className="p-5 flex flex-col flex-1">
              <div className="flex items-start justify-between gap-3">
                <span className="text-[11px] uppercase tracking-[0.3em] text-gold-400">{s.category}{s.media.length ? ` · ${s.media.length} media` : ""}</span>
                <button onClick={() => togglePublished(s)} className="text-ink-300 hover:text-gold-300">{s.published ? <Eye size={16} /> : <EyeOff size={16} />}</button>
              </div>
              <h3 className="mt-2 text-lg font-light text-ink-100">{s.title}</h3>
              <p className="mt-1 text-sm text-ink-300 font-light flex-1">{s.summary}</p>
              <div className="mt-4 flex items-center justify-between pt-4 border-t border-line text-xs text-ink-400">
                <span className="inline-flex items-center gap-1"><GripVertical size={12} /> order {s.order}</span>
                <div className="flex gap-1">
                  <button onClick={() => startEdit(s)} className="p-1.5 rounded text-gold-300 hover:bg-gold-400/10"><Edit2 size={14} /></button>
                  <button onClick={() => remove(s)} className="p-1.5 rounded text-red-400 hover:bg-red-400/10"><Trash2 size={14} /></button>
                </div>
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
