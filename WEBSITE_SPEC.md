# Startup Website — Full Specification & Build Prompt

> **Status:** Draft v1.1 — awaiting brand assets
> **Startup Name:** _TBD_ (placeholder used: `[BRAND]`)
> **Logo:** _TBD — to be provided_
> **Brand Color:** _TBD — to be provided_ (using neutral black/white in interim)
> **Industry:** Tech company
> **Business Model:** Service + Product (tech services + tech products)
> **Product Sales Model:** Quote / demo request (no checkout) — change later if needed
> **Chatbot:** Static / rule-based (no AI API) — see §4
> **Owner:** hello@aumoxo.tech
> **Last Updated:** 2026-05-24

---

## 1. Vision & Positioning

A **professional, modern, conversion-focused** website for a service + product startup. The site should feel like a Series-A SaaS company — clean typography, generous whitespace, subtle motion, dark/light themes, and an always-available AI chatbot. Visitors should be able to:

1. Understand what the company does within 5 seconds of landing.
2. Browse services AND products in dedicated, cleanly separated sections.
3. Talk to a chatbot for instant pre-sales / FAQ answers.
4. Send a direct email to the founder via the contact form (no opening a mail client).
5. See trust signals (partners, testimonials, case studies) before being asked to convert.

### Tone
Confident, modern, slightly playful. Not corporate-stiff. Think Linear / Vercel / Stripe — minimal but warm.

---

## 2. Sitemap (Pages)

| # | Page | Route | Purpose |
|---|------|-------|---------|
| 1 | **Home** | `/` | Hero + value prop + featured services/products + social proof + CTA |
| 2 | **About** | `/about` | Story, mission, team, values, timeline |
| 3 | **Services** | `/services` | Service offerings, process, pricing tiers |
| 4 | **Products** | `/products` | Product showcase, features, demo, pricing |
| 5 | **Product Detail** | `/products/[slug]` | Deep-dive page per product |
| 6 | **Partners** | `/partners` | Logos, partnership tiers, become-a-partner CTA |
| 7 | **Case Studies / Work** | `/work` | Portfolio of past projects with metrics |
| 8 | **Blog** | `/blog` | SEO + thought leadership (optional Phase 2) |
| 9 | **Pricing** | `/pricing` | Combined pricing for services + products |
| 10 | **Contact** | `/contact` | Form (sends real email), calendar embed, social links |
| 11 | **Careers** | `/careers` | Open roles (Phase 2) |
| 12 | **Legal** | `/privacy`, `/terms`, `/cookies` | Required legal pages |
| 13 | **404** | `/*` | Friendly not-found page with search |

---

## 3. Page-by-Page Content Blueprint

### 3.1 Home (`/`)
- **Hero section**
  - Animated headline (e.g., gradient text + typewriter effect on the key noun)
  - Subheadline (1 sentence elevator pitch)
  - Primary CTA: "Get Started" → `/contact`
  - Secondary CTA: "See Our Work" → `/work`
  - Background: subtle animated gradient / particles / 3D mesh
- **Trusted by** logo strip (greyscale partner logos, auto-scroll)
- **What we do** — 3-column grid (Services | Products | Consulting)
- **Featured services** (3 cards with icon, title, 1-line desc, "Learn more")
- **Featured products** (3 cards with screenshot, name, tagline)
- **Process / How it works** — numbered horizontal steps (1 → 2 → 3 → 4)
- **Stats counter** (Projects delivered, Clients, Countries, Years)
- **Testimonials** carousel
- **Case study spotlight** — one featured project with image + metric
- **CTA banner** — "Ready to build something?" with email capture
- **Footer**

### 3.2 About (`/about`)
- Hero: short mission statement
- Origin story (founder narrative)
- Values: 4–6 value cards
- Team grid (photos, names, roles, LinkedIn links)
- Timeline (founded → milestones → today)
- "Join us" CTA → `/careers`

