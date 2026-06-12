"use client";

import { useEffect, useState } from "react";
import { BarChart3, TrendingUp, Hourglass, Users } from "lucide-react";

type Report = {
  months: { month: string; label: string; billed: number; collected: number; spent: number }[];
  totals: { billed: number; collected: number; outstanding: number; spent: number; net: number };
  funnel: { stage: string; count: number; value: number }[];
  pipelineValue: number;
  aging: { current: number; d1_30: number; d31_60: number; d60plus: number };
  projectMix: { active: number; onHold: number; completed: number };
  taskMix: { todo: number; inProgress: number; done: number };
  hr: { headcount: number; monthlyPayroll: number; pendingLeaves: number };
};

const rs = (n: number) => `₹${n.toLocaleString()}`;

const STAGE_LABEL: Record<string, string> = {
  new: "New", contacted: "Contacted", qualified: "Qualified",
  proposal: "Proposal", won: "Won", lost: "Lost",
};

export default function ReportsAdmin() {
  const [report, setReport] = useState<Report | null>(null);

  useEffect(() => {
    fetch("/api/admin/reports", { cache: "no-store" })
      .then((r) => r.json())
      .then((d) => d.months && setReport(d));
  }, []);

  if (!report) {
    return (
      <div>
        <Header />
        <div className="mt-10 card p-12 text-center text-ink-400">Crunching the numbers…</div>
      </div>
    );
  }

  const maxMonth = Math.max(1, ...report.months.map((m) => Math.max(m.billed, m.collected, m.spent)));
  const maxFunnel = Math.max(1, ...report.funnel.map((f) => f.count));
  const agingRows = [
    { label: "Not yet due", value: report.aging.current, cls: "bg-sky-400" },
    { label: "1–30 days overdue", value: report.aging.d1_30, cls: "bg-amber-400" },
    { label: "31–60 days overdue", value: report.aging.d31_60, cls: "bg-orange-500" },
    { label: "60+ days overdue", value: report.aging.d60plus, cls: "bg-red-500" },
  ];
  const maxAging = Math.max(1, ...agingRows.map((a) => a.value));

  return (
    <div>
      <Header />

      {/* Headline KPIs */}
      <div className="mt-8 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        <Kpi label="Billed" value={rs(report.totals.billed)} />
        <Kpi label="Collected" value={rs(report.totals.collected)} />
        <Kpi label="Outstanding" value={rs(report.totals.outstanding)} />
        <Kpi label="Expenses" value={rs(report.totals.spent)} red />
        <Kpi label="Net (cash)" value={rs(report.totals.net)} gold />
      </div>

      <div className="mt-8 grid lg:grid-cols-2 gap-6">
        {/* Monthly money flow */}
        <div className="card p-6">
          <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.3em] text-gold-400 mb-6">
            <BarChart3 size={13} /> Money flow — last 6 months
          </div>
          <div className="flex items-end gap-3 h-44">
            {report.months.map((m) => (
              <div key={m.month} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end">
                <div className="w-full flex items-end justify-center gap-1 flex-1">
                  <div className="w-1/3 rounded-t bg-ink-500/60" title={`Billed ${rs(m.billed)}`} style={{ height: `${(m.billed / maxMonth) * 100}%` }} />
                  <div className="w-1/3 rounded-t bg-gold-400" title={`Collected ${rs(m.collected)}`} style={{ height: `${(m.collected / maxMonth) * 100}%` }} />
                  <div className="w-1/3 rounded-t bg-red-400/80" title={`Spent ${rs(m.spent)}`} style={{ height: `${(m.spent / maxMonth) * 100}%` }} />
                </div>
                <div className="text-[10px] uppercase tracking-wider text-ink-400">{m.label}</div>
              </div>
            ))}
          </div>
          <div className="mt-4 flex gap-5 text-[11px] text-ink-400">
            <span><span className="inline-block h-2 w-2 rounded-sm bg-ink-500/60 mr-1.5" />Billed</span>
            <span><span className="inline-block h-2 w-2 rounded-sm bg-gold-400 mr-1.5" />Collected</span>
            <span><span className="inline-block h-2 w-2 rounded-sm bg-red-400/80 mr-1.5" />Spent</span>
          </div>
        </div>

        {/* CRM funnel */}
        <div className="card p-6">
          <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.3em] text-gold-400 mb-2">
            <TrendingUp size={13} /> Lead funnel
          </div>
          <div className="text-xs text-ink-400 mb-5">Open pipeline value: <span className="text-gold-300">{rs(report.pipelineValue)}</span></div>
          <div className="space-y-3">
            {report.funnel.map((f) => (
              <div key={f.stage}>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-ink-200">{STAGE_LABEL[f.stage] ?? f.stage}</span>
                  <span className="text-ink-400">{f.count}{f.value ? ` · ${rs(f.value)}` : ""}</span>
                </div>
                <div className="h-2 rounded-full bg-bg-elevated overflow-hidden">
                  <div
                    className={`h-full rounded-full ${f.stage === "won" ? "bg-green-400" : f.stage === "lost" ? "bg-red-400/70" : "bg-gold-gradient"}`}
                    style={{ width: `${(f.count / maxFunnel) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Invoice aging */}
        <div className="card p-6">
          <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.3em] text-gold-400 mb-6">
            <Hourglass size={13} /> Receivables aging
          </div>
          {agingRows.every((a) => a.value === 0) ? (
            <p className="text-sm text-ink-400 font-light">Nothing outstanding — all invoices settled. 🎉</p>
          ) : (
            <div className="space-y-3">
              {agingRows.map((a) => (
                <div key={a.label}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-ink-200">{a.label}</span>
                    <span className="text-ink-400">{rs(a.value)}</span>
                  </div>
                  <div className="h-2 rounded-full bg-bg-elevated overflow-hidden">
                    <div className={`h-full rounded-full ${a.cls}`} style={{ width: `${(a.value / maxAging) * 100}%` }} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Delivery & team */}
        <div className="card p-6">
          <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.3em] text-gold-400 mb-6">
            <Users size={13} /> Delivery &amp; team
          </div>
          <div className="grid grid-cols-3 gap-4 text-center">
            <Mini label="Active projects" value={report.projectMix.active} />
            <Mini label="On hold" value={report.projectMix.onHold} />
            <Mini label="Completed" value={report.projectMix.completed} />
            <Mini label="Tasks to do" value={report.taskMix.todo} />
            <Mini label="In progress" value={report.taskMix.inProgress} />
            <Mini label="Done" value={report.taskMix.done} />
          </div>
          <div className="mt-6 pt-5 border-t border-line grid grid-cols-3 gap-4 text-center">
            <Mini label="Headcount" value={report.hr.headcount} />
            <div>
              <div className="font-display text-2xl font-extralight gold-text">{rs(report.hr.monthlyPayroll)}</div>
              <div className="mt-1 text-[10px] uppercase tracking-[0.2em] text-ink-400">Monthly payroll</div>
            </div>
            <Mini label="Pending leaves" value={report.hr.pendingLeaves} />
          </div>
        </div>
      </div>
    </div>
  );
}

function Header() {
  return (
    <div>
      <div className="text-[11px] uppercase tracking-[0.3em] text-gold-400">Business Intelligence</div>
      <h1 className="mt-2 font-display text-4xl font-extralight text-ink-100">Reports</h1>
      <p className="mt-2 text-ink-300 font-light">
        Live analytics computed from your CRM, billing, expenses and HR data.
      </p>
    </div>
  );
}

function Kpi({ label, value, gold = false, red = false }: { label: string; value: string; gold?: boolean; red?: boolean }) {
  return (
    <div className={`card p-6 ${gold ? "gold-border" : ""}`}>
      <div className="text-[10px] uppercase tracking-[0.25em] text-ink-400">{label}</div>
      <div className={`mt-2 font-display text-2xl font-extralight ${gold ? "gold-text" : red ? "text-red-400" : "text-ink-100"}`}>{value}</div>
    </div>
  );
}

function Mini({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <div className="font-display text-2xl font-extralight text-ink-100">{value}</div>
      <div className="mt-1 text-[10px] uppercase tracking-[0.2em] text-ink-400">{label}</div>
    </div>
  );
}
