import Link from "next/link";
import { ArrowUpRight, Leaf, Users, Shield, Heart, Globe, Sparkles } from "lucide-react";

export const metadata = { title: "Sustainability — ESG at AUMOXO" };

const pillars = [
  { i: Leaf, t: "Environment", d: "Net-zero across operations by 2032. 100% renewable electricity already achieved across our offices." },
  { i: Users, t: "People & Culture", d: "Diverse, inclusive workplaces with measurable parity goals and transparent compensation practices." },
  { i: Shield, t: "Governance & Ethics", d: "Independent board majority, rigorous compliance and an industry-leading whistleblower program." },
  { i: Heart, t: "Community Impact", d: "AUMO Foundation invests in STEM education for 50,000+ students globally each year." },
];

const goals = [
  { v: "2032", l: "Net-zero operations" },
  { v: "100%", l: "Renewable electricity" },
  { v: "50%", l: "Women in leadership by 2028" },
  { v: "50K+", l: "Students supported annually" },
];

export default function SustainabilityPage() {
  return (
    <>
      <section className="relative overflow-hidden hero-gradient pt-32 lg:pt-44 pb-20">
        <div className="absolute inset-0 grid-overlay opacity-60" />
        <div className="container-x relative">
          <div className="max-w-4xl">
            <div className="eyebrow"><span className="h-px w-8 bg-gold-400" />Sustainability & ESG</div>
            <h1 className="mt-6 font-display text-5xl md:text-7xl leading-[1.05] font-extralight tracking-tight text-ink-100">
              A responsibility to <span className="gold-text">tomorrow</span>.
            </h1>
            <p className="mt-8 max-w-2xl text-lg text-ink-300 font-light">
              Technology that serves the long term — for our clients, our people, our communities and the planet.
            </p>
          </div>
        </div>
      </section>

      {/* Goals */}
      <section className="border-y border-line bg-bg-surface">
        <div className="container-x py-12 grid grid-cols-2 lg:grid-cols-4 gap-px overflow-hidden rounded-2xl border border-line bg-line">
          {goals.map((g) => (
            <div key={g.l} className="bg-bg-base p-8">
              <div className="font-display text-4xl font-extralight gold-text">{g.v}</div>
              <div className="text-[11px] uppercase tracking-[0.25em] text-ink-400 mt-2">{g.l}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Pillars */}
      <section className="py-24 lg:py-32">
        <div className="container-x">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <div className="eyebrow justify-center"><span className="h-px w-8 bg-gold-400" />Our Pillars<span className="h-px w-8 bg-gold-400" /></div>
            <h2 className="section-title mt-5">Four areas where we make measurable progress.</h2>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            {pillars.map(({ i: Icon, t, d }) => (
              <div key={t} className="card p-10 gold-border">
                <div className="grid h-14 w-14 place-items-center rounded-lg border border-gold-400/30 bg-gold-400/5 text-gold-300">
                  <Icon size={22} />
                </div>
                <h3 className="mt-6 text-2xl font-light text-ink-100">{t}</h3>
                <p className="mt-3 text-ink-300 font-light leading-relaxed">{d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Frameworks */}
      <section className="py-24 lg:py-32 bg-bg-surface border-y border-line">
        <div className="container-x grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <Globe className="text-gold-400 mb-4" size={28} />
            <h2 className="section-title">Aligned to global frameworks.</h2>
            <p className="section-sub">Our reporting and operating model align with the most rigorous international standards.</p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {["UN Global Compact", "GRI Standards", "TCFD", "SASB", "ISO 14001", "Science Based Targets"].map((s) => (
              <div key={s} className="card p-6 text-center text-sm text-ink-200 font-light">
                <Sparkles size={16} className="mx-auto text-gold-400 mb-2" />
                {s}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24 lg:py-32">
        <div className="container-x text-center">
          <h2 className="section-title mx-auto">Read the full report.</h2>
          <p className="section-sub mx-auto text-center">Our 2026 Sustainability Report covers progress, methodology and forward commitments in detail.</p>
          <Link href="/investors" className="btn-gold mt-10">Download report <ArrowUpRight size={18} /></Link>
        </div>
      </section>
    </>
  );
}
