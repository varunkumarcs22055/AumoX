"use client";

import { useEffect, useState } from "react";
import { Check, RotateCcw, Info, Loader2 } from "lucide-react";

type SiteStats = {
  countries: number;
  clients: number;
  engineers: number;
  uptime: number;
};

export default function SettingsAdmin() {
  const [stats, setStats] = useState<SiteStats>({ countries: 0, clients: 0, engineers: 0, uptime: 0 });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  async function load() {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/settings", { cache: "no-store" });
      const data = await res.json();
      if (data.stats) setStats(data.stats);
    } finally { setLoading(false); }
  }

  useEffect(() => { load(); }, []);

  async function save() {
    setSaving(true);
    try {
      await fetch("/api/admin/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stats }),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 1800);
    } finally { setSaving(false); }
  }

  async function reset() {
    if (!confirm("Reset stats to defaults?")) return;
    const res = await fetch("/api/admin/settings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reset: true }),
    });
    const data = await res.json();
    if (data.stats) setStats(data.stats);
  }

  return (
    <div>
      <div className="flex items-end justify-between flex-wrap gap-4">
        <div>
          <div className="text-[11px] uppercase tracking-[0.3em] text-gold-400">Settings</div>
          <h1 className="mt-2 font-display text-4xl font-extralight text-ink-100">Site Settings</h1>
          <p className="mt-2 text-ink-300 font-light">Tune the headline numbers shown across the site. Saved to the live database.</p>
        </div>
      </div>

      <div className="mt-10 grid lg:grid-cols-[2fr_1fr] gap-6">
        <div className="card p-7 gold-border">
          <h2 className="font-display text-xl font-light text-ink-100">Hero stats</h2>
          <p className="text-sm text-ink-300 mt-1 font-light">Shown in the hero bar on the home page.</p>

          {loading ? (
            <div className="mt-8 text-center text-ink-400">Loading…</div>
          ) : (
            <>
              <div className="mt-6 grid sm:grid-cols-2 gap-5">
                <Field label="Countries served">
                  <input type="number" className="input" value={stats.countries} onChange={(e) => setStats({ ...stats, countries: Number(e.target.value) })} />
                </Field>
                <Field label="Enterprise clients">
                  <input type="number" className="input" value={stats.clients} onChange={(e) => setStats({ ...stats, clients: Number(e.target.value) })} />
                </Field>
                <Field label="Engineers worldwide">
                  <input type="number" className="input" value={stats.engineers} onChange={(e) => setStats({ ...stats, engineers: Number(e.target.value) })} />
                </Field>
                <Field label="Platform availability (%)">
                  <input type="number" step="0.01" className="input" value={stats.uptime} onChange={(e) => setStats({ ...stats, uptime: Number(e.target.value) })} />
                </Field>
              </div>

              <div className="mt-6 flex items-center gap-3">
                <button onClick={save} disabled={saving} className="btn-gold text-sm !py-2 !px-4 disabled:opacity-60">
                  {saving ? <><Loader2 size={16} className="animate-spin"/> Saving…</> : <><Check size={16} /> Save</>}
                </button>
                <button onClick={reset} className="btn-ghost text-sm !py-2 !px-4"><RotateCcw size={14} /> Reset</button>
                {saved && <span className="text-sm text-green-400">Saved ✓</span>}
              </div>
            </>
          )}
        </div>

        <div className="card p-7">
          <div className="flex items-center gap-2 text-gold-400 text-[11px] uppercase tracking-[0.3em]">
            <Info size={14} /> Server-side settings
          </div>
          <p className="mt-3 text-sm text-ink-300 font-light leading-relaxed">
            These are managed via environment variables in Vercel — they don&apos;t live in the database.
          </p>
          <dl className="mt-5 space-y-3 text-sm">
            <Row k="Contact email" v="harshchakravarti77@gmail.com" hint="CONTACT_EMAIL_TO" />
            <Row k="Mailer" v="Resend" hint="RESEND_API_KEY" />
            <Row k="Site URL" v="aumoxo.tech" hint="NEXT_PUBLIC_SITE_URL" />
            <Row k="Admin password" v="••••••••" hint="ADMIN_PASSWORD" />
          </dl>
          <p className="mt-5 text-xs text-ink-400 font-light">
            Update via your Vercel dashboard → Project → Settings → Environment Variables, then redeploy.
          </p>
        </div>
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

function Row({ k, v, hint }: { k: string; v: string; hint: string }) {
  return (
    <div className="flex items-baseline justify-between gap-4 border-b border-line pb-2">
      <div>
        <div className="text-ink-100 text-sm">{k}</div>
        <div className="text-[10px] text-ink-400 uppercase tracking-[0.2em] mt-0.5">{hint}</div>
      </div>
      <div className="text-ink-300 text-sm text-right">{v}</div>
    </div>
  );
}
