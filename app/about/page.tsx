import Link from "next/link";
import { ArrowUpRight, Target, Eye, Shield, Sparkles, Users, Globe } from "lucide-react";
import { LogoMark } from "@/components/Logo";
import LogoO from "@/components/LogoO";

export const metadata = {
  title: "About — Think Infinite",
};

const values = [
  { i: Target, t: "Outcomes over output", d: "We measure ourselves by the business impact we create — not effort spent." },
  { i: Shield, t: "Trust by design", d: "Security, privacy and compliance are foundational — never afterthoughts." },
  { i: Sparkles, t: "Engineering excellence", d: "Craft is non-negotiable. We hire and develop the top 1% of practitioners." },
  { i: Users, t: "Partner first", d: "We win when our clients and partners win. Aligned incentives, always." },
];

const milestones = [
  { y: "2024", t: "Founded", d: "AUMOXO founded with a vision to redefine enterprise technology partnership." },
  { y: "2025", t: "First 50 enterprises", d: "Scaled to serve 50+ global enterprise clients across 12 countries." },
  { y: "2026", t: "Platform launch", d: "Released AUMOXO Nexus, Atlas and Pulse — our flagship enterprise platforms." },
  { y: "Today", t: "Global scale", d: "1.2K+ engineers across 60+ countries, serving 250+ enterprise customers." },
];

