import { cn } from "@/lib/utils";

/**
 * Fixed column rules plus an ambient accent glow.
 *
 * Two theme bugs fixed here:
 *  - `dark:opacity-100` used to follow the OS colour scheme rather than the
 *    in-page theme. It now reads `--glow-opacity`, which is declared per theme
 *    alongside every other token.
 *  - `mix-blend-screen` is a no-op-to-invisible on a light background (screen
 *    against near-white stays near-white), so the glow simply vanished in the
 *    light theme. Plain alpha compositing renders in both.
 *
 * Server component: it has no interactivity, so there is no reason to ship it
 * to the client.
 */
export function GridBackground({ className }: { className?: string }) {
    return (
        <div
            aria-hidden="true"
            className={cn(
                "fixed inset-0 z-[-1] pointer-events-none flex justify-between gutter w-full h-full",
                className
            )}
        >
            {/* Ambient radial glow */}
            <div
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80vw] h-[80vw] max-w-[800px] max-h-[800px] bg-accent/10 md:bg-accent/[0.07] rounded-full blur-[100px]"
                style={{ opacity: "var(--glow-opacity)" }}
            />

            {/* Vertical rules */}
            <div className="relative z-10 w-px h-full bg-hairline" />
            <div className="relative z-10 w-px h-full bg-hairline" />
            <div className="relative z-10 w-px h-full bg-hairline" />
            <div className="relative z-10 w-px h-full bg-hairline hidden md:block" />
            <div className="relative z-10 w-px h-full bg-hairline hidden lg:block" />
        </div>
    );
}
