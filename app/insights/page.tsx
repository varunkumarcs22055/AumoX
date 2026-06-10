import Link from "next/link";
import { ArrowUpRight, Clock, ExternalLink } from "lucide-react";
import Reveal from "@/components/anim/Reveal";
import { insightsDb } from "@/lib/admin/db";

export const metadata = {
  title: "Insights — Practical Reads on AI, CRM & Automation",
  description:
    "Practical articles from the AUMOXO team on AI adoption, CRM strategy, business automation and software engineering for growing businesses.",
  keywords: ["AI for business", "CRM strategy", "business automation guide", "AUMOXO insights", "tech blog for SMEs"],
  alternates: { canonical: "/insights" },
};

// Articles are managed in the admin panel — always render fresh.
export const dynamic = "force-dynamic";

function fmtDate(iso: string) {
  try {
    return new Date(iso).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
  } catch {
    return iso;
  }
}

export default async function InsightsPage() {
  const all = await insightsDb.list();
  const items = all.filter((i) => i.published);

  return (
    <>
      {/* HERO */}
      <section className="relative overflow-hidden hero-gradient pt-32 lg:pt-44 pb-20">
        <div className="absolute inset-0 grid-overlay opacity-60" />
        <div className="container-x relative">
          <div className="max-w-4xl">
            <div className="eyebrow">
              <span className="h-px w-8 bg-gold-400" />
              Insights
            </div>
            <h1 className="mt-6 font-display text-5xl md:text-7xl leading-[1.05] font-extralight tracking-tight text-ink-100">
              Practical reads for builders &amp; <span className="gold-text">leaders</span>.
            </h1>
            <p className="mt-8 max-w-2xl text-lg text-ink-300 font-light">
              How we think about AI, automation, CRM and software — written for
              people running real businesses, not for other consultants.
            </p>
          </div>
        </div>
      </section>

      {/* ARTICLES — live from the admin panel */}
      <section className="py-24 lg:py-32">
        <div className="container-x">
          {items.length === 0 ? (
            <div className="card p-12 gold-border text-center">
              <p className="text-lg text-ink-200 font-light">
                New articles are on the way. Subscribe in the footer to get them first.
              </p>
            </div>
          ) : (
            <Reveal stagger=".insight-tile" staggerGap={0.08} className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {items.map((a) => {
                const card = (
                  <>
                    <div className="aspect-[16/9] bg-gradient-to-br from-gold-400/20 via-bg-elevated to-bg-base relative overflow-hidden">
                      <div className="absolute inset-0 grid-overlay opacity-50" />
                      <div className="absolute bottom-4 left-6 text-[11px] uppercase tracking-[0.3em] text-gold-700 dark:text-gold-300 bg-bg-base/60 border border-gold-400/40 rounded-full px-3 py-1">
                        {a.tag}
                      </div>
                    </div>
                    <div className="flex flex-col flex-1 p-7">
                      <h2 className="text-xl text-ink-100 font-light leading-snug group-hover:text-gold-300 transition-colors">
                        {a.title}
                      </h2>
                      <p className="mt-3 text-sm text-ink-300 font-light leading-relaxed flex-1">
                        {a.excerpt}
                      </p>
                      <div className="mt-6 pt-5 border-t border-line flex items-center justify-between text-xs text-ink-400">
                        <span>{fmtDate(a.date)}{a.author ? ` · ${a.author}` : ""}</span>
                        <span className="inline-flex items-center gap-1.5">
                          {a.url ? (
                            <>
                              Read article <ExternalLink size={13} className="text-gold-400" />
                            </>
                          ) : (
                            <>
                              <Clock size={13} className="text-gold-400" />
                              {a.readMin} min
                            </>
                          )}
                        </span>
                      </div>
                    </div>
                  </>
                );
                return a.url ? (
                  <a
                    key={a.id}
                    href={a.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="insight-tile card flex flex-col overflow-hidden group cursor-pointer"
                  >
                    {card}
                  </a>
                ) : (
                  <article key={a.id} className="insight-tile card flex flex-col overflow-hidden group">
                    {card}
                  </article>
                );
              })}
            </Reveal>
          )}
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 lg:py-32 bg-bg-surface border-y border-line">
        <div className="container-x text-center">
          <Reveal kind="scale-in">
            <h2 className="section-title mx-auto">Want this thinking applied to your business?</h2>
            <p className="section-sub mx-auto text-center">
              A short call is usually enough to find the highest-impact opportunity.
            </p>
            <Link href="/contact" className="btn-gold mt-10 inline-flex">
              Start a conversation <ArrowUpRight size={18} />
            </Link>
          </Reveal>
        </div>
      </section>
    </>
  );
}
