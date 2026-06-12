"use client";

import { useEffect, useState } from "react";
import { Plus, Trash2, Check, X, Loader2, FileText, ArrowRight, Printer } from "lucide-react";
import { printDocument } from "@/lib/print-doc";

type QStatus = "draft" | "sent" | "accepted" | "declined" | "expired";
type Item = { description: string; qty: number; rate: number };
type Quotation = {
  id: string; number: string; clientId: string; projectName?: string;
  issueDate: string; validUntil?: string; currency: string; items: Item[];
  taxPercent?: number; discountPercent?: number; terms?: string;
  status: QStatus; invoiceId?: string;
};
type ClientLite = { id: string; company: string };

const STATUS_CLS: Record<QStatus, string> = {
  draft:    "border-ink-400/40 text-ink-400",
  sent:     "border-sky-400/40 text-sky-300",
  accepted: "border-green-400/40 text-green-300",
  declined: "border-red-400/40 text-red-400",
  expired:  "border-amber-400/40 text-amber-300",
};

const sym = (c: string) => (c === "INR" ? "₹" : c === "USD" ? "$" : c === "EUR" ? "€" : c + " ");
function totalOf(q: { items: Item[]; taxPercent?: number; discountPercent?: number }) {
  const sub = q.items.reduce((s, it) => s + it.qty * it.rate, 0);
  const d = sub * (1 - (q.discountPercent || 0) / 100);
  return Math.round(d * (1 + (q.taxPercent || 0) / 100) * 100) / 100;
}

