import Link from "next/link";
import {
  ArrowUpRight,
  Banknote,
  HeartPulse,
  Factory,
  ShoppingBag,
  Radio,
  Zap,
  GraduationCap,
  Plane,
} from "lucide-react";

export const metadata = {
  title: "Industries — Deep Expertise Across Sectors",
};

const industries = [
  { i: Banknote, t: "Banking & Financial Services", d: "Core modernization, digital banking, risk and regulatory programs across retail, commercial and capital markets.", stat: "60+", statL: "Tier-1 clients" },
  { i: HeartPulse, t: "Healthcare & Life Sciences", d: "Connected care, clinical platforms and HIPAA-compliant data engineering for providers, payers and biotech.", stat: "HIPAA", statL: "Compliant" },
  { i: Factory, t: "Manufacturing & Industrial", d: "Industry 4.0, smart factories, IoT and supply chain platforms for global manufacturers.", stat: "30+", statL: "Smart factories" },
  { i: ShoppingBag, t: "Retail & Consumer Goods", d: "Unified commerce, demand sensing, store experience and direct-to-consumer engineering.", stat: "120M+", statL: "Shoppers reached" },
  { i: Radio, t: "Telecom & Media", d: "5G OSS/BSS, content platforms and customer experience modernization at hyperscale.", stat: "5G", statL: "Programs live" },
  { i: Zap, t: "Energy & Utilities", d: "Smart grid, asset performance and clean-energy data platforms for transition-era operators.", stat: "12 GW", statL: "Assets monitored" },
  { i: GraduationCap, t: "Public Sector & Education", d: "Citizen services, modernization and learning platforms with strict accessibility and compliance.", stat: "WCAG", statL: "AA delivered" },
  { i: Plane, t: "Travel & Hospitality", d: "Reservation systems, loyalty engines and unified guest experience for global brands.", stat: "40+", statL: "Brands served" },
];

export default function IndustriesPage() {
  return (
    <>
      <section className="relative overflow-hidden hero-gradient pt-32 lg:pt-44 pb-20">
        <div className="absolute inset-0 grid-overlay opacity-60" />
        <div className="container-x relative">
          <div className="max-w-4xl">
            <div className="eyebrow">
              <span className="h-px w-8 bg-gold-400" />
              Industries
            </div>
            <h1 className="mt-6 font-display text-5xl md:text-7xl leading-[0.95] font-extralight tracking-tight text-ink-100">
              Domain depth meets <span className="gold-text">engineering scale</span>.
            </h1>
            <p className="mt-8 max-w-2xl text-lg text-ink-300 font-light">
              We bring deep sector knowledge to every engagement — paired with the engineering
              muscle to operationalize it at enterprise scale.
            </p>
          </div>
        </div>
      </section>

      <section className="py-24 lg:py-32">
        <div className="container-x">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {industries.map(({ i: Icon, t, d, stat, statL }) => (
              <div key={t} className="card p-8 flex flex-col group">
                <div className="grid h-14 w-14 place-items-center rounded-lg border border-gold-400/30 bg-gold-400/5 text-gold-300 group-hover:bg-gold-400/10 transition-colors">
                  <Icon size={22} />
                </div>
                <h3 className="mt-6 text-xl font-light text-ink-100 leading-snug">{t}</h3>
                <p className="mt-3 text-sm text-ink-300 font-light leading-relaxed flex-1">{d}</p>
                <div className="mt-6 pt-6 border-t border-line flex items-center justify-between">
                  <div>
                    <div className="font-display text-2xl font-extralight gold-text">{stat}</div>
                    <div className="text-[10px] uppercase tracking-[0.25em] text-ink-400 mt-1">{statL}</div>
                  </div>
                  <Link
                    href="/contact"
                    className="text-gold-400 hover:text-gold-300 transition-colors"
                    aria-label={`Learn more about ${t}`}
                  >
                    <ArrowUpRight size={20} />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24 lg:py-32 bg-bg-surface border-y border-line">
        <div className="container-x text-center">
          <h2 className="section-title mx-auto">
            Don't see your industry?
          </h2>
          <p className="section-sub mx-auto text-center">
            Our cross-domain capabilities translate. Let's talk about your context.
          </p>
          <Link href="/contact" className="btn-gold mt-10">
            Get in touch <ArrowUpRight size={18} />
          </Link>
        </div>
      </section>
    </>
  );
}
