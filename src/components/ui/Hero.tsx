"use client";

import Link from "next/link";
import { useState, useSyncExternalStore } from "react";
import { HeroTopologyPlate } from "@/components/visual/EditorialIllustrations";

const subscribeReducedMotion = (cb: () => void) => {
  if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
    return () => {};
  }
  const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
  mq.addEventListener("change", cb);
  return () => mq.removeEventListener("change", cb);
};

const getReducedMotionSnapshot = () =>
  typeof window !== "undefined" &&
  typeof window.matchMedia === "function" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

export interface HeroStats {
  chapters: number;
  papers: number;
  labs: number;
  articles: number;
}

const DEFAULT_HERO_STATS: HeroStats = {
  chapters: 9,
  papers: 50,
  labs: 12,
  articles: 27,
};

export function Hero({ stats = DEFAULT_HERO_STATS }: { stats?: HeroStats }) {
  const [motionPaused, setMotionPaused] = useState(false);
  const osReducedMotion = useSyncExternalStore(
    subscribeReducedMotion,
    getReducedMotionSnapshot,
    () => false
  );
  const effectivePaused = motionPaused || osReducedMotion;

  return (
    <section className="salon-hero" aria-labelledby="hero-title">
      <div className="site-shell salon-hero-grid">
        <div className="salon-hero-copy">
          <p className="eyebrow">
            <span className="eyebrow-dot" />
            Notes on systems &amp; machine intelligence
          </p>
          <h1 id="hero-title">
            Thinking clearly about systems, models, and <em>what lies beneath.</em>
          </h1>
          <p className="salon-hero-lead">
            Long-form essays, mathematical derivations, and small reproducible experiments across
            model architectures, inference mechanics, and reliable backend systems.
          </p>

          <div className="inline-links">
            <Link className="button primary" href="/articles">
              Read the writing
            </Link>
            <a className="text-link" href="#work">
              Companion labs &amp; projects ↓
            </a>
          </div>

          <div className="salon-hero-notes" aria-label="Archive scope">
            <span>
              <strong>{stats.articles}</strong> essays &amp; notes
            </span>
            <span>
              <strong>{stats.chapters}</strong> monograph chapters
            </span>
            <span>
              <strong>{stats.papers}</strong> synthesized papers
            </span>
            <span>
              <strong>{stats.labs}</strong> runnable labs
            </span>
          </div>
        </div>

        <figure className="salon-art-frame">
          <div className="salon-art-canvas">
            <HeroTopologyPlate paused={effectivePaused} />
          </div>
          <figcaption className="salon-art-caption">
            <span>Fig. I — Structure, invariants, and bounded flow</span>
            {!osReducedMotion && (
              <button
                type="button"
                className="motion-quiet-btn"
                onClick={() => setMotionPaused((prev) => !prev)}
              >
                {motionPaused ? "Play motion" : "Pause motion"}
              </button>
            )}
          </figcaption>
        </figure>
      </div>
    </section>
  );
}
