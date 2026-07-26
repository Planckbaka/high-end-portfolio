import type { MetadataRoute } from "next";
import { siteConfig } from "@/config/site";

/**
 * Web app manifest.
 *
 * Replaces the unused static `public/Favicon Converter/site.webmanifest`, which
 * had empty name fields and hardcoded white theme colours that clashed with the
 * dark default theme.
 */
export default function manifest(): MetadataRoute.Manifest {
    return {
        name: siteConfig.name,
        short_name: "Akiwayne",
        description: siteConfig.description,
        start_url: "/",
        display: "standalone",
        background_color: "#0a0a0a",
        theme_color: "#0a0a0a",
        icons: [
            { src: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
            { src: "/android-chrome-192x192.png", sizes: "192x192", type: "image/png" },
            {
                src: "/android-chrome-512x512.png",
                sizes: "512x512",
                type: "image/png",
                purpose: "any",
            },
        ],
    };
}
