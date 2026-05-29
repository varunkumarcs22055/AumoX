import Link from "next/link";
import { ArrowUpRight, CheckCircle2 } from "lucide-react";

export const metadata = {
  title: "Products — Enterprise Software Platforms",
};

const products = [
  {
    name: "AUMOXO Nexus",
    tag: "Integration Platform",
    headline: "Connect every system. Orchestrate every workflow.",
    desc: "Enterprise integration with 200+ pre-built connectors, low-code workflow design and event-driven orchestration — deployable in the cloud or your VPC.",
    features: [
      "200+ enterprise connectors",
      "Low-code workflow builder",
      "Event-driven orchestration",
      "Cloud or self-hosted deployment",
      "SOC 2 Type II certified",
      "Sub-100ms p99 latency",
    ],
  },
  {
    name: "AUMOXO Atlas",
    tag: "Unified Data Platform",
    headline: "From raw data to GenAI-ready insight.",
    desc: "A unified data platform that handles ingestion, governance, the semantic layer and GenAI-ready APIs in one cohesive experience.",
    features: [
      "Streaming + batch ingestion",
      "Built-in governance & lineage",
      "Semantic & metrics layer",
      "GenAI-ready data APIs",
      "Lakehouse architecture",
      "Federated query across clouds",
    ],
  },
  {
    name: "AUMOXO Pulse",
    tag: "Observability Suite",
    headline: "See everything. Miss nothing.",
    desc: "Full-stack observability built for regulated industries — traces, metrics, logs and SLO-aware alerting with retention up to 13 months.",
    features: [
      "Distributed tracing (OpenTelemetry)",
      "Metrics & logs unified",
      "SLO-aware alerting",
      "13-month retention",
      "Compliance-grade audit trail",
      "Per-tenant cost analytics",
    ],
  },
];

export default function ProductsPage() {
  return (
    <>
      <section className="relative overflow-hidden hero-gradient pt-32 lg:pt-44 pb-20">
        <div className="absolute inset-0 grid-overlay opacity-60" />
        <div className="container-x relative">
          <div className="max-w-4xl">
            <div className="eyebrow">
              <span className="h-px w-8 bg-gold-400" />
              Products
            </div>
            <h1 className="mt-6 font-display text-5xl md:text-7xl leading-[1.05] font-extralight tracking-tight text-ink-100">
              Three platforms. <span className="gold-text">Infinite leverage.</span>
            </h1>
            <p className="mt-8 max-w-2xl text-lg text-ink-300 font-light">
              Built with the same rigor we bring to bespoke engagements — but
              productized for global scale.
            </p>
          </div>
        </div>
      </section>

      <section className="py-24 lg:py-32">
        <div className="container-x space-y-24">
          {products.map((p, idx) => (
            <div
              key={p.name}
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
                <p className="mt-6 text-ink-300 font-light leading-relaxed">
                  {p.desc}
                </p>
                <div className="mt-8 flex flex-wrap gap-3">
                  <Link href="/contact" className="btn-gold">
                    Book a demo <ArrowUpRight size={18} />
                  </Link>
                  <Link href="/contact" className="btn-ghost">
                    Talk to product
                  </Link>
                </div>
              </div>
              <div className="card p-10 gold-border">
                <div className="text-[11px] uppercase tracking-[0.3em] text-gold-400 mb-6">
                  Capabilities
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
            </div>
          ))}
        </div>
      </section>

      <section className="py-24 lg:py-32 bg-bg-surface border-y border-line">
        <div className="container-x text-center">
          <h2 className="section-title mx-auto">
            See it for yourself.
          </h2>
          <p className="section-sub mx-auto text-center">
            45-minute demos with a product engineer — tailored to your stack.
          </p>
          <Link href="/contact" className="btn-gold mt-10">
            Request a demo <ArrowUpRight size={18} />
          </Link>
        </div>
      </section>
    </>
  );
}