export default function QuotationsAdmin() {
  const [quotations, setQuotations] = useState<Quotation[]>([]);
  const [clients, setClients] = useState<ClientLite[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    clientId: "", projectName: "", validUntil: "", currency: "INR",
    taxPercent: 18, discountPercent: 0, terms: "",
    items: [{ description: "", qty: 1, rate: 0 }] as Item[],
  });

  async function load() {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/quotations", { cache: "no-store" });
      const data = await res.json();
      setQuotations(data.quotations ?? []);
      setClients(data.clients ?? []);
    } finally { setLoading(false); }
  }
  useEffect(() => { load(); }, []);

  const clientName = (id: string) => clients.find((c) => c.id === id)?.company ?? "Unknown";

  function print(q: Quotation) {
    printDocument({
      kind: "QUOTATION",
      number: q.number,
      issueDate: q.issueDate,
      validUntil: q.validUntil,
      status: q.status,
      billTo: { company: clientName(q.clientId) },
      projectName: q.projectName,
      currency: q.currency,
      items: q.items,
      taxPercent: q.taxPercent,
      discountPercent: q.discountPercent,
      notes: q.terms,
    });
  }

  function setItem(idx: number, patch: Partial<Item>) {
    setForm((f) => ({ ...f, items: f.items.map((it, i) => (i === idx ? { ...it, ...patch } : it)) }));
  }

  async function create() {
    setError("");
    if (!form.clientId) { setError("Select a client."); return; }
    if (!form.items.some((it) => it.description.trim())) { setError("Add at least one line item."); return; }
    setSaving(true);
    try {
      const res = await fetch("/api/admin/quotations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "Failed."); return; }
      setShowForm(false);
      setForm({ ...form, clientId: "", projectName: "", items: [{ description: "", qty: 1, rate: 0 }] });
      load();
    } finally { setSaving(false); }
  }

  async function convert(q: Quotation) {
    if (!confirm(`Convert ${q.number} into an invoice? Line items copy over (discount baked in).`)) return;
    setSaving(true);
    try {
      const res = await fetch("/api/admin/quotations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: q.id, convertToInvoice: true }),
      });
      const data = await res.json();
      if (!res.ok) alert(data.error || "Conversion failed");
      else alert(`Invoice ${data.invoice.number} created and sent to the client portal.`);
      load();
    } finally { setSaving(false); }
  }

  async function setStatus(q: Quotation, status: QStatus) {
    setQuotations((all) => all.map((x) => (x.id === q.id ? { ...x, status } : x)));
    await fetch("/api/admin/quotations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: q.id, status }),
    });
  }

  async function remove(q: Quotation) {
    if (!confirm(`Delete quotation ${q.number}?`)) return;
    await fetch("/api/admin/quotations", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: q.id }),
    });
    load();
  }

  return (
    <div>
      <div className="flex items-end justify-between flex-wrap gap-4">
        <div>
          <div className="text-[11px] uppercase tracking-[0.3em] text-gold-400">Sales Documents</div>
          <h1 className="mt-2 font-display text-4xl font-extralight text-ink-100">Quotations</h1>
          <p className="mt-2 text-ink-300 font-light">
            Send quotes to clients — they accept or decline in their portal. Accepted
            quotes convert to invoices in one click.
          </p>
        </div>
        <button onClick={() => { setShowForm(true); setError(""); }} className="btn-gold text-sm !py-2 !px-4" disabled={clients.length === 0}>
          <Plus size={16} /> New quotation
        </button>
      </div>

      {clients.length === 0 && !loading && (
        <div className="mt-8 card p-6 text-sm text-ink-300 font-light">
          Create a client first (Admin → Clients) — quotations are addressed to a client.
        </div>
      )}

      {showForm && (
        <div className="mt-8 card p-6 gold-border">
          <h2 className="font-display text-xl font-light text-ink-100 mb-5">New quotation</h2>
          <div className="grid md:grid-cols-4 gap-4">
            <Field label="Client">
              <select className="input" value={form.clientId} onChange={(e) => setForm({ ...form, clientId: e.target.value })}>
                <option value="">Select…</option>
                {clients.map((c) => <option key={c.id} value={c.id}>{c.company}</option>)}
              </select>
            </Field>
            <Field label="Project name"><input className="input" value={form.projectName} onChange={(e) => setForm({ ...form, projectName: e.target.value })} placeholder="Acme CRM Platform" /></Field>
            <Field label="Valid until"><input type="date" className="input" value={form.validUntil} onChange={(e) => setForm({ ...form, validUntil: e.target.value })} /></Field>
            <Field label="Currency">
              <select className="input" value={form.currency} onChange={(e) => setForm({ ...form, currency: e.target.value })}>
                {["INR", "USD", "EUR", "GBP", "AED"].map((c) => <option key={c}>{c}</option>)}
              </select>
            </Field>
            <Field label="GST / Tax %"><input type="number" min={0} className="input" value={form.taxPercent} onChange={(e) => setForm({ ...form, taxPercent: Number(e.target.value) })} /></Field>
            <Field label="Discount %"><input type="number" min={0} max={100} className="input" value={form.discountPercent} onChange={(e) => setForm({ ...form, discountPercent: Number(e.target.value) })} /></Field>
            <Field label="Terms (shown to client)" className="md:col-span-2"><input className="input" value={form.terms} onChange={(e) => setForm({ ...form, terms: e.target.value })} placeholder="Default terms from Settings used if empty" /></Field>
          </div>

          <div className="mt-5">
            <div className="text-[11px] uppercase tracking-[0.25em] text-ink-300 mb-3">Line items</div>
            <div className="space-y-2">
              {form.items.map((it, i) => (
                <div key={i} className="grid grid-cols-[1fr_80px_120px_auto] gap-2 items-center">
                  <input className="input !py-2" placeholder="Description" value={it.description} onChange={(e) => setItem(i, { description: e.target.value })} />
                  <input type="number" min={0} className="input !py-2" value={it.qty} onChange={(e) => setItem(i, { qty: Number(e.target.value) })} />
                  <input type="number" min={0} className="input !py-2" value={it.rate} onChange={(e) => setItem(i, { rate: Number(e.target.value) })} />
                  <button onClick={() => setForm((f) => ({ ...f, items: f.items.filter((_, x) => x !== i) }))} className="p-2 rounded text-red-400 hover:bg-red-400/10"><Trash2 size={14} /></button>
                </div>
              ))}
            </div>
            <button onClick={() => setForm((f) => ({ ...f, items: [...f.items, { description: "", qty: 1, rate: 0 }] }))} className="btn-ghost text-xs !py-1.5 !px-3 mt-3">
              <Plus size={13} /> Add line
            </button>
            <div className="mt-4 text-right font-display text-xl font-light gold-text">
              Total: {sym(form.currency)}{totalOf(form).toLocaleString()}
            </div>
          </div>

          {error && <p className="mt-4 text-sm text-red-400">{error}</p>}
          <div className="mt-5 flex gap-3">
            <button onClick={create} disabled={saving} className="btn-gold text-sm !py-2 !px-4 disabled:opacity-60">
              {saving ? <Loader2 size={15} className="animate-spin" /> : <Check size={15} />} Create &amp; send to portal
            </button>
            <button onClick={() => setShowForm(false)} className="btn-ghost text-sm !py-2 !px-4"><X size={15} /> Cancel</button>
          </div>
        </div>
      )}

      <div className="mt-10 space-y-3">
        {loading ? (
          <div className="card p-10 text-center text-ink-400">Loading…</div>
        ) : quotations.length === 0 ? (
          <div className="card p-10 text-center text-ink-400">No quotations yet.</div>
        ) : quotations.map((q) => (
          <div key={q.id} className="card p-5 flex flex-wrap items-center gap-4">
            <div className="grid h-10 w-10 place-items-center rounded-lg border border-gold-400/30 bg-gold-400/5 text-gold-300 shrink-0">
              <FileText size={16} />
            </div>
            <div className="flex-1 min-w-[200px]">
              <div className="text-ink-100 font-light">{q.number}{q.projectName ? ` · ${q.projectName}` : ""}</div>
              <div className="text-xs text-ink-400 mt-0.5">
                {clientName(q.clientId)} · issued {q.issueDate}{q.validUntil ? ` · valid till ${q.validUntil}` : ""}
                {q.invoiceId ? " · converted ✓" : ""}
              </div>
            </div>
            <div className="font-display text-xl font-light gold-text shrink-0">
              {sym(q.currency)}{totalOf(q).toLocaleString()}
            </div>
            <span className={`text-[10px] uppercase tracking-[0.2em] px-2.5 py-1 rounded-full border shrink-0 ${STATUS_CLS[q.status]}`}>{q.status}</span>
            <div className="flex items-center gap-1 shrink-0">
              <button onClick={() => print(q)} className="p-2 rounded-lg text-gold-300 hover:bg-gold-400/10" aria-label="Print / PDF" title="Print or save as PDF"><Printer size={15} /></button>
              {q.status === "accepted" && !q.invoiceId && (
                <button onClick={() => convert(q)} disabled={saving} className="btn-gold text-xs !py-1.5 !px-3">
                  <ArrowRight size={12} /> To invoice
                </button>
              )}
              <select className="input !py-1.5 !px-2 text-xs !w-auto" value={q.status} onChange={(e) => setStatus(q, e.target.value as QStatus)}>
                {(["draft", "sent", "accepted", "declined", "expired"] as const).map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
              <button onClick={() => remove(q)} className="p-2 rounded-lg text-red-400 hover:bg-red-400/10"><Trash2 size={15} /></button>
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
