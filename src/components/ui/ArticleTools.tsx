"use client";
import { useEffect, useState } from "react";
import { headingIndex } from "@/lib/reading-position";
import type { Article } from "@/types";
export function TableOfContents({ toc = [] }: { toc: Article["toc"] }) {
  const [active, setActive] = useState("");
  useEffect(() => {
    const headings = toc
      .map((item) => document.getElementById(item.id))
      .filter((node): node is HTMLElement => !!node);
    let offsets: number[] = [];
    let frame = 0;
    let disposed = false;
    const update = () => {
      frame = 0;
      const index = headingIndex(offsets, window.scrollY + 150);
      setActive(headings[index]?.id || "");
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    const measure = () => {
      if (disposed) return;
      offsets = headings.map((node) => node.getBoundingClientRect().top + window.scrollY);
      schedule();
    };
    measure();
    const observer = typeof ResizeObserver === "undefined" ? null : new ResizeObserver(measure);
    const body = document.querySelector(".article-body");
    if (body) observer?.observe(body);
    document.fonts?.ready.then(measure);
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", measure);
    return () => {
      disposed = true;
      cancelAnimationFrame(frame);
      observer?.disconnect();
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", measure);
    };
  }, [toc]);
  const links = toc.map((item) => (
    <a
      href={`#${item.id}`}
      key={item.id}
      data-depth={item.depth}
      aria-current={active === item.id ? "location" : undefined}
    >
      {item.text}
    </a>
  ));
  if (!toc.length) return null;
  return (
    <>
      <aside className="desktop-toc">
        <div className="toc">
          <p className="eyebrow">On this page</p>
          <nav aria-label="Table of contents">{links}</nav>
        </div>
      </aside>
      <details className="mobile-toc">
        <summary>On this page</summary>
        <nav aria-label="Mobile table of contents">{links}</nav>
      </details>
    </>
  );
}
export function CodeCopyEnhancement() {
  useEffect(() => {
    const cleanups: (() => void)[] = [];
    document.querySelectorAll<HTMLElement>(".code-block").forEach((block) => {
      const toolbar = block.querySelector(".code-toolbar");
      const code = block.querySelector("pre code");
      if (!toolbar || !code) return;
      const button = document.createElement("button");
      button.type = "button";
      button.textContent = "Copy";
      button.setAttribute("aria-label", "Copy code");
      const status = document.createElement("span");
      status.className = "sr-only";
      status.setAttribute("role", "status");
      toolbar.append(status, button);
      let timer: ReturnType<typeof setTimeout>;
      const copy = async () => {
        try {
          await navigator.clipboard.writeText(code.textContent || "");
          button.textContent = "Copied";
          status.textContent = "Code copied";
        } catch {
          button.textContent = "Select code";
          status.textContent = "Clipboard unavailable. Select the code to copy it.";
        }
        clearTimeout(timer);
        timer = setTimeout(() => {
          button.textContent = "Copy";
          status.textContent = "";
        }, 2500);
      };
      button.addEventListener("click", copy);
      cleanups.push(() => {
        clearTimeout(timer);
        button.removeEventListener("click", copy);
        button.remove();
        status.remove();
      });
    });
    return () => cleanups.forEach((cleanup) => cleanup());
  }, []);
  return null;
}