export default function AboutPage() {
  return (
    <>
      <section className="relative overflow-hidden hero-gradient pt-32 lg:pt-44 pb-20">
        <div className="absolute inset-0 grid-overlay opacity-60" />
        <div className="container-x relative">
          <div className="max-w-4xl">
            <div className="eyebrow">
              <span className="h-px w-8 bg-gold-400" />
              About AUMOXO
            </div>
            <h1 className="mt-6 font-display text-5xl md:text-7xl leading-[1.05] font-extralight tracking-tight text-ink-100">
              Built for the enterprises <span className="gold-text">shaping tomorrow</span>.
            </h1>
            <p className="mt-8 max-w-2xl text-lg text-ink-300 font-light">
              We are technologists, engineers and strategists united by a single
              belief — that the next decade of enterprise will be defined by
              those who think infinite.
            </p>
          </div>
        </div>
      </section>

      {/* Mission */}
      <section className="py-24 lg:py-32">
        <div className="container-x">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="card p-12 gold-border text-center">
              <LogoMark size={120} className="mx-auto" />
              <div className="wordmark text-3xl mt-8 whitespace-nowrap">
                AUM<LogoO />X<LogoO />
              </div>
              <div className="text-xs tracking-[0.4em] uppercase text-gold-400 mt-3">
                Think Infinite
              </div>
            </div>
            <div>
              <div className="eyebrow">
                <span className="h-px w-8 bg-gold-400" />
                Our Mission
              </div>
              <h2 className="section-title mt-5">
                To unlock infinite potential within every enterprise we serve.
              </h2>
              <p className="section-sub">
                AUMOXO exists at the intersection of strategy, engineering and
                operations. We combine deep technical capability with sector
                expertise to help leaders move faster, build smarter and operate
                with confidence at any scale.
              </p>
              <div className="mt-8 grid grid-cols-2 gap-6 pt-8 border-t border-line">
                <div className="flex items-start gap-3">
                  <Target size={20} className="text-gold-400 mt-1 shrink-0" />
                  <div>
                    <div className="font-medium text-ink-100">Mission</div>
                    <div className="text-sm text-ink-300 font-light mt-1">
                      Enable enterprise reinvention through technology.
                    </div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Eye size={20} className="text-gold-400 mt-1 shrink-0" />
                  <div>
                    <div className="font-medium text-ink-100">Vision</div>
                    <div className="text-sm text-ink-300 font-light mt-1">
                      The world's most trusted enterprise technology partner.
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-24 lg:py-32 bg-bg-surface border-y border-line">
        <div className="container-x">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <div className="eyebrow justify-center">
              <span className="h-px w-8 bg-gold-400" />
              Our Values
              <span className="h-px w-8 bg-gold-400" />
            </div>
            <h2 className="section-title mt-5">The principles we operate by.</h2>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-px overflow-hidden rounded-2xl border border-line bg-line">
            {values.map(({ i: Icon, t, d }) => (
              <div key={t} className="bg-bg-base p-8">
                <div className="grid h-12 w-12 place-items-center rounded-lg border border-gold-400/30 bg-gold-400/5 text-gold-300">
                  <Icon size={20} />
                </div>
                <h3 className="mt-6 text-lg font-light text-ink-100">{t}</h3>
                <p className="mt-3 text-sm text-ink-300 font-light leading-relaxed">{d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="py-24 lg:py-32">
        <div className="container-x">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <div className="eyebrow justify-center">
              <span className="h-px w-8 bg-gold-400" />
              Our Journey
              <span className="h-px w-8 bg-gold-400" />
            </div>
            <h2 className="section-title mt-5">Milestones on the road so far.</h2>
          </div>
          <div className="relative max-w-4xl mx-auto">
            <div className="absolute left-4 md:left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-gold-400/40 to-transparent" />
            <div className="space-y-12">
              {milestones.map((m, i) => (
                <div
                  key={m.y}
                  className={`relative flex items-center gap-8 md:gap-12 ${
                    i % 2 === 1 ? "md:flex-row-reverse md:text-right" : ""
                  }`}
                >
                  <div className="absolute left-4 md:left-1/2 -translate-x-1/2 h-3 w-3 rounded-full bg-gold-400 ring-4 ring-bg-base" />
                  <div className="hidden md:block flex-1" />
                  <div className="flex-1 pl-12 md:pl-0 md:px-12">
                    <div className="font-display text-3xl font-extralight gold-text">{m.y}</div>
                    <h3 className="mt-2 text-xl font-light text-ink-100">{m.t}</h3>
                    <p className="mt-2 text-sm text-ink-300 font-light leading-relaxed">{m.d}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Global footprint */}
      <section className="py-24 lg:py-32 bg-bg-surface border-y border-line">
        <div className="container-x">
          <div className="grid lg:grid-cols-[1fr_2fr] gap-12 items-end">
            <div>
              <div className="eyebrow">
                <span className="h-px w-8 bg-gold-400" />
                Global Footprint
              </div>
              <h2 className="section-title mt-5">A truly global delivery model.</h2>
            </div>
            <p className="text-ink-300 font-light text-lg leading-relaxed lg:pb-3">
              With engineering hubs across the Americas, Europe and Asia, we deliver
              follow-the-sun operations and 24×7 mission-critical support.
            </p>
          </div>
          <div className="mt-12 grid grid-cols-2 lg:grid-cols-4 gap-px overflow-hidden rounded-2xl border border-line bg-line">
            {[
              { v: "60+", l: "Countries" },
              { v: "18", l: "Delivery hubs" },
              { v: "24×7", l: "Operations" },
              { v: "12+", l: "Languages" },
            ].map((s) => (
              <div key={s.l} className="bg-bg-base p-8 text-center">
                <Globe className="mx-auto text-gold-400 mb-3" size={20} />
                <div className="font-display text-3xl font-extralight gold-text">{s.v}</div>
                <div className="text-[11px] uppercase tracking-[0.25em] text-ink-400 mt-1">
                  {s.l}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 lg:py-32">
        <div className="container-x text-center">
          <h2 className="section-title mx-auto">Join the team. Or work with us.</h2>
          <p className="section-sub mx-auto text-center">
            We're hiring across engineering, design and consulting — globally.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/contact" className="btn-gold">
              Get in touch <ArrowUpRight size={18} />
            </Link>
            <Link href="/contact" className="btn-ghost">
              See open roles
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
