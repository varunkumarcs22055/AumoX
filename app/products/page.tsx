import Link from "next/link";
import BreadcrumbsLd from "@/components/BreadcrumbsLd";
import Reveal from "@/components/anim/Reveal";
import { ArrowUpRight, ExternalLink } from "lucide-react";
import { solutionsDb } from "@/lib/admin/db";

// Managed from the admin (Solutions) — always render fresh.
export const dynamic = "force-dynamic";

export const metadata = {
  title: "Solutions — AI Customer Support, CRM & Operations Automation",
  description:
    "Ready-to-deploy AUMOXO solutions: AI Customer Support Suite (website + WhatsApp chatbot), CRM & Sales Automation, Operations Automation. Plus AUMOXO CRM, AI Assistant and Operations Hub coming soon.",
  keywords: [
    "AI customer support", "WhatsApp chatbot for business",
    "lead automation", "sales pipeline software",
    "operations automation software", "workflow software for SMEs",
    "AUMOXO CRM", "AUMOXO AI Assistant", "AUMOXO Operations Hub",
  ],
  alternates: { canonical: "/products" },
};

// Real shipped work, shown when no admin-managed Solutions exist yet. The moment
// the team adds projects in Admin → Solutions, those take over automatically.
type ShowcaseProject = {
  id: string;
  category: string;
  title: string;
  summary: string;
  description?: string;
  problem?: string;
  approach?: string;
  outcome?: string;
  coverImage?: string;
  media: { type: "image" | "video"; url: string }[];
  tags: string[];
  link?: string;
};

const FALLBACK_PROJECTS: ShowcaseProject[] = [
  {
    id: "collabcode",
    category: "AI · SaaS",
    title: "CollabCode",
    summary: "AI-powered collaborative development platform — teams code, review and innovate together in real time.",
    problem:
      "Modern engineering teams are distributed, but writing and reviewing code together still means juggling a separate editor, chat and call — so pairing is clunky, reviews lag and context gets lost between tools.",
    approach:
      "CollabCode brings the whole workflow into one real-time workspace: multiple developers edit and review the same codebase live, with AI-assisted development workflows that speed up writing and reviewing — built on a modern, scalable SaaS architecture and deployed to the cloud.",
    outcome:
      "A faster, more connected way to build software — improving developer productivity and streamlining collaborative development through real-time collaboration and AI assistance.",
    tags: ["React", "Node.js", "Real-time / WebSockets", "AI integration", "Cloud · SaaS"],
    link: "https://collab-code-rosy.vercel.app/",
    media: [],
  },
  {
    id: "aurea",
    category: "Web · Design",
    title: "Aurea — Fine Dining Experience",
    summary: "An elegant, immersive website for a premium fine-dining restaurant — story, menu, gallery, reviews and reservations.",
    problem:
      "Aurea, a fine-dining restaurant, needed a digital presence as refined as its cuisine — one that conveys atmosphere, showcases the seasonal menu and lets guests reserve a table effortlessly on any device.",
    approach:
      "We designed and built a polished, fully responsive site: a cinematic hero, an 'Our Story' chef feature, a categorised menu (starters, mains, desserts, drinks) with pricing, a gallery, guest reviews and a clear 'Reserve a Table' flow — all crafted to feel premium and load fast.",
    outcome:
      "A sophisticated online storefront that mirrors the in-restaurant experience and turns visitors into reservations.",
    tags: ["React", "Tailwind CSS", "Responsive design", "Reservation flow"],
    link: "https://fine-dining-restaurant-website-six.vercel.app/",
    media: [],
  },
];

const comingSoon = [
  { name: "AUMOXO CRM",         desc: "Lead tracking, follow-ups, sales pipeline management." },
  { name: "AUMOXO AI Assistant", desc: "Custom-trained business assistant connected to your company knowledge." },
  { name: "AUMOXO Operations Hub", desc: "Workflow automation and team operations platform." },
];

