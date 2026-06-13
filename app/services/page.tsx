import Link from "next/link";
import BreadcrumbsLd from "@/components/BreadcrumbsLd";
import Reveal from "@/components/anim/Reveal";
import Tilt3D from "@/components/anim/Tilt3D";
import {
  ArrowUpRight,
  CheckCircle2,
  Globe,
  LayoutDashboard,
  Smartphone,
  Workflow,
  Bot,
  MessageCircle,
  Palette,
  Briefcase,
  Building2,
  Sparkles,
} from "lucide-react";

export const metadata = {
  title: "Services — AI, CRM, Automation, Web & Mobile Development",
  description:
    "AUMOXO services: AI solutions, custom CRM platforms, business automation systems, enterprise software, web applications, SaaS platforms, mobile apps, UI/UX design and technology consulting.",
  keywords: [
    "AI solutions", "AI agents", "AI chatbot development",
    "custom CRM development", "CRM platform", "sales automation",
    "business automation", "workflow automation",
    "enterprise software development", "internal business software",
    "web application development", "Next.js development",
    "SaaS development", "multi-tenant SaaS",
    "Android app development", "Flutter app development",
    "UI/UX design services", "technology consulting",
  ],
  alternates: { canonical: "/services" },
};

const pillars = [
  {
    pillar: "Enterprise Solutions",
    blurb:
      "Software systems that run the business — built around your workflows, not a generic template.",
    services: [
      {
        i: Sparkles,
        name: "AI Solutions",
        desc: "Agents, copilots and ML systems integrated where your team works. Built on Claude, GPT or open models with proper guardrails.",
        deliverables: ["AI agents", "Custom chatbots", "RAG over your data", "Evaluation & guardrails"],
      },
      {
        i: Briefcase,
        name: "CRM Solutions",
        desc: "Custom CRM systems built around your sales process, customer lifecycle and operational workflows.",
        deliverables: ["Lead Management", "Pipeline Tracking", "Sales Automation", "Reporting & Analytics"],
      },
      {
        i: Workflow,
        name: "Automation Systems",
        desc: "Free your team from repetitive work — workflow automation, integrations and AI-powered process orchestration.",
        deliverables: ["n8n / Make / Zapier", "Custom RPA", "ETL pipelines", "Internal tools"],
      },
      {
        i: Building2,
        name: "Enterprise Software",
        desc: "Internal systems, operations platforms, dashboards and business management software designed around your workflows.",
        deliverables: ["Internal portals", "Operations platforms", "Admin dashboards", "Custom workflows"],
      },
    ],
  },
  {
    pillar: "Product Engineering",
    blurb:
      "Production-grade product engineering — from marketing sites to multi-tenant SaaS, built by senior engineers.",
    services: [
      {
        i: Globe,
        name: "Web Applications",
        desc: "Modern web apps built on Next.js, React and Node — fast, accessible, SEO-ready and engineered to scale.",
        deliverables: ["Marketing & corporate", "Customer portals", "E-commerce", "API integrations"],
      },
      {
        i: LayoutDashboard,
        name: "SaaS Platforms",
        desc: "End-to-end SaaS product engineering — multi-tenant architecture, auth, billing, admin tooling and analytics.",
        deliverables: ["Multi-tenant architecture", "Auth & RBAC", "Billing (Stripe/Razorpay)", "Admin & analytics"],
      },
      {
        i: Smartphone,
        name: "Mobile Applications",
        desc: "Native Android in Kotlin, and cross-platform with Flutter or React Native — store-ready from day one.",
        deliverables: ["Native Kotlin", "Flutter / React Native", "Play Store publishing", "Crashlytics & analytics"],
      },
    ],
  },
  {
    pillar: "Design",
    blurb:
      "Design that closes deals — research, systems and pixel-perfect handoff.",
    services: [
      {
        i: Palette,
        name: "UI / UX Design",
        desc: "End-to-end product design — research, wireframes, prototypes and pixel-perfect Figma handoff.",
        deliverables: ["Design systems", "Wireframes & prototypes", "Usability testing", "Dev handoff"],
      },
    ],
  },
  {
    pillar: "Strategy",
    blurb:
      "Specialist help where the impact compounds — strategic technology decisions, well made.",
    services: [
      {
        i: Bot,
        name: "Technology Consulting",
        desc: "Technology strategy, process optimization, digital transformation planning and solution architecture.",
        deliverables: ["Tech strategy", "Process optimization", "Transformation planning", "Solution architecture"],
      },
    ],
  },
];

const process = [
  { n: "01", t: "Strategy",     d: "We start with your goal — not a service list. A focused discovery aligns scope, success criteria and stakeholders." },
  { n: "02", t: "Architecture", d: "Reference architecture, designs, sprint plan and timeline — clear deliverables, clear pricing, zero surprises." },
  { n: "03", t: "Delivery",     d: "A focused pod ships in weekly sprints with live previews. You see real progress, not status decks." },
  { n: "04", t: "Scale",        d: "We launch with you and stay on for hyper-care. Day-2 ops, SLAs and continuous improvement available." },
];

