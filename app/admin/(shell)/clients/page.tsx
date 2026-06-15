"use client";

import { useEffect, useState } from "react";
import {
  Plus, Trash2, Check, X, Loader2, KeyRound, Copy, Building2, Mail, ExternalLink,
} from "lucide-react";

type Client = {
  id: string;
  company: string;
  name: string;
  email: string;
  officialEmail?: string;
  createdAt: string;
  active: boolean;
};

function genPassword() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789";
  let pw = "";
  const arr = new Uint32Array(12);
  crypto.getRandomValues(arr);
  for (let i = 0; i < 12; i++) pw += chars[arr[i] % chars.length];
  return pw;
}

export default function ClientsAdmin() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ company: "", name: "", email: "", officialEmail: "", password: "" });
  const [error, setError] = useState("");
  // Newly issued credentials, shown ONCE so admin can share them with the client
  const [issued, setIssued] = useState<{ email: string; password: string; emailed?: boolean; officialEmail?: string } | null>(null);
  const [copied, setCopied] = useState(false);

  async function load() {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/clients", { cache: "no-store" });
      const data = await res.json();
      setClients(data.clients ?? []);
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => { load(); }, []);

  function startNew() {
    setForm({ company: "", name: "", email: "", officialEmail: "", password: genPassword() });
    setError("");
    setShowForm(true);
  }

  async function createClient() {
    setError("");
    if (!form.company.trim() || !form.email.trim() || form.password.length < 8) {
      setError("Company, email and a password of 8+ characters are required.");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/admin/clients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "Failed to create client."); return; }
      setIssued({
        email: form.email.trim().toLowerCase(),
        password: form.password,
        emailed: data.welcomeEmailed,
        officialEmail: data.officialEmail ?? (form.officialEmail.trim().toLowerCase() || form.email.trim().toLowerCase()),
      });
      setShowForm(false);
      load();
    } finally {
      setSaving(false);
    }
  }

  async function toggleActive(c: Client) {
    setClients((all) => all.map((x) => (x.id === c.id ? { ...x, active: !x.active } : x)));
    await fetch("/api/admin/clients", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: c.id, company: c.company, name: c.name, email: c.email, active: !c.active }),
    });
  }

  async function resetPassword(c: Client) {
    const pw = genPassword();
    if (!confirm(`Generate a new password for ${c.company}? The old password stops working immediately.`)) return;
    const res = await fetch("/api/admin/clients", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: c.id, company: c.company, name: c.name, email: c.email, password: pw }),
    });
    if (res.ok) setIssued({ email: c.email, password: pw });
  }

  async function remove(c: Client) {
    if (!confirm(`Delete client "${c.company}" and ALL their projects? This cannot be undone.`)) return;
    await fetch("/api/admin/clients", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: c.id }),
    });
    load();
  }

  function copyCreds() {
    if (!issued) return;
    navigator.clipboard.writeText(
      `AUMOXO Client Portal\nURL: https://aumoxo.tech/client\nEmail: ${issued.email}\nPassword: ${issued.password}`
    );
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <div>
      <div className="flex items-end justify-between flex-wrap gap-4">
        <div>
          <div className="text-[11px] uppercase tracking-[0.3em] text-gold-400">Clients</div>
          <h1 className="mt-2 font-display text-4xl font-extralight text-ink-100">Client Accounts</h1>
          <p className="mt-2 text-ink-300 font-light">
            Create portal logins for your clients. Assign their projects on the Projects page.
          </p>
        </div>
        <div className="flex gap-3">
          <a href="/portal/login" target="_blank" className="btn-ghost text-sm !py-2 !px-4">
            <ExternalLink size={14} /> View portal
          </a>
          <button onClick={startNew} className="btn-gold text-sm !py-2 !px-4">
            <Plus size={16} /> New client
          </button>
        </div>
      </div>

      {/* One-time credentials banner */}
      {issued && (
        <div className="mt-8 card p-6 ring-2 ring-gold-400/50">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <div className="text-[11px] uppercase tracking-[0.3em] text-gold-400">
                {issued.emailed ? "Credentials emailed to the client" : "Share these credentials — shown only once"}
              </div>
              {issued.emailed && (
                <div className="mt-2 text-xs text-green-300">✓ A welcome email with the portal login was sent to {issued.officialEmail ?? issued.email}. They&apos;ll be asked to change this password on first login.</div>
              )}
              <div className="mt-3 font-mono text-sm text-ink-100 space-y-1">
                <div>Portal: https://aumoxo.tech/client</div>
                <div>Email: {issued.email}</div>
                <div>Password: {issued.password}</div>
              </div>
            </div>
            <div className="flex gap-2">
              <button onClick={copyCreds} className="btn-gold text-sm !py-2 !px-4">
                <Copy size={14} /> {copied ? "Copied!" : "Copy"}
              </button>
              <button onClick={() => setIssued(null)} className="btn-ghost text-sm !py-2 !px-4">
                <X size={14} /> Dismiss
              </button>
            </div>
          </div>
        </div>
      )}

      {/* New client form */}
      {showForm && (
        <div className="mt-8 card p-6 gold-border">
          <h2 className="font-display text-xl font-light text-ink-100 mb-5">New client</h2>
          <div className="grid md:grid-cols-2 gap-5">
            <Field label="Company">
              <input className="input" value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} placeholder="Acme Corp" />
            </Field>
            <Field label="Contact person">
              <input className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Jane Doe" />
            </Field>
            <Field label="Official email (for all communication)">
              <input type="email" className="input" value={form.officialEmail} onChange={(e) => setForm({ ...form, officialEmail: e.target.value })} placeholder="jane@acme.com" />
              <p className="mt-1.5 text-xs text-ink-500">Their real business email. The welcome message + portal credentials are sent here, and this is where we&apos;ll contact them. If left blank, the login email is used.</p>
            </Field>
            <Field label="Login email (portal only)">
              <input type="email" className="input" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="jane@acme.com" />
              <p className="mt-1.5 text-xs text-ink-500">The email they sign in to the portal with. Can be the same as the official email.</p>
            </Field>
            <Field label="Password (share with client)">
              <div className="flex gap-2">
                <input className="input font-mono" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
                <button type="button" onClick={() => setForm({ ...form, password: genPassword() })} className="btn-ghost text-xs !py-2 !px-3 shrink-0">
                  Regenerate
                </button>
              </div>
            </Field>
          </div>
          {error && <p className="mt-4 text-sm text-red-400">{error}</p>}
          <div className="mt-6 flex gap-3">
            <button onClick={createClient} disabled={saving} className="btn-gold text-sm !py-2 !px-4 disabled:opacity-60">
              {saving ? <><Loader2 size={16} className="animate-spin" /> Creating…</> : <><Check size={16} /> Create client</>}
            </button>
            <button onClick={() => setShowForm(false)} className="btn-ghost text-sm !py-2 !px-4"><X size={16} /> Cancel</button>
          </div>
        </div>
      )}

      {/* Client list */}
      <div className="mt-10 space-y-3">
        {loading ? (
          <div className="card p-10 text-center text-ink-400">Loading…</div>
        ) : clients.length === 0 ? (
          <div className="card p-10 text-center text-ink-400">
            No clients yet — click &quot;New client&quot; to create the first portal account.
          </div>
        ) : clients.map((c) => (
          <div key={c.id} className={`card p-5 grid md:grid-cols-[2fr_2fr_auto_auto] items-center gap-4 ${c.active ? "" : "opacity-60"}`}>
            <div className="flex items-center gap-3">
              <div className="grid h-10 w-10 place-items-center rounded-lg border border-gold-400/30 bg-gold-400/5 text-gold-300 shrink-0">
                <Building2 size={16} />
              </div>
              <div>
                <div className="text-ink-100 font-light">{c.company}</div>
                <div className="text-xs text-ink-400">{c.name || "—"}</div>
              </div>
            </div>
            <div className="text-sm text-ink-300 min-w-0">
              <div className="flex items-center gap-2">
                <Mail size={14} className="text-gold-400 shrink-0" /> <span className="truncate">{c.officialEmail || c.email}</span>
              </div>
              {c.officialEmail && c.officialEmail !== c.email && (
                <div className="mt-1 text-xs text-ink-500 truncate pl-6">Login: {c.email}</div>
              )}
            </div>
            <button
              onClick={() => toggleActive(c)}
              className={`text-xs uppercase tracking-[0.2em] px-3 py-1.5 rounded-full border transition-colors ${
                c.active
                  ? "border-green-400/40 text-green-300 hover:bg-green-400/10"
                  : "border-ink-400/40 text-ink-400 hover:bg-bg-elevated"
              }`}
            >
              {c.active ? "Active" : "Disabled"}
            </button>
            <div className="flex gap-2">
              <button onClick={() => resetPassword(c)} className="p-2 rounded-lg text-gold-300 hover:bg-gold-400/10" aria-label="Reset password" title="Reset password">
                <KeyRound size={16} />
              </button>
              <button onClick={() => remove(c)} className="p-2 rounded-lg text-red-400 hover:bg-red-400/10" aria-label="Delete" title="Delete client">
                <Trash2 size={16} />
              </button>
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
