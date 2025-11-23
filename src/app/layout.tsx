import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google";
import "./globals.css";
import { SmoothScroll } from "@/lib/smooth-scroll";
import { cn } from "@/lib/utils";
import { Navbar } from "@/components/ui/Navbar";
import { ThemeProvider } from "@/components/ThemeProvider";
import { ErrorBoundary } from "@/components/ErrorBoundary";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
});

const outfit = Outfit({
  variable: "--font-heading",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Akiwayne's Portfolio | Creative Developer",
    template: "%s | Akiwayne's Portfolio"
  },
  description: "A modern portfolio showcasing creative development, web design, and engineering. Specializing in Go, React, Next.js, Kubernetes, and microservices.",
  keywords: ["portfolio", "web design", "creative developer", "frontend", "backend", "Go", "React", "Next.js", "Kubernetes", "microservices"],
  authors: [{ name: "Akiwayne", url: "https://github.com/Planckbaka" }],
  creator: "Akiwayne",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://yourportfolio.com",
    title: "Akiwayne's Portfolio | Creative Developer",
    description: "A modern portfolio showcasing creative development, web design, and engineering.",
    siteName: "Akiwayne's Portfolio",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Akiwayne's Portfolio"
      }
    ]
  },
  twitter: {
    card: "summary_large_image",
    title: "Akiwayne's Portfolio | Creative Developer",
    description: "A modern portfolio showcasing creative development, web design, and engineering.",
    images: ["/og-image.png"],
    creator: "@akiwayne"
  },
  icons: {
    icon: '/avatar.jpeg',
    shortcut: '/avatar.jpeg',
    apple: '/avatar.jpeg',
  },
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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="antialiased" suppressHydrationWarning>
      <body
        className={cn(
          inter.variable,
          outfit.variable,
          "font-sans bg-background text-foreground overflow-x-hidden"
        )}
      >
        <ThemeProvider
          attribute="data-theme"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <ErrorBoundary>
            <Navbar />
            <SmoothScroll>{children}</SmoothScroll>
          </ErrorBoundary>
        </ThemeProvider>
      </body>
    </html>
  );
}

