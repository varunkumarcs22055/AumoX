import Link from "next/link";
import { ArrowUpRight, Clock, BookOpen } from "lucide-react";

export const metadata = {
  title: "Insights — Perspectives from AUMOXO Practitioners",
};

const featured = {
  tag: "GenAI",
  title: "The enterprise GenAI maturity model — five stages to value",
  excerpt:
    "After deploying generative AI inside 80+ regulated enterprises, a clear pattern has emerged. We map the five stages — and what separates leaders from the rest.",
  date: "May 14, 2026",
  read: "12 min",
  author: "Anika Sharma · Chief AI Officer",
};

const articles = [
  { tag: "Cloud", title: "Multi-cloud FinOps: how leaders cut 40% in 90 days", date: "May 7, 2026", read: "9 min" },
  { tag: "Security", title: "Zero-trust beyond identity — the operating model shift", date: "Apr 28, 2026", read: "11 min" },
  { tag: "Data", title: "The semantic layer is your competitive advantage", date: "Apr 21, 2026", read: "8 min" },
  { tag: "Engineering", title: "Why platform engineering is replacing DevOps in the enterprise", date: "Apr 14, 2026", read: "10 min" },
  { tag: "Leadership", title: "From IT cost center to product organization in 18 months", date: "Apr 7, 2026", read: "13 min" },
  { tag: "GenAI", title: "Agentic systems in production — patterns and pitfalls", date: "Mar 31, 2026", read: "14 min" },
  { tag: "Industry", title: "Open banking 2.0 — what's next after PSD2", date: "Mar 24, 2026", read: "9 min" },
  { tag: "Sustainability", title: "Green software engineering — measurable carbon reduction", date: "Mar 17, 2026", read: "7 min" },
  { tag: "Cloud", title: "Sovereign cloud — strategy for regulated EU enterprises", date: "Mar 10, 2026", read: "11 min" },
];

const categories = ["All", "GenAI", "Cloud", "Security", "Data", "Engineering", "Leadership", "Industry", "Sustainability"];

export default function InsightsPage() {
  return (
    <>
      <section className="relative overflow-hidden hero-gradient pt-32 lg:pt-44 pb-20">
        <div className="absolute inset-0 grid-overlay opacity-60" />
        <div className="container-x relative">
          <div className="max-w-4xl">
            <div className="eyebrow"><span className="h-px w-8 bg-gold-400" />Insights</div>
            <h1 className="mt-6 font-display text-5xl md:text-7xl leading-[0.95] font-extralight tracking-tight text-ink-100">
              Sharpening the <span className="gold-text">conversation</span>.
            </h1>
            <p className="mt-8 max-w-2xl text-lg text-ink-300 font-light">
              Research, frameworks and field reports from our practitioners — turning hard-earned
              lessons into shared knowledge.
            </p>
          </div>
        </div>
      </section>

      {/* Featured */}
      <section className="py-20 lg:py-24">
        <div className="container-x">
          <Link href="/contact" className="block group">
            <div className="card p-0 gold-border overflow-hidden grid lg:grid-cols-2">
              <div className="relative aspect-[16/10] lg:aspect-auto bg-gradient-to-br from-gold-400/30 via-bg-elevated to-bg-base">
                <div className="absolute inset-0 grid-overlay opacity-60" />
                <div className="absolute top-6 left-6 text-[11px] uppercase tracking-[0.3em] text-gold-700 dark:text-gold-300 bg-bg-base/60 border border-gold-400/40 rounded-full px-3 py-1">
                  Featured · {featured.tag}
                </div>
              </div>
              <div className="p-10 lg:p-14 flex flex-col justify-center">
                <h2 className="font-display text-3xl lg:text-4xl font-extralight text-ink-100 leading-tight group-hover:text-gold-200 transition-colors">
                  {featured.title}
                </h2>
                <p className="mt-6 text-ink-300 font-light leading-relaxed">{featured.excerpt}</p>
                <div className="mt-8 flex items-center gap-5 text-xs text-ink-400 uppercase tracking-[0.2em]">
                  <span>{featured.date}</span>
                  <span className="text-gold-400/50">·</span>
                  <span className="inline-flex items-center gap-1.5"><Clock size={12} /> {featured.read}</span>
                  <span className="text-gold-400/50">·</span>
                  <span>{featured.author}</span>
                </div>
                <div className="mt-8 inline-flex items-center gap-2 text-gold-300 group-hover:text-gold-200 font-medium">
                  Read the analysis <ArrowUpRight size={18} />
                </div>
              </div>
            </div>
          </Link>
        </div>
      </section>

      {/* Category filter (visual) */}
      <section>
        <div className="container-x">
          <div className="flex flex-wrap gap-2 pb-8">
            {categories.map((c, i) => (
              <button
                key={c}
                className={`px-4 py-2 rounded-full text-xs uppercase tracking-[0.2em] border transition-colors ${
                  i === 0
                    ? "bg-gold-400/15 border-gold-400 text-gold-300"
                    : "border-line text-ink-300 hover:border-gold-400/50 hover:text-gold-300"
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Grid */}
      <section className="pb-24 lg:pb-32">
        <div className="container-x">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {articles.map((a) => (
              <Link key={a.title} href="/contact" className="card p-8 group flex flex-col">
                <div className="aspect-[16/10] -mx-8 -mt-8 mb-6 bg-gradient-to-br from-gold-400/15 via-bg-elevated to-bg-base relative overflow-hidden">
                  <div className="absolute inset-0 grid-overlay opacity-50" />
                  <div className="absolute bottom-4 left-8 text-[11px] uppercase tracking-[0.3em] text-gold-400">{a.tag}</div>
                </div>
                <h3 className="text-lg text-ink-100 font-light leading-snug group-hover:text-gold-300 transition-colors">
                  {a.title}
                </h3>
                <div className="mt-auto pt-6 flex items-center justify-between text-xs text-ink-400">
                  <span>{a.date} · {a.read}</span>
                  <ArrowUpRight size={14} className="text-gold-400 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            ))}
          </div>
          <div className="text-center mt-12">
            <button className="btn-ghost">
              <BookOpen size={16} /> Load more articles
            </button>
          </div>
        </div>
      </section>
    </>
  );
}