### 3.3 Services (`/services`)
- Hero: "What we offer"
- Service categories (tabs or accordion):
  - Web Development
  - Mobile Apps
  - AI / Automation
  - Consulting
  - _(customize once startup focus is finalized)_
- Per-service card: icon, name, description, deliverables, "Get a quote" button
- **Our Process** — 5-step visual workflow
- Pricing tiers (Starter / Growth / Enterprise) with feature comparison table
- FAQ accordion
- CTA: "Book a discovery call"

### 3.4 Products (`/products`)
- Hero with product line tagline
- Filter/category chips
- Product grid (cards: hero image, name, tagline, price-from, "View")
- Each product card links to `/products/[slug]`
- "Request a custom build" CTA

### 3.5 Product Detail (`/products/[slug]`)
- Hero with product image carousel + title + price + CTA (Buy / Demo)
- Feature highlights (3-column with icons)
- Screenshots / video demo
- Technical specs table
- Pricing & plans
- FAQs
- Related products

### 3.6 Partners (`/partners`)
- Hero: "Better together"
- Current partner logos grid
- Partnership tiers (Bronze / Silver / Gold / Strategic) — what each gets
- Benefits of partnering
- "Become a partner" form (mini contact form → email)
- Testimonials from existing partners

### 3.7 Case Studies (`/work`)
- Filterable grid (by industry / service)
- Each case study card: client logo, project title, 1-line outcome, "Read"
- Detail page per case study: challenge → solution → results (with metrics)

### 3.8 Pricing (`/pricing`)
- Toggle: Services | Products
- 3-tier pricing cards with monthly/annual toggle
- Feature comparison table
- "Custom plan" contact CTA
- FAQ

### 3.9 Contact (`/contact`)
- **Two-column layout:**
  - Left: form (Name, Email, Company, Phone, Service interested in, Budget range, Message)
  - Right: Direct email, phone, office address, social links, Calendly embed
- **Form must:**
  - Validate client-side (Zod + react-hook-form)
  - Submit to a serverless function (`/api/contact`)
  - Send real email via Resend / Nodemailer to `hello@aumoxo.tech`
  - Send auto-reply confirmation to the visitor
  - Honeypot + rate-limit + hCaptcha for spam protection
  - Show success / error toast
- Map embed (optional)

### 3.10 Footer (every page)
- 4 columns: Company | Services | Products | Legal
- Newsletter signup
- Social icons
- Copyright + "Made with care"
- Theme toggle

---

## 4. Chatbot Requirements — Static / Rule-Based

**Decision:** No AI API. Pure client-side scripted bot. Zero recurring cost, instant responses, fully deterministic.

### Behavior
- Floating bubble bottom-right, always visible
- Opens to a chat panel (380px wide, 600px tall; full-screen on mobile)
- Greets immediately with: _"Hi! I'm [BRAND]'s assistant. How can I help you today?"_ + 4 quick-reply buttons
- Persists conversation in `localStorage`
- "Talk to a human" button → opens `/contact` with the chat transcript prefilled in the message field
- Closeable + minimizable; remembers state across pages

### Conversation Flow (decision-tree)
Each user message is matched against a predefined intent (button click or keyword). The bot replies with a canned response + the next set of suggested buttons.

```
Greeting
 ├─ "About our services"     → Services menu (Web Dev / Mobile / AI / Cloud / Consulting)
 │    └─ pick one            → 2-line description + "Get a quote" CTA + "Back"
 ├─ "Show me products"       → Products menu → product info + "Book demo" CTA
 ├─ "Pricing"                → Pricing summary + link to /pricing
 ├─ "Talk to a human"        → Opens /contact, transcript attached
 └─ "Other question"         → Free-text input → keyword match (kw → canned reply)
                                                 → fallback: "I'll connect you with our team" → /contact
```

