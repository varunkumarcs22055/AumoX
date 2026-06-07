import Link from "next/link";
import { ArrowUpRight, TrendingUp } from "lucide-react";

export const metadata = {
  title: "Our Work — Case Studies & Client Outcomes",
};

const cases = [
  {
    industry: "Banking & Financial",
    client: "Tier-1 Global Bank",
    title: "$48M saved through multi-cloud consolidation",
    desc: "Modernized 320 applications across 14 business units, automated 90% of operations and reduced change failure rate by 78%.",
    metrics: [
      { v: "$48M", l: "Saved over 3 yrs" },
      { v: "320", l: "Apps modernized" },
      { v: "78%", l: "Lower CFR" },
    ],
  },
  {
    industry: "Healthcare",
    client: "Global Hospital Network",
    title: "Unified clinical platform serving 12M patients",
    desc: "Built a HIPAA-compliant data platform unifying EHR, claims and IoT — enabling AI-driven clinical decision support across 240 facilities.",
    metrics: [
      { v: "12M", l: "Patients served" },
      { v: "240", l: "Facilities" },
      { v: "31%", l: "Faster diagnosis" },
    ],
  },
  {
    industry: "Retail & CPG",
    client: "Fortune 100 Retailer",
    title: "Unified commerce platform across 5,400 stores",
    desc: "Re-architected the customer journey across digital and physical — driving incremental revenue and best-in-class NPS.",
    metrics: [
      { v: "+18%", l: "Revenue lift" },
      { v: "5,400", l: "Stores live" },
      { v: "+22", l: "NPS points" },
    ],
  },
  {
    industry: "Manufacturing",
    client: "Global Industrial OEM",
    title: "Smart factory rollout across 18 plants",
    desc: "IoT-enabled predictive maintenance and OEE optimization — delivering material yield and downtime improvements at scale.",
    metrics: [
      { v: "+14%", l: "OEE gain" },
      { v: "-38%", l: "Unplanned downtime" },
      { v: "18", l: "Plants in production" },
    ],
  },
  {
    industry: "Telecom & Media",
    client: "European Telco Group",
    title: "5G OSS/BSS modernization in 9 markets",
    desc: "Replaced 14 legacy stacks with a unified, cloud-native OSS/BSS — accelerating time-to-market for new propositions by 60%.",
    metrics: [
      { v: "9", l: "Markets live" },
      { v: "60%", l: "Faster TTM" },
      { v: "€110M", l: "Run-rate savings" },
    ],
  },
  {
    industry: "Energy & Utilities",
    client: "Renewables Operator",
    title: "Asset performance platform for 12 GW portfolio",
    desc: "Built a real-time asset platform aggregating telemetry from 6,000+ turbines — improving yield and SLA performance.",
    metrics: [
      { v: "12 GW", l: "Under management" },
      { v: "+9%", l: "Energy yield" },
      { v: "99.7%", l: "Data availability" },
    ],
  },
];

export default function WorkPage() {
  return (
    <>
      <section className="relative overflow-hidden hero-gradient pt-32 lg:pt-44 pb-20">
        <div className="absolute inset-0 grid-overlay opacity-60" />
        <div className="container-x relative">
          <div className="max-w-4xl">
            <div className="eyebrow"><span className="h-px w-8 bg-gold-400" />Our Work</div>
            <h1 className="mt-6 font-display text-5xl md:text-7xl leading-[1.05] font-extralight tracking-tight text-ink-100">
              Outcomes that <span className="gold-text">compound</span>.
            </h1>
            <p className="mt-8 max-w-2xl text-lg text-ink-300 font-light">
              A selection of client engagements where we partnered to deliver
              measurable, lasting business impact.
            </p>
          </div>
        </div>
      </section>

      <section className="py-20 lg:py-24">
        <div className="container-x space-y-6">
          {cases.map((c) => (
            <Link
              key={c.title}
              href="/contact"
              className="group card p-10 lg:p-14 gold-border grid lg:grid-cols-[2fr_1fr] gap-10 items-start"
            >
              <div>
                <div className="flex flex-wrap gap-3 items-center text-[11px] uppercase tracking-[0.3em]">
                  <span className="text-gold-400">{c.industry}</span>
                  <span className="text-gold-400/40">·</span>
                  <span className="text-ink-400">{c.client}</span>
                </div>
                <h2 className="mt-4 font-display text-3xl md:text-4xl font-extralight text-ink-100 leading-tight group-hover:text-gold-200 transition-colors">
                  {c.title}
                </h2>
                <p className="mt-5 text-ink-300 font-light leading-relaxed max-w-2xl">{c.desc}</p>
                <div className="mt-8 inline-flex items-center gap-2 text-sm text-gold-300 group-hover:text-gold-200 font-medium">
                  Read the case study <ArrowUpRight size={16} />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-px overflow-hidden rounded-xl border border-line bg-line lg:max-w-md lg:ml-auto">
                {c.metrics.map((m) => (
                  <div key={m.l} className="bg-bg-base p-5 text-center">
                    <TrendingUp size={14} className="mx-auto text-gold-400/60 mb-2" />
                    <div className="font-display text-2xl font-extralight gold-text">{m.v}</div>
                    <div className="text-[10px] uppercase tracking-[0.2em] text-ink-400 mt-1 leading-tight">{m.l}</div>
                  </div>
                ))}
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="py-24 lg:py-32 bg-bg-surface border-y border-line">
        <div className="container-x text-center">
          <h2 className="section-title mx-auto">Could your story be next?</h2>
          <p className="section-sub mx-auto text-center">Let's talk about the outcomes you're working toward.</p>
          <Link href="/contact" className="btn-gold mt-10">
            Start a conversation <ArrowUpRight size={18} />
          </Link>
        </div>
      </section>
    </>
  );
}
