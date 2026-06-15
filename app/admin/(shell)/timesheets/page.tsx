"use client";

import { useEffect, useMemo, useState } from "react";
import { Clock, Check, RefreshCw } from "lucide-react";

type Entry = { id: string; employeeId: string; projectId?: string; date: string; hours: number; billable: boolean; note?: string; invoiced?: boolean };
type Lite = { id: string; name: string };

export default function TimesheetsAdmin() {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [employees, setEmployees] = useState<Lite[]>([]);
  const [projects, setProjects] = useState<Lite[]>([]);
  const [emp, setEmp] = useState("");
  const [proj, setProj] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  async function load() {
    const d = await fetch("/api/admin/timesheets", { cache: "no-store" }).then((r) => r.json());
    setEntries(d.entries ?? []);
    setEmployees(d.employees ?? []);
    setProjects((d.projects ?? []).map((p: Lite) => ({ id: p.id, name: p.name })));
  }
  useEffect(() => { load(); }, []);

  const empName = (id: string) => employees.find((e) => e.id === id)?.name ?? "—";
  const projName = (id?: string) => projects.find((p) => p.id === id)?.name ?? "—";

  const filtered = useMemo(() => entries.filter((e) =>
    (!emp || e.employeeId === emp) && (!proj || e.projectId === proj) &&
    (!from || e.date >= from) && (!to || e.date <= to)
  ), [entries, emp, proj, from, to]);

  const totals = useMemo(() => {
    const billable = filtered.filter((e) => e.billable).reduce((s, e) => s + e.hours, 0);
    const nonBillable = filtered.filter((e) => !e.billable).reduce((s, e) => s + e.hours, 0);
    const unbilled = filtered.filter((e) => e.billable && !e.invoiced).reduce((s, e) => s + e.hours, 0);
    return { billable, nonBillable, unbilled, total: billable + nonBillable };
  }, [filtered]);

  async function markInvoiced(ids: string[], invoiced: boolean) {
    await fetch("/api/admin/timesheets", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ids, invoiced }) });
    load();
  }

  return (
    <div>
      <div className="flex items-end justify-between flex-wrap gap-4">
        <div>
          <div className="text-[11px] uppercase tracking-[0.3em] text-gold-400">ERP · Time</div>
          <h1 className="mt-2 font-display text-4xl font-extralight text-ink-100">Timesheets</h1>
          <p className="mt-2 text-ink-300 font-light">Hours logged by your team against projects. Billable hours feed your invoicing.</p>
        </div>
        <button onClick={load} className="btn-ghost text-sm !py-2 !px-4"><RefreshCw size={14} /> Refresh</button>
      </div>

      <div className="mt-8 grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Kpi label="Total hours" value={`${totals.total.toFixed(1)}h`} />
        <Kpi label="Billable" value={`${totals.billable.toFixed(1)}h`} gold />
        <Kpi label="Non-billable" value={`${totals.nonBillable.toFixed(1)}h`} />
        <Kpi label="Unbilled billable" value={`${totals.unbilled.toFixed(1)}h`} gold />
      </div>

      <div className="mt-6 flex flex-wrap gap-3 items-end">
        <Field label="Employee"><select className="input !py-2 !w-auto" value={emp} onChange={(e) => setEmp(e.target.value)}><option value="">All</option>{employees.map((e) => <option key={e.id} value={e.id}>{e.name}</option>)}</select></Field>
        <Field label="Project"><select className="input !py-2 !w-auto" value={proj} onChange={(e) => setProj(e.target.value)}><option value="">All</option>{projects.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}</select></Field>
        <Field label="From"><input type="date" className="input !py-2" value={from} onChange={(e) => setFrom(e.target.value)} /></Field>
        <Field label="To"><input type="date" className="input !py-2" value={to} onChange={(e) => setTo(e.target.value)} /></Field>
        {totals.unbilled > 0 && (
          <button onClick={() => markInvoiced(filtered.filter((e) => e.billable && !e.invoiced).map((e) => e.id), true)} className="btn-gold text-sm !py-2 !px-4">
            <Check size={14} /> Mark {totals.unbilled.toFixed(1)}h invoiced
          </button>
        )}
      </div>

      <div className="mt-6 card overflow-x-auto">
        <table className="w-full text-sm">
          <thead><tr className="text-left text-[10px] uppercase tracking-[0.2em] text-gold-400 border-b border-line">
            <th className="p-4">Date</th><th className="p-4">Employee</th><th className="p-4">Project</th><th className="p-4">Hours</th><th className="p-4">Type</th><th className="p-4">Note</th>
          </tr></thead>
          <tbody>
            {filtered.length === 0 ? <tr><td colSpan={6} className="p-8 text-center text-ink-400">No entries match.</td></tr> :
              filtered.map((e) => (
                <tr key={e.id} className="border-b border-line/50 text-ink-200 font-light">
                  <td className="p-4 whitespace-nowrap">{e.date}</td>
                  <td className="p-4">{empName(e.employeeId)}</td>
                  <td className="p-4">{projName(e.projectId)}</td>
                  <td className="p-4 text-gold-300">{e.hours}h</td>
                  <td className="p-4 text-xs">{e.billable ? (e.invoiced ? <span className="text-green-300">billed</span> : <span className="text-gold-300">billable</span>) : <span className="text-ink-400">internal</span>}</td>
                  <td className="p-4 text-xs text-ink-400">{e.note || "—"}</td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Kpi({ label, value, gold = false }: { label: string; value: string; gold?: boolean }) {
  return <div className={`card p-5 ${gold ? "gold-border" : ""}`}><div className="text-[10px] uppercase tracking-[0.25em] text-ink-400">{label}</div><div className={`mt-2 font-display text-2xl font-extralight ${gold ? "gold-text" : "text-ink-100"}`}>{value}</div></div>;
}
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="block"><span className="block text-[11px] uppercase tracking-[0.25em] text-ink-300 mb-2">{label}</span>{children}</label>;
}
