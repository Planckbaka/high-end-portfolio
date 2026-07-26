"use client";

import { ArrowUp } from "lucide-react";
import { socialLinks } from "@/config/data";
import { siteConfig } from "@/config/site";
import { smoothScrollTo } from "@/lib/smooth-scroll";

/**
 * Site footer.
 *
 * Replaces the previous inert "Scroll to top" <span> with a real button, and
 * surfaces the configured social links so the page ends on something actionable
 * instead of a dead label. Links whose URL is still a placeholder ("#") are
 * skipped rather than rendered as links that go nowhere.
 */
export function SiteFooter() {
    const realLinks = socialLinks.filter((link) => link.url && link.url !== "#");

    return (
        <footer
            className="gutter py-12 border-t border-hairline flex flex-col md:flex-row gap-6 md:gap-4 justify-between items-start md:items-center text-eyebrow uppercase text-foreground/55"
            role="contentinfo"
        >
            <span className="nums-tabular">
                © {new Date().getFullYear()} {siteConfig.author.name}
            </span>

            {realLinks.length > 0 && (
                <nav aria-label="Social links" className="flex flex-wrap gap-x-5 gap-y-2">
                    {realLinks.map((link) => (
                        <a
                            key={link.name}
                            href={link.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hover:text-accent transition-colors duration-300"
                        >
                            {link.name}
                        </a>
                    ))}
                </nav>
            )}

            <button
                type="button"
                onClick={() => smoothScrollTo(0)}
                className="group inline-flex items-center gap-2 hover:text-accent transition-colors duration-300"
            >
                Back to top
                <span
                    aria-hidden="true"
                    className="grid h-7 w-7 place-items-center rounded-full border border-hairline-strong group-hover:border-accent group-hover:-translate-y-0.5 transition-all duration-300"
                >
                    <ArrowUp size={12} />
                </span>
            </button>
        </footer>
    );
}
