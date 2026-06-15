"use client";

import { useEffect, useState } from "react";
import { Megaphone, Plus, Trash2, Pin, Check, X, Loader2 } from "lucide-react";

type Ann = { id: string; title: string; body: string; audience: "staff" | "clients" | "all"; pinned: boolean; createdAt: string; authorName: string };

const AUD_CLS: Record<Ann["audience"], string> = {
  staff: "border-indigo-400/40 text-indigo-300", clients: "border-green-400/40 text-green-300", all: "border-gold-400/40 text-gold-300",
};

export default function AnnouncementsAdmin() {
  const [items, setItems] = useState<Ann[]>([]);
  const [form, setForm] = useState({ title: "", body: "", audience: "staff" as Ann["audience"], pinned: false });
  const [saving, setSaving] = useState(false);

  async function load() {
    const d = await fetch("/api/admin/announcements", { cache: "no-store" }).then((r) => r.json());
    setItems(d.announcements ?? []);
  }
  useEffect(() => { load(); }, []);

  async function post() {
    if (!form.title.trim() || !form.body.trim()) { alert("Title and message are required."); return; }
    setSaving(true);
    try {
      const d = await fetch("/api/admin/announcements", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) }).then((r) => r.json());
      setItems(d.announcements ?? []);
      setForm({ title: "", body: "", audience: form.audience, pinned: false });
    } finally { setSaving(false); }
  }
  async function remove(id: string) {
    if (!confirm("Delete this announcement?")) return;
    await fetch("/api/admin/announcements", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }) });
    setItems((all) => all.filter((a) => a.id !== id));
  }

  return (
    <div>
      <div>
        <div className="text-[11px] uppercase tracking-[0.3em] text-gold-400">Company</div>
        <h1 className="mt-2 font-display text-4xl font-extralight text-ink-100">Announcements</h1>
        <p className="mt-2 text-ink-300 font-light">Post company-wide notices to staff, clients, or everyone. Pinned notices show first.</p>
      </div>

      <div className="mt-8 card p-6 gold-border">
        <div className="grid md:grid-cols-[2fr_1fr] gap-4">
          <label className="block"><span className="block text-[11px] uppercase tracking-[0.25em] text-ink-300 mb-2">Title</span>
            <input className="input" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Holiday notice / Policy update…" /></label>
          <label className="block"><span className="block text-[11px] uppercase tracking-[0.25em] text-ink-300 mb-2">Audience</span>
            <select className="input" value={form.audience} onChange={(e) => setForm({ ...form, audience: e.target.value as Ann["audience"] })}>
              <option value="staff">Staff only</option><option value="clients">Clients only</option><option value="all">Everyone</option>
            </select></label>
        </div>
        <label className="block mt-4"><span className="block text-[11px] uppercase tracking-[0.25em] text-ink-300 mb-2">Message</span>
          <textarea className="input min-h-[120px] resize-y" value={form.body} onChange={(e) => setForm({ ...form, body: e.target.value })} /></label>
        <div className="mt-4 flex items-center gap-4">
          <label className="flex items-center gap-2 text-sm text-ink-200"><input type="checkbox" checked={form.pinned} onChange={(e) => setForm({ ...form, pinned: e.target.checked })} className="h-4 w-4 accent-amber-500" /> <Pin size={13} /> Pin to top</label>
          <button onClick={post} disabled={saving} className="btn-gold text-sm !py-2 !px-4 disabled:opacity-60 ml-auto">{saving ? <Loader2 size={15} className="animate-spin" /> : <Plus size={15} />} Post announcement</button>
        </div>
      </div>

      <div className="mt-8 space-y-3">
        {items.length === 0 ? <div className="card p-10 text-center text-ink-400">No announcements yet.</div> : items.map((a) => (
          <div key={a.id} className="card p-5">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-2 flex-wrap">
                {a.pinned && <Pin size={13} className="text-gold-400" />}
                <span className="text-ink-100 font-light">{a.title}</span>
                <span className={`text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full border ${AUD_CLS[a.audience]}`}>{a.audience}</span>
              </div>
              <button onClick={() => remove(a.id)} className="p-1.5 rounded text-red-400 hover:bg-red-400/10 shrink-0"><Trash2 size={14} /></button>
            </div>
            <p className="mt-2 text-sm text-ink-300 font-light whitespace-pre-wrap">{a.body}</p>
            <div className="mt-2 text-[11px] text-ink-500">{new Date(a.createdAt).toLocaleString()} · by {a.authorName}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
