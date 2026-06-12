"use client";

import { useEffect, useState } from "react";
import { Trash2, Loader2, Landmark, Check, Wallet } from "lucide-react";

type Invoice = {
  id: string; number: string; clientId: string; issueDate: string; dueDate?: string;
  currency: string; items: { qty: number; rate: number }[]; taxPercent?: number; status: string;
};
type Payment = {
  id: string; invoiceId: string; clientId: string; date: string;
  amount: number; currency: string; method: string; reference?: string;
};
type ClientLite = { id: string; company: string };
type Expense = {
  id: string; date: string; category: string; description: string;
  amount: number; currency: string; vendor?: string; reference?: string;
};

const EXPENSE_CATEGORIES = ["Salaries", "Software & tools", "Infrastructure", "Marketing", "Travel", "Office", "Professional fees", "Other"];

const sym = (c: string) => (c === "INR" ? "₹" : c === "USD" ? "$" : c === "EUR" ? "€" : c + " ");
function totalOf(inv: Invoice) {
  const sub = inv.items.reduce((s, it) => s + it.qty * it.rate, 0);
  return Math.round(sub * (1 + (inv.taxPercent || 0) / 100) * 100) / 100;
}

export default function FinanceAdmin() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [clients, setClients] = useState<ClientLite[]>([]);
  const [totals, setTotals] = useState({ billed: 0, collected: 0, outstanding: 0 });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ invoiceId: "", amount: "", method: "Bank transfer", reference: "", date: new Date().toISOString().slice(0, 10) });
  const [msg, setMsg] = useState("");
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [expSaving, setExpSaving] = useState(false);
  const [expMsg, setExpMsg] = useState("");
  const [expForm, setExpForm] = useState({
    date: new Date().toISOString().slice(0, 10),
    category: "Software & tools",
    description: "",
    amount: "",
    vendor: "",
    reference: "",
  });

  async function load() {
    setLoading(true);
    try {
      const [res, expRes] = await Promise.all([
        fetch("/api/admin/payments", { cache: "no-store" }),
        fetch("/api/admin/expenses", { cache: "no-store" }),
      ]);
      const data = await res.json();
      const expData = await expRes.json();
      setInvoices(data.invoices ?? []);
      setPayments(data.payments ?? []);
      setClients(data.clients ?? []);
      setTotals(data.totals ?? { billed: 0, collected: 0, outstanding: 0 });
      setExpenses(expData.expenses ?? []);
    } finally { setLoading(false); }
  }
  useEffect(() => { load(); }, []);

  const totalSpent = expenses.reduce((s, e) => s + e.amount, 0);
  const net = totals.collected - totalSpent;

  async function recordExpense() {
    setExpMsg("");
    if (!expForm.description.trim() || !expForm.amount || Number(expForm.amount) <= 0) {
      setExpMsg("Add a description and a positive amount.");
      return;
    }
    setExpSaving(true);
    try {
      const res = await fetch("/api/admin/expenses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...expForm, amount: Number(expForm.amount), currency: "INR" }),
      });
      const data = await res.json();
      if (!res.ok) { setExpMsg(data.error ?? "Failed."); return; }
      setExpenses(data.expenses ?? []);
      setExpForm({ ...expForm, description: "", amount: "", vendor: "", reference: "" });
    } finally { setExpSaving(false); }
  }

  async function removeExpense(e: Expense) {
    if (!confirm(`Delete this ₹${e.amount.toLocaleString()} expense?`)) return;
    await fetch("/api/admin/expenses", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: e.id }),
    });
    setExpenses((all) => all.filter((x) => x.id !== e.id));
  }

  const clientName = (id: string) => clients.find((c) => c.id === id)?.company ?? "Unknown";
  const invNumber = (id: string) => invoices.find((i) => i.id === id)?.number ?? "—";
  const paidFor = (invoiceId: string) => payments.filter((p) => p.invoiceId === invoiceId).reduce((s, p) => s + p.amount, 0);

  async function record() {
    setMsg("");
    if (!form.invoiceId || !form.amount || Number(form.amount) <= 0) { setMsg("Pick an invoice and a positive amount."); return; }
    setSaving(true);
    try {
      const res = await fetch("/api/admin/payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, amount: Number(form.amount) }),
      });
      const data = await res.json();
      if (!res.ok) { setMsg(data.error ?? "Failed."); return; }
      setForm({ ...form, invoiceId: "", amount: "", reference: "" });
      load();
    } finally { setSaving(false); }
  }

  async function removePayment(p: Payment) {
    if (!confirm(`Delete this ${sym(p.currency)}${p.amount.toLocaleString()} payment record?`)) return;
    await fetch("/api/admin/payments", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: p.id }),
    });
    load();
  }

  const openInvoices = invoices.filter((i) => i.status !== "draft" && i.status !== "paid");

  return (
    <div>
      <div>
        <div className="text-[11px] uppercase tracking-[0.3em] text-gold-400">ERP · Finance</div>
        <h1 className="mt-2 font-display text-4xl font-extralight text-ink-100">Ledger</h1>
        <p className="mt-2 text-ink-300 font-light">
          Record incoming payments against invoices. Fully paid invoices flip to
          &quot;paid&quot; automatically — clients see it in their portal.
        </p>
      </div>

      {/* KPIs */}
      <div className="mt-8 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        <div className="card p-6">
          <div className="text-[10px] uppercase tracking-[0.25em] text-ink-400">Billed (issued)</div>
          <div className="mt-2 font-display text-2xl font-extralight text-ink-100">₹{totals.billed.toLocaleString()}</div>
        </div>
        <div className="card p-6">
          <div className="text-[10px] uppercase tracking-[0.25em] text-ink-400">Collected</div>
          <div className="mt-2 font-display text-2xl font-extralight text-ink-100">₹{totals.collected.toLocaleString()}</div>
        </div>
        <div className="card p-6">
          <div className="text-[10px] uppercase tracking-[0.25em] text-ink-400">Outstanding</div>
          <div className="mt-2 font-display text-2xl font-extralight text-ink-100">₹{totals.outstanding.toLocaleString()}</div>
        </div>
        <div className="card p-6">
          <div className="text-[10px] uppercase tracking-[0.25em] text-ink-400">Expenses</div>
          <div className="mt-2 font-display text-2xl font-extralight text-red-400">₹{totalSpent.toLocaleString()}</div>
        </div>
        <div className="card p-6 gold-border">
          <div className="text-[10px] uppercase tracking-[0.25em] text-ink-400">Net (cash)</div>
          <div className={`mt-2 font-display text-2xl font-extralight ${net >= 0 ? "gold-text" : "text-red-400"}`}>₹{net.toLocaleString()}</div>
        </div>
      </div>

      {/* Record payment */}
      <div className="mt-8 card p-5 gold-border">
        <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.3em] text-gold-400 mb-4">
          <Landmark size={13} /> Record a payment
        </div>
        <div className="grid md:grid-cols-[1.5fr_1fr_1fr_1fr_1fr_auto] gap-3 items-end">
          <Field label="Invoice">
            <select className="input !py-2" value={form.invoiceId} onChange={(e) => {
              const inv = invoices.find((i) => i.id === e.target.value);
              const remaining = inv ? Math.max(0, totalOf(inv) - paidFor(inv.id)) : 0;
              setForm({ ...form, invoiceId: e.target.value, amount: remaining ? String(remaining) : "" });
            }}>
              <option value="">Select…</option>
              {openInvoices.map((i) => (
                <option key={i.id} value={i.id}>
                  {i.number} · {clientName(i.clientId)} · due {sym(i.currency)}{Math.max(0, totalOf(i) - paidFor(i.id)).toLocaleString()}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Amount"><input type="number" min={0} className="input !py-2" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} /></Field>
          <Field label="Date"><input type="date" className="input !py-2" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} /></Field>
          <Field label="Method">
            <select className="input !py-2" value={form.method} onChange={(e) => setForm({ ...form, method: e.target.value })}>
              {["Bank transfer", "UPI", "Razorpay", "Stripe", "Cash", "Cheque", "Other"].map((m) => <option key={m}>{m}</option>)}
            </select>
          </Field>
          <Field label="Reference"><input className="input !py-2" placeholder="UTR / txn id" value={form.reference} onChange={(e) => setForm({ ...form, reference: e.target.value })} /></Field>
          <button onClick={record} disabled={saving} className="btn-gold text-sm !py-2.5 !px-4 disabled:opacity-60">
            {saving ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />} Record
          </button>
        </div>
        {msg && <p className="mt-3 text-sm text-red-400">{msg}</p>}
      </div>

      {/* Record expense */}
      <div className="mt-6 card p-5">
        <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.3em] text-gold-400 mb-4">
          <Wallet size={13} /> Record an expense
        </div>
        <div className="grid md:grid-cols-[1fr_1.6fr_1fr_1fr_1fr_1fr_auto] gap-3 items-end">
          <Field label="Date"><input type="date" className="input !py-2" value={expForm.date} onChange={(e) => setExpForm({ ...expForm, date: e.target.value })} /></Field>
          <Field label="Description"><input className="input !py-2" placeholder="e.g. Vercel Pro subscription" value={expForm.description} onChange={(e) => setExpForm({ ...expForm, description: e.target.value })} /></Field>
          <Field label="Category">
            <select className="input !py-2" value={expForm.category} onChange={(e) => setExpForm({ ...expForm, category: e.target.value })}>
              {EXPENSE_CATEGORIES.map((c) => <option key={c}>{c}</option>)}
            </select>
          </Field>
          <Field label="Amount (₹)"><input type="number" min={0} className="input !py-2" value={expForm.amount} onChange={(e) => setExpForm({ ...expForm, amount: e.target.value })} /></Field>
          <Field label="Vendor"><input className="input !py-2" placeholder="optional" value={expForm.vendor} onChange={(e) => setExpForm({ ...expForm, vendor: e.target.value })} /></Field>
          <Field label="Reference"><input className="input !py-2" placeholder="bill / txn id" value={expForm.reference} onChange={(e) => setExpForm({ ...expForm, reference: e.target.value })} /></Field>
          <button onClick={recordExpense} disabled={expSaving} className="btn-gold text-sm !py-2.5 !px-4 disabled:opacity-60">
            {expSaving ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />} Add
          </button>
        </div>
        {expMsg && <p className="mt-3 text-sm text-red-400">{expMsg}</p>}
        {expenses.length > 0 && (
          <div className="mt-5 space-y-2">
            {expenses.map((e) => (
              <div key={e.id} className="flex items-center gap-3 border-t border-line pt-2">
                <div className="flex-1 min-w-0">
                  <div className="text-sm text-ink-100 font-light truncate">{e.description}{e.vendor ? ` · ${e.vendor}` : ""}</div>
                  <div className="text-xs text-ink-400 mt-0.5">{e.date} · {e.category}{e.reference ? ` · ${e.reference}` : ""}</div>
                </div>
                <div className="text-sm text-red-400 shrink-0">−₹{e.amount.toLocaleString()}</div>
                <button onClick={() => removeExpense(e)} className="p-1.5 rounded text-red-400 hover:bg-red-400/10 shrink-0"><Trash2 size={14} /></button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Ledger */}
      <div className="mt-8 grid lg:grid-cols-2 gap-6">
        <div>
          <div className="text-[11px] uppercase tracking-[0.3em] text-gold-400 mb-4">Invoices</div>
          <div className="space-y-2">
            {loading ? <div className="card p-8 text-center text-ink-400">Loading…</div> :
              invoices.filter((i) => i.status !== "draft").length === 0 ? (
                <div className="card p-8 text-center text-ink-400">No issued invoices.</div>
              ) : invoices.filter((i) => i.status !== "draft").map((i) => {
                const total = totalOf(i);
                const paid = paidFor(i.id);
                return (
                  <div key={i.id} className="card p-4 flex items-center gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="text-sm text-ink-100 font-light truncate">{i.number} · {clientName(i.clientId)}</div>
                      <div className="text-xs text-ink-400 mt-0.5">{sym(i.currency)}{paid.toLocaleString()} / {sym(i.currency)}{total.toLocaleString()} paid</div>
                    </div>
                    <div className="h-1.5 w-24 rounded-full bg-bg-elevated overflow-hidden shrink-0">
                      <div className="h-full bg-gold-gradient" style={{ width: `${Math.min(100, (paid / (total || 1)) * 100)}%` }} />
                    </div>
                    <span className={`text-[10px] uppercase tracking-[0.15em] shrink-0 ${i.status === "paid" ? "text-green-300" : i.status === "overdue" ? "text-red-400" : "text-sky-300"}`}>{i.status}</span>
                  </div>
                );
              })}
          </div>
        </div>
        <div>
          <div className="text-[11px] uppercase tracking-[0.3em] text-gold-400 mb-4">Payments received</div>
          <div className="space-y-2">
            {loading ? <div className="card p-8 text-center text-ink-400">Loading…</div> :
              payments.length === 0 ? (
                <div className="card p-8 text-center text-ink-400">No payments recorded yet.</div>
              ) : payments.map((p) => (
                <div key={p.id} className="card p-4 flex items-center gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="text-sm text-ink-100 font-light">{sym(p.currency)}{p.amount.toLocaleString()} · {invNumber(p.invoiceId)}</div>
                    <div className="text-xs text-ink-400 mt-0.5">{p.date} · {p.method}{p.reference ? ` · ${p.reference}` : ""}</div>
                  </div>
                  <button onClick={() => removePayment(p)} className="p-1.5 rounded text-red-400 hover:bg-red-400/10"><Trash2 size={14} /></button>
                </div>
              ))}
          </div>
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
