"use client";

import { GridBackground } from "@/components/ui/GridBackground";
import { motion } from "framer-motion";

export default function ArticlesError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    return (
        <main className="relative min-h-screen w-full flex items-center justify-center overflow-hidden">
            <GridBackground />

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="relative z-10 text-center px-4 max-w-2xl"
            >
                <div className="mb-8">
                    <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-accent/10 flex items-center justify-center">
                        <svg
                            className="w-8 h-8 text-accent"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                            />
                        </svg>
                    </div>

                    <h2 className="text-3xl md:text-5xl font-heading font-bold uppercase tracking-tighter mb-4">
                        Something Went{" "}
                        <span className="text-accent">Wrong</span>
                    </h2>

                    <p className="text-foreground/60 text-sm md:text-base mb-2">
                        Failed to load articles. Please try again.
                    </p>

                    {error.message && (
                        <p className="text-xs text-foreground/40 font-mono mt-4 p-3 bg-foreground/5 rounded">
                            {error.message}
                        </p>
                    )}
                </div>

                <button
                    onClick={reset}
                    className="group relative px-8 py-3 bg-accent text-accent-foreground font-medium uppercase tracking-wider text-sm overflow-hidden transition-all duration-300 hover:scale-105"
                >
                    <span className="relative z-10">Try Again</span>
                    <div className="absolute inset-0 bg-foreground/10 scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
                </button>
            </motion.div>
        </main>
    );
}
