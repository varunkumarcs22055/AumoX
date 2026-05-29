import Link from "next/link";
import HeroBackground from "@/components/HeroBackground";
import Reveal from "@/components/anim/Reveal";
import Counter from "@/components/anim/Counter";
import HeroEntrance, { SplitWords } from "@/components/anim/HeroEntrance";
import {
  ArrowUpRight,
  Globe,
  LayoutDashboard,
  Workflow,
  Bot,
  MessageCircle,
  Palette,
  Box,
  Video,
  Share2,
  Smartphone,
  Briefcase,
  Sparkles,
  Banknote,
  HeartPulse,
  Factory,
  ShoppingBag,
  Radio,
  Zap,
  Quote,
} from "lucide-react";

export default function HomePage() {
  return (
    <>
      {/* ========== HERO ========== */}
      <section className="relative overflow-hidden hero-gradient pt-32 lg:pt-44 pb-24 lg:pb-32 min-h-[100vh]">
        <div className="absolute inset-0 grid-overlay opacity-40" />
        <HeroBackground />
        <HeroEntrance className="container-x relative z-10">
          <div className="max-w-4xl">
            <div data-anim="eyebrow" className="eyebrow">
              <span className="h-px w-8 bg-gold-400" />
              Think Infinite · Enterprise Technology
            </div>
            <h1
              data-anim="title"
              className="mt-6 font-display text-5xl md:text-7xl lg:text-[88px] leading-[0.95] tracking-tight font-extralight text-ink-100"
              style={{ perspective: "800px" }}
            >
              <SplitWords text="Engineering the next" />
              <br />
              <SplitWords text="decade of" /> <span className="gold-text font-light"><SplitWords text="enterprise." /></span>
            </h1>
            <p data-anim="subtitle" className="mt-8 max-w-2xl text-lg md:text-xl text-ink-300 font-light leading-relaxed">
              AUMOXO partners with global enterprises to design, build, and
              operate the systems that move industries forward — from intelligent
              cloud to AI-native products.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row gap-4">
              <Link data-anim="cta" href="/contact" className="btn-gold">
                Start a Conversation
                <ArrowUpRight size={18} />
              </Link>
              <Link data-anim="cta" href="/services" className="btn-ghost">
                Explore Capabilities
              </Link>
            </div>
          </div>

          {/* Stats bar (animated count-up on view) */}
          <div className="relative mt-24">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-px overflow-hidden rounded-2xl border border-line bg-line">
              {[
                { v: 60, suf: "+", l: "Countries served" },
                { v: 250, suf: "+", l: "Enterprise clients" },
                { v: 1200, suf: "+", l: "Engineers worldwide" },
                { v: 99.99, suf: "%", dec: 2, l: "Platform availability" },
              ].map((s) => (
                <div
                  key={s.l}
                  data-anim="stat"
                  className="bg-bg-surface p-8 lg:p-10 flex flex-col gap-2"
                >
                  <div className="font-display text-4xl lg:text-5xl font-extralight gold-text">
                    <Counter to={s.v} suffix={s.suf} decimals={s.dec ?? 0} />
                  </div>
                  <div className="text-xs uppercase tracking-[0.25em] text-ink-400">
                    {s.l}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </HeroEntrance>
      </section>

      {/* ========== TRUSTED BY ========== */}
      <section className="border-y border-line bg-bg-surface">
        <div className="container-x py-16">
          <div className="flex items-center justify-center gap-4 mb-12">
            <span className="h-px w-12 bg-gradient-to-r from-transparent to-gold-400/60" />
            <span className="text-[11px] uppercase tracking-[0.35em] text-ink-300 font-medium">
              Trusted by leaders across 60+ countries
            </span>
            <span className="h-px w-12 bg-gradient-to-l from-transparent to-gold-400/60" />
          </div>

          <div className="marquee">
            <div className="marquee-track">
              {[
                "ASTRION", "QUANTIVA", "NORDWELL", "MERIDIAN", "VERTEX LABS",
                "HELION", "PARAGON", "STELLAR", "OBSIDIAN", "EVERMORE",
                "ARGENTUM", "LUMEN COR",
                "ASTRION", "QUANTIVA", "NORDWELL", "MERIDIAN", "VERTEX LABS",
                "HELION", "PARAGON", "STELLAR", "OBSIDIAN", "EVERMORE",
                "ARGENTUM", "LUMEN COR",
              ].map((name, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 px-2 whitespace-nowrap text-ink-400 hover:text-gold-600 dark:hover:text-gold-300 transition-colors"
                >
                  <span className="h-2 w-2 rounded-full bg-gold-400/40" />
                  <span className="font-display text-2xl font-extralight tracking-[0.28em]">
                    {name}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-px overflow-hidden rounded-xl border border-line bg-line">
            {[
              { v: "250+", l: "Enterprise clients" },
              { v: "92%",  l: "Client retention" },
              { v: "4.9★", l: "Avg engagement rating" },
              { v: "15+",  l: "Decade-long partnerships" },
            ].map((s) => (
              <div key={s.l} className="bg-bg-base px-6 py-7 text-center">
                <div className="font-display text-2xl lg:text-3xl font-extralight gold-text">{s.v}</div>
                <div className="mt-1 text-[11px] uppercase tracking-[0.25em] text-ink-400">{s.l}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ========== WHAT WE DO ========== */}
      <section className="py-24 lg:py-32">
        <div className="container-x">
          <div className="grid lg:grid-cols-[1fr_2fr] gap-12 lg:gap-20 mb-16">
            <div>
              <div className="eyebrow">
                <span className="h-px w-8 bg-gold-400" />
                What We Do
              </div>
              <h2 className="section-title mt-5">
                A complete capability stack for the modern enterprise.
              </h2>
            </div>
            <div className="lg:pt-16">
              <p className="text-lg text-ink-300 font-light leading-relaxed">
                We bring together strategy, engineering, and operations to
                deliver outcomes that compound — across every layer of your
                technology landscape.
              </p>
              <Link
                href="/services"
                className="inline-flex items-center gap-2 mt-6 text-gold-300 hover:text-gold-200 transition-colors font-medium"
              >
                See all services <ArrowUpRight size={16} />
              </Link>
            </div>
          </div>

          <Reveal stagger=".reveal-card" staggerGap={0.07} className="grid md:grid-cols-2 lg:grid-cols-3 gap-px overflow-hidden rounded-2xl border border-line bg-line">
            {[
              { i: Globe, t: "Web Applications", d: "Modern web apps built on Next.js + React — fast, accessible, SEO-ready and engineered to scale." },
              { i: LayoutDashboard, t: "SaaS Dashboards", d: "End-to-end SaaS product engineering — multi-tenant, billing, auth, analytics and admin tools." },
              { i: Bot, t: "AI Agents & Chatbots", d: "Production-grade agents and conversational AI — built on Claude, GPT or open models with guardrails." },
              { i: Smartphone, t: "Android Applications", d: "Native Kotlin and cross-platform Flutter / React Native apps — Play Store ready from day one." },
              { i: Workflow, t: "Automation Services", d: "Workflow automation, bots and integrations that free your team from repetitive work." },
              { i: Palette, t: "UI/UX Design", d: "Design that closes deals — research, systems, prototypes and pixel-perfect handoff." },
              { i: Share2, t: "Social Media Management", d: "Full-service social — content calendars, post production, engagement and performance reporting." },
              { i: Box, t: "3D Modelling", d: "Photoreal product renders, hero scenes and animation-ready assets for web and marketing." },
              { i: Video, t: "Video Editing", d: "Reels, ad creatives, brand films and product demos — story-led editing with motion design." },
            ].map(({ i: Icon, t, d }) => (
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
      </section>

      {/* ========== INDUSTRIES ========== */}
      <section className="py-24 lg:py-32 bg-bg-surface border-y border-line relative overflow-hidden">
        <div className="absolute inset-0 grid-overlay opacity-40" />
        <div className="container-x relative">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <div className="eyebrow justify-center">
              <span className="h-px w-8 bg-gold-400" />
              Industries
              <span className="h-px w-8 bg-gold-400" />
            </div>
            <h2 className="section-title mt-5">
              Deep expertise across regulated and digital-first industries.
            </h2>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {[
              { i: Banknote, t: "Banking & Financial" },
              { i: HeartPulse, t: "Healthcare & Life Sciences" },
              { i: Factory, t: "Manufacturing" },
              { i: ShoppingBag, t: "Retail & CPG" },
              { i: Radio, t: "Telecom & Media" },
              { i: Zap, t: "Energy & Utilities" },
            ].map(({ i: Icon, t }) => (
              <Link
                key={t}
                href="/industries"
                className="group card p-6 flex flex-col items-center text-center"
              >
                <div className="grid h-14 w-14 place-items-center rounded-full border border-gold-400/30 bg-bg-base text-gold-300 group-hover:bg-gold-400/10 group-hover:border-gold-400/60 transition-all">
                  <Icon size={22} />
                </div>
                <div className="mt-4 text-sm text-ink-200 font-light leading-snug">
                  {t}
                </div>
              </Link>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link href="/industries" className="btn-ghost">
              View all industries <ArrowUpRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* ========== PRODUCTS ========== */}
      <section className="py-24 lg:py-32">
        <div className="container-x">
          <div className="grid lg:grid-cols-[1fr_2fr] gap-12 lg:gap-20 mb-16">
            <div>
              <div className="eyebrow">
                <span className="h-px w-8 bg-gold-400" />
                Our Products
              </div>
              <h2 className="section-title mt-5">
                Software platforms engineered for enterprise scale.
              </h2>
            </div>
            <div className="lg:pt-16">
              <p className="text-lg text-ink-300 font-light leading-relaxed">
                Three flagship platforms power critical workloads for our
                clients — built with the same rigor we bring to bespoke
                engagements.
              </p>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                name: "AUMOXO Nexus",
                tag: "Integration Platform",
                desc: "200+ connectors, low-code workflows, and event-driven orchestration deployed in the cloud or your VPC.",
              },
              {
                name: "AUMOXO Atlas",
                tag: "Unified Data Platform",
                desc: "Ingestion, governance, semantic layer and GenAI-ready APIs in one cohesive experience.",
              },
              {
                name: "AUMOXO Pulse",
                tag: "Observability Suite",
                desc: "Traces, metrics, logs and SLO-aware alerting with 13-month retention for regulated industries.",
              },
            ].map((p) => (
              <div key={p.name} className="card p-8 gold-border flex flex-col">
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
                  Explore product <ArrowUpRight size={14} />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ========== CASE STUDY / TESTIMONIAL ========== */}
      <section className="py-24 lg:py-32 bg-bg-surface border-y border-line">
        <div className="container-x">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <div className="eyebrow">
                <span className="h-px w-8 bg-gold-400" />
                Featured Outcome
              </div>
              <h2 className="section-title mt-5">
                $48M saved over three years for a global bank.
              </h2>
              <p className="section-sub">
                We led a multi-cloud consolidation across 14 business units —
                modernizing 320 applications, automating 90% of operations, and
                reducing change failure rate by 78%.
              </p>
              <div className="mt-8 grid grid-cols-3 gap-6">
                {[
                  { v: "320", l: "Apps modernized" },
                  { v: "78%", l: "Lower CFR" },
                  { v: "5.2x", l: "Deploy frequency" },
                ].map((s) => (
                  <div key={s.l}>
                    <div className="font-display text-3xl font-extralight gold-text">
                      {s.v}
                    </div>
                    <div className="mt-1 text-[11px] uppercase tracking-[0.25em] text-ink-400">
                      {s.l}
                    </div>
                  </div>
                ))}
              </div>
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 mt-10 text-gold-300 hover:text-gold-200 font-medium"
              >
                Read the full story <ArrowUpRight size={16} />
              </Link>
            </div>
            <div className="card p-10 gold-border relative">
              <Quote className="absolute top-6 right-6 text-gold-400/30" size={56} />
              <p className="text-xl lg:text-2xl font-light text-ink-100 leading-relaxed">
                "AUMOXO didn't just deliver a migration — they re-architected
                how our technology organization operates. The financial impact
                was immediate. The cultural impact has been lasting."
              </p>
              <div className="mt-8 flex items-center gap-4 pt-6 border-t border-line">
                <div className="h-12 w-12 rounded-full bg-gold-gradient grid place-items-center text-black font-medium">
                  PM
                </div>
                <div>
                  <div className="text-ink-100 font-medium">Priya Mehta</div>
                  <div className="text-sm text-ink-400">
                    Group CTO · Global Tier-1 Bank
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========== INSIGHTS ========== */}
      <section className="py-24 lg:py-32">
        <div className="container-x">
          <div className="flex items-end justify-between flex-wrap gap-6 mb-12">
            <div>
              <div className="eyebrow">
                <span className="h-px w-8 bg-gold-400" />
                Insights
              </div>
              <h2 className="section-title mt-5">
                Perspectives from our practitioners.
              </h2>
            </div>
            <Link href="/about" className="btn-ghost">
              All insights
            </Link>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                tag: "GenAI",
                title: "The enterprise GenAI maturity model — five stages to value",
                date: "May 2026",
              },
              {
                tag: "Cloud",
                title: "Multi-cloud FinOps: how leaders cut 40% in 90 days",
                date: "Apr 2026",
              },
              {
                tag: "Security",
                title: "Zero-trust beyond identity — the operating model shift",
                date: "Mar 2026",
              },
            ].map((a) => (
              <article
                key={a.title}
                className="card p-8 flex flex-col group cursor-pointer"
              >
                <div className="aspect-[16/10] -mx-8 -mt-8 mb-6 bg-gradient-to-br from-gold-400/20 via-bg-elevated to-bg-base relative overflow-hidden">
                  <div className="absolute inset-0 grid-overlay opacity-50" />
                  <div className="absolute bottom-4 left-8 text-[11px] uppercase tracking-[0.3em] text-gold-400">
                    {a.tag}
                  </div>
                </div>
                <h3 className="text-lg text-ink-100 font-light leading-snug group-hover:text-gold-300 transition-colors">
                  {a.title}
                </h3>
                <div className="mt-auto pt-6 flex items-center justify-between text-xs text-ink-400">
                  <span>{a.date}</span>
                  <ArrowUpRight
                    size={14}
                    className="text-gold-400 group-hover:translate-x-1 transition-transform"
                  />
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ========== CTA ========== */}
      <section className="py-24 lg:py-32 relative overflow-hidden">
        <div className="absolute inset-0 hero-gradient" />
        <div className="absolute inset-0 grid-overlay opacity-50" />
        <div className="container-x relative">
          <div className="text-center max-w-3xl mx-auto">
            <h2 className="font-display text-4xl md:text-6xl font-extralight text-ink-100 tracking-tight leading-[1.05]">
              Ready to build what's <span className="gold-text">next</span>?
            </h2>
            <p className="mt-6 text-lg text-ink-300 font-light">
              Tell us about your business. We'll respond within one working day.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/contact" className="btn-gold">
                Start a Conversation
                <ArrowUpRight size={18} />
              </Link>
              <Link href="/services" className="btn-ghost">
                See Services
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
