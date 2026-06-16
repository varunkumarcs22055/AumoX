import Link from "next/link";
import BreadcrumbsLd from "@/components/BreadcrumbsLd";
import { ArrowUpRight, Target, Eye, Shield, Sparkles, Users, Compass } from "lucide-react";
import Logo from "@/components/Logo";
import TeamAvatar from "@/components/TeamAvatar";
import Reveal from "@/components/anim/Reveal";

export const metadata = {
  title: "About AUMOXO — Helping Businesses Innovate Through Technology",
  description:
    "AUMOXO helps businesses automate, grow and innovate through AI, software engineering and product thinking. Learn our story, mission and core values.",
  keywords: ["about AUMOXO", "AUMOXO story", "AUMOXO mission", "AUMOXO team"],
  alternates: { canonical: "/about" },
};

const values = [
  { i: Target,   t: "Outcomes over output",   d: "We measure ourselves by the business impact we create — not effort spent." },
  { i: Shield,   t: "Trust by design",        d: "Security, privacy and reliability are foundational — not afterthoughts." },
  { i: Sparkles, t: "Engineering excellence", d: "Craft is non-negotiable. We bring senior practitioners to every engagement." },
  { i: Users,    t: "Partner first",          d: "We win when our clients win. Aligned incentives, transparent communication." },
];

const leadership = [
  {
    name: "Aditya Singh",
    role: "Founder & CEO",
    initials: "AS",
    photo: "https://res.cloudinary.com/dmbuydq2r/image/upload/v1781552090/aumoxo/team/aditya.jpg",
    focus: ["Product Strategy", "Business Development", "Client Success", "Company Growth"],
  },
  {
    name: "Varun Thakur",
    role: "Co-Founder & CTO",
    initials: "VT",
    photo: "https://res.cloudinary.com/dmbuydq2r/image/upload/v1781552094/aumoxo/team/varun.jpg",
    focus: ["Architecture", "Engineering", "Infrastructure", "Scalability"],
  },
  {
    name: "Prathamesh",
    role: "Head of Engineering",
    initials: "P",
    photo: "https://res.cloudinary.com/dmbuydq2r/image/upload/v1781597789/aumoxo/team/prathamesh.jpg",
    focus: ["Development Operations", "Technical Delivery", "Code Quality", "Project Execution"],
  },
];

const assurance = [
  "Bug Fixes",
  "Security Updates",
  "Performance Monitoring",
  "Technical Assistance",
  "Minor Improvements",
];

export default function AboutPage() {
  return (
    <>
      <BreadcrumbsLd items={[{ name: "About", path: "/about" }]} />
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
          <Reveal stagger=".mission-col" staggerGap={0.15} className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="mission-col card p-12 gold-border text-center">
              <div className="flex justify-center scale-150 origin-center my-6">
                <Logo />
              </div>
            </div>
            <div className="mission-col">
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
          </Reveal>
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
                AUMOXO was founded by <span className="text-ink-100">Aditya Singh</span> and{" "}
                <span className="text-ink-100">Varun Thakur</span> on a simple belief:
                businesses shouldn't need massive budgets or large consulting firms to
                access world-class technology. The companies that win the next decade
                won't be the ones with the deepest pockets — they'll be the ones who
                move fastest with the smartest stack.
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
                <div className="text-ink-100 font-medium">Aditya Singh &amp; Varun Thakur</div>
                <div className="text-sm text-ink-400">Founders, AUMOXO</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* LEADERSHIP */}
      <section className="py-24 lg:py-32">
        <div className="container-x">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <div className="eyebrow justify-center">
              <span className="h-px w-8 bg-gold-400" />
              Leadership
              <span className="h-px w-8 bg-gold-400" />
            </div>
            <h2 className="section-title mt-5">The team behind every engagement.</h2>
            <p className="section-sub mx-auto text-center">
              Founder-led delivery — every project is directly overseen by the leadership team.
            </p>
          </div>
          <Reveal stagger=".leader-card" staggerGap={0.12} className="grid md:grid-cols-3 gap-6">
            {leadership.map((m) => (
              <div key={m.name} className="leader-card card p-8 gold-border flex flex-col">
                <TeamAvatar name={m.name} initials={m.initials} photo={m.photo} size={88} />
                <h3 className="mt-6 font-display text-2xl font-light text-ink-100">{m.name}</h3>
                <div className="mt-1 text-[11px] uppercase tracking-[0.25em] text-gold-400">
                  {m.role}
                </div>
                <ul className="mt-6 space-y-2.5 pt-6 border-t border-line">
                  {m.focus.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm text-ink-200">
                      <Sparkles size={14} className="text-gold-400 shrink-0 mt-0.5" />
                      <span className="font-light">{f}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </Reveal>
          <p className="mt-10 text-center text-ink-300 font-light max-w-3xl mx-auto">
            Together, the leadership team combines entrepreneurial thinking, technical
            expertise, and execution-focused delivery to help businesses build,
            automate, and scale with confidence.
          </p>
        </div>
      </section>

      {/* GROWTH ASSURANCE */}
      <section className="py-24 lg:py-32 bg-bg-surface border-y border-line">
        <div className="container-x">
          <div className="grid lg:grid-cols-[1fr_1.2fr] gap-12 lg:gap-20 items-center">
            <div>
              <div className="eyebrow">
                <span className="h-px w-8 bg-gold-400" />
                AUMOXO Growth Assurance
              </div>
              <h2 className="section-title mt-5">
                6 months of complimentary post-launch support.
              </h2>
              <p className="section-sub">
                We don't disappear after launch. Every project includes six months of
                included support — so your investment keeps paying off and your systems
                keep getting better.
              </p>
            </div>
            <Reveal stagger=".assure-tile" staggerGap={0.07} className="grid sm:grid-cols-2 gap-px overflow-hidden rounded-2xl border border-line bg-line">
              {assurance.map((a) => (
                <div key={a} className="assure-tile bg-bg-base p-7 flex items-center gap-3">
                  <Shield size={18} className="text-gold-400 shrink-0" />
                  <span className="text-ink-100 font-light">{a}</span>
                </div>
              ))}
              <div className="assure-tile bg-bg-base p-7 flex items-center gap-3 sm:col-span-2">
                <Sparkles size={18} className="text-gold-400 shrink-0" />
                <span className="text-ink-300 font-light text-sm">
                  Reduces risk and ensures long-term success.
                </span>
              </div>
            </Reveal>
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
          <Reveal stagger=".value-tile" staggerGap={0.08} className="grid md:grid-cols-2 lg:grid-cols-4 gap-px overflow-hidden rounded-2xl border border-line bg-line">
            {values.map(({ i: Icon, t, d }) => (
              <div key={t} className="value-tile bg-bg-base p-8">
                <div className="grid h-12 w-12 place-items-center rounded-lg border border-gold-400/30 bg-gold-400/5 text-gold-300">
                  <Icon size={20} />
                </div>
                <h3 className="mt-6 text-lg font-light text-ink-100">{t}</h3>
                <p className="mt-3 text-sm text-ink-300 font-light leading-relaxed">{d}</p>
              </div>
            ))}
          </Reveal>
        </div>
      </section>

      {/* CTA — replaces Journey timeline + Global footprint + Join the team */}
      <section className="py-24 lg:py-32 bg-bg-surface border-y border-line">
        <div className="container-x text-center">
          <Reveal kind="scale-in">
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
          </Reveal>
        </div>
      </section>
    </>
  );
}
