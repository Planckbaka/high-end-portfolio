"use client";

import { motion, useScroll, useSpring } from "framer-motion";

/**
 * Hairline reading-progress bar pinned under the navbar.
 *
 * Purely decorative, so it is hidden from assistive tech — a screen reader
 * gains nothing from a continuously changing percentage.
 */
export function ReadingProgress() {
    const { scrollYProgress } = useScroll();
    const scaleX = useSpring(scrollYProgress, {
        stiffness: 180,
        damping: 30,
        restDelta: 0.001,
    });

    return (
        <motion.div
            aria-hidden="true"
            style={{ scaleX }}
            className="fixed top-0 left-0 z-[60] h-0.5 w-full origin-left bg-accent"
        />
    );
}
