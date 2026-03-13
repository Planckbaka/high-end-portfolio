"use client";

import { useEffect, useState } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";

export function CustomCursor() {
    const [isVisible, setIsVisible] = useState(false);

    // Also track if device is touch or screen is very small, to hide cursor.
    // Lazy initializer avoids a redundant state update + re-render on mount.
    const [isTouchDevice] = useState(
        () => typeof window !== "undefined" && ("ontouchstart" in window || navigator.maxTouchPoints > 0)
    );

    // Create motion values for x and y
    const cursorX = useMotionValue(-100);
    const cursorY = useMotionValue(-100);
    
    // Add smooth springing to the cursor movement
    const springConfig = { damping: 25, stiffness: 300 };
    const cursorXSpring = useSpring(cursorX, springConfig);
    const cursorYSpring = useSpring(cursorY, springConfig);

    useEffect(() => {
        const moveCursor = (e: MouseEvent) => {
            cursorX.set(e.clientX - 16); // offset by half the width/height
            cursorY.set(e.clientY - 16);
            setIsVisible(true);
        };

        const handleMouseEnter = () => setIsVisible(true);
        const handleMouseLeave = () => setIsVisible(false);

        // Listen for mouse movement
        window.addEventListener("mousemove", moveCursor);
        document.body.addEventListener("mouseenter", handleMouseEnter);
        document.body.addEventListener("mouseleave", handleMouseLeave);

        return () => {
            window.removeEventListener("mousemove", moveCursor);
            document.body.removeEventListener("mouseenter", handleMouseEnter);
            document.body.removeEventListener("mouseleave", handleMouseLeave);
        };
    }, [cursorX, cursorY]);

    if (isTouchDevice) return null;

    return (
        <motion.div
            className="fixed top-0 left-0 w-8 h-8 rounded-full pointer-events-none z-[9999] mix-blend-difference bg-white"
            style={{
                x: cursorXSpring,
                y: cursorYSpring,
                opacity: isVisible ? 1 : 0,
                scale: isVisible ? 1 : 0.5,
            }}
            transition={{
                opacity: { duration: 0.2 },
                scale: { duration: 0.3 }
            }}
        />
    );
}
