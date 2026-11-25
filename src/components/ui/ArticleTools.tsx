"use client";
import { useEffect, useState } from "react";
import { headingIndex } from "@/lib/reading-position";
import type { Article } from "@/types";
export function TableOfContents({ toc = [] }: { toc: Article["toc"] }) {
  const [active, setActive] = useState("");
  const [collapsed, setCollapsed] = useState(false);
  const activeIdx = toc.findIndex((item) => item.id === active);

  useEffect(() => {
    const layout = document.querySelector(".article-layout");
    if (!layout) return;
    if (collapsed) {
      layout.setAttribute("data-toc-collapsed", "true");
    } else {
      layout.removeAttribute("data-toc-collapsed");
    }
    return () => {
      layout.removeAttribute("data-toc-collapsed");
    };
  }, [collapsed]);
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
  const links = toc.map((item, idx) => (
    <a
      href={`#${item.id}`}
      key={`${item.id}-${idx}`}
      data-depth={item.depth}
      aria-current={active === item.id ? "location" : undefined}
      /*
       * Chapter titles run to 74 characters; in a 220px rail they wrap to four
       * lines and the contents stops being scannable. One line, ellipsised,
       * with the full title in `title` and the heading itself a click away.
       */
      title={item.text}
    >
      {item.text}
    </a>
  ));
  if (!toc.length) return null;
  const h2Items = toc.filter((t) => t.depth === 2);
  const currentH2Number =
    activeIdx >= 0
      ? toc.slice(0, activeIdx + 1).filter((t) => t.depth === 2).length
      : 1;
  return (
    <>
      <aside className="desktop-toc">
        {collapsed ? (
          <div className="toc toc-collapsed-rail">
            <button
              type="button"
              className="toc-focus-btn"
              onClick={() => setCollapsed(false)}
              aria-label="Show table of contents"
            >
              Contents ▸
            </button>
          </div>
        ) : (
          <div className="toc">
            <div className="toc-header">
              <p className="eyebrow">Contents</p>
              <div className="toc-header-actions">
                {h2Items.length > 0 && (
                  <span className="toc-step-counter" aria-hidden="true">
                    {String(Math.max(1, currentH2Number)).padStart(2, "0")}/
                    {String(h2Items.length).padStart(2, "0")}
                  </span>
                )}
                <button
                  type="button"
                  className="toc-focus-btn"
                  onClick={() => setCollapsed(true)}
                  aria-label="Hide table of contents for focus reading"
                  title="Focus reading mode"
                >
                  Focus
                </button>
              </div>
            </div>
            <nav aria-label="Table of contents">{links}</nav>
          </div>
        )}
      </aside>
      <details className="mobile-toc">
        <summary>Contents</summary>
        <nav aria-label="Mobile table of contents">{links}</nav>
      </details>
    </>
  );
}
export function CodeCopyEnhancement() {
  useEffect(() => {
    const cleanups: (() => void)[] = [];
    // Horizontally scrollable equations must be reachable by keyboard.
    document.querySelectorAll<HTMLElement>(".math-display").forEach((node, i) => {
      if (node.scrollWidth > node.clientWidth) {
        node.tabIndex = 0;
        node.setAttribute("role", "region");
        node.setAttribute("aria-label", `Equation ${i + 1}, scrollable`);
      }
    });
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

    // BibTeX & command copy button enhancement (Jon Barron style)
    document
      .querySelectorAll<HTMLButtonElement>("button[data-bibtex], button[data-copy-text]")
      .forEach((btn) => {
        let timer: ReturnType<typeof setTimeout>;
        const originalText = btn.textContent || "Copy";
        const copiedLabel = btn.hasAttribute("data-bibtex")
          ? "Copied BibTeX!"
          : btn.getAttribute("data-copied-label") || "Copied!";
        const onCopyPayload = async () => {
          const payload =
            btn.getAttribute("data-bibtex") || btn.getAttribute("data-copy-text") || "";
          try {
            await navigator.clipboard.writeText(payload);
            btn.textContent = copiedLabel;
            btn.setAttribute("data-copied", "true");
          } catch {
            btn.textContent = "Clipboard unavailable";
          }
          clearTimeout(timer);
          timer = setTimeout(() => {
            btn.textContent = originalText;
            btn.removeAttribute("data-copied");
          }, 2200);
        };
        btn.addEventListener("click", onCopyPayload);
        cleanups.push(() => {
          clearTimeout(timer);
          btn.removeEventListener("click", onCopyPayload);
        });
      });

    // Academic figure click-to-zoom lightbox
    const zoomableImages = document.querySelectorAll<HTMLImageElement>("img.zoomable");
    if (zoomableImages.length > 0) {
      const overlay = document.createElement("div");
      overlay.className = "figure-lightbox";
      overlay.setAttribute("role", "dialog");
      overlay.setAttribute("aria-modal", "true");
      overlay.setAttribute("aria-label", "Expanded figure view");
      overlay.hidden = true;

      const closeBtn = document.createElement("button");
      closeBtn.type = "button";
      closeBtn.className = "figure-lightbox-close";
      closeBtn.textContent = "Close (Esc)";
      closeBtn.setAttribute("aria-label", "Close expanded figure");

      const previewImg = document.createElement("img");
      previewImg.className = "figure-lightbox-img";
      previewImg.alt = "";

      const captionBox = document.createElement("p");
      captionBox.className = "figure-lightbox-caption";

      overlay.append(closeBtn, previewImg, captionBox);
      document.body.appendChild(overlay);

      const closeLightbox = () => {
        overlay.hidden = true;
        document.body.style.overflow = "";
      };

      const onKeyDown = (e: KeyboardEvent) => {
        if (e.key === "Escape" && !overlay.hidden) {
          closeLightbox();
        }
      };

      overlay.addEventListener("click", (e) => {
        if (e.target === overlay || e.target === closeBtn) {
          closeLightbox();
        }
      });
      window.addEventListener("keydown", onKeyDown);

      zoomableImages.forEach((img) => {
        const openLightbox = () => {
          previewImg.src = img.src;
          previewImg.alt = img.alt;
          const fig = img.closest("figure");
          const cap = fig?.querySelector("figcaption");
          captionBox.textContent = cap?.textContent || img.alt || "";
          overlay.hidden = false;
          document.body.style.overflow = "hidden";
          closeBtn.focus();
        };
        img.addEventListener("click", openLightbox);
        cleanups.push(() => img.removeEventListener("click", openLightbox));
      });

      cleanups.push(() => {
        window.removeEventListener("keydown", onKeyDown);
        document.body.style.overflow = "";
        overlay.remove();
      });
    }

    return () => cleanups.forEach((cleanup) => cleanup());
  }, []);
  return null;
}
