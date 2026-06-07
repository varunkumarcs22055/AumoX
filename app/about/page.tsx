import Link from "next/link";
import { ArrowUpRight, Target, Eye, Shield, Sparkles, Users, Compass } from "lucide-react";
import { LogoMark } from "@/components/Logo";
import LogoO from "@/components/LogoO";

export const metadata = { title: "About — AUMOXO" };

const values = [
  { i: Target,   t: "Outcomes over output",   d: "We measure ourselves by the business impact we create — not effort spent." },
  { i: Shield,   t: "Trust by design",        d: "Security, privacy and reliability are foundational — not afterthoughts." },
  { i: Sparkles, t: "Engineering excellence", d: "Craft is non-negotiable. We bring senior practitioners to every engagement." },
  { i: Users,    t: "Partner first",          d: "We win when our clients win. Aligned incentives, transparent communication." },
];

export default function AboutPage() {
  return (
    <>
      {/* HERO */}
      <section className="relative overflow-hidden hero-gradient pt-32 lg:pt-44 pb-20">
        <div className="absolute inset-0 grid-overlay opacity-60" />
        <div className="container-x relative">
          <div className="max-w-4xl">
            <div className="eyebrow">
              <span className="h-px w-8 bg-gold-400" />
              About AUMOXO
            </div>
            <h1 className="mt-6 font-display text-5xl md:text-7xl leading-[1.05] font-extralight tracking-tight text-ink-100">
              Helping businesses automate, grow, and innovate through{" "}
              <span className="gold-text">technology</span>.
            </h1>
            <p className="mt-8 max-w-2xl text-lg text-ink-300 font-light">
              AUMOXO is a modern technology partner for organizations that want
              to move faster, operate smarter, and build for what's next.
            </p>
          </div>
        </div>
      </section>

      {/* MISSION */}
      <section className="py-24 lg:py-32">
        <div className="container-x">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="card p-12 gold-border text-center">
              <div className="mx-auto block">
                <LogoMark size={140} className="mx-auto" />
              </div>
              <div className="text-3xl mt-8 font-semibold tracking-[0.16em] text-ink-100 whitespace-nowrap inline-flex items-center justify-center">
                AUM<LogoO size={0.9} spacing={0.04} />X<LogoO size={0.9} spacing={0.04} />
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
                Make world-class technology accessible to every business.
              </h2>
              <p className="section-sub">
                We combine AI, software engineering, and product thinking to help
                organizations move faster, operate smarter, and serve their
                customers better.
              </p>
              <div className="mt-8 grid grid-cols-2 gap-6 pt-8 border-t border-line">
                <div className="flex items-start gap-3">
                  <Target size={20} className="text-gold-400 mt-1 shrink-0" />
                  <div>
                    <div className="font-medium text-ink-100">Mission</div>
                    <div className="text-sm text-ink-300 font-light mt-1">
                      Enable business reinvention through accessible technology.
                    </div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Eye size={20} className="text-gold-400 mt-1 shrink-0" />
                  <div>
                    <div className="font-medium text-ink-100">Vision</div>
                    <div className="text-sm text-ink-300 font-light mt-1">
                      A trusted technology partner for the next decade of business.
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FOUNDER / COMPANY STORY */}
      <section className="py-24 lg:py-32 bg-bg-surface border-y border-line">
        <div className="container-x">
          <div className="max-w-4xl mx-auto">
            <div className="eyebrow">
              <span className="h-px w-8 bg-gold-400" />
              Our Story
            </div>
            <h2 className="section-title mt-5">
              Started with a simple belief.
            </h2>
            <div className="mt-10 space-y-6 text-lg text-ink-200 font-light leading-relaxed">
              <p>
                AUMOXO was started with a simple belief: businesses shouldn't need
                massive budgets to access world-class technology. The companies that
                win the next decade won't be the ones with the deepest pockets —
                they'll be the ones who move fastest with the smartest stack.
              </p>
              <p>
                We combine AI, software engineering, and product thinking to help
                organizations move faster and operate smarter. Whether you're a
                startup shipping your first MVP or an established business
                modernizing core operations, we bring the same craft and rigor.
              </p>
              <p className="text-gold-300 dark:text-gold-200 font-normal">
                Think infinite. Build practical. Ship now.
              </p>
            </div>
            <div className="mt-10 flex items-center gap-4 pt-8 border-t border-line">
              <div className="grid h-12 w-12 place-items-center rounded-full bg-gold-gradient text-black font-medium">
                <Compass size={20} />
              </div>
              <div>
                <div className="text-ink-100 font-medium">The AUMOXO team</div>
                <div className="text-sm text-ink-400">Founders &amp; practitioners</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* VALUES */}
      <section className="py-24 lg:py-32">
        <div className="container-x">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <div className="eyebrow justify-center">
              <span className="h-px w-8 bg-gold-400" />
              Core Values
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

      {/* CTA — replaces Journey timeline + Global footprint + Join the team */}
      <section className="py-24 lg:py-32 bg-bg-surface border-y border-line">
        <div className="container-x text-center">
          <h2 className="section-title mx-auto">Let's build something great together.</h2>
          <p className="section-sub mx-auto text-center">
            Whether you have a clear scope or just an idea — start the conversation.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/contact" className="btn-gold">
              Get in Touch <ArrowUpRight size={18} />
            </Link>
            <Link href="/contact" className="btn-ghost">
              Schedule Consultation
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