export default async function SolutionsPage() {
  const work = (await solutionsDb.list())
    .filter((s) => s.published)
    .sort((a, b) => a.order - b.order);
  // Prefer admin-managed case studies; fall back to our real shipped projects
  // so the showcase is never empty.
  const showcase: ShowcaseProject[] = work.length > 0 ? work : FALLBACK_PROJECTS;

  return (
    <>
      <BreadcrumbsLd items={[{ name: "Solutions", path: "/products" }]} />
      {/* HERO */}
      <section className="relative overflow-hidden hero-gradient pt-32 lg:pt-44 pb-20">
        <div className="absolute inset-0 grid-overlay opacity-60" />
        <div className="container-x relative">
          <div className="max-w-4xl">
            <div className="eyebrow">
              <span className="h-px w-8 bg-gold-400" />
              Solutions
            </div>
            <h1 className="mt-6 font-display text-5xl md:text-7xl leading-[1.05] font-extralight tracking-tight text-ink-100">
              Ready-to-deploy <span className="gold-text">solutions</span>.
            </h1>
            <p className="mt-8 max-w-2xl text-lg text-ink-300 font-light">
              Practical software, AI systems, and automation frameworks that
              accelerate delivery and reduce development costs.
            </p>
          </div>
        </div>
      </section>

      {/* OUR WORK — admin-managed, falling back to our real shipped projects */}
      <section className="py-24 lg:py-32 border-b border-line">
          <div className="container-x">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <div className="eyebrow justify-center">
                <span className="h-px w-8 bg-gold-400" />
                Our Work
                <span className="h-px w-8 bg-gold-400" />
              </div>
              <h2 className="section-title mt-5">Solutions That Deliver Business Outcomes</h2>
              <p className="section-sub mx-auto text-center">
                At AUMOXO, we build intelligent software, automation systems and digital
                platforms that solve real business challenges — each designed to improve
                efficiency, accelerate growth and create measurable impact.
              </p>
            </div>

            <div className="space-y-20">
              {showcase.map((s, idx) => (
                <Reveal
                  key={s.id}
                  kind="fade-up"
                  className={`grid lg:grid-cols-2 gap-10 lg:gap-16 items-center ${idx % 2 === 1 ? "lg:[&>*:first-child]:order-2" : ""}`}
                >
                  {/* Cover / lead media */}
                  <div className="zoom-wrap rounded-2xl overflow-hidden border border-line gold-border">
                    {s.coverImage ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={s.coverImage} alt={s.title} className="w-full aspect-[16/10] object-cover" />
                    ) : s.media[0]?.type === "video" ? (
                      <video src={s.media[0].url} className="w-full aspect-[16/10] object-cover" controls muted playsInline />
                    ) : s.media[0] ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={s.media[0].url} alt={s.title} className="w-full aspect-[16/10] object-cover" />
                    ) : (
                      <div className="w-full aspect-[16/10] bg-gradient-to-br from-gold-400/15 to-bg-base" />
                    )}
                  </div>

                  <div>
                    <div className="text-[11px] uppercase tracking-[0.3em] text-gold-400">{s.category}</div>
                    <h3 className="mt-3 font-display text-3xl md:text-4xl font-extralight text-ink-100 tracking-tight">{s.title}</h3>
                    {s.summary && <p className="mt-4 text-xl font-light text-ink-200 leading-snug">{s.summary}</p>}
                    {s.description && <p className="mt-4 text-ink-300 font-light leading-relaxed whitespace-pre-wrap">{s.description}</p>}

                    {/* Case study — Problem / Solution / Outcome */}
                    {(s.problem || s.approach || s.outcome) && (
                      <div className="mt-6 space-y-4 border-l border-gold-400/30 pl-5">
                        {s.problem && (
                          <div>
                            <div className="text-[11px] uppercase tracking-[0.25em] text-gold-400">Problem</div>
                            <p className="mt-1.5 text-ink-300 font-light leading-relaxed whitespace-pre-wrap">{s.problem}</p>
                          </div>
                        )}
                        {s.approach && (
                          <div>
                            <div className="text-[11px] uppercase tracking-[0.25em] text-gold-400">Solution</div>
                            <p className="mt-1.5 text-ink-300 font-light leading-relaxed whitespace-pre-wrap">{s.approach}</p>
                          </div>
                        )}
                        {s.outcome && (
                          <div>
                            <div className="text-[11px] uppercase tracking-[0.25em] text-gold-400">Outcome</div>
                            <p className="mt-1.5 text-ink-300 font-light leading-relaxed whitespace-pre-wrap">{s.outcome}</p>
                          </div>
                        )}
                      </div>
                    )}

                    {s.tags.length > 0 && (
                      <div className="mt-6">
                        <div className="text-[11px] uppercase tracking-[0.25em] text-gold-400 mb-2">Technologies</div>
                        <div className="flex flex-wrap gap-2">
                          {s.tags.map((t) => (
                            <span key={t} className="text-[11px] uppercase tracking-[0.15em] text-ink-300 border border-line rounded-full px-3 py-1">{t}</span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Extra media gallery */}
                    {s.media.length > (s.coverImage ? 0 : 1) && (
                      <div className="mt-6 grid grid-cols-3 gap-3">
                        {s.media.slice(s.coverImage ? 0 : 1).map((m, i) => (
                          <div key={i} className="zoom-wrap rounded-lg overflow-hidden border border-line">
                            {m.type === "video" ? (
                              <video src={m.url} className="w-full aspect-square object-cover" controls muted playsInline />
                            ) : (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img src={m.url} alt="" className="w-full aspect-square object-cover" />
                            )}
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="mt-7 flex flex-wrap gap-3">
                      {s.link && (
                        <a href={s.link} target="_blank" rel="noopener noreferrer" className="btn-gold">
                          View live <ExternalLink size={16} />
                        </a>
                      )}
                      <Link href="/contact" className="btn-ghost">Build something like this</Link>
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

      {/* COMING SOON PRODUCTS */}
      <section className="py-24 lg:py-32 bg-bg-surface border-y border-line">
        <div className="container-x">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <div className="eyebrow justify-center">
              <span className="h-px w-8 bg-gold-400" />
              Coming Soon
              <span className="h-px w-8 bg-gold-400" />
            </div>
            <h2 className="section-title mt-5">
              Productized platforms — currently in development.
            </h2>
            <p className="section-sub mx-auto text-center">
              We're shipping AUMOXO's first own-brand platforms. Join the waitlist
              for early access.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {comingSoon.map((c) => (
              <div key={c.name} className="card p-8 gold-border flex flex-col">
                <div className="text-[11px] uppercase tracking-[0.3em] text-gold-400">
                  Coming Soon
                </div>
                <h3 className="mt-3 font-display text-2xl font-light text-ink-100">{c.name}</h3>
                <p className="mt-4 text-sm text-ink-300 leading-relaxed font-light flex-1">{c.desc}</p>
                <Link
                  href="/contact"
                  className="inline-flex items-center gap-1.5 mt-6 text-xs uppercase tracking-[0.25em] text-gold-300 hover:text-gold-200"
                >
                  Join the waitlist <ArrowUpRight size={14} />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 lg:py-32">
        <div className="container-x text-center">
          <h2 className="section-title mx-auto">See how it fits your team.</h2>
          <p className="section-sub mx-auto text-center">
            Short discovery call. No commitment. Clear next steps.
          </p>
          <Link href="/contact" className="btn-gold mt-10">
            Schedule Consultation <ArrowUpRight size={18} />
          </Link>
        </div>
      </section>
    </>
  );
}
