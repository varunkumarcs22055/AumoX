import Link from "next/link";
import Reveal from "@/components/anim/Reveal";
import { ArrowUpRight, CheckCircle2, Sparkles, Briefcase, Workflow } from "lucide-react";

export const metadata = {
  title: "Solutions — Ready-to-Deploy Software & AI",
};

const solutions = [
  {
    i: Sparkles,
    name: "AI Customer Support Suite",
    tag: "Solution 01",
    headline: "Customer support that scales without scaling headcount.",
    desc: "Website chatbot, WhatsApp bot, knowledge base and intelligent ticket routing — trained on your business knowledge and live from week one.",
    features: [
      "Website chatbot",
      "WhatsApp bot",
      "Knowledge base",
      "Ticket routing",
      "Human handoff",
      "Analytics & training",
    ],
  },
  {
    i: Briefcase,
    name: "CRM & Sales Automation",
    tag: "Solution 02",
    headline: "Built around how your team actually sells.",
    desc: "Lead management, follow-up automation, sales dashboards and reporting — tailored to your pipeline, not a generic template.",
    features: [
      "Lead management",
      "Follow-up automation",
      "Sales dashboards",
      "Pipeline tracking",
      "Reporting & analytics",
      "Email + WhatsApp sequences",
    ],
  },
  {
    i: Workflow,
    name: "Operations Automation",
    tag: "Solution 03",
    headline: "Free your team from repetitive work.",
    desc: "Internal workflows, approvals, notifications and reporting — orchestrated end-to-end so your team focuses on the work that matters.",
    features: [
      "Internal workflows",
      "Approvals & sign-off",
      "Notifications",
      "Reporting & dashboards",
      "Integration with your stack",
      "Audit trails",
    ],
  },
];

const comingSoon = [
  { name: "AUMOXO CRM",         desc: "Lead tracking, follow-ups, sales pipeline management." },
  { name: "AUMOXO AI Assistant", desc: "Custom-trained business assistant connected to your company knowledge." },
  { name: "AUMOXO Operations Hub", desc: "Workflow automation and team operations platform." },
];

export default function SolutionsPage() {
  return (
    <>
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

      {/* SOLUTIONS */}
      <section className="py-24 lg:py-32">
        <div className="container-x space-y-24">
          {solutions.map((p, idx) => (
            <Reveal
              key={p.name}
              kind="fade-up"
              className={`grid lg:grid-cols-2 gap-12 lg:gap-20 items-center ${
                idx % 2 === 1 ? "lg:[&>*:first-child]:order-2" : ""
              }`}
            >
              <div>
                <div className="text-[11px] uppercase tracking-[0.3em] text-gold-400">
                  {p.tag}
                </div>
                <h2 className="mt-3 font-display text-4xl md:text-5xl font-extralight text-ink-100 tracking-tight leading-[1.05]">
                  {p.name}
                </h2>
                <p className="mt-6 text-2xl font-light text-ink-200 leading-snug">
                  {p.headline}
                </p>
                <p className="mt-6 text-ink-300 font-light leading-relaxed">{p.desc}</p>
                <div className="mt-8 flex flex-wrap gap-3">
                  <Link href="/contact" className="btn-gold">
                    Discuss Project <ArrowUpRight size={18} />
                  </Link>
                  <Link href="/contact" className="btn-ghost">
                    Schedule Consultation
                  </Link>
                </div>
              </div>
              <div className="card p-10 gold-border">
                <div className="text-[11px] uppercase tracking-[0.3em] text-gold-400 mb-6">
                  What's Inside
                </div>
                <ul className="space-y-4">
                  {p.features.map((f) => (
                    <li key={f} className="flex items-start gap-3 text-ink-200">
                      <CheckCircle2 size={18} className="text-gold-400 shrink-0 mt-0.5" />
                      <span className="font-light">{f}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>
          ))}
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
