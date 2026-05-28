import Link from "next/link";
import { ArrowUpRight, MapPin, Globe } from "lucide-react";

export const metadata = { title: "Global Locations — AUMO.X Offices Worldwide" };

const regions = [
  {
    region: "Americas",
    offices: [
      { city: "New York", country: "USA", role: "HQ — Americas", hub: "Financial Services" },
      { city: "San Francisco", country: "USA", role: "Engineering Hub", hub: "AI & Cloud" },
      { city: "Austin", country: "USA", role: "Delivery Center" },
      { city: "Toronto", country: "Canada", role: "Delivery Center" },
      { city: "Mexico City", country: "Mexico", role: "Delivery Center" },
      { city: "São Paulo", country: "Brazil", role: "Regional Hub — LATAM" },
    ],
  },
  {
    region: "EMEA",
    offices: [
      { city: "London", country: "United Kingdom", role: "HQ — EMEA", hub: "Financial Services" },
      { city: "Berlin", country: "Germany", role: "Engineering Hub" },
      { city: "Paris", country: "France", role: "Delivery Center" },
      { city: "Amsterdam", country: "Netherlands", role: "Delivery Center" },
      { city: "Lisbon", country: "Portugal", role: "Delivery Center" },
      { city: "Dubai", country: "UAE", role: "Regional Hub — Middle East" },
    ],
  },
  {
    region: "APAC",
    offices: [
      { city: "Bengaluru", country: "India", role: "Global Engineering HQ", hub: "Engineering" },
      { city: "Mumbai", country: "India", role: "Financial Services Hub" },
      { city: "Hyderabad", country: "India", role: "Delivery Center" },
      { city: "Singapore", country: "Singapore", role: "HQ — APAC" },
      { city: "Sydney", country: "Australia", role: "Delivery Center" },
      { city: "Tokyo", country: "Japan", role: "Delivery Center" },
    ],
  },
];

export default function LocationsPage() {
  return (
    <>
      <section className="relative overflow-hidden hero-gradient pt-32 lg:pt-44 pb-20">
        <div className="absolute inset-0 grid-overlay opacity-60" />
        <div className="container-x relative">
          <div className="max-w-4xl">
            <div className="eyebrow"><span className="h-px w-8 bg-gold-400" />Global Locations</div>
            <h1 className="mt-6 font-display text-5xl md:text-7xl leading-[0.95] font-extralight tracking-tight text-ink-100">
              Where we <span className="gold-text">deliver</span>.
            </h1>
            <p className="mt-8 max-w-2xl text-lg text-ink-300 font-light">
              18 delivery hubs across 60+ countries — follow-the-sun operations and on-the-ground client teams worldwide.
            </p>
          </div>
        </div>
      </section>

      <section className="border-y border-line bg-bg-surface">
        <div className="container-x py-12 grid grid-cols-2 lg:grid-cols-4 gap-px overflow-hidden rounded-2xl border border-line bg-line">
          {[
            { v: "60+", l: "Countries" }, { v: "18", l: "Delivery hubs" },
            { v: "24×7", l: "Coverage" }, { v: "12+", l: "Languages" },
          ].map((s) => (
            <div key={s.l} className="bg-bg-base p-8">
              <Globe size={18} className="text-gold-400 mb-3" />
              <div className="font-display text-3xl font-extralight gold-text">{s.v}</div>
              <div className="text-[11px] uppercase tracking-[0.25em] text-ink-400 mt-2">{s.l}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="py-24 lg:py-32 space-y-20">
        {regions.map((r) => (
          <div key={r.region} className="container-x">
            <div className="flex items-center gap-4 mb-10">
              <div className="h-px flex-1 bg-gradient-to-r from-transparent via-gold-400/40 to-transparent" />
              <h2 className="font-display text-3xl font-extralight text-ink-100 tracking-[0.15em] uppercase">{r.region}</h2>
              <div className="h-px flex-1 bg-gradient-to-r from-transparent via-gold-400/40 to-transparent" />
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {r.offices.map((o) => (
                <div key={o.city} className="card p-6 group">
                  <div className="flex items-start gap-4">
                    <div className="shrink-0 grid h-10 w-10 place-items-center rounded-lg border border-gold-400/30 bg-gold-400/5 text-gold-300">
                      <MapPin size={16} />
                    </div>
                    <div className="flex-1">
                      <div className="text-lg text-ink-100 font-light">{o.city}</div>
                      <div className="text-xs text-ink-400">{o.country}</div>
                      <div className="mt-2 text-[11px] uppercase tracking-[0.25em] text-gold-400">{o.role}</div>
                      {o.hub && (
                        <div className="mt-1 text-[10px] uppercase tracking-[0.2em] text-ink-400">Focus: {o.hub}</div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </section>

      <section className="py-24 lg:py-32 bg-bg-surface border-y border-line">
        <div className="container-x text-center">
          <h2 className="section-title mx-auto">Need a local team?</h2>
          <Link href="/contact" className="btn-gold mt-10">Get in touch <ArrowUpRight size={18} /></Link>
        </div>
      </section>
    </>
  );
}
