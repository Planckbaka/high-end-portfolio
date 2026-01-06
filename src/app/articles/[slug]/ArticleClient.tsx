"use client";

import { GridBackground } from "@/components/ui/GridBackground";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import type { Article } from "@/types";

export default function ArticleClient({ article }: { article: Article }) {
    return (
        <main className="relative w-full min-h-screen overflow-hidden pt-32 pb-24 px-4 md:px-12 lg:px-24">
            <GridBackground />

            <div className="relative z-10 max-w-5xl mx-auto">
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6 }}
                    className="mb-12"
                >
                    <Link
                        href="/articles"
                        className="inline-flex items-center gap-2 text-sm uppercase tracking-widest text-foreground/60 hover:text-accent transition-colors duration-300"
                    >
                        <ArrowLeft size={16} />
                        Back to Articles
                    </Link>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                >
                    <div className="flex flex-col md:flex-row md:items-baseline gap-6 md:gap-12 mb-12 border-b border-foreground/10 pb-12">
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
                        <div className="md:w-3/4">
                            <h1 className="text-4xl md:text-6xl lg:text-7xl font-heading font-bold uppercase leading-[0.9] tracking-tighter mb-8">
                                {article.title}
                            </h1>
                            <p className="text-xl md:text-2xl text-foreground/60 font-light leading-relaxed max-w-2xl">
                                {article.excerpt}
                            </p>
                        </div>
                    </div>

                    <div className="flex flex-col md:flex-row gap-6 md:gap-12">
                        <div className="md:w-1/4 hidden md:block">
                            {/* Sidebar or empty for grid alignment */}
                            <div className="sticky top-32">
                                <p className="text-xs uppercase tracking-widest text-foreground/40 mb-4">Share</p>
                                <div className="flex gap-4">
                                    {/* Social placeholders */}
                                    <div className="w-8 h-8 rounded-full border border-foreground/10" />
                                    <div className="w-8 h-8 rounded-full border border-foreground/10" />
                                </div>
                            </div>
                        </div>
                        <div className="md:w-3/4">
                            <div
                                className="prose prose-lg max-w-none 
                                prose-headings:font-heading prose-headings:uppercase prose-headings:tracking-tight prose-headings:text-foreground prose-headings:mt-12 prose-headings:mb-6 prose-headings:no-underline
                                [&_h2_a]:text-foreground [&_h3_a]:text-foreground [&_h2_a]:no-underline [&_h3_a]:no-underline hover:[&_h2_a]:text-foreground hover:[&_h3_a]:text-foreground
                                prose-h2:text-3xl prose-h3:text-2xl
                                prose-p:font-light prose-p:text-foreground/90 prose-p:leading-relaxed prose-p:mb-6
                                prose-strong:text-foreground prose-strong:font-semibold
                                prose-a:text-accent prose-a:no-underline hover:prose-a:text-accent/80 transition-colors
                                prose-blockquote:text-foreground/80 prose-blockquote:border-accent prose-blockquote:italic prose-blockquote:pl-6
                                prose-li:text-foreground/90 prose-li:font-light
                                
                                /* Code block styles */
                                prose-pre:bg-foreground/5 prose-pre:p-4 prose-pre:rounded-sm prose-pre:border prose-pre:border-foreground/10
                                prose-code:text-foreground/80 prose-code:bg-foreground/5 prose-code:px-1 prose-code:py-0.5 prose-code:rounded-sm prose-code:font-mono prose-code:text-sm prose-code:before:content-none prose-code:after:content-none
                                
                                [&>figure]:my-8 [&>figure]:bg-foreground/5 [&>figure]:rounded-sm [&>figure]:overflow-hidden [&>figure]:border [&>figure]:border-foreground/10
                                
                                prose-ul:list-disc prose-ol:list-decimal
                                prose-hr:border-foreground/10
                                prose-table:border-collapse prose-th:border prose-th:border-foreground/10 prose-th:p-2 prose-td:border prose-td:border-foreground/10 prose-td:p-2
                                dark:prose-invert"
                                dangerouslySetInnerHTML={{ __html: article.content || "" }}
                            />
                        </div>
                    </div>
                </motion.div>
            </div>
        </main>
    );
}
