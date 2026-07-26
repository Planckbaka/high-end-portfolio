"use client";

import { Check, Link2, Linkedin } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { siteConfig } from "@/config/site";

/**
 * Share affordances for an article.
 *
 * Replaces the two empty bordered circles that previously sat under "Share" and
 * did nothing.
 */
export function ShareLinks({ title, slug }: { title: string; slug: string }) {
    const [copied, setCopied] = useState(false);

    /*
     * Always share the canonical URL rather than window.location.href. It is
     * identical in production, but keeps shares from a preview deployment (or
     * localhost) pointing at the real article instead of a host nobody else can
     * reach — and it needs no state, so the markup is stable across hydration.
     */
    const url = `${siteConfig.url}/articles/${slug}`;

    useEffect(() => {
        if (!copied) return;
        const id = window.setTimeout(() => setCopied(false), 2000);
        return () => window.clearTimeout(id);
    }, [copied]);

    const copy = useCallback(async () => {
        try {
            await navigator.clipboard.writeText(url);
            setCopied(true);
        } catch {
            // Clipboard unavailable (insecure context or denied permission).
            // Silently no-op rather than throwing at the user.
        }
    }, [url]);

    const targets = [
        {
            name: "Share on X",
            href: `https://x.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`,
            icon: <XIcon />,
        },
        {
            name: "Share on LinkedIn",
            href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
            icon: <Linkedin size={15} aria-hidden="true" />,
        },
    ];

    return (
        <div>
            <p className="text-eyebrow uppercase text-foreground/40 mb-4">Share</p>
            <div className="flex gap-3">
                {targets.map((target) => (
                    <a
                        key={target.name}
                        href={target.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={`${target.name} (opens in a new tab)`}
                        className="grid h-9 w-9 place-items-center rounded-full border border-hairline-strong text-foreground/60 hover:text-accent hover:border-accent transition-colors duration-300"
                    >
                        {target.icon}
                    </a>
                ))}

                <button
                    type="button"
                    onClick={copy}
                    aria-label={copied ? "Link copied" : "Copy link to this article"}
                    className="grid h-9 w-9 place-items-center rounded-full border border-hairline-strong text-foreground/60 hover:text-accent hover:border-accent transition-colors duration-300"
                >
                    {copied ? (
                        <Check size={15} className="text-accent" aria-hidden="true" />
                    ) : (
                        <Link2 size={15} aria-hidden="true" />
                    )}
                </button>
            </div>
            <span aria-live="polite" className="sr-only">
                {copied ? "Link copied to clipboard" : ""}
            </span>
        </div>
    );
}

/** lucide-react has no X/Twitter glyph, so ship the mark inline. */
function XIcon() {
    return (
        <svg viewBox="0 0 24 24" width={14} height={14} fill="currentColor" aria-hidden="true">
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
    );
}
