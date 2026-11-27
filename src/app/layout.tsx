import type { Metadata, Viewport } from "next";
import { Newsreader, Inter, Source_Serif_4, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { SiteFooter } from "@/components/ui/SiteFooter";
import { cn } from "@/lib/utils";
import { Navbar } from "@/components/ui/Navbar";

import { ThemeProvider } from "@/components/ThemeProvider";
import { ErrorBoundary } from "@/components/ErrorBoundary";

import { siteConfig } from "@/config/site";
import { PERSON_ID, serializeJsonLd } from "@/lib/seo";
import { RouteAnnouncer } from "@/components/RouteAnnouncer";

const newsreader = Newsreader({
  variable: "--font-display",
  subsets: ["latin"],
  style: ["normal", "italic"],
  display: "swap",
});

const inter = Inter({
  variable: "--font-ui",
  subsets: ["latin"],
  display: "swap",
});

const sourceSerif = Source_Serif_4({
  variable: "--font-serif",
  subsets: ["latin"],
  style: ["normal", "italic"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-code",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: siteConfig.title,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
  keywords: [
    "Go",
    "Python",
    "LLM",
    "model inference",
    "backend engineering",
    "PyTorch",
    "concurrency",
    "FlashAttention",
    "DeepSeek MLA",
    "GRPO",
    "distributed training",
    "KV cache",
    "AI infrastructure",
    "systems engineering",
  ],
  authors: [{ name: siteConfig.author.name, url: siteConfig.author.github }],
  creator: siteConfig.author.name,
  alternates: {
    canonical: "/",
    types: { "application/rss+xml": "/feed.xml" },
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: siteConfig.url,
    title: siteConfig.title,
    description: siteConfig.description,
    siteName: siteConfig.name,
    images: [
      {
        url: siteConfig.ogImage,
        width: 1200,
        height: 630,
        alt: siteConfig.name,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: siteConfig.title,
    description: siteConfig.description,
    images: [siteConfig.ogImage],
    creator: siteConfig.author.twitter,
  },
  icons: {
    icon: [
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
    ],
    shortcut: "/favicon-32x32.png",
    apple: "/apple-touch-icon.png",
  },
  manifest: "/manifest.webmanifest",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export const viewport: Viewport = {
  colorScheme: "light dark",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#faf9f5" },
    { media: "(prefers-color-scheme: dark)", color: "#141413" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Person",
    "@id": PERSON_ID,
    name: siteConfig.author.name,
    url: siteConfig.url,
    image: `${siteConfig.url}${siteConfig.ogImage}`,
    sameAs: [siteConfig.author.github, siteConfig.author.linkedin],
    jobTitle: "Backend & AI Systems Researcher",
    description: siteConfig.description,
    knowsAbout: ["Go", "Python", "Model Inference", "Backend Systems"],
  };

  return (
    <html lang="en" className="antialiased overflow-x-clip" suppressHydrationWarning>
      <body
        className={cn(
          newsreader.variable,
          inter.variable,
          sourceSerif.variable,
          jetbrainsMono.variable,
          "bg-background text-foreground overflow-x-clip font-sans"
        )}
      >
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: serializeJsonLd(jsonLd) }}
        />
        <ThemeProvider
          attribute="data-theme"
          defaultTheme="light"
          enableSystem={false}
          disableTransitionOnChange
        >
          <ErrorBoundary>
            <a href="#main-content" className="skip-link">
              Skip to main content
            </a>
            <Navbar />
            <main id="main-content" tabIndex={-1}>
              {children}
            </main>
            <SiteFooter />
            <RouteAnnouncer />
          </ErrorBoundary>
        </ThemeProvider>
      </body>
    </html>
  );
}
