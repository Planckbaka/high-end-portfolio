"use client";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";

/*
 * App Router changes the document title on navigation but announces nothing.
 * This mirrors the new title into a polite live region so screen-reader users
 * hear which page they landed on.
 */
export function RouteAnnouncer() {
  const pathname = usePathname();
  const mounted = useRef(false);
  useEffect(() => {
    if (!mounted.current) {
      mounted.current = true;
      return;
    }
    const timer = setTimeout(() => {
      const region = document.getElementById("route-announcer");
      if (region) region.textContent = document.title;
    }, 100);
    return () => clearTimeout(timer);
  }, [pathname]);
  return <div id="route-announcer" role="status" aria-live="polite" className="sr-only" />;
}