### Implementation
- **Single React component** (`components/chatbot/StaticChatbot.tsx`)
- **Flow defined in JSON/TS:** `lib/chatbot-flow.ts` — array of `{ id, message, options: [{label, nextId | action}] }`
- Easy to edit copy without touching code
- Optional: keyword-to-response map for free-text fallback (e.g., "price" → pricing reply)
- No backend required, no API keys, no rate-limiting needed

### Why this is the right call for MVP
- Tech audience expects fast, accurate answers — a static bot with curated replies beats a hallucinating LLM for pre-sales FAQ
- Zero cost, zero latency, no compliance/PII concerns
- Trivial to upgrade to AI later (swap the matcher for an LLM call) without touching the UI

---

## 5. Email / Contact Integration

### Recommended stack: **Resend** (modern, dev-friendly, generous free tier)

- Free tier: 3,000 emails/month, 100/day
- Setup: add API key to `.env`, install `resend` npm package
- Verify your sending domain (improves deliverability)

### Contact form flow
```
User submits form
   ↓
/api/contact (Next.js Route Handler)
   ↓
Validate (Zod) → Honeypot check → Rate-limit (Upstash) → hCaptcha verify
   ↓
Resend.emails.send({
  from: 'contact@[brand].com',
  to: 'hello@aumoxo.tech',
  replyTo: visitorEmail,
  subject: `New inquiry from ${name}`,
  react: <ContactEmailTemplate {...data} />
})
   ↓
Auto-reply to visitor with same Resend instance
   ↓
Return success → UI shows toast
```

### Alternatives
- **EmailJS** — pure client-side, no backend needed, free tier 200 emails/mo. Easiest but exposes config in browser.
- **SendGrid** — enterprise-grade, free tier 100/day.
- **Nodemailer + Gmail SMTP** — free but rate-limited and triggers spam filters.

---

## 6. Tech Stack (Recommended)

| Layer | Choice | Why |
|-------|--------|-----|
| **Framework** | Next.js 15 (App Router) | SEO, ISR, route handlers for email/chat, image opt |
| **Language** | TypeScript | Type safety |
| **Styling** | Tailwind CSS v4 | Fast, consistent, dark mode built-in |
| **Components** | shadcn/ui | Beautiful, accessible, copy-paste, fully customizable |
| **Animations** | Framer Motion | Smooth, declarative, page transitions |
| **Icons** | Lucide React | Clean, modern, huge library |
| **Forms** | react-hook-form + Zod | Best DX, tiny bundle |
| **Email** | Resend + React Email | Beautiful HTML emails as React components |
| **Chatbot** | Static React component + JSON flow | Zero cost, instant, deterministic. AI upgrade later if needed. |
| **CMS (optional)** | Sanity / Contentlayer | For blog + case studies if non-devs edit |
| **Analytics** | Vercel Analytics + Plausible | Privacy-friendly |
| **Hosting** | Vercel | Zero-config Next.js, free SSL, edge functions |
| **Domain DNS** | Cloudflare | Free, fast, easy |
| **Error tracking** | Sentry (free tier) | Catch prod errors |
| **Rate limiting** | Upstash Redis | Serverless, free tier |

---

## 7. Design System

### Typography
- **Headings:** Geist Sans / Inter / Satoshi (variable font, weights 400–900)
- **Body:** Same family at 16px / 1.6 line-height
- **Mono (for code/numbers):** Geist Mono / JetBrains Mono

### Color (light mode default)
```
--background:    #FFFFFF
--foreground:    #0A0A0A
--primary:       #6366F1  (indigo — swap once brand color chosen)
--primary-hover: #4F46E5
--accent:        #F59E0B  (warm amber for highlights)
--muted:         #F4F4F5
--border:        #E4E4E7
--success:       #10B981
--error:         #EF4444
```
Dark mode: invert with `#0A0A0A` background, `#FAFAFA` text. Tailwind handles via `dark:` prefix.

### Spacing & Layout
- Container max-width: 1280px
- Section vertical padding: `py-24` desktop, `py-16` mobile
- Grid gap: 24px
- Border radius: `rounded-xl` (12px) for cards, `rounded-full` for pills/buttons

