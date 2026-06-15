// AUMOXO assistant brain — a self-contained knowledge base + intent scorer.
// No external API: every answer is curated company knowledge, so it's instant,
// private and free, and it "knows" AUMOXO end to end. Add a node + a few
// keywords to teach it something new.

export type FlowOption = {
  label: string;
  next?: string;
  action?: "contact" | "navigate" | "external";
  href?: string;
};

export type FlowNode = {
  id: string;
  message: string;
  options: FlowOption[];
};

const ASK = { label: "Discuss a project", action: "contact" as const };
const HUMAN = { label: "Talk to a human", action: "contact" as const };
const HOME = { label: "← Main menu", next: "greeting" };

export const flow: Record<string, FlowNode> = {
  greeting: {
    id: "greeting",
    message:
      "Welcome to AUMOXO — Think Infinite. I'm your assistant and I know our work inside out. Ask me anything, or pick a topic:",
    options: [
      { label: "What we do", next: "services_menu" },
      { label: "Our work", next: "work" },
      { label: "How we work", next: "process" },
      { label: "Pricing", next: "pricing" },
      ASK,
    ],
  },

  about: {
    id: "about",
    message:
      "AUMOXO is a technology company that builds AI solutions, CRM platforms, automation systems and custom software for businesses that want to move faster. Our philosophy is simple — Think Infinite: make world-class technology accessible to every business. Every project also includes 6 months of complimentary post-launch support.",
    options: [
      { label: "What we do", next: "services_menu" },
      { label: "Our work", next: "work" },
      { label: "The team", next: "team" },
      HOME,
    ],
  },
  team: {
    id: "team",
    message:
      "AUMOXO is built by senior engineers, designers and strategists who work as one team on every engagement — no hand-offs to juniors. You always work directly with the people building your product.",
    options: [{ label: "Careers", next: "careers" }, ASK, HOME],
  },

  // ---- Services pillars ----
  services_menu: {
    id: "services_menu",
    message:
      "We work across four practice areas. Which one fits what you need?",
    options: [
      { label: "Enterprise Solutions", next: "svc_enterprise" },
      { label: "Product Engineering", next: "svc_product" },
      { label: "Design (UI/UX)", next: "svc_design" },
      { label: "Tech Consulting", next: "svc_consulting" },
      HOME,
    ],
  },
  svc_enterprise: {
    id: "svc_enterprise",
    message:
      "Enterprise Solutions — systems that run the business, built around your workflows: AI Solutions (agents, chatbots, GenAI), custom CRM platforms, automation systems and enterprise software / internal tools.",
    options: [
      { label: "AI solutions", next: "ai" },
      { label: "CRM platforms", next: "crm" },
      { label: "Automation", next: "automation" },
      ASK,
    ],
  },
  svc_product: {
    id: "svc_product",
    message:
      "Product Engineering — production-grade software by senior engineers on modern stacks: web applications, SaaS platforms (multi-tenant) and mobile apps (Android / Flutter).",
    options: [
      { label: "Web apps", next: "web" },
      { label: "SaaS platforms", next: "saas" },
      { label: "Mobile apps", next: "mobile" },
      ASK,
    ],
  },
  svc_design: {
    id: "svc_design",
    message:
      "Design — research-led UI/UX: user research, design systems, interactive prototypes and pixel-perfect Figma handoff so what we build looks and feels premium.",
    options: [ASK, { label: "Product engineering", next: "svc_product" }, HOME],
  },
  svc_consulting: {
    id: "svc_consulting",
    message:
      "Technology Consulting — tech strategy, process optimization, digital-transformation planning and solution architecture. Useful when you know the goal but want the right plan and stack to get there.",
    options: [{ label: "Schedule a consultation", action: "contact" }, HOME],
  },

  // ---- Capability deep-dives ----
  ai: {
    id: "ai",
    message:
      "AI Solutions: AI agents and assistants, website + WhatsApp chatbots, GenAI workflows and intelligent automation — trained on your business knowledge and integrated with your tools. Live from week one, not a science project.",
    options: [{ label: "AI Customer Support Suite", next: "sol_support" }, ASK, HOME],
  },
  crm: {
    id: "crm",
    message:
      "CRM Platforms: custom CRMs built around how your team actually sells — lead management, pipelines, follow-up automation, dashboards and reporting. Not a generic template you have to bend your process around.",
    options: [{ label: "CRM & Sales Automation", next: "sol_crm" }, ASK, HOME],
  },
  automation: {
    id: "automation",
    message:
      "Automation Systems: internal workflows, approvals, notifications and reporting orchestrated end-to-end, integrated with your existing stack — so your team stops doing repetitive work by hand.",
    options: [{ label: "Operations Automation", next: "sol_ops" }, ASK, HOME],
  },
  web: {
    id: "web",
    message:
      "Web Applications: fast, scalable web apps on modern stacks (Next.js / React). From marketing sites to complex dashboards — SEO-ready, responsive and built to last.",
    options: [ASK, { label: "SaaS platforms", next: "saas" }, HOME],
  },
  saas: {
    id: "saas",
    message:
      "SaaS Platforms: multi-tenant products with auth, billing, dashboards and admin — engineered to scale from MVP to production. We can take you from idea to a launched SaaS.",
    options: [ASK, { label: "Build my MVP", action: "contact" }, HOME],
  },
  mobile: {
    id: "mobile",
    message:
      "Mobile Apps: Android and cross-platform (Flutter) apps with clean UX and solid performance, integrated with your backend and APIs.",
    options: [ASK, HOME],
  },

  // ---- Ready-to-deploy solutions ----
  solutions_menu: {
    id: "solutions_menu",
    message: "Ready-to-deploy solutions — which fits your need?",
    options: [
      { label: "AI Customer Support", next: "sol_support" },
      { label: "CRM & Sales Automation", next: "sol_crm" },
      { label: "Operations Automation", next: "sol_ops" },
      { label: "See our work", next: "work" },
      HOME,
    ],
  },
  sol_support: {
    id: "sol_support",
    message:
      "AI Customer Support Suite: website chatbot, WhatsApp bot, knowledge base, intelligent ticket routing and human handoff — trained on your business knowledge and live from week one. Support that scales without scaling headcount.",
    options: [ASK, { label: "Other solutions", next: "solutions_menu" }, HOME],
  },
  sol_crm: {
    id: "sol_crm",
    message:
      "CRM & Sales Automation: lead management, follow-up automation, sales dashboards, pipeline tracking, reporting and email + WhatsApp sequences — built around your pipeline, not a generic template.",
    options: [ASK, { label: "Other solutions", next: "solutions_menu" }, HOME],
  },
  sol_ops: {
    id: "sol_ops",
    message:
      "Operations Automation: internal workflows, approvals, notifications, reporting and audit trails — integrated with your stack so your team focuses on work that matters.",
    options: [ASK, { label: "Other solutions", next: "solutions_menu" }, HOME],
  },

  // ---- Real work / case studies ----
  work: {
    id: "work",
    message:
      "A couple of things we've shipped: CollabCode — an AI-powered real-time collaborative development platform — and Aurea, an elegant fine-dining restaurant website with menu, gallery and reservations. Each is a full Problem → Solution → Technologies → Outcome case study.",
    options: [
      { label: "See all work", action: "navigate", href: "/products" },
      { label: "CollabCode", next: "work_collabcode" },
      { label: "Aurea", next: "work_aurea" },
      ASK,
    ],
  },
  work_collabcode: {
    id: "work_collabcode",
    message:
      "CollabCode brings the whole dev workflow into one real-time workspace: multiple developers code and review the same codebase live, with AI-assisted development workflows, on a scalable SaaS architecture. Built to boost developer productivity.",
    options: [
      { label: "View live", action: "external", href: "https://collab-code-rosy.vercel.app/" },
      { label: "Aurea", next: "work_aurea" },
      ASK,
    ],
  },
  work_aurea: {
    id: "work_aurea",
    message:
      "Aurea is a premium fine-dining website — cinematic hero, chef story, a categorised menu, gallery, reviews and a clear 'Reserve a Table' flow. Fast, fully responsive and crafted to mirror the in-restaurant experience.",
    options: [
      { label: "View live", action: "external", href: "https://fine-dining-restaurant-website-six.vercel.app/" },
      { label: "CollabCode", next: "work_collabcode" },
      ASK,
    ],
  },

  // ---- Industries ----
  industries: {
    id: "industries",
    message:
      "We build for businesses that move fast: startups & SMEs, healthcare, education, e-commerce and professional services. The approach adapts to your domain — the engineering bar doesn't.",
    options: [{ label: "What we do", next: "services_menu" }, ASK, HOME],
  },

  // ---- Process ----
  process: {
    id: "process",
    message:
      "How we work — a clear path, not a black box: 1) Discovery, 2) Strategy, 3) Design, 4) Development, 5) Launch, 6) Support. And every project includes 6 months of complimentary post-launch support, so we don't disappear after go-live.",
    options: [{ label: "Pricing", next: "pricing" }, { label: "Timeline", next: "timeline" }, ASK],
  },
  timeline: {
    id: "timeline",
    message:
      "Timelines depend on scope. A focused MVP or website is typically a few weeks; a full platform is a few months. We scope it precisely on a short discovery call and give you clear milestones.",
    options: [{ label: "Get a timeline", action: "contact" }, { label: "Pricing", next: "pricing" }, HOME],
  },
  pricing: {
    id: "pricing",
    message:
      "Every engagement is custom-quoted to your scope — no generic packages. Tell us what you're building and we'll send a clear, itemised quotation (you can even review and accept it in your client portal). Short discovery call, no commitment.",
    options: [{ label: "Get a quote", action: "contact" }, { label: "How we work", next: "process" }, HOME],
  },
  guarantee: {
    id: "guarantee",
    message:
      "AUMOXO Growth Assurance: every project includes 6 months of complimentary post-launch support. We stay with you after launch so your investment keeps paying off.",
    options: [ASK, HOME],
  },
  tech: {
    id: "tech",
    message:
      "Our stack: Next.js / React on the web, Node.js and Postgres on the backend, Flutter for mobile, and modern AI tooling for agents and automation — chosen per project, always production-grade.",
    options: [ASK, { label: "What we do", next: "services_menu" }, HOME],
  },

  // ---- Access / accounts ----
  portal: {
    id: "portal",
    message:
      "Clients get a private portal at aumoxo.tech/client — track project progress live, view quotations and invoices, download deliverables, pay online and message the team. Access is created by us when your project starts.",
    options: [
      { label: "Open client portal", action: "navigate", href: "/client" },
      ASK,
      HOME,
    ],
  },
  careers: {
    id: "careers",
    message:
      "We're always interested in great people. See open roles and apply on our careers page — applications come straight to our team.",
    options: [
      { label: "View careers", action: "navigate", href: "/careers" },
      HOME,
    ],
  },
  partners: {
    id: "partners",
    message:
      "Interested in partnering with AUMOXO? We collaborate with agencies and product teams. Tell us a bit about you and we'll take it from there.",
    options: [
      { label: "Partnership page", action: "navigate", href: "/partners" },
      { label: "Talk to us", action: "contact" },
      HOME,
    ],
  },
  insights: {
    id: "insights",
    message:
      "Our Insights are practical reads on AI, automation, CRM and building software that moves the needle — written for people running real businesses.",
    options: [{ label: "Read insights", action: "navigate", href: "/insights" }, HOME],
  },

  // ---- Contact / location ----
  contact: {
    id: "contact",
    message:
      "The fastest way to reach us is hello@aumoxo.tech, or use the contact form and we'll reply within one working day.",
    options: [
      { label: "Open contact form", action: "contact" },
      { label: "Email us", action: "external", href: "mailto:hello@aumoxo.tech" },
      HOME,
    ],
  },
  location: {
    id: "location",
    message:
      "AUMOXO works with clients remotely and delivers worldwide — so where you're based is never a blocker. Everything from discovery to support runs smoothly online.",
    options: [{ label: "Talk to us", action: "contact" }, HOME],
  },

  // ---- Small talk ----
  thanks: {
    id: "thanks",
    message: "Anytime! Anything else I can help with?",
    options: [
      { label: "What we do", next: "services_menu" },
      { label: "Our work", next: "work" },
      ASK,
    ],
  },
  bye: {
    id: "bye",
    message:
      "Thanks for stopping by AUMOXO. When you're ready to build something great, we're a message away — hello@aumoxo.tech. 👋",
    options: [{ label: "Discuss a project", action: "contact" }],
  },

  fallback: {
    id: "fallback",
    message:
      "Good question — let me point you the right way. You can pick a topic below, or I can connect you with a human from our team who'll answer in detail.",
    options: [
      { label: "What we do", next: "services_menu" },
      { label: "Pricing", next: "pricing" },
      { label: "Our work", next: "work" },
      HUMAN,
    ],
  },
};

