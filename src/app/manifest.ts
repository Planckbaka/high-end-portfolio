import type { MetadataRoute } from "next";
import { siteConfig } from "@/config/site";

/**
 * Web app manifest.
 *
 * Purpose-built favicon set; per-scheme browser chrome colors live in the
 * viewport `themeColor` (layout.tsx) because the manifest spec takes only one.
 */
export default function manifest(): MetadataRoute.Manifest {
    return {
        name: siteConfig.name,
        short_name: "Akiwayne",
        description: siteConfig.description,
        id: "/",
        start_url: "/",
        display: "standalone",
        // Matches --background for the default (light) theme; the browser-level
        // themeColor in layout.tsx handles per-scheme values, which the
        // manifest spec cannot express.
        background_color: "#f7f6f2",
        theme_color: "#f7f6f2",
        icons: [
            { src: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
            { src: "/android-chrome-192x192.png", sizes: "192x192", type: "image/png" },
            {
                src: "/android-chrome-512x512.png",
                sizes: "512x512",
                type: "image/png",
                purpose: "any",
            },
            {
                src: "/android-chrome-512x512.png",
                sizes: "512x512",
                type: "image/png",
                purpose: "maskable",
            },
        ],
    };
}
