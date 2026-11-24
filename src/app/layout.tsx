import type { Metadata } from "next";
import { Space_Grotesk, JetBrains_Mono, Source_Serif_4 } from "next/font/google";
import "./globals.css";
import { SiteFooter } from "@/components/ui/SiteFooter";
import { cn } from "@/lib/utils";
import { Navbar } from "@/components/ui/Navbar";

import { ThemeProvider } from "@/components/ThemeProvider";
import { ErrorBoundary } from "@/components/ErrorBoundary";

import { siteConfig } from "@/config/site";
import { RouteAnnouncer } from "@/components/RouteAnnouncer";

const spaceGrotesk = Space_Grotesk({
  variable: "--font-display",
  subsets: ["latin"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-code",
  subsets: ["latin"],
  display: "swap",
});

const sourceSerif = Source_Serif_4({
  variable: "--font-serif",
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
  ],
  authors: [{ name: siteConfig.author.name, url: siteConfig.author.github }],
  creator: siteConfig.author.name,
  alternates: {
    // Footgun: this default canonicalizes any future route that forgets its
    // own metadata to the homepage. Every route must override it.
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
  /*
   * Purpose-built favicon set. The old config pointed every icon slot at
   * /avatar.jpeg — a 22 KB photo the browser had to downscale to 16px, with no
   * apple-touch or maskable variant.
   */
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

export const viewport = {
  // Matches --background in globals.css for each theme, so the browser chrome
  // on mobile blends into the page instead of banding against it.
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f7f6f2" },
    { media: "(prefers-color-scheme: dark)", color: "#191b19" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // JSON-LD structured data for SEO
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: siteConfig.author.name,
    url: siteConfig.url,
    image: `${siteConfig.url}${siteConfig.ogImage}`,
    sameAs: [siteConfig.author.github, siteConfig.author.linkedin],
    jobTitle: "Backend Developer",
    description: siteConfig.description,
    knowsAbout: ["Go", "Python", "Model Inference", "Backend Systems"],
  };

  return (
    /*
     * overflow-x: clip, not hidden. `hidden` makes the element a scroll
     * container, which strands the sticky header; `clip` trims the same
     * overflow without one. Applies to html and body together, because a
     * clip on body alone still lets html scroll sideways.
     */
    <html lang="en" className="antialiased overflow-x-clip" suppressHydrationWarning>
      <body
        className={cn(
          spaceGrotesk.variable,
          jetbrainsMono.variable,
          sourceSerif.variable,
          "bg-background text-foreground overflow-x-clip font-sans"
        )}
      >
        {/* React 19 hoists this into <head>; no manual <head> element needed. */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
        />
        <ThemeProvider
          attribute="data-theme"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <ErrorBoundary>
            {/* Skip to content link for accessibility */}
            <a href="#main-content" className="skip-link">
              Skip to main content
            </a>
            <Navbar />
            {/* tabIndex makes <main> a programmatic focus target for the skip
                link across assistive tech, not just modern fragment focus. */}
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
