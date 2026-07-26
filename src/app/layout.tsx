import type { Metadata } from "next";
import { Space_Grotesk, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { SmoothScroll } from "@/lib/smooth-scroll";
import { cn } from "@/lib/utils";
import { Navbar } from "@/components/ui/Navbar";
import { Noise } from "@/components/ui/Noise";
import { ThemeProvider } from "@/components/ThemeProvider";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { CustomCursor } from "@/components/ui/CustomCursor";
import { siteConfig } from "@/config/site";

const spaceGrotesk = Space_Grotesk({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
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
  keywords: ["portfolio", "web design", "creative developer", "frontend", "backend", "Go", "React", "Next.js", "Kubernetes", "microservices"],
  authors: [{ name: siteConfig.author.name, url: siteConfig.author.github }],
  creator: siteConfig.author.name,
  alternates: {
    canonical: "/",
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
   * Purpose-built favicon set (generated previously and left unused in
   * public/Favicon Converter/). The old config pointed every icon slot at
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
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export const viewport = {
  // Matches --background in globals.css for each theme, so the browser chrome
  // on mobile blends into the page instead of banding against it.
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f6f5f3" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0a0a" },
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
    sameAs: [
      siteConfig.author.github,
      siteConfig.author.linkedin,
    ],
    jobTitle: "Creative Developer",
    description: siteConfig.description,
    knowsAbout: ["Go", "React", "Next.js", "Kubernetes", "Microservices", "Web Design"],
  };

  return (
    <html lang="en" className="antialiased" suppressHydrationWarning>
      <body
        className={cn(
          spaceGrotesk.variable,
          jetbrainsMono.variable,
          "font-sans bg-background text-foreground overflow-x-hidden"
        )}
      >
        {/* React 19 hoists this into <head>; no manual <head> element needed. */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <ThemeProvider
          attribute="data-theme"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <ErrorBoundary>
            {/* Skip to content link for accessibility */}
            <a
              href="#main-content"
              className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[100] focus:px-4 focus:py-2 focus:bg-accent focus:text-accent-foreground focus:rounded"
            >
              Skip to main content
            </a>
            <CustomCursor />
            <Navbar />
            <Noise />
            <SmoothScroll>
              <main id="main-content">{children}</main>
            </SmoothScroll>
          </ErrorBoundary>
        </ThemeProvider>
      </body>
    </html>
  );
}
