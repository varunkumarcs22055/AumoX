"use client";

import { useEffect, useState } from "react";
import { Check, RotateCcw, Info, Loader2, ShieldCheck, KeyRound, Trash2, Copy, UserPlus } from "lucide-react";

type AdminAccount = { id: string; name: string; email: string; createdAt: string; active: boolean };

type SiteStats = {
  countries: number;
  clients: number;
  engineers: number;
  uptime: number;
};

type CompanySettings = {
  prefix: string;
  gstDefault: number;
  dueDays: number;
  terms?: string;
  bankDetails?: string;
  annualLeave: number;
};

export default function SettingsAdmin() {
  const [stats, setStats] = useState<SiteStats>({ countries: 0, clients: 0, engineers: 0, uptime: 0 });
  const [company, setCompany] = useState<CompanySettings>({ prefix: "AMX", gstDefault: 18, dueDays: 14, terms: "", bankDetails: "", annualLeave: 18 });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [companySaving, setCompanySaving] = useState(false);
  const [companySaved, setCompanySaved] = useState(false);
  const [role, setRole] = useState<"super" | "admin" | "">("");
  const [admins, setAdmins] = useState<AdminAccount[]>([]);
  const [adminForm, setAdminForm] = useState({ name: "", email: "" });
  const [adminBusy, setAdminBusy] = useState(false);
  const [adminMsg, setAdminMsg] = useState("");
  const [adminCreds, setAdminCreds] = useState<{ name: string; email: string; password: string } | null>(null);

  async function load() {
    setLoading(true);
    try {
      const [res, cRes, meRes] = await Promise.all([
        fetch("/api/admin/settings", { cache: "no-store" }),
        fetch("/api/admin/company", { cache: "no-store" }),
        fetch("/api/admin/me", { cache: "no-store" }),
      ]);
      const data = await res.json();
      if (data.stats) setStats(data.stats);
      const cData = await cRes.json();
      if (cData.settings) setCompany(cData.settings);
      const meData = await meRes.json();
      setRole(meData.role ?? "");
      if (meData.role === "super") {
        const aRes = await fetch("/api/admin/admins", { cache: "no-store" });
        const aData = await aRes.json();
        setAdmins(aData.admins ?? []);
      }
    } finally { setLoading(false); }
  }

  useEffect(() => { load(); }, []);

  async function createAdmin() {
    setAdminMsg("");
    if (!adminForm.name.trim() || !adminForm.email.trim()) {
      setAdminMsg("Name and email are required.");
      return;
    }
    setAdminBusy(true);
    try {
      const res = await fetch("/api/admin/admins", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(adminForm),
      });
      const data = await res.json();
      if (!res.ok) { setAdminMsg(data.error ?? "Failed."); return; }
      setAdmins((all) => [data.admin, ...all]);
      setAdminCreds({ name: data.admin.name, email: data.admin.email, password: data.password });
      setAdminForm({ name: "", email: "" });
    } finally { setAdminBusy(false); }
  }

  async function toggleAdmin(a: AdminAccount) {
    const res = await fetch("/api/admin/admins", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: a.id, active: !a.active }),
    });
    if (res.ok) setAdmins((all) => all.map((x) => (x.id === a.id ? { ...x, active: !a.active } : x)));
  }

  async function resetAdminPassword(a: AdminAccount) {
    if (!confirm(`Generate a new password for ${a.name}? Their old one stops working immediately.`)) return;
    const res = await fetch("/api/admin/admins", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: a.id, resetPassword: true }),
    });
    const data = await res.json();
    if (res.ok && data.password) setAdminCreds({ name: a.name, email: a.email, password: data.password });
  }

  async function removeAdmin(a: AdminAccount) {
    if (!confirm(`Remove admin account for ${a.name}? They lose access immediately.`)) return;
    await fetch("/api/admin/admins", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: a.id }),
    });
    setAdmins((all) => all.filter((x) => x.id !== a.id));
  }

  async function saveCompany() {
    setCompanySaving(true);
    try {
      const res = await fetch("/api/admin/company", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(company),
      });
      const data = await res.json();
      if (data.settings) setCompany(data.settings);
      setCompanySaved(true);
      setTimeout(() => setCompanySaved(false), 1800);
    } finally { setCompanySaving(false); }
  }

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

      {/* Admin accounts — visible only to the main (super) admin */}
      {role === "super" && (
        <div className="mt-10 card p-7 gold-border">
          <div className="flex items-center gap-2">
            <ShieldCheck size={18} className="text-gold-400" />
            <h2 className="font-display text-xl font-light text-ink-100">Admin accounts</h2>
          </div>
          <p className="text-sm text-ink-300 mt-1 font-light">
            You are the main admin (master password). Create accounts for trusted
            team members — they get full panel access except this section. Deactivate
            or remove one and they&apos;re locked out instantly.
          </p>

          {adminCreds && (
            <div className="mt-5 rounded-xl border border-gold-400/40 bg-gold-400/5 p-5">
              <div className="text-[11px] uppercase tracking-[0.3em] text-gold-400">
                Credentials for {adminCreds.name} — shown only once
              </div>
              <div className="mt-3 grid sm:grid-cols-2 gap-3 text-sm">
                <div><span className="text-ink-400 text-xs block">Login email</span><span className="text-ink-100">{adminCreds.email}</span></div>
                <div><span className="text-ink-400 text-xs block">Password</span><span className="text-gold-300 font-mono">{adminCreds.password}</span></div>
              </div>
              <div className="mt-4 flex gap-3">
                <button
                  onClick={() => navigator.clipboard?.writeText(`Admin login: https://aumoxo.tech/admin/login\nEmail: ${adminCreds.email}\nPassword: ${adminCreds.password}`)}
                  className="btn-gold text-xs !py-2 !px-4"
                >
                  <Copy size={13} /> Copy
                </button>
                <button onClick={() => setAdminCreds(null)} className="btn-ghost text-xs !py-2 !px-4">Done</button>
              </div>
            </div>
          )}

          <div className="mt-6 grid sm:grid-cols-[1fr_1fr_auto] gap-3 items-end">
            <Field label="Name">
              <input className="input !py-2" value={adminForm.name} onChange={(e) => setAdminForm({ ...adminForm, name: e.target.value })} placeholder="Aditya Singh" />
            </Field>
            <Field label="Login email">
              <input type="email" className="input !py-2" value={adminForm.email} onChange={(e) => setAdminForm({ ...adminForm, email: e.target.value })} placeholder="aditya@aumoxo.tech" />
            </Field>
            <button onClick={createAdmin} disabled={adminBusy} className="btn-gold text-sm !py-2.5 !px-4 disabled:opacity-60">
              {adminBusy ? <Loader2 size={14} className="animate-spin" /> : <UserPlus size={14} />} Create admin
            </button>
          </div>
          {adminMsg && <p className="mt-3 text-sm text-red-400">{adminMsg}</p>}

          {admins.length > 0 && (
            <div className="mt-6 space-y-2">
              {admins.map((a) => (
                <div key={a.id} className="flex flex-wrap items-center gap-3 border-t border-line pt-3">
                  <div className="flex-1 min-w-[180px]">
                    <div className="text-sm text-ink-100 font-light">{a.name}</div>
                    <div className="text-xs text-ink-400">{a.email}</div>
                  </div>
                  <span className={`text-[10px] uppercase tracking-[0.2em] px-2.5 py-1 rounded-full border ${a.active ? "border-green-400/40 text-green-300" : "border-red-400/40 text-red-400"}`}>
                    {a.active ? "Active" : "Disabled"}
                  </span>
                  <button onClick={() => toggleAdmin(a)} className="btn-ghost text-xs !py-1.5 !px-3">
                    {a.active ? "Disable" : "Enable"}
                  </button>
                  <button onClick={() => resetAdminPassword(a)} className="p-2 rounded-lg text-gold-300 hover:bg-gold-400/10" title="Reset password"><KeyRound size={14} /></button>
                  <button onClick={() => removeAdmin(a)} className="p-2 rounded-lg text-red-400 hover:bg-red-400/10" title="Remove"><Trash2 size={14} /></button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Company / document settings — affect only the NEXT documents */}
      <div className="mt-10 card p-7 gold-border">
        <h2 className="font-display text-xl font-light text-ink-100">Company &amp; documents</h2>
        <p className="text-sm text-ink-300 mt-1 font-light">
          Defaults for quotations, invoices and HR. Changing these never alters
          already-issued document numbers.
        </p>
        <div className="mt-6 grid sm:grid-cols-3 gap-5">
          <Field label="Serial prefix (e.g. AMX2606IN001)">
            <input className="input font-mono uppercase" maxLength={5} value={company.prefix} onChange={(e) => setCompany({ ...company, prefix: e.target.value.toUpperCase() })} />
          </Field>
          <Field label="Default GST / tax %">
            <input type="number" min={0} max={50} className="input" value={company.gstDefault} onChange={(e) => setCompany({ ...company, gstDefault: Number(e.target.value) })} />
          </Field>
          <Field label="Invoice due (days)">
            <input type="number" min={0} max={180} className="input" value={company.dueDays} onChange={(e) => setCompany({ ...company, dueDays: Number(e.target.value) })} />
          </Field>
          <Field label="Annual leave per employee (days)">
            <input type="number" min={0} max={60} className="input" value={company.annualLeave} onChange={(e) => setCompany({ ...company, annualLeave: Number(e.target.value) })} />
          </Field>
          <Field label="Default terms (on quotes/invoices)">
            <input className="input" value={company.terms ?? ""} onChange={(e) => setCompany({ ...company, terms: e.target.value })} />
          </Field>
          <Field label="Bank / UPI details (shown to clients)">
            <input className="input" placeholder="A/C 1234… IFSC… / yourupi@bank" value={company.bankDetails ?? ""} onChange={(e) => setCompany({ ...company, bankDetails: e.target.value })} />
          </Field>
        </div>
        <div className="mt-6 flex items-center gap-3">
          <button onClick={saveCompany} disabled={companySaving} className="btn-gold text-sm !py-2 !px-4 disabled:opacity-60">
            {companySaving ? <><Loader2 size={16} className="animate-spin" /> Saving…</> : <><Check size={16} /> Save company settings</>}
          </button>
          {companySaved && <span className="text-sm text-green-400">Saved ✓</span>}
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
            <Row k="Contact email" v="hello@aumoxo.tech" hint="CONTACT_EMAIL_TO" />
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
