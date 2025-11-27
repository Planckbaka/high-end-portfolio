"use client";

import { GridBackground } from "@/components/ui/GridBackground";
import { motion } from "framer-motion";
import Link from "next/link";

export default function NotFound() {
    return (
        <main className="relative min-h-screen w-full flex items-center justify-center overflow-hidden">
            <GridBackground />

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                className="relative z-10 text-center px-4"
            >
                <motion.div
                    initial={{ scale: 0.9 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
                    className="mb-8"
                >
                    <h1 className="text-[20vw] md:text-[15vw] lg:text-[12vw] font-heading font-bold leading-none text-foreground/10">
                        404
                    </h1>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3, duration: 0.8 }}
                    className="space-y-6"
                >
                    <h2 className="text-3xl md:text-5xl font-heading font-bold uppercase tracking-tighter">
                        Page Not{" "}
                        <span className="text-accent">Found</span>
                    </h2>

                    <p className="text-foreground/60 max-w-md mx-auto text-sm md:text-base">
                        The page you're looking for doesn't exist or has been moved.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mt-8">
                        <Link
                            href="/"
                            className="group relative px-8 py-3 bg-accent text-accent-foreground font-medium uppercase tracking-wider text-sm overflow-hidden transition-all duration-300 hover:scale-105"
                        >
                            <span className="relative z-10">Go Home</span>
                            <div className="absolute inset-0 bg-foreground/10 scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
                        </Link>

                        <Link
                            href="/articles"
                            className="group px-8 py-3 border border-foreground/20 text-foreground font-medium uppercase tracking-wider text-sm hover:border-accent hover:text-accent transition-all duration-300"
                        >
                            View Articles
                        </Link>
                    </div>
                </motion.div>
            </motion.div>
        </main>
    );
}
