"use client";

import { GridBackground } from "@/components/ui/GridBackground";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

interface Article {
    id: number;
    title: string;
    date: string;
    category: string;
    excerpt: string;
    slug: string;
    content?: string;
}

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
                            <span className="text-xs uppercase tracking-widest text-foreground/60">
                                {article.date}
                            </span>
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
                                className="prose prose-lg max-w-none prose-headings:font-heading prose-headings:uppercase prose-headings:tracking-tight prose-headings:text-foreground prose-p:font-light prose-p:text-foreground/80 prose-strong:text-accent prose-a:text-accent prose-blockquote:text-foreground/70 prose-blockquote:border-accent prose-li:text-foreground/80"
                                dangerouslySetInnerHTML={{ __html: article.content || "" }}
                            />
                        </div>
                    </div>
                </motion.div>
            </div>
        </main>
    );
}