export default function ServicesPage() {
  return (
    <>
      <BreadcrumbsLd items={[{ name: "Services", path: "/services" }]} />
      {/* HERO */}
      <section className="relative overflow-hidden hero-gradient pt-32 lg:pt-44 pb-20">
        <div className="absolute inset-0 grid-overlay opacity-60" />
        <div className="container-x relative">
          <div className="max-w-4xl">
            <div className="eyebrow">
              <span className="h-px w-8 bg-gold-400" />
              Services
            </div>
            <h1 className="mt-6 font-display text-5xl md:text-7xl leading-[1.05] font-extralight tracking-tight text-ink-100">
              Technology that moves <span className="gold-text">businesses forward</span>.
            </h1>
            <p className="mt-8 max-w-2xl text-lg text-ink-300 font-light">
              From custom software and AI systems to automation and digital
              transformation, AUMOXO delivers solutions designed for measurable
              business impact.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row gap-4">
              <Link href="/contact" className="btn-gold">
                Discuss Project <ArrowUpRight size={18} />
              </Link>
              <Link href="#enterprise-solutions" className="btn-ghost">Explore services</Link>
            </div>
          </div>
        </div>
      </section>

      {/* Pillars */}
      {pillars.map((p) => {
        const anchor = p.pillar.toLowerCase().replace(/[^a-z0-9]+/g, "-");
        return (
          <section key={p.pillar} id={anchor} className="py-24 lg:py-32 even:bg-bg-surface even:border-y even:border-line">
            <div className="container-x">
              <div className="grid lg:grid-cols-[1fr_2fr] gap-12 lg:gap-20 mb-14">
                <div>
                  <div className="eyebrow">
                    <span className="h-px w-8 bg-gold-400" />
                    {p.pillar}
                  </div>
                  <h2 className="section-title mt-5">{p.pillar}.</h2>
                </div>
                <p className="text-lg text-ink-300 font-light leading-relaxed lg:pt-16">{p.blurb}</p>
              </div>

              <Reveal stagger=".svc-card" staggerGap={0.08} className="grid md:grid-cols-2 gap-6">
                {p.services.map(({ i: Icon, name, desc, deliverables }) => (
                  <Tilt3D key={name} max={6} className="h-full">
                    <div className="svc-card card p-10 gold-border group h-full">
                      <div className="flex items-start justify-between">
                        <div className="grid h-14 w-14 place-items-center rounded-lg border border-gold-400/30 bg-gold-400/5 text-gold-600 dark:text-gold-300">
                          <Icon size={22} />
                        </div>
                        <Sparkles size={16} className="text-gold-400/60 group-hover:text-gold-400 transition-colors" />
                      </div>
                      <h3 className="mt-7 font-display text-2xl font-light text-ink-100">{name}</h3>
                      <p className="mt-3 text-ink-300 font-light leading-relaxed">{desc}</p>
                      <ul className="mt-6 grid grid-cols-2 gap-2.5">
                        {deliverables.map((d) => (
                          <li key={d} className="flex items-start gap-2 text-sm text-ink-200">
                            <CheckCircle2 size={15} className="text-gold-400 shrink-0 mt-0.5" />
                            <span className="font-light">{d}</span>
                          </li>
                        ))}
                      </ul>
                      <Link
                        href="/contact"
                        className="inline-flex items-center gap-1.5 mt-7 text-xs uppercase tracking-[0.25em] text-gold-600 dark:text-gold-300 hover:opacity-80"
                      >
                        Discuss Project <ArrowUpRight size={14} />
                      </Link>
                    </div>
                  </Tilt3D>
                ))}
              </Reveal>
            </div>
          </section>
        );
      })}

      {/* Coming soon — Business Operations product */}
      <section className="py-24 lg:py-32">
        <div className="container-x">
          <div className="card gold-border p-10 lg:p-14 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">
            <div>
              <div className="eyebrow">
                <span className="h-px w-8 bg-gold-400" />
                Coming Soon
              </div>
              <h3 className="mt-4 font-display text-3xl font-extralight text-ink-100">
                Building the future of business operations.
              </h3>
              <p className="mt-3 text-ink-300 font-light max-w-2xl">
                We're developing the next generation of business management tools
                focused on automation, intelligence and operational efficiency.
                Join the waitlist for early access.
              </p>
            </div>
            <Link href="/contact" className="btn-ghost shrink-0">
              Join waitlist <ArrowUpRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* How We Work */}
      <section className="py-24 lg:py-32 bg-bg-surface border-y border-line">
        <div className="container-x">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <div className="eyebrow justify-center"><span className="h-px w-8 bg-gold-400" />How We Work<span className="h-px w-8 bg-gold-400" /></div>
            <h2 className="section-title mt-5">A disciplined four-step delivery model.</h2>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-px overflow-hidden rounded-2xl border border-line bg-line">
            {process.map((p) => (
              <div key={p.n} className="bg-bg-base p-8">
                <div className="font-display text-5xl font-extralight gold-text">{p.n}</div>
                <h3 className="mt-6 text-xl font-light text-ink-100">{p.t}</h3>
                <p className="mt-3 text-sm text-ink-300 font-light leading-relaxed">{p.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 lg:py-32">
        <div className="container-x text-center">
          <h2 className="section-title mx-auto">Let's scope your project.</h2>
          <p className="section-sub mx-auto text-center">
            A short call is usually enough to map outcomes, scope and a path forward.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/contact" className="btn-gold">
              Discuss Project <ArrowUpRight size={18} />
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
