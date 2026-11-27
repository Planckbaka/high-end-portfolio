"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { LLM_INFRA_SERIES, MODEL_SYSTEMS_SERIES } from "@/lib/series";

export interface MonographChapterItem {
  slug: string;
  title: string;
  excerpt: string;
  readingTime: string;
  seriesOrder: number;
  paperCount: number;
  labPath?: string;
}

export function MonographRoom({
  chapters,
  totalPapers,
  companionChapterCount,
}: {
  chapters: MonographChapterItem[];
  totalPapers: number;
  companionChapterCount: number;
}) {
  const [activeSlug, setActiveSlug] = useState<string | null>(null);
  const activeChapter = activeSlug ? chapters.find((c) => c.slug === activeSlug) : null;

  return (
    <div className="monograph-room-wrap">
      <section className="monograph-room" aria-labelledby="monograph-heading">
        <div className="monograph-left">
          <p className="monograph-room-kicker">
            <span aria-hidden="true" />
            {activeChapter
              ? `Chapter ${String(activeChapter.seriesOrder).padStart(2, "0")} · ${activeChapter.readingTime}${
                  activeChapter.paperCount > 0
                    ? ` · ${activeChapter.paperCount} arXiv sources`
                    : ""
                }`
              : `Research monograph · ${chapters.length} chapters · ${totalPapers} arXiv papers`}
          </p>

          <div className="monograph-preview-stage">
            {activeChapter ? (
              <div className="monograph-chapter-preview" key={activeChapter.slug}>
                <h2 id="monograph-heading">{activeChapter.title}</h2>
                <p className="monograph-room-lead">{activeChapter.excerpt}</p>
                {activeChapter.labPath && (
                  <p className="monograph-preview-lab">
                    Includes reproducible CPU verification: <code>/{activeChapter.labPath}</code>
                  </p>
                )}
              </div>
            ) : (
              <div className="monograph-chapter-preview" key="overview">
                <h2 id="monograph-heading">LLM &amp; AI Infrastructure from First Principles</h2>
                <p className="monograph-room-lead">
                  Every modern architectural shift—from RoPE, FlashAttention-2, and DeepSeek MLA to
                  V4.1 asymmetric CED, Muon, Looped Transformers, and Block Diffusion LLMs—was
                  forced by a physical memory or compute bottleneck. Each chapter pairs closed-form
                  math with HBM/SRAM Roofline analysis and runnable CPU PyTorch checks.
                </p>
              </div>
            )}
          </div>

          <div className="monograph-cta-row">
            <Link
              className="button clay"
              href={activeChapter ? `/articles/${activeChapter.slug}` : LLM_INFRA_SERIES.path}
            >
              {activeChapter ? "Read this chapter →" : "Read the monograph →"}
            </Link>
            {activeChapter && (
              <Link className="monograph-overview-link" href={LLM_INFRA_SERIES.path}>
                All {chapters.length} chapters →
              </Link>
            )}
          </div>

          <p className="monograph-companion-note">
            Companion track:{" "}
            <Link href={MODEL_SYSTEMS_SERIES.path}>
              {MODEL_SYSTEMS_SERIES.title} ({companionChapterCount} chapters) →
            </Link>
          </p>
        </div>

        <div
          className="monograph-index-sheet"
          onMouseLeave={() => setActiveSlug(null)}
          onBlur={(e) => {
            if (!e.currentTarget.contains(e.relatedTarget)) {
              setActiveSlug(null);
            }
          }}
        >
          <div className="monograph-frontispiece" aria-hidden="true">
            <Image
              src="/images/editorial/monograph-nocturne.webp"
              alt=""
              width={960}
              height={536}
              loading="lazy"
              className="monograph-frontispiece-img"
            />
          </div>
          <div className="monograph-sheet-head">
            <span>Contents</span>
            <span>Chapters 01–{String(chapters.length).padStart(2, "0")}</span>
          </div>
          <ol className="monograph-chapter-list">
            {chapters.map((chapter) => {
              const isActive = activeSlug === chapter.slug;
              return (
                <li key={chapter.slug} className="monograph-chapter-item">
                  <Link
                    href={`/articles/${chapter.slug}`}
                    data-active={isActive ? "true" : undefined}
                    onMouseEnter={() => setActiveSlug(chapter.slug)}
                    onFocus={() => setActiveSlug(chapter.slug)}
                  >
                    <span className="monograph-ch-num">
                      {String(chapter.seriesOrder).padStart(2, "0")}
                    </span>
                    <span className="monograph-ch-title">{chapter.title}</span>
                    <span className="monograph-ch-meta">{chapter.readingTime}</span>
                  </Link>
                </li>
              );
            })}
          </ol>
        </div>
      </section>
    </div>
  );
}
