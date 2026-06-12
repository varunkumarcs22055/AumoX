"use client";

import { useEffect, useMemo, useState } from "react";
import { Plus, Trash2, Check, X, Loader2, Receipt, Printer } from "lucide-react";
import { printDocument } from "@/lib/print-doc";

type InvoiceStatus = "draft" | "sent" | "paid" | "overdue";
type Item = { description: string; qty: number; rate: number };
type Invoice = {
  id: string;
  number: string;
  clientId: string;
  projectId?: string;
  issueDate: string;
  dueDate?: string;
  currency: string;
  items: Item[];
  taxPercent?: number;
  notes?: string;
  status: InvoiceStatus;
};
type ClientLite = { id: string; company: string };
type ProjectLite = { id: string; name: string; clientId: string };

const STATUS_CLS: Record<InvoiceStatus, string> = {
  draft:   "border-ink-400/40 text-ink-400",
  sent:    "border-sky-400/40 text-sky-300",
  paid:    "border-green-400/40 text-green-300",
  overdue: "border-red-400/40 text-red-400",
};

function sym(cur: string) {
  return cur === "INR" ? "₹" : cur === "USD" ? "$" : cur === "EUR" ? "€" : cur + " ";
}
function totalOf(inv: { items: Item[]; taxPercent?: number }) {
  const sub = inv.items.reduce((s, it) => s + it.qty * it.rate, 0);
  return Math.round(sub * (1 + (inv.taxPercent || 0) / 100) * 100) / 100;
}