### Motion
- Page transitions: 200ms fade + 8px slide-up
- Hover states: 150ms ease-out
- Scroll-triggered reveals: Framer Motion `whileInView`
- Avoid motion if `prefers-reduced-motion`

### Imagery
- Use Next.js `<Image>` for all images (auto WebP + lazy load)
- Placeholder: blur or shimmer skeleton
- Source from Unsplash / your own assets / generated 3D renders

---

## 8. Accessibility (WCAG 2.2 AA)
- Semantic HTML (`<nav>`, `<main>`, `<article>`, etc.)
- All interactive elements keyboard-focusable with visible focus ring
- Color contrast ≥ 4.5:1 for text
- Alt text on every image
- ARIA labels on icon-only buttons
- Skip-to-content link
- Forms with proper `<label>` associations
- Test with axe DevTools before shipping

---

## 9. SEO & Performance Targets

### SEO
- Per-page `<title>` and `<meta description>`
- Open Graph + Twitter cards (auto-generated via `next/og`)
- `sitemap.xml` and `robots.txt`
- JSON-LD structured data: `Organization`, `Service`, `Product`, `BreadcrumbList`, `FAQPage`
- Canonical URLs
- Semantic heading hierarchy (one `<h1>` per page)

### Performance (Lighthouse targets)
- Performance: ≥ 95
- Accessibility: 100
- Best Practices: 100
- SEO: 100
- LCP < 1.8s, CLS < 0.05, INP < 200ms

---

## 10. Security & Privacy
- HTTPS only (Vercel auto)
- CSP headers via `next.config.js`
- `.env` secrets never committed
- Rate limit all API routes
- hCaptcha on contact form
- Cookie consent banner (if EU traffic)
- Privacy policy + Terms (use Termly / Iubenda generators)
- GDPR data deletion endpoint if collecting emails

---

## 11. Project Structure
```
[brand]-website/
├── app/
│   ├── (marketing)/
│   │   ├── page.tsx              # Home
│   │   ├── about/page.tsx
│   │   ├── services/page.tsx
│   │   ├── products/page.tsx
│   │   ├── products/[slug]/page.tsx
│   │   ├── partners/page.tsx
│   │   ├── work/page.tsx
│   │   ├── pricing/page.tsx
│   │   └── contact/page.tsx
│   ├── api/
│   │   ├── contact/route.ts      # Email sender
│   │   └── chat/route.ts         # Chatbot endpoint
│   ├── layout.tsx
│   └── globals.css
├── components/
│   ├── ui/                       # shadcn primitives
│   ├── sections/                 # Hero, Features, Testimonials, etc.
│   ├── chatbot/
│   ├── forms/
│   └── layout/                   # Navbar, Footer
├── lib/
│   ├── email.ts                  # Resend wrapper
│   ├── chat.ts                   # Anthropic wrapper
│   └── utils.ts
├── content/                      # MDX for blog / case studies
├── public/
├── emails/                       # React Email templates
├── .env.local
├── next.config.js
├── tailwind.config.ts
└── package.json
```

---

## 12. Environment Variables Needed
```
RESEND_API_KEY=
CONTACT_EMAIL_TO=hello@aumoxo.tech
CONTACT_EMAIL_FROM=contact@[brand].com
HCAPTCHA_SECRET=
NEXT_PUBLIC_HCAPTCHA_SITEKEY=
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=
NEXT_PUBLIC_SITE_URL=https://[brand].com
```
_(No `ANTHROPIC_API_KEY` — chatbot is static.)_

---

## 13. Build Phases (Suggested)

### Phase 1 — MVP (Week 1–2)
- Home, About, Services, Products (list only), Contact
- Working email form
- Basic chatbot (Tidio quick-start or custom Claude)
- Footer, Navbar, dark mode
- Deploy to Vercel on temp domain

### Phase 2 — Polish (Week 3)
- Partners, Pricing, Case Studies pages
- Product detail pages
- Animations + scroll reveals
- SEO + OG images
- Analytics

