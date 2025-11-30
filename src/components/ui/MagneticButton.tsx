"use client";

import { motion, useMotionTemplate, useMotionValue, useSpring } from "framer-motion";
import { ArrowUpRight, FileText } from "lucide-react";
import { useRef } from "react";

export function MagneticButton({
    children,
    href,
    className = "",
}: {
    children: React.ReactNode;
    href: string;
    className?: string;
}) {
    const ref = useRef<HTMLAnchorElement>(null);

    // Mouse position relative to the button center
    const x = useMotionValue(0);
    const y = useMotionValue(0);

    // Smooth spring animation
    const springConfig = { damping: 15, stiffness: 150, mass: 0.1 };
    const xSpring = useSpring(x, springConfig);
    const ySpring = useSpring(y, springConfig);

    const transform = useMotionTemplate`translate(${xSpring}px, ${ySpring}px)`;

    const handleMouseMove = (e: React.MouseEvent<HTMLAnchorElement>) => {
        if (!ref.current) return;

        const { left, top, width, height } = ref.current.getBoundingClientRect();
        const centerX = left + width / 2;
        const centerY = top + height / 2;

        const distanceX = e.clientX - centerX;
        const distanceY = e.clientY - centerY;

        // Magnetic strength
        x.set(distanceX * 0.3);
        y.set(distanceY * 0.3);
    };

    const handleMouseLeave = () => {
        x.set(0);
        y.set(0);
    };

    return (
        <motion.a
            ref={ref}
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            style={{ transform }}
            className={`group relative inline-flex items-center gap-3 px-8 py-4 bg-white/5 border border-white/10 rounded-full overflow-hidden hover:border-accent/50 transition-colors duration-500 ${className}`}
        >
            {/* Hover Fill Effect */}
            <div className="absolute inset-0 bg-accent translate-y-[100%] group-hover:translate-y-0 transition-transform duration-500 ease-[0.76,0,0.24,1]" />

            {/* Content */}
            <div className="relative z-10 flex items-center gap-2 mix-blend-difference text-white">
                <FileText size={18} />
                <span className="uppercase tracking-widest text-sm font-bold">{children}</span>
                <ArrowUpRight size={18} className="group-hover:rotate-45 transition-transform duration-500" />
            </div>
        </motion.a>
    );
}
