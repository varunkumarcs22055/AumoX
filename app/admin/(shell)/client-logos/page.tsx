"use client";

import { useEffect, useState } from "react";
import { Plus, Edit2, Trash2, Check, X, Loader2, ExternalLink, GripVertical } from "lucide-react";
import MediaUpload from "@/components/admin/MediaUpload";

type ClientLogo = {
  id: string;
  name: string;
  logo: string;
  url?: string;
  order: number;
  createdAt: string;
};

const newId = () => Math.random().toString(36).slice(2, 10);
const empty = (): ClientLogo => ({ id: newId(), name: "", logo: "", url: "", order: 0, createdAt: "" });

export default function ClientLogosAdmin() {
  const [items, setItems] = useState<ClientLogo[]>([]);
  const [editing, setEditing] = useState<ClientLogo | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  async function load() {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/client-logos", { cache: "no-store" });
      const data = await res.json();
      setItems((data.logos ?? []).sort((a: ClientLogo, b: ClientLogo) => a.order - b.order));
    } finally { setLoading(false); }
  }
  useEffect(() => { load(); }, []);

  function startNew() { const e = empty(); e.order = items.length; setEditing(e); setShowForm(true); }
  function startEdit(l: ClientLogo) { setEditing({ ...l }); setShowForm(true); }
  function cancel() { setEditing(null); setShowForm(false); }

  async function save() {
    if (!editing) return;
    if (!editing.logo) { alert("Please upload a logo image first."); return; }
    setSaving(true);
    try {
      const res = await fetch("/api/admin/client-logos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editing),
      });
      const data = await res.json();
      if (!res.ok) { alert(data.error ?? "Failed"); return; }
      setItems((data.logos ?? []).sort((a: ClientLogo, b: ClientLogo) => a.order - b.order));
      cancel();
    } finally { setSaving(false); }
  }

  async function remove(l: ClientLogo) {
    if (!confirm(`Remove ${l.name || "this logo"} from the marquee?`)) return;
    const res = await fetch("/api/admin/client-logos", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: l.id }),
    });
    const data = await res.json();
    setItems((data.logos ?? []).sort((a: ClientLogo, b: ClientLogo) => a.order - b.order));
  }

  return (
    <div>
      <div className="flex items-end justify-between flex-wrap gap-4">
        <div>
          <div className="text-[11px] uppercase tracking-[0.3em] text-gold-400">Industries</div>
          <h1 className="mt-2 font-display text-4xl font-extralight text-ink-100">Company Logos</h1>
          <p className="mt-2 text-ink-300 font-light max-w-2xl">
            Logos shown in the scrolling marquee on the public Industries page. The strip
            auto-adjusts to however many you add — upload one and it appears instantly.
          </p>
        </div>
        <div className="flex gap-3 flex-wrap">
          <a href="/industries" target="_blank" className="btn-ghost text-sm !py-2 !px-4"><ExternalLink size={14} /> View page</a>
          <button onClick={startNew} className="btn-gold text-sm !py-2 !px-4"><Plus size={16} /> Add logo</button>
        </div>
      </div>

      {/* Live preview strip */}
      {items.length > 0 && (
        <div className="mt-8 card p-6 overflow-hidden">
          <div className="text-[11px] uppercase tracking-[0.3em] text-ink-400 mb-4">Preview</div>
          <div className="flex flex-wrap items-center gap-x-10 gap-y-6">
            {items.map((l) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img key={l.id} src={l.logo} alt={l.name} title={l.name} className="h-10 w-auto object-contain opacity-80" />
            ))}
          </div>
        </div>
      )}

      {showForm && editing && (
        <div className="mt-8 card p-6 gold-border">
          <h2 className="font-display text-xl font-light text-ink-100 mb-5">
            {items.find((i) => i.id === editing.id) ? "Edit logo" : "Add logo"}
          </h2>
          <div className="grid md:grid-cols-2 gap-5">
            <div className="md:col-span-2">
              <MediaUpload
                label="Logo image (PNG/SVG with transparent background works best)"
                accept="image"
                folder="aumoxo/logos"
                publicId={editing.name || undefined}
                value={editing.logo || undefined}
                valueType="image"
                onChange={(url) => setEditing({ ...editing, logo: url })}
                onClear={() => setEditing({ ...editing, logo: "" })}
              />
            </div>
            <Field label="Company name (alt text)">
              <input className="input" value={editing.name} onChange={(e) => setEditing({ ...editing, name: e.target.value })} placeholder="Acme Corp" />
            </Field>
            <Field label="Display order (lower = first)">
              <input type="number" className="input" value={editing.order} onChange={(e) => setEditing({ ...editing, order: Number(e.target.value) })} />
            </Field>
            <Field label="Link (optional)" className="md:col-span-2">
              <input type="url" className="input" value={editing.url ?? ""} onChange={(e) => setEditing({ ...editing, url: e.target.value })} placeholder="https://company.com" />
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

      <div className="mt-10 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? (
          <div className="card p-10 text-center text-ink-400 sm:col-span-2 lg:col-span-3">Loading…</div>
        ) : items.length === 0 ? (
          <div className="card p-10 text-center text-ink-400 sm:col-span-2 lg:col-span-3">
            No logos yet — add your first company logo and it shows up in the Industries marquee.
          </div>
        ) : items.map((l) => (
          <div key={l.id} className="card overflow-hidden flex flex-col">
            <div className="h-28 grid place-items-center bg-bg-base/60 border-b border-line p-5">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={l.logo} alt={l.name} className="max-h-16 w-auto object-contain" />
            </div>
            <div className="p-4 flex items-center justify-between gap-3">
              <div className="min-w-0">
                <div className="text-sm text-ink-100 truncate">{l.name || <span className="text-ink-500">No name</span>}</div>
                <div className="text-xs text-ink-400 inline-flex items-center gap-1"><GripVertical size={12} /> order {l.order}</div>
              </div>
              <div className="flex gap-1 shrink-0">
                <button onClick={() => startEdit(l)} className="p-1.5 rounded text-gold-300 hover:bg-gold-400/10"><Edit2 size={14} /></button>
                <button onClick={() => remove(l)} className="p-1.5 rounded text-red-400 hover:bg-red-400/10"><Trash2 size={14} /></button>
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
