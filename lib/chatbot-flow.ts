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
      "Welcome to AUMOXO. I'm your virtual assistant — how can I help you today?",
    options: [
      { label: "Explore our services", next: "services_menu" },
      { label: "View ready-to-deploy solutions", next: "solutions_menu" },
      { label: "Discuss a project", action: "contact" },
      { label: "Talk to a human", action: "contact" },
    ],
  },

  // ---- Services pillars ----
  services_menu: {
    id: "services_menu",
    message: "We focus on four practice areas — which interests you?",
    options: [
      { label: "Enterprise Solutions", next: "svc_enterprise" },
      { label: "Product Engineering", next: "svc_product" },
      { label: "Design", next: "svc_design" },
      { label: "Technology Consulting", next: "svc_consulting" },
      { label: "← Back", next: "greeting" },
    ],
  },
  svc_enterprise: {
    id: "svc_enterprise",
    message:
      "Enterprise Solutions covers AI Solutions, CRM Platforms, Automation Systems and Enterprise Software — systems that run the business, built around your workflows.",
    options: [
      { label: "Discuss project", action: "contact" },
      { label: "← Other practices", next: "services_menu" },
    ],
  },
  svc_product: {
    id: "svc_product",
    message:
      "Product Engineering covers Web Applications, SaaS Platforms and Mobile Applications — production-grade, built by senior engineers on modern stacks.",
    options: [
      { label: "Discuss project", action: "contact" },
      { label: "← Other practices", next: "services_menu" },
    ],
  },
  svc_design: {
    id: "svc_design",
    message:
      "Design covers UI/UX — research-led design systems, prototypes and pixel-perfect Figma handoff.",
    options: [
      { label: "Discuss project", action: "contact" },
      { label: "← Other practices", next: "services_menu" },
    ],
  },
  svc_consulting: {
    id: "svc_consulting",
    message:
      "Technology Consulting: tech strategy, process optimization, digital transformation planning and solution architecture.",
    options: [
      { label: "Schedule consultation", action: "contact" },
      { label: "← Other practices", next: "services_menu" },
    ],
  },

  // ---- Ready-to-deploy solutions ----
  solutions_menu: {
    id: "solutions_menu",
    message: "Three ready-to-deploy solutions. Which fits your need?",
    options: [
      { label: "AI Customer Support Suite", next: "sol_support" },
      { label: "CRM & Sales Automation", next: "sol_crm" },
      { label: "Operations Automation", next: "sol_ops" },
      { label: "Coming-soon products", next: "sol_soon" },
      { label: "← Back", next: "greeting" },
    ],
  },
  sol_support: {
    id: "sol_support",
    message:
      "AI Customer Support Suite: website chatbot, WhatsApp bot, knowledge base, ticket routing and human handoff — trained on your business knowledge.",
    options: [
      { label: "Discuss project", action: "contact" },
      { label: "← Other solutions", next: "solutions_menu" },
    ],
  },
  sol_crm: {
    id: "sol_crm",
    message:
      "CRM & Sales Automation: lead management, follow-up automation, sales dashboards, pipeline tracking and reporting — built around your sales process.",
    options: [
      { label: "Discuss project", action: "contact" },
      { label: "← Other solutions", next: "solutions_menu" },
    ],
  },
  sol_ops: {
    id: "sol_ops",
    message:
      "Operations Automation: internal workflows, approvals, notifications and reporting — integrated with your existing stack.",
    options: [
      { label: "Discuss project", action: "contact" },
      { label: "← Other solutions", next: "solutions_menu" },
    ],
  },
  sol_soon: {
    id: "sol_soon",
    message:
      "We're shipping AUMOXO's own platforms: AUMOXO CRM, AUMOXO AI Assistant, and AUMOXO Operations Hub. All coming soon — want on the waitlist?",
    options: [
      { label: "Join waitlist", action: "contact" },
      { label: "← Other solutions", next: "solutions_menu" },
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
  [/\b(price|pricing|cost|quote|budget|engagement)\b/i, "fallback"],
  [/\b(web|website|frontend|next\.?js|react)\b/i, "svc_product"],
  [/\b(saas|dashboard|admin|portal)\b/i, "svc_product"],
  [/\b(android|mobile|app|kotlin|flutter|ios)\b/i, "svc_product"],
  [/\b(automation|automate|workflow|zap|n8n)\b/i, "sol_ops"],
  [/\b(ai|agent|llm|gen ?ai|chatbot|bot|support)\b/i, "sol_support"],
  [/\b(crm|sales|pipeline|lead|follow.?up)\b/i, "sol_crm"],
  [/\b(ui|ux|design|figma|prototype)\b/i, "svc_design"],
  [/\b(consult|strategy|advisory|architecture)\b/i, "svc_consulting"],
  [/\b(enterprise|internal|operations|ops|business software)\b/i, "svc_enterprise"],
  [/\b(service|services|offer|capability)\b/i, "services_menu"],
  [/\b(product|platform|solution|solutions)\b/i, "solutions_menu"],
  [/\b(contact|human|talk|call|email|reach|meet)\b/i, "fallback"],
];

export function matchIntent(text: string): string {
  for (const [pattern, target] of keywordMap) {
    if (pattern.test(text)) return target;
  }
  return "fallback";
}
