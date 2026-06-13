import Link from "next/link";
import HeroBackground from "@/components/HeroBackground";
import Marquee from "@/components/Marquee";
import Reveal from "@/components/anim/Reveal";
import HeroEntrance, { SplitWords } from "@/components/anim/HeroEntrance";
import MagneticLink from "@/components/anim/MagneticLink";
import FAQ, { type FAQItem } from "@/components/FAQ";
import { insightsDb } from "@/lib/admin/db";

// Shared between the visible accordion and the FAQPage rich-result schema.
const faqs: FAQItem[] = [
  {
    q: "What services does AUMOXO provide?",
    a: "AUMOXO builds AI solutions, custom CRM platforms, business automation systems, enterprise software, web and mobile applications, SaaS products and UI/UX design — and provides technology consulting for businesses planning their digital roadmap.",
  },
  {
    q: "How much does a custom software or CRM project cost?",
    a: "It depends on scope, but most AUMOXO projects start from focused MVP builds and scale up to full enterprise platforms. After a short discovery call we give you a clear fixed quote with line items, GST and timelines — no surprises mid-project.",
  },
  {
    q: "How long does it take to build a web application or CRM?",
    a: "A focused MVP typically ships in 3–6 weeks. Full CRM platforms or multi-module enterprise systems usually take 2–4 months. You watch progress live, phase by phase, in your own client portal.",
  },
  {
    q: "Does AUMOXO provide support after launch?",
    a: "Yes — every project includes AUMOXO Growth Assurance: 6 months of complimentary post-launch support covering bug fixes, security updates, performance monitoring, technical assistance and minor improvements.",
  },
  {
    q: "Can AUMOXO integrate AI into my existing business?",
    a: "Yes. We build AI agents, chatbots and automation that plug into the tools you already use — websites, WhatsApp, CRMs and internal systems — trained on your business knowledge with proper guardrails.",
  },
  {
    q: "How do I track my project's progress with AUMOXO?",
    a: "Every client gets a private portal at aumoxo.tech with a live phase tracker (Discovery → Strategy → Design → Development → Launch → Support), team updates, deliverable downloads, quotations and invoices in one place.",
  },
];
import {
  ArrowUpRight,
  Globe,
  LayoutDashboard,
  Workflow,
  Bot,
  Smartphone,
  Palette,
  Building2,
  Database,
  Sparkles,
  Cpu,
  Rocket,
  Briefcase,
  GraduationCap,
  HeartPulse,
  ShoppingBag,
  Home,
  Users,
  Handshake,
  Target,
  Shield,
} from "lucide-react";

