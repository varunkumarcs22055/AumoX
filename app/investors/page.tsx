import Link from "next/link";
import { ArrowUpRight, FileText, TrendingUp, Calendar, Shield } from "lucide-react";

export const metadata = { title: "Investor Relations — AUMO.X" };

const highlights = [
  { v: "$2.1B", l: "FY26 revenue" },
  { v: "47%", l: "YoY growth" },
  { v: "24.8%", l: "Adj. EBITDA margin" },
  { v: "250+", l: "Enterprise clients" },
];

const filings = [
  { type: "Annual Report", title: "Annual Report FY26", date: "May 2026", size: "8.2 MB" },
  { type: "Quarterly", title: "Q4 FY26 Results", date: "May 2026", size: "2.1 MB" },
  { type: "Quarterly", title: "Q3 FY26 Results", date: "Feb 2026", size: "2.0 MB" },
  { type: "Sustainability", title: "ESG & Sustainability Report 2026", date: "Mar 2026", size: "5.4 MB" },
  { type: "Governance", title: "Corporate Governance Charter", date: "Jan 2026", size: "1.1 MB" },
  { type: "Quarterly", title: "Q2 FY26 Results", date: "Nov 2025", size: "1.9 MB" },
];

const calendar = [
  { date: "Aug 14, 2026", t: "Q1 FY27 Earnings Call" },
  { date: "Sep 22, 2026", t: "Annual General Meeting" },
  { date: "Nov 13, 2026", t: "Q2 FY27 Earnings Call" },
  { date: "Feb 12, 2027", t: "Q3 FY27 Earnings Call" },
];

export default function InvestorsPage() {
  return (
    <>
      <section className="relative overflow-hidden hero-gradient pt-32 lg:pt-44 pb-20">
        <div className="absolute inset-0 grid-overlay opacity-60" />
        <div className="container-x relative">
          <div className="max-w-4xl">
            <div className="eyebrow"><span className="h-px w-8 bg-gold-400" />Investor Relations</div>
            <h1 className="mt-6 font-display text-5xl md:text-7xl leading-[0.95] font-extralight tracking-tight text-ink-100">
              Building <span className="gold-text">durable value</span>.
            </h1>
            <p className="mt-8 max-w-2xl text-lg text-ink-300 font-light">
              Transparent reporting, disciplined capital allocation and a long-term commitment to compounding returns for our shareholders.
            </p>
          </div>
        </div>
      </section>

      {/* Financial highlights */}
      <section className="py-20 lg:py-24">
        <div className="container-x">
          <div className="eyebrow mb-6"><span className="h-px w-8 bg-gold-400" />FY26 Highlights</div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-px overflow-hidden rounded-2xl border border-line bg-line">
            {highlights.map((h) => (
              <div key={h.l} className="bg-bg-surface p-10">
                <TrendingUp size={18} className="text-gold-400 mb-4" />
                <div className="font-display text-4xl lg:text-5xl font-extralight gold-text">{h.v}</div>
                <div className="text-[11px] uppercase tracking-[0.25em] text-ink-400 mt-2">{h.l}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Filings & reports */}
      <section className="py-20 lg:py-24 bg-bg-surface border-y border-line">
        <div className="container-x">
          <div className="flex items-end justify-between flex-wrap gap-6 mb-10">
            <div>
              <div className="eyebrow"><span className="h-px w-8 bg-gold-400" />Filings & Reports</div>
              <h2 className="section-title mt-5">Financial documents archive.</h2>
            </div>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            {filings.map((f) => (
              <a key={f.title} href="#" className="group flex items-center gap-5 p-6 rounded-xl border border-line bg-bg-base hover:border-gold-400/50 hover:bg-bg-elevated transition-all">
                <div className="shrink-0 grid h-12 w-12 place-items-center rounded-lg border border-gold-400/30 bg-gold-400/5 text-gold-300">
                  <FileText size={20} />
                </div>
                <div className="flex-1">
                  <div className="text-[11px] uppercase tracking-[0.2em] text-gold-400">{f.type}</div>
                  <div className="mt-1 text-ink-100 font-light group-hover:text-gold-300 transition-colors">{f.title}</div>
                  <div className="mt-1 text-xs text-ink-400">{f.date} · {f.size} · PDF</div>
                </div>
                <ArrowUpRight size={18} className="text-gold-400" />
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* Calendar */}
      <section className="py-20 lg:py-24">
        <div className="container-x">
          <div className="grid lg:grid-cols-[1fr_2fr] gap-12">
            <div>
              <div className="eyebrow"><span className="h-px w-8 bg-gold-400" />IR Calendar</div>
              <h2 className="section-title mt-5">Upcoming events.</h2>
              <p className="section-sub">Quarterly earnings, AGM and analyst days.</p>
            </div>
            <div className="space-y-3">
              {calendar.map((c) => (
                <div key={c.t} className="flex items-center gap-5 p-5 rounded-xl border border-line bg-bg-surface">
                  <Calendar size={20} className="text-gold-400 shrink-0" />
                  <div className="flex-1">
                    <div className="text-[11px] uppercase tracking-[0.2em] text-gold-400">{c.date}</div>
                    <div className="text-ink-100 font-light">{c.t}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Governance */}
      <section className="py-24 lg:py-32 bg-bg-surface border-y border-line">
        <div className="container-x grid lg:grid-cols-2 gap-12 items-start">
          <div>
            <Shield className="text-gold-400 mb-4" size={28} />
            <h2 className="section-title">Governance built on transparency.</h2>
            <p className="section-sub">A majority-independent board, three standing committees and policies designed to align long-term shareholder and stakeholder interests.</p>
          </div>
          <ul className="space-y-3 text-ink-200 font-light">
            {[
              "Majority-independent board with separate Chair and CEO roles",
              "Audit, Compensation and Nominations committees — independent chairs",
              "Annual shareholder vote on executive compensation",
              "Comprehensive whistleblower and anti-corruption policies",
              "Quarterly disclosures aligned to SEC / IFRS standards",
              "Cybersecurity oversight at board level",
            ].map((t) => (
              <li key={t} className="flex items-start gap-3 p-4 rounded-lg border border-line bg-bg-base">
                <span className="text-gold-400 mt-0.5">◆</span> {t}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="py-24 lg:py-32">
        <div className="container-x text-center">
          <h2 className="section-title mx-auto">Investor inquiries</h2>
          <p className="section-sub mx-auto text-center">Connect with our Investor Relations team.</p>
          <a href="mailto:harshchakravarti77@gmail.com?subject=Investor%20inquiry" className="btn-gold mt-10">
            Contact IR <ArrowUpRight size={18} />
          </a>
        </div>
      </section>
    </>
  );
}
