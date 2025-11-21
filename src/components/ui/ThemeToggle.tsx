"use client";

import * as React from "react";
import { useTheme } from "next-themes";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export function ThemeToggle() {
    const { theme, setTheme } = useTheme();
    const [mounted, setMounted] = React.useState(false);

    React.useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) {
        return <div className="w-32 h-8" />;
    }

    return (
        <div className="flex items-center gap-3 text-xs uppercase tracking-widest font-bold">
            <span className="hidden md:inline-block text-white/60">Dark Mode:</span>
            <div className="relative flex items-center bg-white/5 border border-white/10 rounded-full p-0.5">
                <button
                    onClick={() => setTheme("dark")}
                    className={cn(
                        "relative z-10 px-3 py-1 rounded-full transition-colors duration-300",
                        theme === "dark" ? "text-black" : "text-white/60 hover:text-white/80"
                    )}
                >
                    On
                    {theme === "dark" && (
                        <motion.div
                            layoutId="activeTheme"
                            className="absolute inset-0 bg-white rounded-full z-[-1]"
                            transition={{ type: "spring", stiffness: 400, damping: 30 }}
                        />
                    )}
                </button>
                <button
                    onClick={() => setTheme("light")}
                    className={cn(
                        "relative z-10 px-3 py-1 rounded-full transition-colors duration-300",
                        theme === "light" ? "text-black" : "text-white/60 hover:text-white/80"
                    )}
                >
                    Off
                    {theme === "light" && (
                        <motion.div
                            layoutId="activeTheme"
                            className="absolute inset-0 bg-white rounded-full z-[-1]"
                            transition={{ type: "spring", stiffness: 400, damping: 30 }}
                        />
                    )}
                </button>
            </div>
        </div>
    );
}
