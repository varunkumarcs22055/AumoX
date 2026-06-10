import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Chatbot from "@/components/Chatbot";
import SiteParticles from "@/components/SiteParticles";
import JsonLd from "@/components/JsonLd";
import MaintenanceGate from "@/components/MaintenanceGate";
import PageTransition from "@/components/PageTransition";
import { ThemeProvider } from "@/components/ThemeProvider";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://aumoxo.tech";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default:
      "AUMOXO — AI Solutions, CRM Platforms, Automation & Custom Software Development",
    template: "%s | AUMOXO",
  },
  description:
    "AUMOXO develops enterprise-grade software, AI solutions, automation systems, CRM platforms and digital products. We help businesses innovate faster, operate smarter, and scale confidently with custom web, mobile and SaaS engineering.",
  applicationName: "AUMOXO",
  authors: [{ name: "AUMOXO Technologies", url: siteUrl }],
  generator: "Next.js",
  referrer: "origin-when-cross-origin",
  keywords: [
    // brand
    "AUMOXO", "aumoxo", "AUMOXO Technologies", "Think Infinite",
    // primary services
    "AI solutions", "AI agents", "AI chatbots", "GenAI for business",
    "CRM development", "custom CRM platform", "CRM software development",
    "business automation", "workflow automation", "process automation",
    "enterprise software", "custom enterprise software", "internal tools",
    // engineering
    "web application development", "Next.js development", "React development",
    "SaaS development", "SaaS platform development", "multi-tenant SaaS",
    "mobile app development", "Android app development", "Flutter app development",
    "UI/UX design", "product design",
    // strategy
    "technology consulting", "digital transformation", "solution architecture",
    // industries
    "software for startups", "software for SMEs", "software for healthcare",
    "software for education", "software for e-commerce", "software for professional services",
    // long-tail
    "build my SaaS", "build my MVP", "hire AI developers",
    "WhatsApp chatbot for business", "AI customer support",
    "automate lead follow-ups", "internal business software",
  ],
  category: "Technology",
  creator: "AUMOXO",
  publisher: "AUMOXO",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    title:
      "AUMOXO — AI, Automation & Custom Software for Modern Businesses",
    description:
      "Enterprise-grade software, AI solutions, CRM platforms and automation systems engineered for businesses that want to move faster.",
    url: siteUrl,
    siteName: "AUMOXO",
    images: [
      {
        url: "/logo.jpeg",
        width: 1024,
        height: 1024,
        alt: "AUMOXO — Think Infinite",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "AUMOXO — AI, Automation & Custom Software",
    description:
      "AI solutions, CRM platforms, automation systems and digital products for businesses that move fast.",
    images: ["/logo.jpeg"],
    creator: "@aumoxo",
  },
  alternates: {
    canonical: siteUrl,
  },
  icons: {
    icon: [
      { url: "/favicon.svg?v=3", type: "image/svg+xml" },
      { url: "/logo-mark.png?v=3", type: "image/png", sizes: "any" },
    ],
    apple: "/logo-mark.png?v=3",
    shortcut: "/favicon.svg?v=3",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-snippet": -1,
      "max-image-preview": "large",
      "max-video-preview": -1,
    },
  },
};

// Inline script that runs before paint — applies stored theme (or dark default) to avoid FOUC.
const noFlashScript = `
(function(){
  try {
    var t = localStorage.getItem('aumox_theme');
    if (!t) t = 'dark';
    if (t === 'dark') document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  } catch(e) {
    document.documentElement.classList.add('dark');
  }
})();
`;

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} dark`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: noFlashScript }} />
        <JsonLd />
      </head>
      <body className="min-h-screen bg-bg-base text-ink-100 font-sans">
        <ThemeProvider>
          <MaintenanceGate>
            <Navbar />
            <main className="min-h-screen">
              <PageTransition>{children}</PageTransition>
            </main>
            <Footer />
            <SiteParticles />
            <Chatbot />
          </MaintenanceGate>
        </ThemeProvider>
      </body>
    </html>
  );
}
