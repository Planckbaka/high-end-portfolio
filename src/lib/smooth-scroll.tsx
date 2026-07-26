"use client";

import { ReactNode, useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import Lenis from "lenis";

interface SmoothScrollProps {
    children: ReactNode;
}

/**
 * Module-level handle to the live Lenis instance.
 *
 * Anything that needs to move the page must go through Lenis. Native
 * `window.scrollTo({ behavior: "smooth" })` and `Element.scrollIntoView`
 * fight Lenis for control of the scroll position: Lenis keeps writing its own
 * interpolated value every frame, so the native animation is either overridden
 * mid-flight or ignored outright.
 */
let lenisInstance: Lenis | null = null;

export function getLenis(): Lenis | null {
    return lenisInstance;
}

/** Scroll the window to a target, with a graceful fallback if Lenis is absent. */
export function smoothScrollTo(
    target: number | string | HTMLElement,
    options?: { offset?: number; immediate?: boolean }
) {
    const lenis = getLenis();

    if (lenis) {
        lenis.scrollTo(target, {
            offset: options?.offset ?? 0,
            immediate: options?.immediate ?? false,
        });
        return;
    }

    // No Lenis (reduced motion, hydration not finished, or instance torn down).
    const prefersReduced =
        typeof window !== "undefined" &&
        window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const behavior: ScrollBehavior =
        options?.immediate || prefersReduced ? "auto" : "smooth";

    if (typeof target === "number") {
        window.scrollTo({ top: target, behavior });
        return;
    }

    const el =
        typeof target === "string" ? document.querySelector<HTMLElement>(target) : target;

    if (el) {
        window.scrollTo({
            top: el.getBoundingClientRect().top + window.scrollY + (options?.offset ?? 0),
            behavior,
        });
    }
}

export function SmoothScroll({ children }: SmoothScrollProps) {
    const rafIdRef = useRef<number | null>(null);
    const lenisRef = useRef<Lenis | null>(null);
    const pathname = usePathname();

    useEffect(() => {
        // Honour the OS reduced-motion setting: hijacking the scroll is exactly
        // the kind of motion this preference is meant to opt out of.
        const reducedMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
        if (reducedMotionQuery.matches) return;

        // duration lowered from 1.2 → 1.0 to reduce the "floaty input lag" feel
        // while still keeping the signature smooth-scroll aesthetic.
        const lenis = new Lenis({
            duration: 1.0,
            easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
            orientation: "vertical",
            gestureOrientation: "vertical",
            smoothWheel: true,
            wheelMultiplier: 1,
            touchMultiplier: 1.5,
        });

        lenisRef.current = lenis;
        lenisInstance = lenis;

        // RAF loop
        function raf(time: number) {
            lenis.raf(time);
            rafIdRef.current = requestAnimationFrame(raf);
        }

        rafIdRef.current = requestAnimationFrame(raf);

        // Cleanup
        return () => {
            if (rafIdRef.current !== null) {
                cancelAnimationFrame(rafIdRef.current);
            }
            lenis.destroy();
            lenisRef.current = null;
            if (lenisInstance === lenis) lenisInstance = null;
        };
    }, []);

    /*
     * The App Router resets native scroll on navigation, but Lenis caches its
     * own animated position. Without resyncing, the new route renders at the top
     * while Lenis still believes it is scrolled down, and the first wheel event
     * snaps the page back to the previous offset.
     */
    useEffect(() => {
        lenisRef.current?.scrollTo(0, { immediate: true, force: true });
    }, [pathname]);

    return <>{children}</>;
}
