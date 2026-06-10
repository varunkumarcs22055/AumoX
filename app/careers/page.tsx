import Link from "next/link";
import { MapPin, ArrowUpRight, Sparkles, Rocket, Users, GraduationCap, Globe2, HeartHandshake } from "lucide-react";
import Reveal from "@/components/anim/Reveal";
import { jobsDb } from "@/lib/admin/db";

export const metadata = {
  title: "Careers — Build the Next Decade with AUMOXO",
  description:
    "Join AUMOXO and build AI solutions, CRM platforms and enterprise software for businesses worldwide. Open roles in engineering, AI, design and growth.",
  keywords: ["AUMOXO careers", "AUMOXO jobs", "startup engineering jobs", "AI engineer jobs", "Next.js developer jobs"],
  alternates: { canonical: "/careers" },
};

// Roles are managed in the admin panel — always render fresh.
export const dynamic = "force-dynamic";

const perks = [
  { i: Rocket,         t: "Real ownership",        d: "Small team, founder-led — your work ships to real clients in weeks, not quarters." },
  { i: Sparkles,       t: "AI-first engineering",  d: "Work hands-on with modern LLMs, agents and automation on every project." },
  { i: Globe2,         t: "Remote-first",          d: "Work from anywhere. We collaborate async and meet where the work is." },
  { i: GraduationCap,  t: "Steep growth curve",    d: "Direct mentorship from the founding team across product, engineering and clients." },
  { i: Users,          t: "Client exposure",       d: "You talk to real stakeholders — engineers here own outcomes, not tickets." },
  { i: HeartHandshake, t: "Built to last",         d: "We optimize for craft and long-term relationships — with clients and with the team." },
];

export default async function CareersPage() {
  const allJobs = await jobsDb.list();
  const jobs = allJobs.filter((j) => j.active);

  return (
    <>
      {/* HERO */}
      <section className="relative overflow-hidden hero-gradient pt-32 lg:pt-44 pb-20">
        <div className="absolute inset-0 grid-overlay opacity-60" />
        <div className="container-x relative">
          <div className="max-w-4xl">
            <div className="eyebrow">
              <span className="h-px w-8 bg-gold-400" />
              Careers
            </div>
            <h1 className="mt-6 font-display text-5xl md:text-7xl leading-[1.05] font-extralight tracking-tight text-ink-100">
              Do the best work of your <span className="gold-text">career</span>.
            </h1>
            <p className="mt-8 max-w-2xl text-lg text-ink-300 font-light">
              We're a founder-led team building AI solutions, CRM platforms and
              enterprise software for businesses worldwide. Small team, big
              problems, real ownership.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row gap-4">
              <Link href="#open-roles" className="btn-gold">
                See open roles <ArrowUpRight size={18} />
              </Link>
              <Link href="/about" className="btn-ghost">Meet the team</Link>
            </div>
          </div>
        </div>
      </section>

      {/* WHY AUMOXO */}
      <section className="py-24 lg:py-32">
        <div className="container-x">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <div className="eyebrow justify-center">
              <span className="h-px w-8 bg-gold-400" />
              Why AUMOXO
              <span className="h-px w-8 bg-gold-400" />
            </div>
            <h2 className="section-title mt-5">A place to build, not just belong.</h2>
          </div>
          <Reveal stagger=".perk-card" staggerGap={0.07} className="grid md:grid-cols-2 lg:grid-cols-3 gap-px overflow-hidden rounded-2xl border border-line bg-line">
            {perks.map(({ i: Icon, t, d }) => (
              <div key={t} className="perk-card bg-bg-base p-8">
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

      {/* OPEN ROLES — live from the admin panel */}
      <section id="open-roles" className="py-24 lg:py-32 bg-bg-surface border-y border-line">
        <div className="container-x">
          <div className="flex items-end justify-between flex-wrap gap-6 mb-12">
            <div>
              <div className="eyebrow">
                <span className="h-px w-8 bg-gold-400" />
                Open Roles
              </div>
              <h2 className="section-title mt-5">
                {jobs.length > 0 ? `${jobs.length} open ${jobs.length === 1 ? "position" : "positions"}.` : "Open positions."}
              </h2>
            </div>
          </div>

          {jobs.length === 0 ? (
            <div className="card p-12 gold-border text-center">
              <p className="text-lg text-ink-200 font-light">
                No open roles right now — but we're always happy to hear from
                exceptional people.
              </p>
              <Link href="/contact?role=Open%20application" className="btn-gold mt-8 inline-flex">
                Send an open application <ArrowUpRight size={18} />
              </Link>
            </div>
          ) : (
            <Reveal stagger=".job-card" staggerGap={0.08} className="space-y-4">
              {jobs.map((j) => (
                <div key={j.id} className="job-card card p-7 lg:p-8 gold-border">
                  <div className="flex flex-col lg:flex-row lg:items-center gap-6 lg:gap-10">
                    <div className="flex-1">
                      <div className="text-[11px] uppercase tracking-[0.25em] text-gold-400">
                        {j.team} · {j.level}
                      </div>
                      <h3 className="mt-2 font-display text-2xl font-light text-ink-100">{j.title}</h3>
                      {j.description && (
                        <p className="mt-3 text-sm text-ink-300 font-light leading-relaxed max-w-2xl">{j.description}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-ink-300 shrink-0">
                      <MapPin size={15} className="text-gold-400" />
                      {j.location}
                      <span className="mx-2 text-ink-500">·</span>
                      {j.type}
                    </div>
                    <Link
                      href={`/contact?role=${encodeURIComponent(j.title)}`}
                      className="btn-gold !py-2.5 !px-6 text-sm shrink-0"
                    >
                      Apply <ArrowUpRight size={16} />
                    </Link>
                  </div>
                </div>
              ))}
            </Reveal>
          )}

          <p className="mt-10 text-sm text-ink-400 font-light">
            Don't see your role?{" "}
            <Link href="/contact?role=Open%20application" className="text-gold-300 hover:text-gold-200 transition-colors">
              Send an open application
            </Link>{" "}
            — we read every one.
          </p>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 lg:py-32">
        <div className="container-x text-center">
          <Reveal kind="scale-in">
            <h2 className="section-title mx-auto">Think infinite. Build with us.</h2>
            <p className="section-sub mx-auto text-center">
              Tell us what you want to build — the best applications read like that.
            </p>
            <Link href="/contact?role=Open%20application" className="btn-gold mt-10 inline-flex">
              Get in touch <ArrowUpRight size={18} />
            </Link>
          </Reveal>
        </div>
      </section>
    </>
  );
}
