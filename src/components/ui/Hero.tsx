"use client";

import { motion } from "framer-motion";

export function Hero() {
    return (
        <section className="relative min-h-screen flex flex-col justify-center px-4 md:px-12 lg:px-24 pt-20">
            <h1 className="sr-only">Creative Developer & Designer</h1>
            <div className="flex flex-col gap-2 md:gap-4" aria-hidden="true">
                <OverflowText className="text-[12vw] leading-[0.85] font-heading font-bold uppercase tracking-tighter text-foreground">
                    Creative
                </OverflowText>
                <div className="flex items-center gap-4 md:gap-8">
                    <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: "auto" }}
                        transition={{ duration: 1, ease: [0.76, 0, 0.24, 1], delay: 0.5 }}
                        className="h-[1px] bg-accent flex-1 overflow-hidden"
                    />
                    <OverflowText className="text-[12vw] leading-[0.85] font-heading font-bold uppercase tracking-tighter text-foreground text-right" delay={0.1}>
                        Developer
                    </OverflowText>
                </div>
                <OverflowText className="text-[12vw] leading-[0.85] font-heading font-bold uppercase tracking-tighter text-foreground/50" delay={0.2}>
                    &  Designer
                </OverflowText>
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1, duration: 0.8 }}
                className="absolute bottom-12 left-4 md:left-12 lg:left-24 text-sm uppercase tracking-widest text-foreground/60"
            >
                Scroll to explore
            </motion.div>
        </section>
    );
}

function OverflowText({ children, className, delay = 0 }: { children: React.ReactNode, className?: string, delay?: number }) {
    return (
        <div className="overflow-hidden">
            <motion.div
                initial={{ y: "100%" }}
                animate={{ y: 0 }}
                transition={{ duration: 1, ease: [0.76, 0, 0.24, 1], delay }}
                className={className}
            >
                {children}
            </motion.div>
        </div>
    );
}
