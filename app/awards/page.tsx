import Link from "next/link";
import { Award, Trophy, Star, Sparkles, ArrowUpRight } from "lucide-react";

export const metadata = { title: "Awards & Recognition — AUMO.X" };

const awards = [
  { y: "2026", n: "Leader", o: "Global Tech Services Quadrant", c: "Industry Analysis" },
  { y: "2026", n: "Best Workplace", o: "Fortune Magazine", c: "Employer Brand" },
  { y: "2026", n: "Top 50", o: "Forbes World's Most Innovative Companies", c: "Innovation" },
  { y: "2026", n: "Excellence Award", o: "Banking Tech Awards · Best Cloud Transformation", c: "Industry" },
  { y: "2026", n: "Visionary", o: "Enterprise AI Platforms · Independent Analyst", c: "Product" },
  { y: "2025", n: "Top Employer", o: "Top Employers Institute · Global", c: "Employer Brand" },
  { y: "2025", n: "Partner of the Year", o: "Major Hyperscaler · Global SI", c: "Partner" },
  { y: "2025", n: "Sustainability Champion", o: "ESG Today · Tech Services", c: "Sustainability" },
  { y: "2025", n: "Customer Choice", o: "Industry Reviews · Cloud Migration", c: "Customer" },
];

const certifications = [
  "ISO 27001 · Information Security",
  "ISO 9001 · Quality Management",
  "ISO 14001 · Environmental",
  "SOC 2 Type II",
  "HIPAA Compliance",
  "PCI-DSS Level 1",
  "CMMI Level 5",
  "GDPR Aligned",
];

export default function AwardsPage() {
  return (
    <>
      <section className="relative overflow-hidden hero-gradient pt-32 lg:pt-44 pb-20">
        <div className="absolute inset-0 grid-overlay opacity-60" />
        <div className="container-x relative">
          <div className="max-w-4xl">
            <div className="eyebrow"><span className="h-px w-8 bg-gold-400" />Awards & Recognition</div>
            <h1 className="mt-6 font-display text-5xl md:text-7xl leading-[0.95] font-extralight tracking-tight text-ink-100">
              Recognized by those who <span className="gold-text">know</span>.
            </h1>
            <p className="mt-8 max-w-2xl text-lg text-ink-300 font-light">
              From independent analysts to industry juries — a selection of recognitions earned across our practice areas, geographies and culture.
            </p>
          </div>
        </div>
      </section>

      <section className="py-24 lg:py-32">
        <div className="container-x">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {awards.map((a) => (
              <div key={`${a.y}-${a.n}-${a.o}`} className="card p-8 gold-border">
                <div className="flex items-start justify-between">
                  <Trophy size={28} className="text-gold-400" />
                  <div className="font-display text-2xl font-extralight text-ink-400">{a.y}</div>
                </div>
                <div className="mt-6 text-[11px] uppercase tracking-[0.3em] text-gold-400">{a.c}</div>
                <h3 className="mt-2 text-xl font-light text-ink-100">{a.n}</h3>
                <p className="mt-2 text-sm text-ink-300 font-light leading-relaxed">{a.o}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24 lg:py-32 bg-bg-surface border-y border-line">
        <div className="container-x">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <Sparkles className="mx-auto text-gold-400 mb-4" size={24} />
            <h2 className="section-title mx-auto">Certifications & Compliance</h2>
            <p className="section-sub mx-auto text-center">Our delivery is built on industry-leading frameworks for security, quality and trust.</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {certifications.map((c) => (
              <div key={c} className="card p-6 text-center">
                <Star size={16} className="mx-auto text-gold-400 mb-2" />
                <div className="text-sm text-ink-200 font-light">{c}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24 lg:py-32">
        <div className="container-x text-center">
          <Award className="mx-auto text-gold-400 mb-6" size={32} />
          <h2 className="section-title mx-auto">Work with award-winning teams.</h2>
          <Link href="/contact" className="btn-gold mt-10">Start a conversation <ArrowUpRight size={18} /></Link>
        </div>
      </section>
    </>
  );
}