/* ------------------------------------------------------------------ *
 * Intent scoring — match free text to the best knowledge node.
 * Each intent lists keyword phrases; multi-word phrases score higher
 * (more specific). The highest-scoring node wins; ties fall back.
 * ------------------------------------------------------------------ */
type Intent = { node: string; keywords: string[] };

const INTENTS: Intent[] = [
  { node: "greeting", keywords: ["hi", "hii", "hey", "hello", "yo", "good morning", "good evening", "namaste", "start"] },
  { node: "thanks", keywords: ["thanks", "thank you", "thx", "appreciate", "great", "awesome", "perfect", "nice", "cool"] },
  { node: "bye", keywords: ["bye", "goodbye", "see you", "later", "that's all", "thats all"] },

  { node: "about", keywords: ["about", "who are you", "who is aumoxo", "what is aumoxo", "company", "mission", "think infinite", "vision"] },
  { node: "team", keywords: ["team", "who works", "founders", "people", "engineers", "developers behind"] },

  { node: "services_menu", keywords: ["services", "what do you do", "what do you offer", "capabilities", "offerings", "help me with", "can you build"] },
  { node: "svc_enterprise", keywords: ["enterprise", "internal tool", "business software", "erp"] },
  { node: "svc_product", keywords: ["product engineering", "build software", "development", "engineering"] },
  { node: "svc_design", keywords: ["design", "ui", "ux", "ui/ux", "figma", "prototype", "wireframe", "branding", "user experience"] },
  { node: "svc_consulting", keywords: ["consult", "consulting", "strategy", "advisory", "architecture", "transformation", "audit", "roadmap"] },

  { node: "ai", keywords: ["ai", "artificial intelligence", "agent", "agents", "llm", "genai", "gen ai", "machine learning", "ml", "gpt", "assistant", "automate with ai"] },
  { node: "crm", keywords: ["crm", "customer relationship", "sales pipeline", "leads", "lead management", "follow up", "follow-up"] },
  { node: "automation", keywords: ["automation", "automate", "workflow", "workflows", "approval", "n8n", "zapier", "integrate", "integration"] },
  { node: "web", keywords: ["web", "website", "web app", "web application", "frontend", "next.js", "nextjs", "react", "landing page"] },
  { node: "saas", keywords: ["saas", "platform", "multi-tenant", "mvp", "subscription", "product startup"] },
  { node: "mobile", keywords: ["mobile", "app", "android", "ios", "flutter", "kotlin", "react native", "play store"] },

  { node: "solutions_menu", keywords: ["solutions", "ready to deploy", "ready-to-deploy", "what can i buy", "products"] },
  { node: "sol_support", keywords: ["support suite", "customer support", "chatbot", "whatsapp bot", "help desk", "helpdesk", "ticket", "knowledge base"] },
  { node: "sol_crm", keywords: ["sales automation", "crm solution", "pipeline tracking", "sales dashboard"] },
  { node: "sol_ops", keywords: ["operations", "ops automation", "back office", "internal workflow"] },

  { node: "work", keywords: ["work", "portfolio", "case study", "case studies", "projects", "examples", "what have you built", "show me", "previous work", "clients"] },
  { node: "work_collabcode", keywords: ["collabcode", "collab code", "collaborative coding", "code editor"] },
  { node: "work_aurea", keywords: ["aurea", "restaurant", "fine dining", "menu", "reservation"] },

  { node: "industries", keywords: ["industries", "industry", "sector", "healthcare", "education", "ecommerce", "e-commerce", "startup", "sme", "do you work with"] },

  { node: "process", keywords: ["how do you work", "process", "methodology", "approach", "steps", "phases", "discovery", "workflow of project", "how it works"] },
  { node: "timeline", keywords: ["how long", "timeline", "duration", "time to build", "how fast", "delivery time", "deadline", "when can"] },
  { node: "pricing", keywords: ["price", "pricing", "cost", "how much", "quote", "quotation", "budget", "rate", "charges", "fees", "estimate", "expensive"] },
  { node: "guarantee", keywords: ["guarantee", "warranty", "after launch", "post launch", "post-launch", "maintenance", "support period", "6 months", "growth assurance"] },
  { node: "tech", keywords: ["tech stack", "technology", "technologies", "stack", "what tools", "languages", "framework"] },

  { node: "portal", keywords: ["portal", "client portal", "dashboard", "my project", "track project", "invoice", "login", "sign in", "account"] },
  { node: "careers", keywords: ["career", "careers", "job", "jobs", "hiring", "vacancy", "internship", "apply", "work with you", "join"] },
  { node: "partners", keywords: ["partner", "partnership", "collaborate", "white label", "white-label", "reseller", "agency"] },
  { node: "insights", keywords: ["insights", "blog", "articles", "read", "resources"] },

  { node: "contact", keywords: ["contact", "reach", "email", "phone", "get in touch", "talk to someone", "talk to a human", "speak", "support email"] },
  { node: "location", keywords: ["where are you", "location", "office", "based", "address", "country", "city", "remote"] },
];

// Phrase weight: longer phrases are more specific → score higher.
const weightOf = (phrase: string) => (phrase.includes(" ") ? 3 : 1) + Math.min(2, Math.floor(phrase.length / 6));

export function matchIntent(text: string): string {
  const t = ` ${text.toLowerCase().replace(/[^a-z0-9\s.+/-]/g, " ").replace(/\s+/g, " ")} `;
  let best = "";
  let bestScore = 0;
  for (const intent of INTENTS) {
    let score = 0;
    for (const kw of intent.keywords) {
      // word-ish boundary match so "ai" doesn't fire inside "email"
      if (t.includes(` ${kw} `) || t.includes(` ${kw}.`) || t.includes(` ${kw},`)) score += weightOf(kw);
      else if (kw.includes(" ") && t.includes(kw)) score += weightOf(kw);
    }
    if (score > bestScore) { bestScore = score; best = intent.node; }
  }
  return bestScore > 0 ? best : "fallback";
}
