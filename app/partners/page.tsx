import Link from "next/link";
import { ArrowUpRight, Handshake, Award, Globe, Shield } from "lucide-react";

export const metadata = {
  title: "Partners — Strategic Alliances & Ecosystem",
};

const tiers = [
  {
    name: "Strategic",
    badge: "Tier 1",
    desc: "Joint go-to-market, co-engineering and executive sponsorship. Reserved for hyperscalers and platform leaders.",
    benefits: ["Joint product roadmap", "Co-marketing programs", "Embedded engineering pods", "Quarterly EBR with CXO"],
  },
  {
    name: "Gold",
    badge: "Tier 2",
    desc: "Deep technical alignment, joint solutions and shared pipeline. For category-leading ISVs and consultancies.",
    benefits: ["Joint solution catalog", "Shared pipeline", "Certification investment", "Annual partner summit"],
  },
  {
    name: "Silver",
    badge: "Tier 3",
    desc: "Referral and resale relationships with co-branded materials and joint success management.",
    benefits: ["Referral commissions", "Resale enablement", "Co-branded collateral", "Quarterly check-ins"],
  },
  {
    name: "Bronze",
    badge: "Community",
    desc: "Open ecosystem partners — developer programs, integrations and community-led initiatives.",
    benefits: ["Developer portal", "Integration listing", "Community forum", "Annual showcase"],
  },
];

export default function PartnersPage() {
  return (
    <>
      <section className="relative overflow-hidden hero-gradient pt-32 lg:pt-44 pb-20">
        <div className="absolute inset-0 grid-overlay opacity-60" />
        <div className="container-x relative">
          <div className="max-w-4xl">
            <div className="eyebrow">
              <span className="h-px w-8 bg-gold-400" />
              Partners
            </div>
            <h1 className="mt-6 font-display text-5xl md:text-7xl leading-[0.95] font-extralight tracking-tight text-ink-100">
              Better, together. <span className="gold-text">Always.</span>
            </h1>
            <p className="mt-8 max-w-2xl text-lg text-ink-300 font-light">
              We win when our partners win. Our ecosystem includes hyperscalers,
              ISVs, advisory firms and integration specialists across the globe.
            </p>
          </div>
        </div>
      </section>

      {/* Partner logos strip */}
      <section className="border-y border-line bg-bg-surface">
        <div className="container-x py-16">
          <div className="text-center text-[11px] uppercase tracking-[0.3em] text-ink-400 mb-10">
            A select view of our ecosystem
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-px overflow-hidden rounded-2xl border border-line bg-line">
            {[
              "ASTRION", "QUANTIVA", "NORDWELL", "MERIDIAN", "VERTEX LABS",
              "HELION", "PARAGON", "STELLAR INC", "OBSIDIAN", "EVERMORE",
              "ARGENTUM", "LUMEN COR",
            ].map((n) => (
              <div
                key={n}
                className="bg-bg-base p-10 grid place-items-center text-base tracking-[0.25em] text-ink-300 font-light hover:text-gold-300 transition-colors"
              >
                {n}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Tiers */}
      <section className="py-24 lg:py-32">
        <div className="container-x">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <div className="eyebrow justify-center">
              <span className="h-px w-8 bg-gold-400" />
              Partnership Tiers
              <span className="h-px w-8 bg-gold-400" />
            </div>
            <h2 className="section-title mt-5">A framework that scales with the relationship.</h2>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {tiers.map((t) => (
              <div key={t.name} className="card p-10 gold-border">
                <div className="flex items-center justify-between">
                  <div className="font-display text-3xl font-light text-ink-100">{t.name}</div>
                  <span className="text-[11px] uppercase tracking-[0.3em] text-gold-400 border border-gold-400/40 rounded-full px-3 py-1">
                    {t.badge}
                  </span>
                </div>
                <p className="mt-4 text-ink-300 font-light leading-relaxed">{t.desc}</p>
                <ul className="mt-6 grid grid-cols-2 gap-3">
                  {t.benefits.map((b) => (
                    <li key={b} className="flex items-start gap-2 text-sm text-ink-200 font-light">
                      <span className="text-gold-400">◆</span> {b}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-24 lg:py-32 bg-bg-surface border-y border-line">
        <div className="container-x">
          <div className="grid lg:grid-cols-3 gap-8">
            {[
              { i: Handshake, t: "Aligned incentives", d: "Joint planning and revenue models that reward outcomes — not just activity." },
              { i: Award, t: "Industry-leading enablement", d: "Certifications, lab credits, and engineering bootcamps for your teams." },
              { i: Globe, t: "Global reach", d: "Plug into our enterprise relationships across 60+ countries." },
              { i: Shield, t: "Compliance & trust", d: "Inherit our ISO 27001, SOC 2 and HIPAA-aligned delivery posture." },
            ].map(({ i: Icon, t, d }) => (
              <div key={t} className="flex gap-5">
                <div className="shrink-0 grid h-12 w-12 place-items-center rounded-lg border border-gold-400/30 bg-gold-400/5 text-gold-300">
                  <Icon size={20} />
                </div>
                <div>
                  <h3 className="text-lg font-light text-ink-100">{t}</h3>
                  <p className="mt-2 text-sm text-ink-300 font-light leading-relaxed">{d}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 lg:py-32">
        <div className="container-x text-center">
          <h2 className="section-title mx-auto">
            Become an AUMO.X partner.
          </h2>
          <p className="section-sub mx-auto text-center">
            Tell us about your organization and the opportunity you see.
          </p>
          <Link href="/contact" className="btn-gold mt-10">
            Start the conversation <ArrowUpRight size={18} />
          </Link>
        </div>
      </section>
    </>
  );
}
