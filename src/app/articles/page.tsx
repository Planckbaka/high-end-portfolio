"use client";

import { GridBackground } from "@/components/ui/GridBackground";
import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import Link from "next/link";

const articles = [
    {
        id: 1,
        title: "The Future of Digital Interfaces",
        date: "Oct 24, 2024",
        category: "Design",
        excerpt: "exploring how spatial computing and AI are reshaping the way we interact with digital products.",
        slug: "future-of-digital-interfaces"
    },
    {
        id: 2,
        title: "Mastering Framer Motion",
        date: "Sep 12, 2024",
        category: "Development",
        excerpt: "A deep dive into creating complex animations with React and Framer Motion for high-performance web apps.",
        slug: "mastering-framer-motion"
    },
    {
        id: 3,
        title: "Minimalism in 2025",
        date: "Aug 05, 2024",
        category: "Trends",
        excerpt: "Why the 'less is more' philosophy is making a comeback in a world of information overload.",
        slug: "minimalism-in-2025"
    },
    {
        id: 4,
        title: "Building Accessible Web Apps",
        date: "Jul 18, 2024",
        category: "Engineering",
        excerpt: "Practical tips and strategies for ensuring your applications are usable by everyone.",
        slug: "building-accessible-web-apps"
    }
];

export default function ArticlesPage() {
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
                    <h1 className="text-[10vw] md:text-[8vw] leading-[0.85] font-heading font-bold uppercase tracking-tighter mb-8">
                        Articles
                    </h1>
                    <p className="text-sm uppercase tracking-widest text-foreground/60 max-w-md">
                        Thoughts on design, technology, and the creative process.
                    </p>
                </motion.div>

                <div className="grid grid-cols-1 gap-8">
                    {articles.map((article, index) => (
                        <motion.div
                            key={article.id}
                            initial={{ opacity: 0, y: 50 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: "-10%" }}
                            transition={{ duration: 0.6, delay: index * 0.1 }}
                            className="group border-t border-foreground/10 py-12 hover:bg-foreground/5 transition-colors duration-500 -mx-4 px-4 md:-mx-12 md:px-12 lg:-mx-24 lg:px-24 cursor-pointer"
                        >
                            <Link href={`#`} className="block"> {/* Placeholder link */}
                                <div className="flex flex-col md:flex-row md:items-baseline justify-between gap-4 md:gap-12">
                                    <div className="md:w-1/4">
                                        <span className="text-xs uppercase tracking-widest text-accent mb-2 block">
                                            {article.category}
                                        </span>
                                        <span className="text-xs uppercase tracking-widest text-foreground/60">
                                            {article.date}
                                        </span>
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
                </div>
            </div>
        </main>
    );
}
