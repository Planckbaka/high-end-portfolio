import { ArrowDown } from "lucide-react";
import { contactDetails } from "@/config/data";
import { siteConfig } from "@/config/site";

/**
 * Landing hero.
 *
 * Deliberately a server component with CSS-only entrance animation. This is the
 * LCP element, so it paints on the first frame rather than waiting for React to
 * hydrate and framer-motion to run — and the headline can never be left stuck
 * at opacity 0 if that JS never arrives. See the `reveal-*` utilities in
 * globals.css.
 */
export function Hero() {
    return (
        <section className="relative min-h-svh flex flex-col justify-center gutter pt-36 pb-28 md:pt-32">
            {/* Eyebrow: gives the display type a subject before the reader scrolls */}
            <p
                className="reveal-fade [--reveal-delay:0.55s] text-eyebrow uppercase text-foreground/55 mb-6 md:mb-10 flex flex-wrap items-center gap-x-3 gap-y-1"
            >
                <span className="text-foreground/85">{siteConfig.author.name}</span>
                <span aria-hidden="true" className="h-px w-6 bg-accent/70" />
                <span>{contactDetails.location}</span>
            </p>

            <h1 className="flex flex-col gap-1 md:gap-2">
                <OverflowText className="text-display-2xl font-heading uppercase text-foreground">
                    Creative
                </OverflowText>

                <span className="flex items-center gap-4 md:gap-8">
                    {/* Rule that draws itself in, tying the two lines together */}
                    <span
                        aria-hidden="true"
                        className="reveal-rule [--reveal-delay:0.5s] h-px flex-1 bg-accent/70"
                    />
                    <OverflowText
                        className="text-display-2xl font-heading uppercase text-foreground text-right"
                        delay="0.1s"
                    >
                        Developer
                    </OverflowText>
                </span>

                <OverflowText
                    className="text-display-2xl font-heading uppercase text-foreground/35"
                    delay="0.2s"
                >
                    &amp; Designer
                </OverflowText>
            </h1>

            {/* Real anchor rather than a decorative label */}
            <a
                href="#work"
                className="reveal [--reveal-delay:0.9s] group absolute bottom-10 left-4 md:left-12 lg:left-24 inline-flex items-center gap-3 text-eyebrow uppercase text-foreground/55 hover:text-accent transition-colors duration-300"
            >
                <span
                    aria-hidden="true"
                    className="grid h-8 w-8 place-items-center rounded-full border border-hairline-strong group-hover:border-accent transition-colors duration-300"
                >
                    <ArrowDown
                        size={13}
                        className="animate-bounce [animation-duration:2.2s] motion-reduce:animate-none"
                    />
                </span>
                Scroll to explore
            </a>
        </section>
    );
}

/**
 * Reveals a line of type by sliding it up out of a clipping mask.
 *
 * Rendered as spans so the parent <h1> stays a valid heading — the visible
 * words are the accessible name, rather than duplicating them into a
 * separate sr-only heading.
 */
function OverflowText({
    children,
    className,
    delay = "0s",
}: {
    children: React.ReactNode;
    className?: string;
    delay?: string;
}) {
    return (
        <span className="block overflow-hidden">
            <span
                className={`reveal-unmask block ${className ?? ""}`}
                style={{ "--reveal-delay": delay } as React.CSSProperties}
            >
                {children}
            </span>
        </span>
    );
}
