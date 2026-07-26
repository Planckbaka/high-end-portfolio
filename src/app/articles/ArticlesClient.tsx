"use client";

import { GridBackground } from "@/components/ui/GridBackground";
import { ArrowUpRight, ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import type { Article } from "@/types";
import { WritingBacklog } from "@/components/ui/WritingBacklog";
import { smoothScrollTo } from "@/lib/smooth-scroll";

interface ArticlesClientProps {
    articles: Article[];
}

function Pagination({ currentPage, totalPages, onPageChange }: {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
}) {
    const getPageNumbers = () => {
        const pages: (number | string)[] = [];
        const maxVisible = 5;

        if (totalPages <= maxVisible + 2) {
            // Show all pages if total is small
            return Array.from({ length: totalPages }, (_, i) => i + 1);
        }

        // Always show first page
        pages.push(1);

        if (currentPage > 3) {
            pages.push('...');
        }

        // Show pages around current page
        const start = Math.max(2, currentPage - 1);
        const end = Math.min(totalPages - 1, currentPage + 1);

        for (let i = start; i <= end; i++) {
            pages.push(i);
        }

        if (currentPage < totalPages - 2) {
            pages.push('...');
        }

        // Always show last page
        if (totalPages > 1) {
            pages.push(totalPages);
        }

        return pages;
    };

    return (
        <nav className="flex justify-center items-center gap-3 mt-24" aria-label="Pagination">
            <button
                onClick={() => onPageChange(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="group flex items-center gap-2 text-eyebrow uppercase text-foreground/60 hover:text-accent disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:text-foreground/60 transition-all duration-300"
                aria-label="Previous page"
            >
                <ChevronLeft size={16} className="group-hover:-translate-x-1 transition-transform duration-300" aria-hidden="true" />
                <span className="hidden sm:inline">Prev</span>
            </button>

            <div className="flex gap-2">
                {getPageNumbers().map((page, index) => {
                    if (page === '...') {
                        return (
                            <span
                                key={`ellipsis-${index}`}
                                aria-hidden="true"
                                className="w-8 h-8 flex items-center justify-center text-foreground/40"
                            >
                                •••
                            </span>
                        );
                    }

                    const isCurrent = currentPage === page;

                    return (
                        <button
                            key={page}
                            onClick={() => onPageChange(page as number)}
                            className={`w-8 h-8 flex items-center justify-center rounded-full border text-xs font-medium nums-tabular transition-all duration-300 ${isCurrent
                                ? "border-accent bg-accent text-accent-foreground scale-110"
                                : "border-hairline-strong text-foreground/60 hover:border-accent/50 hover:text-foreground hover:scale-105"
                                }`}
                            aria-label={`Page ${page}`}
                            aria-current={isCurrent ? "page" : undefined}
                        >
                            {page}
                        </button>
                    );
                })}
            </div>

            <button
                onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="group flex items-center gap-2 text-eyebrow uppercase text-foreground/60 hover:text-accent disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:text-foreground/60 transition-all duration-300"
                aria-label="Next page"
            >
                <span className="hidden sm:inline">Next</span>
                <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform duration-300" aria-hidden="true" />
            </button>
        </nav>
    );
}

export default function ArticlesClient({ articles }: ArticlesClientProps) {
    const [requestedPage, setRequestedPage] = useState(1);
    const itemsPerPage = 5;
    const totalPages = Math.ceil(articles.length / itemsPerPage);

    // Derive currentPage from requestedPage, clamping to valid range
    const currentPage = totalPages > 0 ? Math.min(requestedPage, totalPages) : 1;

    const currentArticles = articles.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    const handlePageChange = (page: number) => {
        if (page === currentPage) return;
        setRequestedPage(page);
        /*
         * Route the scroll through Lenis. The previous implementation called
         * `scrollIntoView({ behavior: "smooth" })` behind nested setTimeouts;
         * Lenis overwrites the scroll position every frame, so the native
         * animation was fighting it and landed inconsistently.
         */
        smoothScrollTo("#articles-heading", { offset: -160 });
    };

    return (
        /* <div>, not <main> — the root layout already provides the main landmark. */
        <div className="relative w-full min-h-screen overflow-x-clip pt-32 pb-24 gutter">
            <GridBackground />

            <div className="relative z-10">
                <div className="reveal mb-20 md:mb-24">
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-4">
                        <h1
                            id="articles-heading"
                            className="text-display-xl font-heading uppercase scroll-mt-40"
                        >
                            Articles
                        </h1>
                        {articles.length > 0 && (
                            <p className="text-eyebrow uppercase text-foreground/40 nums-tabular">
                                {articles.length} Article{articles.length !== 1 ? 's' : ''}
                            </p>
                        )}
                    </div>
                    <p className="text-sm leading-relaxed text-foreground/60 max-w-md">
                        Thoughts on Advanced Go dev, Kubernetes, Docker, Kafka, Redis, and Linux system programming.
                    </p>
                </div>

                {currentArticles.length === 0 ? (
                    <p className="border-t border-hairline py-16 text-foreground/50">
                        No articles published yet — check back soon.
                    </p>
                ) : (
                    <div
                        /* Re-keying on the page number restarts the CSS reveal for the
                           new set of rows. */
                        key={currentPage}
                        className="flex flex-col"
                    >
                        {currentArticles.map((article, index) => (
                            <article
                                key={article.id}
                                className="reveal group border-t border-hairline last:border-b"
                                style={{ "--reveal-delay": `${index * 0.07}s` } as React.CSSProperties}
                            >
                                <Link
                                    href={`/articles/${article.slug}`}
                                    className="block py-12 -mx-4 px-4 md:-mx-12 md:px-12 lg:-mx-24 lg:px-24 hover:bg-surface transition-colors duration-500"
                                    data-cursor="view"
                                >
                                    <div className="flex flex-col md:flex-row md:items-baseline justify-between gap-4 md:gap-12">
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

                                        <div className="md:w-1/2">
                                            <h2 className="text-display-sm md:text-display-md title-mixed font-heading uppercase mb-4 group-hover:translate-x-2 transition-transform duration-500">
                                                {article.title}
                                            </h2>
                                            <p className="text-foreground/60 font-light leading-relaxed">
                                                {article.excerpt}
                                            </p>
                                        </div>

                                        <div className="md:w-1/4 flex md:justify-end items-start">
                                            <span
                                                aria-hidden="true"
                                                className="w-10 h-10 rounded-full border border-hairline-strong grid place-items-center group-hover:bg-accent group-hover:border-accent group-hover:text-accent-foreground transition-all duration-500"
                                            >
                                                <ArrowUpRight size={18} />
                                            </span>
                                        </div>
                                    </div>
                                </Link>
                            </article>
                        ))}
                    </div>
                )}

                {totalPages > 1 && (
                    <Pagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={handlePageChange}
                    />
                )}

                <div className="mt-32 pt-24 border-t border-hairline">
                    <WritingBacklog />
                </div>
            </div>
        </div>
    );
}