### Phase 3 — Growth (Week 4+)
- Blog with MDX
- Careers page
- Newsletter (Resend Audiences / Beehiiv)
- CMS (Sanity) if non-devs need to edit
- A/B test landing variations

---

## 14. Open Decisions

**Resolved:**
- ~~Industry~~ → Tech company ✅
- ~~Chatbot route~~ → Static / rule-based ✅
- ~~E-commerce vs quote~~ → Quote / demo request flow ✅

**Still needed before scaffolding:**
1. **Startup name & domain** — needed for branding, email-from address, OG tags
2. **Logo** — you'll provide
3. **Primary brand color** — you'll provide (drives the whole palette)
4. **Tech sub-vertical?** — SaaS / DevTools / AI / Cybersec / Fintech / etc. (sharpens copy + sample services)
5. **Languages** — English only, or multi-language (i18n)?

---

## 15. Ready-to-Use AI Build Prompt

> Use this prompt with Claude Code, Cursor, v0, or any AI coding tool to scaffold the project.

```
Build a production-ready marketing website for a service + product startup called [BRAND].

Industry: Tech company offering tech services + tech products.
Product sales: quote / demo request flow (no checkout).

Stack: Next.js 15 (App Router, TypeScript), Tailwind CSS v4, shadcn/ui, Framer Motion,
react-hook-form + Zod, Lucide icons, Resend for email, deploy on Vercel.
Chatbot is STATIC (no AI API) — React component driven by a JSON decision tree.

Pages to build:
- / (Home: hero, partner logos, services preview, products preview, process, stats,
  testimonials, case study spotlight, CTA, footer)
- /about (mission, story, values, team grid, timeline)
- /services (categories, process, pricing tiers, FAQ)
- /products (filterable grid)
- /products/[slug] (detail page)
- /partners (logos, tiers, become-a-partner form)
- /work (case studies grid + detail)
- /pricing (services/products toggle, comparison table)
- /contact (form + Calendly embed + socials)
- /privacy, /terms, /404

Global components: sticky Navbar with logo + nav + theme toggle + CTA,
Footer with 4 columns + newsletter, floating static Chatbot bubble (bottom-right):
- Decision-tree flow defined in lib/chatbot-flow.ts (JSON)
- Quick-reply buttons + free-text fallback with keyword matching
- "Talk to a human" escalation pre-fills /contact with the transcript
- No backend, no API keys

Contact form:
- Fields: name, email, company, phone, service, budget, message
- Zod validation
- POST to /api/contact which uses Resend to email hello@aumoxo.tech
- Auto-reply to visitor
- Honeypot + rate-limit (Upstash) + hCaptcha
- Toast notifications

Design:
- Modern, minimal, Linear/Vercel aesthetic
- Light + dark mode (default light), Geist or Inter font
- Indigo primary (#6366F1) until brand color is finalized
- Generous whitespace, rounded-xl cards, subtle gradients
- Framer Motion page transitions and scroll reveals
- Respect prefers-reduced-motion

Quality bar:
- Lighthouse ≥ 95 across all categories
- WCAG 2.2 AA accessible
- Full SEO: meta tags, OG images via next/og, sitemap, robots, JSON-LD
- TypeScript strict, no `any`
- All images via next/image
- Mobile-first responsive

Deliver:
- Full project scaffold per the structure in WEBSITE_SPEC.md §11
- .env.example with all required keys
- README with setup + deploy instructions
- Seed data for 6 services, 6 products, 8 partner logos, 4 case studies, 3 testimonials
  (use realistic placeholder copy)
```

---

## 16. Next Steps

Tell me:
1. Should I **scaffold the Next.js project now** in this folder?
2. Any of the **Open Decisions** in §14 you can answer now?
3. Do you want me to **draft the actual copy** (headlines, service descriptions, About story) once you share the name + industry?

Once you give the green light, I can have a working MVP visible in your browser within one session.
