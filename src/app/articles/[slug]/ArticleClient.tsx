"use client";

import { GridBackground } from "@/components/ui/GridBackground";
import { ReadingProgress } from "@/components/ui/ReadingProgress";
import { ShareLinks } from "@/components/ui/ShareLinks";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import type { Article } from "@/types";

export default function ArticleClient({ article }: { article: Article }) {
    return (
        /*
         * A <div>, not a <main>. The root layout already renders
         * <main id="main-content">, and nesting a second main landmark inside it
         * is invalid HTML and announces two "main" regions to screen readers.
         */
        <div className="relative w-full min-h-screen overflow-x-clip pt-32 pb-24 gutter">
            <GridBackground />
            <ReadingProgress />

            <div className="relative z-10 max-w-5xl mx-auto">
                <div className="reveal-fade mb-12">
                    <Link
                        href="/articles"
                        className="group inline-flex items-center gap-2 text-eyebrow uppercase text-foreground/55 hover:text-accent transition-colors duration-300"
                    >
                        <ArrowLeft
                            size={14}
                            className="group-hover:-translate-x-1 transition-transform duration-300"
                            aria-hidden="true"
                        />
                        Back to Articles
                    </Link>
                </div>

                {/*
                 * CSS reveal, not framer-motion. An article's body must never be
                 * conditional on an animation completing — that is the whole
                 * content of the page.
                 */}
                <article className="reveal [--reveal-delay:0.15s]">
                    <header className="flex flex-col md:flex-row md:items-baseline gap-6 md:gap-12 mb-12 border-b border-hairline pb-12">
                        <div className="md:w-1/4 flex flex-col gap-1">
                            <span className="text-eyebrow uppercase text-accent mb-1">
                                {article.category}
                            </span>
                            <time
                                className="text-eyebrow uppercase text-foreground/60 nums-tabular"
                                dateTime={article.date}
                            >
                                {article.date}
                            </time>
                            {article.readingTime && (
                                <span className="text-eyebrow uppercase text-foreground/40">
                                    {article.readingTime}
                                </span>
                            )}
                        </div>
                        <div className="md:w-3/4">
                            <h1 className="text-display-lg title-mixed font-heading uppercase mb-8">
                                {article.title}
                            </h1>
                            {article.excerpt && (
                                <p className="text-xl md:text-2xl text-foreground/60 font-light leading-relaxed max-w-2xl">
                                    {article.excerpt}
                                </p>
                            )}
                        </div>
                    </header>

                    <div className="flex flex-col md:flex-row gap-6 md:gap-12">
                        <aside className="md:w-1/4 hidden md:block">
                            <div className="sticky top-32">
                                <ShareLinks title={article.title} slug={article.slug} />
                            </div>
                        </aside>
                        <div
                            className="md:w-3/4 min-w-0"
                            style={{ contentVisibility: "auto", containIntrinsicSize: "auto 1200px" }}
                        >
                            {/*
                             * Colours, code blocks, tables and heading anchors are all
                             * styled from the design tokens in globals.css (`.prose`),
                             * so no per-element prose-* overrides are needed here.
                             */}
                            <div
                                className="prose prose-lg"
                                dangerouslySetInnerHTML={{ __html: article.content || "" }}
                            />
                        </div>
                    </div>

                    {/* Share row for narrow viewports, where the sidebar is hidden */}
                    <div className="md:hidden mt-16 pt-8 border-t border-hairline">
                        <ShareLinks title={article.title} slug={article.slug} />
                    </div>
                </article>

                <div className="mt-24 pt-12 border-t border-hairline">
                    <Link
                        href="/articles"
                        className="group inline-flex items-center gap-2 text-eyebrow uppercase text-foreground/55 hover:text-accent transition-colors duration-300"
                    >
                        <ArrowLeft
                            size={14}
                            className="group-hover:-translate-x-1 transition-transform duration-300"
                            aria-hidden="true"
                        />
                        All Articles
                    </Link>
                </div>
            </div>
        </div>
    );
}
