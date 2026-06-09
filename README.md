# AUMOXO — Enterprise Technology Website

> **Think Infinite.** Production-grade Next.js 15 marketing site for AUMOXO.

## Stack

- **Next.js 15** (App Router, React 19)
- **TypeScript** (strict)
- **Tailwind CSS v3** with custom AUMOXO gold/black design tokens
- **react-hook-form + zod** for forms
- **Resend** for transactional email
- **Lucide React** for icons
- **Static chatbot** (no AI API needed) with JSON-driven flow + keyword matching

## Pages

| Route | Description |
|---|---|
| `/` | Home — hero, stats, services preview, industries grid, products, case study, insights, CTA |
| `/services` | Six capability practices, four-step delivery model |
| `/industries` | Eight industry verticals with stat cards |
| `/products` | AUMOXO Nexus · Atlas · Pulse — full product showcase |
| `/partners` | Logo wall, 4-tier partnership program, partner benefits |
| `/about` | Mission, values, timeline, global footprint |
| `/contact` | Working contact form (sends real email via Resend) |
| `/api/contact` | Serverless email endpoint with rate-limit + honeypot |

## Quick Start

```bash
# 1) Install dependencies
npm install

# 2) Start dev server
npm run dev

# Open http://localhost:3000
```

## Email Setup (Contact Form)

The contact form uses **[Resend](https://resend.com)** — free tier is 3,000 emails/month.

1. Sign up at [resend.com](https://resend.com)
2. Create an API key (Dashboard → API Keys)
3. Copy `.env.example` to `.env.local` and paste the key:

```env
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxx
CONTACT_EMAIL_TO=harshchakravarti77@gmail.com
CONTACT_EMAIL_FROM=onboarding@resend.dev   # use your verified domain in prod
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

> Until you add a key, form submissions just log to the server console — the UI still shows the success state so you can test the flow.

**Production:** verify your sending domain in Resend (recommended `contact@aumox.com`) for the best deliverability.

## Chatbot

- Static, JSON-driven flow in `lib/chatbot-flow.ts`
- Decision-tree of quick-reply buttons + keyword matcher for free-text
- "Talk to a human" pre-fills the contact form with the transcript
- No backend, no API keys, zero recurring cost
- Persists conversation in `localStorage`

To customize: edit `lib/chatbot-flow.ts` — each node has `message` and `options[]`.

## Branding

- **Logo:** SVG component at `components/Logo.tsx` (full + mark variants) — recreates the gold A emblem
- **Brand image:** `public/logo-mark.png` (transparent PNG used everywhere) + `public/logo.jpeg` (OG/social card image)
- **Color tokens:** `tailwind.config.ts` → `colors.gold` (50–700) and `colors.bg`
- **Typography:** Inter via `next/font/google` (variable, swap)

To swap brand assets:
- Drop your finalized logo at `public/logo-mark.png` and update `components/Logo.tsx` to use `<Image>`
- Adjust gold palette in `tailwind.config.ts`

## Project Structure

```
.
├── app/
│   ├── layout.tsx            # Root layout (nav, footer, chatbot)
│   ├── page.tsx              # Home
│   ├── globals.css
│   ├── about/page.tsx
│   ├── services/page.tsx
│   ├── industries/page.tsx
│   ├── products/page.tsx
│   ├── partners/page.tsx
│   ├── contact/
│   │   ├── page.tsx
│   │   └── ContactForm.tsx   # client component
│   └── api/contact/route.ts  # Resend email endpoint
├── components/
│   ├── Navbar.tsx            # Sticky nav, mobile drawer
│   ├── Footer.tsx
│   ├── Chatbot.tsx           # Static AI-free assistant
│   └── Logo.tsx              # SVG logo (mark + full)
├── lib/
│   └── chatbot-flow.ts       # JSON flow for the bot
├── public/
│   ├── favicon.svg
│   ├── logo-mark.png       # transparent brand mark
│   └── logo.jpeg           # OG / social card image
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

## Deploy

### Vercel (1-click)
1. Push this repo to GitHub
2. Import the repo on [vercel.com/new](https://vercel.com/new)
3. Add `RESEND_API_KEY`, `CONTACT_EMAIL_TO`, `CONTACT_EMAIL_FROM` to Vercel env vars
4. Deploy — done

### Custom domain
Point your domain (e.g. `aumox.com`) to Vercel via DNS:
- `A    @    76.76.21.21`
- `CNAME www  cname.vercel-dns.com`

## Customization Checklist

- [ ] Replace placeholder partner / client names with real ones
- [ ] Add real case study content to `/work` (currently just on home)
- [ ] Update `app/about/page.tsx` with actual leadership team
- [ ] Verify domain in Resend, switch `CONTACT_EMAIL_FROM` to `contact@aumox.com`
- [ ] Add favicon variants (`/icon.png`, `/apple-icon.png`)
- [ ] Wire analytics (Vercel Analytics or Plausible)
- [ ] Add real Calendly / scheduling embed on Contact page

## License

© AUMOXO Technologies. All rights reserved.
# AumoX
