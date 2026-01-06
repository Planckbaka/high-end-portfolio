"use client";

import { GridBackground } from "@/components/ui/GridBackground";
import { motion } from "framer-motion";
import { ArrowUpRight, ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import type { Article } from "@/types";

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
        <div className="flex justify-center items-center gap-3 mt-24">
            <button
                onClick={() => onPageChange(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="group flex items-center gap-2 text-sm uppercase tracking-widest text-foreground/60 hover:text-accent disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:text-foreground/60 transition-all duration-300"
                aria-label="Previous page"
            >
                <ChevronLeft size={16} className="group-hover:-translate-x-1 transition-transform duration-300" />
                <span className="hidden sm:inline">Prev</span>
            </button>

            <div className="flex gap-2">
                {getPageNumbers().map((page, index) => {
                    if (page === '...') {
                        return (
                            <span
                                key={`ellipsis-${index}`}
                                className="w-8 h-8 flex items-center justify-center text-foreground/40"
                            >
                                •••
                            </span>
                        );
                    }

                    return (
                        <button
                            key={page}
                            onClick={() => onPageChange(page as number)}
                            className={`w-8 h-8 flex items-center justify-center rounded-full border text-xs font-medium transition-all duration-300 ${currentPage === page
                                    ? "border-accent bg-accent text-black scale-110"
                                    : "border-foreground/10 text-foreground/60 hover:border-accent/50 hover:scale-105"
                                }`}
                            aria-label={`Page ${page}`}
                            aria-current={currentPage === page ? "page" : undefined}
                        >
                            {page}
                        </button>
                    );
                })}
            </div>

            <button
                onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="group flex items-center gap-2 text-sm uppercase tracking-widest text-foreground/60 hover:text-accent disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:text-foreground/60 transition-all duration-300"
                aria-label="Next page"
            >
                <span className="hidden sm:inline">Next</span>
                <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform duration-300" />
            </button>
        </div>
    );
}

export default function ArticlesClient({ articles }: ArticlesClientProps) {
    const [requestedPage, setRequestedPage] = useState(1);
    const [isAnimating, setIsAnimating] = useState(false);
    const itemsPerPage = 5;
    const totalPages = Math.ceil(articles.length / itemsPerPage);
    
    // Derive currentPage from requestedPage, clamping to valid range
    const currentPage = totalPages > 0 ? Math.min(requestedPage, totalPages) : 1;

    const currentArticles = articles.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    const scrollToTop = () => {
        const mainElement = document.querySelector('main');
        if (mainElement) {
            mainElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
        } else {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    const handlePageChange = (page: number) => {
        if (page === currentPage || isAnimating) return;

        setIsAnimating(true);
        setRequestedPage(page);

        setTimeout(() => {
            scrollToTop();
            setTimeout(() => setIsAnimating(false), 300);
        }, 100);
    };

    return (
        <main className="relative w-full min-h-screen overflow-hidden pt-32 pb-24 px-4 md:px-12 lg:px-24">
            <GridBackground />

            <div className="relative z-10">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    className="mb-24"
                >
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-4">
                        <h1 className="text-[10vw] md:text-[8vw] leading-[0.85] font-heading font-bold uppercase tracking-tighter">
                            Articles
                        </h1>
                        {articles.length > 0 && (
                            <p className="text-xs uppercase tracking-widest text-foreground/40">
                                {articles.length} Article{articles.length !== 1 ? 's' : ''}
                            </p>
                        )}
                    </div>
                    <p className="text-sm uppercase tracking-widest text-foreground/60 max-w-md">
                        Thoughts on Advanced Go dev, Kubernetes, Docker, Kafka, Redis, and Linux system programming.
                    </p>
                </motion.div>

                <motion.div
                    key={currentPage}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.4 }}
                    className="grid grid-cols-1 gap-8 min-h-[600px]"
                >
                    {currentArticles.map((article, index) => (
                        <motion.div
                            key={article.id}
                            initial={{ opacity: 0, y: 50 }}
                            animate={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: "-10%" }}
                            transition={{ duration: 0.6, delay: index * 0.1 }}
                            className="group border-t border-foreground/10 py-12 hover:bg-foreground/5 transition-colors duration-500 -mx-4 px-4 md:-mx-12 md:px-12 lg:-mx-24 lg:px-24 cursor-pointer"
                        >
                            <Link href={`/articles/${article.slug}`} className="block">
                                <div className="flex flex-col md:flex-row md:items-baseline justify-between gap-4 md:gap-12">
                                    <div className="md:w-1/4">
                                        <span className="text-xs uppercase tracking-widest text-accent mb-2 block">
                                            {article.category}
                                        </span>
                                        <div className="flex flex-col gap-1">
                                            <span className="text-xs uppercase tracking-widest text-foreground/60">
                                                {article.date}
                                            </span>
                                            {article.readingTime && (
                                                <span className="text-[10px] uppercase tracking-widest text-foreground/40">
                                                    {article.readingTime}
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    <div className="md:w-1/2">
                                        <h2 className="text-2xl md:text-4xl font-heading font-bold uppercase leading-none mb-4 group-hover:translate-x-2 transition-transform duration-500">
                                            {article.title}
                                        </h2>
                                        <p className="text-foreground/60 font-light leading-relaxed">
                                            {article.excerpt}
                                        </p>
                                    </div>

                                    <div className="md:w-1/4 flex justify-end items-start">
                                        <div className="w-10 h-10 rounded-full border border-foreground/10 flex items-center justify-center group-hover:bg-accent group-hover:border-accent group-hover:text-black transition-all duration-500">
                                            <ArrowUpRight size={20} />
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        </motion.div>
                    ))}
                </motion.div>

                {totalPages > 1 && (
                    <Pagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={handlePageChange}
                    />
                )}
            </div>
        </main>
    );
}
