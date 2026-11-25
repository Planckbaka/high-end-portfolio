"use client";

export function BackToTop() {
  const handleClick = () => {
    if (typeof window === "undefined") return;
    const reduced =
      typeof window.matchMedia === "function" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    window.scrollTo({ top: 0, behavior: reduced ? "instant" : "smooth" });
  };

  return (
    <button type="button" onClick={handleClick}>
      Back to top ↑
    </button>
  );
}
