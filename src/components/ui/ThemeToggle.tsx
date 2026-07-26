"use client";

import * as React from "react";
import { useTheme } from "next-themes";
import { motion } from "framer-motion";
import { Moon, Sun } from "lucide-react";
import { cn } from "@/lib/utils";

const OPTIONS = [
    { value: "light", label: "Light", Icon: Sun },
    { value: "dark", label: "Dark", Icon: Moon },
] as const;

export function ThemeToggle() {
    const { setTheme, resolvedTheme } = useTheme();
    const [mounted, setMounted] = React.useState(false);

    React.useEffect(() => {
        setMounted(true);
    }, []);

    // Reserve the final footprint so mounting does not shift the navbar.
    if (!mounted) {
        return <div className="h-8 w-[72px]" aria-hidden="true" />;
    }

    /*
     * Compare against `resolvedTheme`, not `theme`. With `enableSystem` the
     * latter can be the literal string "system", which matches neither option
     * and would leave the control with no visible selection.
     */
    const active = resolvedTheme === "light" ? "light" : "dark";

    return (
        <div
            role="group"
            aria-label="Colour theme"
            className="relative flex items-center gap-0.5 rounded-full border border-hairline bg-surface p-0.5"
        >
            {OPTIONS.map(({ value, label, Icon }) => {
                const isActive = active === value;

                return (
                    <button
                        key={value}
                        type="button"
                        onClick={() => setTheme(value)}
                        aria-label={`Switch to ${label.toLowerCase()} theme`}
                        aria-pressed={isActive}
                        className={cn(
                            "relative z-10 grid h-7 w-8 place-items-center rounded-full transition-colors duration-300",
                            isActive
                                ? "text-background"
                                : "text-foreground/45 hover:text-foreground/80"
                        )}
                    >
                        <Icon size={14} strokeWidth={2.25} aria-hidden="true" />
                        {isActive && (
                            <motion.span
                                layoutId="activeTheme"
                                className="absolute inset-0 -z-10 rounded-full bg-foreground"
                                transition={{ type: "spring", stiffness: 400, damping: 30 }}
                            />
                        )}
                    </button>
                );
            })}
        </div>
    );
}
