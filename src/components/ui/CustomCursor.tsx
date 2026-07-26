"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useMotionValue, useSpring, useReducedMotion } from "framer-motion";
import { useTheme } from "next-themes";

type CursorType = "" | "link" | "view" | "coming";

export function CustomCursor() {
    const [isVisible, setIsVisible] = useState(true);
    const [hoveredType, setHoveredType] = useState<CursorType>("");
    const shouldReduceMotion = useReducedMotion();
    const { resolvedTheme } = useTheme();

    const cursorSizeRef = useRef(16);

    const cursorX = useMotionValue(-100);
    const cursorY = useMotionValue(-100);

    const springConfig = { damping: 30, stiffness: 250, mass: 0.8 };
    const cursorXSpring = useSpring(cursorX, springConfig);
    const cursorYSpring = useSpring(cursorY, springConfig);

    const getCursorSize = (type: CursorType): number => {
        switch (type) {
            case "coming": return 80;
            case "view": return 70;
            case "link": return 56;
            default: return 16;
        }
    };

    // Keep size ref in sync with hovered type so the RAF loop picks it up
    useEffect(() => {
        cursorSizeRef.current = getCursorSize(hoveredType);
    }, [hoveredType]);

    useEffect(() => {
        // Respect reduced motion preference
        if (shouldReduceMotion) return;

        // Add custom cursor class for CSS cursor hiding
        document.body.classList.add("custom-cursor-active");

        // Latest pointer position; updated by mousemove, consumed by the RAF loop.
        // Keeping this in a ref means mousemove does ~zero allocation and no React work.
        const mousePos = { x: -100, y: -100 };
        let rafId: number | null = null;

        // One RAF per frame writes both MotionValues — coalesces 60-120 mousemoves into 1 render tick.
        const tick = () => {
            const size = cursorSizeRef.current;
            cursorX.set(mousePos.x - size / 2);
            cursorY.set(mousePos.y - size / 2);
            rafId = requestAnimationFrame(tick);
        };
        rafId = requestAnimationFrame(tick);

        // mousemove: ONLY record coordinates. No DOM traversal, no state, no MotionValue writes.
        const handleMouseMove = (e: MouseEvent) => {
            mousePos.x = e.clientX;
            mousePos.y = e.clientY;
        };

        // Hover detection via delegated pointerover — fires only on element transitions,
        // not on every pixel move. Dedup by resolved type so React renders only on real change.
        const resolveType = (target: EventTarget | null): CursorType => {
            const el = target instanceof HTMLElement ? target : null;
            if (!el) return "";
            const cursorEl = el.closest("[data-cursor]") as HTMLElement | null;
            if (cursorEl) {
                const type = cursorEl.getAttribute("data-cursor") as CursorType;
                if (type === "coming" || type === "view") return type;
            }
            const interactiveEl = el.closest("a, button, [role='button'], input[type='submit']") as HTMLElement | null;
            return interactiveEl ? "link" : "";
        };
        let lastType: CursorType = "";
        const handlePointerOver = (e: PointerEvent) => {
            const t = resolveType(e.target);
            if (t !== lastType) {
                lastType = t;
                setHoveredType(t);
            }
        };

        const handleMouseEnter = () => setIsVisible(true);
        const handleMouseLeave = () => setIsVisible(false);

        window.addEventListener("mousemove", handleMouseMove, { passive: true });
        document.addEventListener("pointerover", handlePointerOver, { passive: true });
        document.body.addEventListener("mouseenter", handleMouseEnter);
        document.body.addEventListener("mouseleave", handleMouseLeave);

        return () => {
            document.body.classList.remove("custom-cursor-active");
            if (rafId !== null) cancelAnimationFrame(rafId);
            window.removeEventListener("mousemove", handleMouseMove);
            document.removeEventListener("pointerover", handlePointerOver);
            document.body.removeEventListener("mouseenter", handleMouseEnter);
            document.body.removeEventListener("mouseleave", handleMouseLeave);
        };
    }, [shouldReduceMotion, cursorX, cursorY]);

    // Hide on touch devices
    const [isTouchDevice] = useState(() =>
        typeof window !== "undefined" && ("ontouchstart" in window || navigator.maxTouchPoints > 0)
    );

    if (shouldReduceMotion || isTouchDevice) return null;

    const size = getCursorSize(hoveredType);
    // No mix-blend-difference: it forces a full-viewport recomposite every frame.
    // Theme-aware solid colors preserve the look on the default dark theme at ~zero compositor cost.
    const isDark = resolvedTheme !== "light"; // undefined (SSR/first paint) → dark, matching defaultTheme
    const cursorBg = isDark ? "rgba(255, 255, 255, 0.9)" : "rgba(20, 20, 20, 0.9)";
    const cursorBgLink = isDark ? "rgba(255, 255, 255, 0.15)" : "rgba(20, 20, 20, 0.1)";
    const cursorBorderLink = isDark ? "rgba(255, 255, 255, 1)" : "rgba(20, 20, 20, 0.9)";
    const labelColor = isDark ? "black" : "white";

    return (
        <motion.div
            className="fixed top-0 left-0 rounded-full pointer-events-none z-[9999] flex items-center justify-center font-sans font-bold uppercase tracking-widest text-[8px] text-center will-change-transform"
            style={{
                x: cursorXSpring,
                y: cursorYSpring,
                opacity: isVisible ? 1 : 0,
                width: size,
                height: size,
                backgroundColor: hoveredType === "link" ? cursorBgLink : cursorBg,
                border: hoveredType === "link" ? `1px solid ${cursorBorderLink}` : "none",
            }}
            animate={{
                scale: isVisible ? 1 : 0.5,
            }}
            transition={{
                type: "spring",
                stiffness: 300,
                damping: 25,
                mass: 0.5,
            }}
        >
            {(hoveredType === "coming" || hoveredType === "view") && (
                <motion.span
                    initial={{ opacity: 0, scale: 0.6 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    className="text-[9px] tracking-widest font-heading select-none pointer-events-none"
                    style={{ color: labelColor }}
                >
                    {hoveredType === "coming" ? "COMING" : "VIEW"}
                </motion.span>
            )}
        </motion.div>
    );
}
