import Link from "next/link";
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
  Box,
  Video,
  Share2,
  Briefcase,
  Sparkles,
} from "lucide-react";

export const metadata = {
  title: "Services — Engineering · AI · Design · Growth",
};

const pillars = [
  {
    pillar: "Engineering & Development",
    blurb:
      "Production-grade software — from marketing sites to mission-critical platforms — built by senior engineers.",
    color: "from-amber-500/15 to-transparent",
    services: [
      {
        i: Globe,
        name: "Web Application Services",
        desc: "Modern web apps built on Next.js, React and Node — fast, accessible, SEO-ready and engineered to scale.",
        deliverables: ["Marketing & corporate sites", "Customer portals", "E-commerce", "API integrations"],
      },
      {
        i: LayoutDashboard,
        name: "SaaS Dashboards",
        desc: "End-to-end SaaS product engineering — multi-tenant architecture, billing, auth, analytics and admin tooling.",
        deliverables: ["Multi-tenant architecture", "Auth & RBAC", "Billing (Stripe/Razorpay)", "Admin & analytics"],
      },
      {
        i: Smartphone,
        name: "Android Application Development",
        desc: "Native Android apps in Kotlin and cross-platform with Flutter / React Native — Play Store ready from day one.",
        deliverables: ["Native Kotlin", "Flutter / React Native", "Play Store publishing", "Crashlytics & analytics"],
      },
      {
        i: Workflow,
        name: "Automation Services",
        desc: "Free your team from repetitive work — workflow automation, integrations and bots across your stack.",
        deliverables: ["n8n / Make / Zapier", "Custom RPA scripts", "ETL pipelines", "Internal tools"],
      },
    ],
  },
  {
    pillar: "AI & Intelligence",
    blurb:
      "Practical, production-ready AI — agents, assistants and copilots that move real business metrics.",
    color: "from-violet-500/15 to-transparent",
    services: [
      {
        i: Bot,
        name: "AI Agents",
        desc: "Custom agentic systems with tool use, memory and guardrails — built on Claude, GPT or open models.",
        deliverables: ["Multi-tool agents", "RAG over your data", "Vector search", "Evaluation & guardrails"],
      },
      {
        i: MessageCircle,
        name: "Chatbots",
        desc: "Customer-facing and internal chatbots — from rule-based assistants to fully conversational LLM bots.",
        deliverables: ["Web & WhatsApp", "LLM-powered", "Knowledge base", "Human handoff"],
      },
    ],
  },
  {
    pillar: "Design & Creative",
    blurb:
      "Design that closes deals — interfaces, motion and content that elevate every touchpoint of your brand.",
    color: "from-rose-500/15 to-transparent",
    services: [
      {
        i: Palette,
        name: "UI / UX Design",
        desc: "End-to-end product design — research, wireframes, prototypes and pixel-perfect handoff in Figma.",
        deliverables: ["Design systems", "Wireframes & prototypes", "Usability testing", "Dev handoff"],
      },
      {
        i: Box,
        name: "3D Modelling",
        desc: "Photoreal product renders, hero scenes and animation-ready assets for web and marketing.",
        deliverables: ["Product visualization", "Hero scenes", "Animation rigs", "AR-ready assets"],
      },
      {
        i: Video,
        name: "Video Editing",
        desc: "Reels, ad creatives, brand films and product demos — story-led editing with motion design.",
        deliverables: ["Short-form reels", "Ad creatives", "Brand films", "Motion graphics"],
      },
    ],
  },
  {
    pillar: "Growth & Strategy",
    blurb:
      "Specialist help where the impact compounds — social presence, brand voice and the strategic decisions in between.",
    color: "from-emerald-500/15 to-transparent",
    services: [
      {
        i: Share2,
        name: "Social Media Management",
        desc: "Full-service social — content calendars, post production, engagement and performance reporting.",
        deliverables: ["Content calendars", "Post production", "Community management", "Monthly analytics"],
      },
      {
        i: Briefcase,
        name: "Business Consultancy",
        desc: "Strategic advisory for tech-first businesses — GTM, ops design, fundraising readiness and team scaling.",
        deliverables: ["GTM strategy", "Ops design", "Fundraising readiness", "Team scaling"],
      },
    ],
  },
];

const process = [
  { n: "01", t: "Discover", d: "We start with your goal — not a service list. A short, focused discovery aligns scope, success criteria and stakeholders." },
  { n: "02", t: "Design", d: "Architecture, designs, sprint plan and timeline — clear deliverables, clear pricing, zero surprises." },
  { n: "03", t: "Build", d: "A focused pod ships in weekly sprints with live previews. You see real progress, not status decks." },
  { n: "04", t: "Launch & Support", d: "We launch with you and stay on for hyper-care. Day-2 ops, SLAs and continuous improvement available." },
];

export default function ServicesPage() {
  return (
    <>
      <section className="relative overflow-hidden hero-gradient pt-32 lg:pt-44 pb-20">
        <div className="absolute inset-0 grid-overlay opacity-60" />
        <div className="container-x relative">
          <div className="max-w-4xl">
            <div className="eyebrow">
              <span className="h-px w-8 bg-gold-400" />
              Services
            </div>
            <h1 className="mt-6 font-display text-5xl md:text-7xl leading-[0.95] font-extralight tracking-tight text-ink-100">
              Eleven services. <span className="gold-text">One partner.</span>
            </h1>
            <p className="mt-8 max-w-2xl text-lg text-ink-300 font-light">
              Engineering, AI, design and growth — under one roof, delivered by senior practitioners
              who care as much about your business as you do.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row gap-4">
              <Link href="/contact" className="btn-gold">
                Start a project <ArrowUpRight size={18} />
              </Link>
              <Link href="#engineering-development" className="btn-ghost">Explore services</Link>
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

              <div className="grid md:grid-cols-2 gap-6">
                {p.services.map(({ i: Icon, name, desc, deliverables }) => (
                  <div key={name} className="card p-10 gold-border group">
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
                      Request a quote <ArrowUpRight size={14} />
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          </section>
        );
      })}

      {/* Coming soon */}
      <section className="py-24 lg:py-32">
        <div className="container-x">
          <div className="card gold-border p-10 lg:p-14 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">
            <div>
              <div className="eyebrow">
                <span className="h-px w-8 bg-gold-400" />
                Coming soon
              </div>
              <h3 className="mt-4 font-display text-3xl font-extralight text-ink-100">
                Business Management <span className="text-ink-400 font-extralight">— in development</span>
              </h3>
              <p className="mt-3 text-ink-300 font-light max-w-2xl">
                A full-spectrum operations practice for high-growth teams — finance ops, HR systems,
                vendor management and process design. Join the waitlist.
              </p>
            </div>
            <Link href="/contact" className="btn-ghost shrink-0">
              Join waitlist <ArrowUpRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* Process */}
      <section className="py-24 lg:py-32 bg-bg-surface border-y border-line">
        <div className="container-x">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <div className="eyebrow justify-center"><span className="h-px w-8 bg-gold-400" />How We Work<span className="h-px w-8 bg-gold-400" /></div>
            <h2 className="section-title mt-5">A clear, disciplined delivery model.</h2>
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

      <section className="py-24 lg:py-32">
        <div className="container-x text-center">
          <h2 className="section-title mx-auto">Let's scope your project.</h2>
          <p className="section-sub mx-auto text-center">
            A 30-minute call is usually enough to map outcomes, scope and a path forward.
          </p>
          <Link href="/contact" className="btn-gold mt-10">
            Book a consultation <ArrowUpRight size={18} />
          </Link>
        </div>
      </section>
    </>
  );
}
