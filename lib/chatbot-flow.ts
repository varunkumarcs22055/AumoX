export type FlowOption = {
  label: string;
  next?: string;
  action?: "contact" | "external";
  href?: string;
};

export type FlowNode = {
  id: string;
  message: string;
  options: FlowOption[];
};

export const flow: Record<string, FlowNode> = {
  greeting: {
    id: "greeting",
    message:
      "Welcome to AUMO.X. I'm your virtual assistant — how can I help you today?",
    options: [
      { label: "Explore our services", next: "services_menu" },
      { label: "View products", next: "products_menu" },
      { label: "Pricing & engagement models", next: "pricing" },
      { label: "Talk to a human", action: "contact" },
    ],
  },

  services_menu: {
    id: "services_menu",
    message: "We offer 11 services across 4 pillars — which interests you?",
    options: [
      { label: "Engineering & Development", next: "svc_engineering" },
      { label: "AI Agents & Chatbots", next: "svc_ai" },
      { label: "Design & Creative", next: "svc_design" },
      { label: "Growth & Strategy", next: "svc_growth" },
      { label: "← Back", next: "greeting" },
    ],
  },
  svc_engineering: {
    id: "svc_engineering",
    message:
      "Engineering covers Web Applications, SaaS Dashboards, Android apps and Automation services — built by senior engineers on modern stacks (Next.js, React, Kotlin, Flutter, n8n).",
    options: [
      { label: "Request a quote", action: "contact" },
      { label: "← Other services", next: "services_menu" },
    ],
  },
  svc_ai: {
    id: "svc_ai",
    message:
      "We build production-grade AI Agents (with tool use, memory, RAG) and Chatbots (rule-based or LLM-powered) on Claude, GPT or open-source models — with guardrails and evaluation.",
    options: [
      { label: "Request a quote", action: "contact" },
      { label: "← Other services", next: "services_menu" },
    ],
  },
  svc_design: {
    id: "svc_design",
    message:
      "Design & Creative includes UI/UX Design, 3D Modelling and Video Editing — research-driven product design, photoreal product renders and short-form ad creatives.",
    options: [
      { label: "Request a quote", action: "contact" },
      { label: "← Other services", next: "services_menu" },
    ],
  },
  svc_growth: {
    id: "svc_growth",
    message:
      "Growth covers Social Media Management (content, posting, engagement, reporting) and Business Consultancy (GTM, ops, fundraising, scaling).",
    options: [
      { label: "Request a quote", action: "contact" },
      { label: "← Other services", next: "services_menu" },
    ],
  },

  pricing: {
    id: "pricing",
    message:
      "Engagement models: project-based fixed bid, monthly retainer or dedicated pod. We share indicative ranges after a 15-minute discovery call.",
    options: [
      { label: "Book discovery call", action: "contact" },
      { label: "← Back", next: "greeting" },
    ],
  },

  products_menu: {
    id: "products_menu",
    message: "We build three flagship platforms. Which would you like to see?",
    options: [
      { label: "AUMO Nexus — Integration", next: "prod_nexus" },
      { label: "AUMO Atlas — Data Platform", next: "prod_atlas" },
      { label: "AUMO Pulse — Observability", next: "prod_pulse" },
      { label: "← Back", next: "greeting" },
    ],
  },
  prod_nexus: {
    id: "prod_nexus",
    message:
      "AUMO Nexus is our enterprise integration platform — 200+ connectors, low-code workflows and event-driven orchestration deployed in the cloud or your VPC.",
    options: [
      { label: "Book a demo", action: "contact" },
      { label: "← Other products", next: "products_menu" },
    ],
  },
  prod_atlas: {
    id: "prod_atlas",
    message:
      "AUMO Atlas is a unified data platform — ingestion, governance, semantic layer and GenAI-ready APIs in one cohesive experience.",
    options: [
      { label: "Book a demo", action: "contact" },
      { label: "← Other products", next: "products_menu" },
    ],
  },
  prod_pulse: {
    id: "prod_pulse",
    message:
      "AUMO Pulse is full-stack observability built for regulated industries — traces, metrics, logs and SLO-aware alerting with retention up to 13 months.",
    options: [
      { label: "Book a demo", action: "contact" },
      { label: "← Other products", next: "products_menu" },
    ],
  },

  fallback: {
    id: "fallback",
    message:
      "I'm a guided assistant — let me connect you with a human from our team who can answer in detail.",
    options: [
      { label: "Open contact form", action: "contact" },
      { label: "← Back to start", next: "greeting" },
    ],
  },
};

const keywordMap: Array<[RegExp, string]> = [
  [/\b(price|pricing|cost|quote|budget|engagement)\b/i, "pricing"],
  [/\b(web|website|frontend|next\.?js|react)\b/i, "svc_engineering"],
  [/\b(saas|dashboard|admin|portal)\b/i, "svc_engineering"],
  [/\b(android|mobile|app|kotlin|flutter)\b/i, "svc_engineering"],
  [/\b(automation|automate|workflow|zap|n8n|integration)\b/i, "svc_engineering"],
  [/\b(ai|agent|llm|gen ?ai|claude|gpt|chatbot|bot)\b/i, "svc_ai"],
  [/\b(ui|ux|design|figma|prototype)\b/i, "svc_design"],
  [/\b(3d|render|modell?ing)\b/i, "svc_design"],
  [/\b(video|reel|edit|motion|ad)\b/i, "svc_design"],
  [/\b(social|instagram|facebook|linkedin|content|growth)\b/i, "svc_growth"],
  [/\b(consult|strategy|gtm|fundrais|scal)\b/i, "svc_growth"],
  [/\b(service|services|offer)\b/i, "services_menu"],
  [/\b(product|platform|nexus|atlas|pulse)\b/i, "products_menu"],
  [/\b(contact|human|talk|call|email|reach)\b/i, "fallback"],
];

export function matchIntent(text: string): string {
  for (const [pattern, target] of keywordMap) {
    if (pattern.test(text)) return target;
  }
  return "fallback";
}