export default async function HomePage() {
  const latestInsights = (await insightsDb.list())
    .filter((i) => i.published)
    .slice(0, 3);
  return (
    <>
      {/* ========== HERO ========== */}
      <section className="relative overflow-hidden hero-gradient pt-32 lg:pt-44 pb-24 lg:pb-32 min-h-[100vh]">
        <div className="absolute inset-0 grid-overlay opacity-40" />
        <HeroBackground />
        <HeroEntrance className="container-x relative z-10">
          <div className="max-w-4xl xl:max-w-3xl">
            <div data-anim="eyebrow" className="eyebrow">
              <span className="h-px w-8 bg-gold-400" />
              Think Infinite · AUMOXO
            </div>
            <h1
              data-anim="title"
              className="mt-6 font-display text-5xl md:text-7xl lg:text-[88px] leading-[1.05] tracking-tight font-extralight text-ink-100"
              style={{ perspective: "800px" }}
            >
              <SplitWords text="Engineering the Next" />
              <br />
              <SplitWords text="Decade of" /> <SplitWords text="Enterprise." className="gold-text shimmer-text font-light" />
            </h1>
            <p data-anim="subtitle" className="mt-8 max-w-2xl text-lg md:text-xl text-ink-300 font-light leading-relaxed">
              AUMOXO develops enterprise-grade software, AI solutions, automation
              systems, and digital products that help organizations innovate faster,
              operate smarter, and scale confidently.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row gap-4">
              <MagneticLink data-anim="cta" href="/contact" className="btn-gold">
                Start a Conversation
                <ArrowUpRight size={18} />
              </MagneticLink>
              <MagneticLink data-anim="cta" href="/services" className="btn-ghost">
                Explore Capabilities
              </MagneticLink>
            </div>
          </div>

          {/* Value pillars — replaces fake enterprise stats */}
          <div className="relative mt-24">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-px overflow-hidden rounded-2xl border border-line bg-line">
              {[
                { i: Sparkles,  t: "AI-First Solutions",        s: "Intelligence in every workflow." },
                { i: Cpu,       t: "Enterprise-Grade Development", s: "Production code, built to last." },
                { i: LayoutDashboard, t: "Custom Software & SaaS",  s: "Made for how you actually work." },
                { i: Rocket,    t: "Built For Scale",            s: "Architected from day one." },
              ].map((s) => (
                <div
                  key={s.t}
                  data-anim="stat"
                  className="bg-bg-surface p-7 lg:p-8 flex flex-col gap-2"
                >
                  <s.i size={20} className="text-gold-400" />
                  <div className="mt-2 font-display text-xl lg:text-2xl font-light text-ink-100">
                    {s.t}
                  </div>
                  <div className="text-sm text-ink-300 font-light leading-relaxed">
                    {s.s}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </HeroEntrance>
      </section>

      {/* ========== BOTTOM STRIP — moving marquee of capabilities ========== */}
      <section className="border-y border-line bg-bg-surface">
        <div className="py-6">
          <Marquee
            speedSeconds={28}
            items={[
              "AI Solutions",
              "Enterprise Software",
              "CRM Platforms",
              "Business Automation",
              "Web & Mobile Development",
              "Custom Software",
              "SaaS Engineering",
              "AI Agents & Chatbots",
              "Mobile Apps",
              "UI / UX Design",
            ].map((label) => (
              <span
                className="flex items-center gap-6 text-[13px] uppercase tracking-[0.25em] text-ink-300 font-medium"
                key={label}
              >
                <span>{label}</span>
                <span className="text-gold-400/60">•</span>
              </span>
            ))}
          />
        </div>
      </section>

      {/* ========== WHAT WE DO — reorganized into 3 pillars ========== */}
      <section className="py-24 lg:py-32">
        <div className="container-x">
          <div className="grid lg:grid-cols-[1fr_2fr] gap-12 lg:gap-20 mb-16">
            <div>
              <div className="eyebrow">
                <span className="h-px w-8 bg-gold-400" />
                What We Do
              </div>
              <h2 className="section-title mt-5">
                A focused capability stack — engineering, AI, and design.
              </h2>
            </div>
            <div className="lg:pt-16">
              <p className="text-lg text-ink-300 font-light leading-relaxed">
                We combine strategy, software engineering, and AI to ship outcomes —
                not just code. Three practices, one team, owned end to end.
              </p>
              <Link
                href="/services"
                className="inline-flex items-center gap-2 mt-6 text-gold-300 hover:text-gold-200 transition-colors font-medium"
              >
                See all services <ArrowUpRight size={16} />
              </Link>
            </div>
          </div>

          <div className="space-y-12">
            {[
              {
                pillar: "Enterprise Solutions",
                items: [
                  { i: Sparkles,  t: "AI Solutions",       d: "Agents, copilots and ML systems integrated where your team actually works." },
                  { i: Briefcase, t: "CRM Platforms",      d: "Custom CRM built around your sales process, customer lifecycle and operations." },
                  { i: Workflow,  t: "Automation Systems", d: "Free your team from repetitive work with workflows, bots and integrations." },
                ],
              },
              {
                pillar: "Product Engineering",
                items: [
                  { i: Globe,     t: "Web Applications",   d: "Production web apps on Next.js + React — fast, accessible, SEO-ready." },
                  { i: Smartphone,t: "Mobile Applications",d: "Native Android and cross-platform apps — store-ready from day one." },
                  { i: LayoutDashboard, t: "SaaS Platforms", d: "Multi-tenant SaaS with auth, billing, admin tooling and analytics." },
                ],
              },
              {
                pillar: "Design",
                items: [
                  { i: Palette,   t: "UI/UX Design",       d: "Research-led design systems, prototypes and pixel-perfect handoff." },
                ],
              },
            ].map((group) => (
              <div key={group.pillar}>
                <div className="text-[11px] uppercase tracking-[0.3em] text-gold-400 mb-5">
                  {group.pillar}
                </div>
                <Reveal stagger=".reveal-card" staggerGap={0.07} className="grid md:grid-cols-2 lg:grid-cols-3 gap-px overflow-hidden rounded-2xl border border-line bg-line">
                  {group.items.map(({ i: Icon, t, d }) => (
                    <div
                      key={t}
                      className="reveal-card group relative bg-bg-base p-8 lg:p-10 transition-all hover:bg-bg-surface"
                    >
                      <div className="grid h-12 w-12 place-items-center rounded-lg border border-gold-400/30 bg-gold-400/5 text-gold-300 group-hover:border-gold-400/60 group-hover:bg-gold-400/10 transition-colors">
                        <Icon size={22} />
                      </div>
                      <h3 className="mt-6 text-xl font-light text-ink-100">{t}</h3>
                      <p className="mt-3 text-sm text-ink-300 leading-relaxed font-light">
                        {d}
                      </p>
                      <Link
                        href="/services"
                        className="inline-flex items-center gap-1.5 mt-6 text-xs uppercase tracking-[0.25em] text-gold-400 hover:text-gold-300 transition-colors"
                      >
                        Learn more <ArrowUpRight size={14} />
                      </Link>
                    </div>
                  ))}
                </Reveal>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ========== INDUSTRIES WE EMPOWER — believable client-centric list ========== */}
      <section className="py-24 lg:py-32 bg-bg-surface border-y border-line relative overflow-hidden">
        <div className="absolute inset-0 grid-overlay opacity-40" />
        <div className="container-x relative">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <div className="eyebrow justify-center">
              <span className="h-px w-8 bg-gold-400" />
              Industries We Empower
              <span className="h-px w-8 bg-gold-400" />
            </div>
            <h2 className="section-title mt-5">
              Built for the businesses that move fast.
            </h2>
          </div>

          <Reveal stagger=".industry-card" staggerGap={0.06} className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-7 gap-4">
            {[
              { i: Rocket,        t: "Startups" },
              { i: Building2,     t: "SMEs" },
              { i: Briefcase,     t: "Professional Services" },
              { i: GraduationCap, t: "Education" },
              { i: HeartPulse,    t: "Healthcare" },
              { i: ShoppingBag,   t: "E-Commerce" },
              { i: Home,          t: "Real Estate" },
            ].map(({ i: Icon, t }) => (
              <Link
                key={t}
                href="/industries"
                className="industry-card group card p-6 flex flex-col items-center text-center"
              >
                <div className="grid h-14 w-14 place-items-center rounded-full border border-gold-400/30 bg-bg-base text-gold-300 group-hover:bg-gold-400/10 group-hover:border-gold-400/60 transition-all">
                  <Icon size={22} />
                </div>
                <div className="mt-4 text-sm text-ink-200 font-light leading-snug">
                  {t}
                </div>
              </Link>
            ))}
          </Reveal>

          <div className="text-center mt-12">
            <Link href="/industries" className="btn-ghost">
              See how we serve each <ArrowUpRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* ========== SOLUTIONS (formerly Products) ========== */}
      <section className="py-24 lg:py-32">
        <div className="container-x">
          <div className="grid lg:grid-cols-[1fr_2fr] gap-12 lg:gap-20 mb-16">
            <div>
              <div className="eyebrow">
                <span className="h-px w-8 bg-gold-400" />
                Our Solutions
              </div>
              <h2 className="section-title mt-5">
                Ready-to-deploy solutions for modern businesses.
              </h2>
            </div>
            <div className="lg:pt-16">
              <p className="text-lg text-ink-300 font-light leading-relaxed">
                Practical software, AI systems and automation frameworks that
                accelerate delivery and reduce development cost.
              </p>
            </div>
          </div>

          <Reveal stagger=".product-card" staggerGap={0.12} className="grid md:grid-cols-3 gap-6">
            {[
              {
                name: "AUMOXO CRM",
                tag: "Coming Soon",
                desc: "Lead tracking, follow-ups and sales pipeline management for teams that sell.",
              },
              {
                name: "AUMOXO AI Assistant",
                tag: "Coming Soon",
                desc: "A custom-trained business assistant connected to your company knowledge.",
              },
              {
                name: "AUMOXO Operations Hub",
                tag: "Coming Soon",
                desc: "Workflow automation and a team operations platform for everyday work.",
              },
            ].map((p) => (
              <div key={p.name} className="product-card card p-8 gold-border flex flex-col">
                <div className="text-[11px] uppercase tracking-[0.3em] text-gold-400">
                  {p.tag}
                </div>
                <h3 className="mt-3 font-display text-2xl font-light text-ink-100">
                  {p.name}
                </h3>
                <p className="mt-4 text-sm text-ink-300 leading-relaxed font-light flex-1">
                  {p.desc}
                </p>
                <Link
                  href="/products"
                  className="inline-flex items-center gap-1.5 mt-6 text-xs uppercase tracking-[0.25em] text-gold-300 hover:text-gold-200"
                >
                  Join the waitlist <ArrowUpRight size={14} />
                </Link>
              </div>
            ))}
          </Reveal>
        </div>
      </section>

      {/* ========== WHY BUSINESSES CHOOSE AUMOXO — replaces fake testimonial ========== */}
      <section className="py-24 lg:py-32 bg-bg-surface border-y border-line">
        <div className="container-x">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <div className="eyebrow justify-center">
              <span className="h-px w-8 bg-gold-400" />
              Why Businesses Choose AUMOXO
              <span className="h-px w-8 bg-gold-400" />
            </div>
            <h2 className="section-title mt-5">
              Four reasons we win the work.
            </h2>
          </div>

          <Reveal stagger=".why-card" staggerGap={0.08} className="grid sm:grid-cols-2 lg:grid-cols-4 gap-px overflow-hidden rounded-2xl border border-line bg-line">
            {[
              { i: Users,     t: "Founder-Led Delivery",      d: "Every project is directly overseen by the leadership team." },
              { i: Sparkles,  t: "AI-First Thinking",         d: "We identify automation opportunities before development begins." },
              { i: Target,    t: "Business-Focused Execution", d: "We focus on measurable outcomes, not technical jargon." },
              { i: Handshake, t: "Long-Term Partnership",     d: "We stay involved beyond launch — building relationships, not transactions." },
            ].map(({ i: Icon, t, d }) => (
              <div key={t} className="why-card bg-bg-base p-8 lg:p-10">
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

      {/* ========== GROWTH ASSURANCE — 6 months post-launch support ========== */}
      <section className="py-24 lg:py-32">
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
                We don't disappear after launch. Every project includes six months
                of included support — so your investment keeps paying off and your
                systems keep getting better.
              </p>
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 mt-6 text-gold-300 hover:text-gold-200 transition-colors font-medium"
              >
                Start a project <ArrowUpRight size={16} />
              </Link>
            </div>
            <Reveal stagger=".assure-tile" staggerGap={0.07} className="grid sm:grid-cols-2 gap-px overflow-hidden rounded-2xl border border-line bg-line">
              {[
                "Bug Fixes",
                "Security Updates",
                "Performance Monitoring",
                "Technical Assistance",
                "Minor Improvements",
              ].map((a) => (
                <div key={a} className="assure-tile bg-bg-base p-7 flex items-center gap-3">
                  <Shield size={18} className="text-gold-400 shrink-0" />
                  <span className="text-ink-100 font-light">{a}</span>
                </div>
              ))}
              <div className="assure-tile bg-bg-base p-7 flex items-center gap-3">
                <Sparkles size={18} className="text-gold-400 shrink-0" />
                <span className="text-ink-300 font-light text-sm">
                  Reduces risk and ensures long-term success.
                </span>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ========== INSIGHTS TEASER — customer-search topics ========== */}
      <section className="py-24 lg:py-32">
        <div className="container-x">
          <div className="flex items-end justify-between flex-wrap gap-6 mb-12">
            <div>
              <div className="eyebrow">
                <span className="h-px w-8 bg-gold-400" />
                Insights
              </div>
              <h2 className="section-title mt-5">
                Practical reads for builders & business leaders.
              </h2>
            </div>
            <Link
              href="/insights"
              className="inline-flex items-center gap-2 text-gold-300 hover:text-gold-200 transition-colors font-medium"
            >
              All insights <ArrowUpRight size={16} />
            </Link>
          </div>

          <Reveal stagger=".insight-card" staggerGap={0.12} className="grid md:grid-cols-3 gap-6">
            {latestInsights.map((a) => (
              <Link
                key={a.id}
                href={a.url || "/insights"}
                target={a.url ? "_blank" : undefined}
                rel={a.url ? "noopener noreferrer" : undefined}
                className="insight-card card p-8 flex flex-col group cursor-pointer"
              >
                <div className="aspect-[16/10] -mx-8 -mt-8 mb-6 bg-gradient-to-br from-gold-400/20 via-bg-elevated to-bg-base relative overflow-hidden">
                  <div className="absolute inset-0 grid-overlay opacity-50" />
                  <div className="absolute bottom-4 left-8 text-[11px] uppercase tracking-[0.3em] text-gold-700 dark:text-gold-300 bg-bg-base/60 border border-gold-400/40 rounded-full px-3 py-1">
                    {a.tag}
                  </div>
                </div>
                <h3 className="text-lg text-ink-100 font-light leading-snug group-hover:text-gold-300 transition-colors">
                  {a.title}
                </h3>
                <div className="mt-auto pt-6 flex items-center justify-between text-xs text-ink-400">
                  <span>{a.readMin} min read</span>
                  <ArrowUpRight
                    size={14}
                    className="text-gold-400 group-hover:translate-x-1 transition-transform"
                  />
                </div>
              </Link>
            ))}
          </Reveal>
        </div>
      </section>

      {/* ========== FAQ — visible answers + FAQPage rich-result schema ========== */}
      <section className="py-24 lg:py-32 bg-bg-surface border-y border-line">
        <div className="container-x">
          <div className="grid lg:grid-cols-[1fr_2fr] gap-12 lg:gap-20">
            <div>
              <div className="eyebrow">
                <span className="h-px w-8 bg-gold-400" />
                FAQ
              </div>
              <h2 className="section-title mt-5">Questions, answered.</h2>
              <p className="section-sub">
                The things businesses ask us before starting a project.
              </p>
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 mt-6 text-gold-300 hover:text-gold-200 transition-colors font-medium"
              >
                Ask something else <ArrowUpRight size={16} />
              </Link>
            </div>
            <Reveal kind="fade-up">
              <FAQ items={faqs} />
            </Reveal>
          </div>
        </div>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "FAQPage",
              mainEntity: faqs.map((f) => ({
                "@type": "Question",
                name: f.q,
                acceptedAnswer: { "@type": "Answer", text: f.a },
              })),
            }),
          }}
        />
      </section>

      {/* ========== CTA ========== */}
      <section className="py-24 lg:py-32 relative overflow-hidden">
        <div className="absolute inset-0 hero-gradient" />
        <div className="absolute inset-0 grid-overlay opacity-50" />
        <div className="container-x relative">
          <Reveal kind="scale-in" className="text-center max-w-3xl mx-auto">
            <h2 className="font-display text-4xl md:text-6xl font-extralight text-ink-100 tracking-tight leading-[1.05]">
              Let's build something <span className="gold-text">great together</span>.
            </h2>
            <p className="mt-6 text-lg text-ink-300 font-light">
              Tell us about your business. We'll respond within one working day.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/contact" className="btn-gold">
                Get in Touch
                <ArrowUpRight size={18} />
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
