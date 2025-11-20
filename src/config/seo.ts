import { Metadata } from "next";

export const siteConfig = {
    name: "High-End Portfolio",
    description: "A showcase of modern web design and interaction",
    url: process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
    author: {
        name: "Your Name",
        email: "your.email@example.com",
        twitter: "@yourhandle",
    },
    keywords: [
        "portfolio",
        "web design",
        "creative developer",
        "next.js",
        "react",
        "framer motion",
    ],
};

export const defaultMetadata: Metadata = {
    metadataBase: new URL(siteConfig.url),
    title: {
        default: siteConfig.name,
        template: `%s | ${siteConfig.name}`,
    },
    description: siteConfig.description,
    keywords: siteConfig.keywords,
    authors: [{ name: siteConfig.author.name, url: siteConfig.url }],
    creator: siteConfig.author.name,
    openGraph: {
        type: "website",
        locale: "en_US",
        url: siteConfig.url,
        title: siteConfig.name,
        description: siteConfig.description,
        siteName: siteConfig.name,
    },
    twitter: {
        card: "summary_large_image",
        title: siteConfig.name,
        description: siteConfig.description,
        creator: siteConfig.author.twitter,
    },
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
