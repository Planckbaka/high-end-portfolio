"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { navItems } from "@/config/data";

/**
 * Shared nav links — one implementation for both the desktop bar and the
 * mobile row.
 *
 * The active item gets an accent rule underneath rather than only a colour
 * shift, so the current section is legible at a glance in both themes.
 */
function NavLinks({ className, linkClassName }: {
    className?: string;
    linkClassName?: string;
}) {
    const pathname = usePathname();

    return (
        <>
            {navItems.map((item, index) => {
                const isActive = pathname === item.path;

                return (
                    <div key={item.path} className={cn("flex items-center gap-2", className)}>
                        <Link
                            href={item.path}
                            aria-current={isActive ? "page" : undefined}
                            className={cn(
                                "relative py-1 transition-colors duration-300",
                                isActive
                                    ? "text-foreground"
                                    : "text-foreground/55 hover:text-foreground",
                                linkClassName
                            )}
                        >
                            {item.name}
                            <span
                                aria-hidden="true"
                                className={cn(
                                    "absolute -bottom-0.5 left-0 h-px bg-accent transition-all duration-300",
                                    isActive ? "w-full opacity-100" : "w-0 opacity-0"
                                )}
                            />
                        </Link>
                        {index < navItems.length - 1 && (
                            <span aria-hidden="true" className="text-foreground/20">/</span>
                        )}
                    </div>
                );
            })}
        </>
    );
}

export function Navbar() {
    return (
        /*
         * Entrance is a CSS animation, not framer-motion. Site navigation must be
         * in its final position on the first painted frame: a JS-driven
         * `initial={{ y: "-100%" }}` leaves the whole header parked off-screen if
         * that animation never completes.
         */
        <header
            className="reveal-drop fixed top-0 left-0 w-full z-50 gutter py-4 md:py-5 backdrop-blur-xl bg-background/75 border-b border-hairline"
        >
            <div className="flex justify-between items-center gap-4">

                {/* Logo / Brand */}
                <Link href="/" className="flex items-center gap-3 group shrink-0" aria-label="Go to homepage">
                    <Image
                        src="/avatar.jpeg"
                        alt=""
                        width={32}
                        height={32}
                        className="rounded-full object-cover border border-hairline-strong group-hover:scale-105 transition-transform duration-300"
                    />
                    <span className="font-heading font-bold uppercase tracking-[0.18em] text-sm text-foreground">
                        Portfolio
                    </span>
                </Link>

                {/*
                 * Desktop navigation.
                 *
                 * Previously absolutely centred (`absolute left-1/2 -translate-x-1/2`)
                 * from the `md` breakpoint up. Because it was out of flow it could not
                 * push the theme controls aside, so between 768px and ~935px the
                 * centred links overlapped the "Dark mode" toggle. It now sits in
                 * normal flow and only turns on at `lg`, where there is room for it.
                 */}
                <nav
                    className="hidden lg:flex items-center gap-2 text-eyebrow uppercase"
                    aria-label="Main navigation"
                >
                    <NavLinks />
                </nav>

                {/* Right side: theme toggle & copyright */}
                <div className="flex items-center gap-4 md:gap-6 shrink-0">
                    <ThemeToggle />
                    <span className="hidden xl:inline-block text-eyebrow text-foreground/45 nums-tabular">
                        © {new Date().getFullYear()}
                    </span>
                </div>
            </div>

            {/* Navigation for narrow viewports, including the md range where the
                inline desktop bar would not fit alongside the toggle. */}
            <div className="lg:hidden flex justify-center mt-3 gap-4 text-eyebrow uppercase">
                <NavLinks />
            </div>
        </header>
    );
}
