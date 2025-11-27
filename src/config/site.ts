/**
 * Site configuration
 * Centralized site metadata and URLs
 */

export const siteConfig = {
    name: "Akiwayne's Portfolio",
    title: "Akiwayne's Portfolio | Creative Developer",
    description:
        "A modern portfolio showcasing creative development, web design, and engineering. Specializing in Go, React, Next.js, Kubernetes, and microservices.",
    url:
        process.env.NEXT_PUBLIC_SITE_URL ||
        "https://high-end-portfolio.1229773363.workers.dev",
    author: {
        name: "Akiwayne",
        email: "akiwayne24@gmail.com",
        github: "https://github.com/Planckbaka",
        linkedin: "https://www.linkedin.com/in/zhang-weihuang-78753b382/",
        twitter: "@akiwayne",
    },
    ogImage: "/og-image.png",
    links: {
        github: "https://github.com/Planckbaka",
        linkedin: "https://www.linkedin.com/in/zhang-weihuang-78753b382/",
    },
} as const;

export type SiteConfig = typeof siteConfig;