export default function InvoicesAdmin() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [clients, setClients] = useState<ClientLite[]>([]);
  const [projects, setProjects] = useState<ProjectLite[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    clientId: "",
    projectId: "",
    issueDate: new Date().toISOString().slice(0, 10),
    dueDate: "",
    currency: "INR",
    taxPercent: 18,
    notes: "",
    items: [{ description: "", qty: 1, rate: 0 }] as Item[],
  });

  const [bankDetails, setBankDetails] = useState("");

  async function load() {
    setLoading(true);
    try {
      const [res, companyRes] = await Promise.all([
        fetch("/api/admin/invoices", { cache: "no-store" }),
        fetch("/api/admin/company", { cache: "no-store" }),
      ]);
      const data = await res.json();
      const company = await companyRes.json();
      setInvoices(data.invoices ?? []);
      setClients(data.clients ?? []);
      setProjects(data.projects ?? []);
      setBankDetails(company.settings?.bankDetails ?? "");
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => { load(); }, []);

  function print(inv: Invoice) {
    printDocument({
      kind: "INVOICE",
      number: inv.number,
      issueDate: inv.issueDate,
      dueDate: inv.dueDate,
      status: inv.status,
      billTo: { company: clientName(inv.clientId) },
      projectName: projects.find((p) => p.id === inv.projectId)?.name,
      currency: inv.currency,
      items: inv.items,
      taxPercent: inv.taxPercent,
      notes: inv.notes,
      bankDetails,
    });
  }

  const totals = useMemo(() => {
    const issued = invoices.filter((i) => i.status !== "draft");
    const paid = invoices.filter((i) => i.status === "paid");
    const open = issued.filter((i) => i.status !== "paid");
    return {
      paidValue: paid.reduce((s, i) => s + totalOf(i), 0),
      openValue: open.reduce((s, i) => s + totalOf(i), 0),
      count: invoices.length,
    };
  }, [invoices]);

  const clientName = (id: string) => clients.find((c) => c.id === id)?.company ?? "Unknown";

  function setItem(idx: number, patch: Partial<Item>) {
    setForm((f) => ({
      ...f,
      items: f.items.map((it, i) => (i === idx ? { ...it, ...patch } : it)),
    }));
  }

  async function create() {
    setError("");
    if (!form.clientId) { setError("Select a client."); return; }
    if (!form.items.some((it) => it.description.trim())) { setError("Add at least one line item."); return; }
    setSaving(true);
    try {
      const res = await fetch("/api/admin/invoices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, projectId: form.projectId || undefined, status: "sent" }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "Failed to create invoice."); return; }
      setShowForm(false);
      setForm({ ...form, clientId: "", projectId: "", items: [{ description: "", qty: 1, rate: 0 }], notes: "" });
      load();
    } finally {
      setSaving(false);
    }
  }

  async function setStatus(inv: Invoice, status: InvoiceStatus) {
    setInvoices((all) => all.map((x) => (x.id === inv.id ? { ...x, status } : x)));
    await fetch("/api/admin/invoices", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: inv.id, status }),
    });
  }

  async function remove(inv: Invoice) {
    if (!confirm(`Delete invoice ${inv.number}?`)) return;
    await fetch("/api/admin/invoices", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: inv.id }),
    });
    load();
  }

  const clientProjects = projects.filter((p) => p.clientId === form.clientId);

  return (
    <div>
      <div className="flex items-end justify-between flex-wrap gap-4">
        <div>
          <div className="text-[11px] uppercase tracking-[0.3em] text-gold-400">ERP · Billing</div>
          <h1 className="mt-2 font-display text-4xl font-extralight text-ink-100">Invoices</h1>
          <p className="mt-2 text-ink-300 font-light">
            Issue and track invoices. Sent / paid / overdue invoices appear read-only
            in the client&apos;s portal.
          </p>
        </div>
        <button
          onClick={() => { setShowForm(true); setError(""); }}
          className="btn-gold text-sm !py-2 !px-4"
          disabled={clients.length === 0}
        >
          <Plus size={16} /> New invoice
        </button>
      </div>

      {/* Money summary */}
      <div className="mt-8 grid grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="card p-5">
          <div className="text-[10px] uppercase tracking-[0.25em] text-ink-400">Collected (paid)</div>
          <div className="mt-2 font-display text-2xl font-extralight gold-text">₹{totals.paidValue.toLocaleString()}</div>
        </div>
        <div className="card p-5">
          <div className="text-[10px] uppercase tracking-[0.25em] text-ink-400">Outstanding</div>
          <div className="mt-2 font-display text-2xl font-extralight text-ink-100">₹{totals.openValue.toLocaleString()}</div>
        </div>
        <div className="card p-5">
          <div className="text-[10px] uppercase tracking-[0.25em] text-ink-400">Total invoices</div>
          <div className="mt-2 font-display text-2xl font-extralight text-ink-100">{totals.count}</div>
        </div>
      </div>

      {clients.length === 0 && !loading && (
        <div className="mt-8 card p-6 text-sm text-ink-300 font-light">
          Create a client first (Admin → Clients) — invoices are billed to a client.
        </div>
      )}

      {/* New invoice form */}
      {showForm && (
        <div className="mt-8 card p-6 gold-border">
          <h2 className="font-display text-xl font-light text-ink-100 mb-5">New invoice</h2>
          <div className="grid md:grid-cols-4 gap-5">
            <Field label="Client">
              <select className="input" value={form.clientId} onChange={(e) => setForm({ ...form, clientId: e.target.value, projectId: "" })}>
                <option value="">Select…</option>
                {clients.map((c) => <option key={c.id} value={c.id}>{c.company}</option>)}
              </select>
            </Field>
            <Field label="Project (optional)">
              <select className="input" value={form.projectId} onChange={(e) => setForm({ ...form, projectId: e.target.value })}>
                <option value="">—</option>
                {clientProjects.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </Field>
            <Field label="Issue date">
              <input type="date" className="input" value={form.issueDate} onChange={(e) => setForm({ ...form, issueDate: e.target.value })} />
            </Field>
            <Field label="Due date">
              <input type="date" className="input" value={form.dueDate} onChange={(e) => setForm({ ...form, dueDate: e.target.value })} />
            </Field>
            <Field label="Currency">
              <select className="input" value={form.currency} onChange={(e) => setForm({ ...form, currency: e.target.value })}>
                {["INR", "USD", "EUR", "GBP", "AED"].map((c) => <option key={c}>{c}</option>)}
              </select>
            </Field>
            <Field label="Tax %">
              <input type="number" min={0} max={50} className="input" value={form.taxPercent} onChange={(e) => setForm({ ...form, taxPercent: Number(e.target.value) })} />
            </Field>
            <Field label="Notes (shown on invoice)" className="md:col-span-2">
              <input className="input" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="Payment terms, bank details reference…" />
            </Field>
          </div>

          {/* Line items */}
          <div className="mt-6">
            <div className="text-[11px] uppercase tracking-[0.25em] text-ink-300 mb-3">Line items</div>
            <div className="space-y-2">
              {form.items.map((it, i) => (
                <div key={i} className="grid grid-cols-[1fr_80px_120px_auto] gap-2 items-center">
                  <input className="input !py-2" placeholder="Description — e.g. CRM development (milestone 1)" value={it.description} onChange={(e) => setItem(i, { description: e.target.value })} />
                  <input type="number" min={0} className="input !py-2" placeholder="Qty" value={it.qty} onChange={(e) => setItem(i, { qty: Number(e.target.value) })} />
                  <input type="number" min={0} className="input !py-2" placeholder="Rate" value={it.rate} onChange={(e) => setItem(i, { rate: Number(e.target.value) })} />
                  <button
                    onClick={() => setForm((f) => ({ ...f, items: f.items.filter((_, x) => x !== i) }))}
                    className="p-2 rounded text-red-400 hover:bg-red-400/10"
                    aria-label="Remove line"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
            <button
              onClick={() => setForm((f) => ({ ...f, items: [...f.items, { description: "", qty: 1, rate: 0 }] }))}
              className="btn-ghost text-xs !py-1.5 !px-3 mt-3"
            >
              <Plus size={13} /> Add line
            </button>
            <div className="mt-4 text-right font-display text-xl font-light gold-text">
              Total: {sym(form.currency)}{totalOf(form).toLocaleString()}
            </div>
          </div>

          {error && <p className="mt-4 text-sm text-red-400">{error}</p>}
          <div className="mt-6 flex gap-3">
            <button onClick={create} disabled={saving} className="btn-gold text-sm !py-2 !px-4 disabled:opacity-60">
              {saving ? <><Loader2 size={16} className="animate-spin" /> Creating…</> : <><Check size={16} /> Create &amp; send</>}
            </button>
            <button onClick={() => setShowForm(false)} className="btn-ghost text-sm !py-2 !px-4"><X size={16} /> Cancel</button>
          </div>
        </div>
      )}

      {/* Invoice list */}
      <div className="mt-10 space-y-3">
        {loading ? (
          <div className="card p-10 text-center text-ink-400">Loading…</div>
        ) : invoices.length === 0 ? (
          <div className="card p-10 text-center text-ink-400">No invoices yet.</div>
        ) : invoices.map((inv) => (
          <div key={inv.id} className="card p-5 flex flex-wrap items-center gap-4">
            <div className="grid h-10 w-10 place-items-center rounded-lg border border-gold-400/30 bg-gold-400/5 text-gold-300 shrink-0">
              <Receipt size={16} />
            </div>
            <div className="flex-1 min-w-[180px]">
              <div className="text-ink-100 font-light">{inv.number}</div>
              <div className="text-xs text-ink-400 mt-0.5">
                {clientName(inv.clientId)} · issued {inv.issueDate}{inv.dueDate ? ` · due ${inv.dueDate}` : ""}
              </div>
            </div>
            <div className="font-display text-xl font-light gold-text shrink-0">
              {sym(inv.currency)}{totalOf(inv).toLocaleString()}
            </div>
            <span className={`text-[10px] uppercase tracking-[0.2em] px-2.5 py-1 rounded-full border shrink-0 ${STATUS_CLS[inv.status]}`}>
              {inv.status}
            </span>
            <div className="flex items-center gap-1 shrink-0">
              <button onClick={() => print(inv)} className="p-2 rounded-lg text-gold-300 hover:bg-gold-400/10" aria-label="Print / PDF" title="Print or save as PDF"><Printer size={15} /></button>
              <select className="input !py-1.5 !px-2 text-xs !w-auto" value={inv.status} onChange={(e) => setStatus(inv, e.target.value as InvoiceStatus)}>
                {(["draft", "sent", "paid", "overdue"] as const).map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
              <button onClick={() => remove(inv)} className="p-2 rounded-lg text-red-400 hover:bg-red-400/10" aria-label="Delete"><Trash2 size={15} /></button>
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
