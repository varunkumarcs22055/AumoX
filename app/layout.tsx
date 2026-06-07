import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Chatbot from "@/components/Chatbot";
import SiteParticles from "@/components/SiteParticles";
import { ThemeProvider } from "@/components/ThemeProvider";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "AUMOXO — Think Infinite | Enterprise Technology Services & Products",
    template: "%s | AUMOXO",
  },
  description:
    "AUMOXO delivers next-generation technology services and products to global enterprises. Cloud, AI, digital engineering, and platform solutions built for scale.",
  keywords: ["AUMOXO", "enterprise technology", "digital transformation", "AI solutions", "cloud services", "software products", "IT services"],
  openGraph: {
    title: "AUMOXO — Think Infinite",
    description: "Enterprise technology services and products engineered for the next decade.",
    url: siteUrl,
    siteName: "AUMOXO",
    images: ["/logo.jpeg"],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "AUMOXO — Think Infinite",
    description: "Enterprise technology services and products built for scale.",
    images: ["/logo.jpeg"],
  },
  icons: {
    icon: [
      { url: "/logo-mark.png?v=2", type: "image/png" },
    ],
    apple: "/logo-mark.png?v=2",
    shortcut: "/logo-mark.png?v=2",
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
      </head>
      <body className="min-h-screen bg-bg-base text-ink-100 font-sans">
        <ThemeProvider>
          <Navbar />
          <main className="min-h-screen">{children}</main>
          <Footer />
          <SiteParticles />
          <Chatbot />
        </ThemeProvider>
      </body>
    </html>
  );
}
