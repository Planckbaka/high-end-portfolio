"use client";

import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";

interface ProjectCardProps {
    title: string;
    category: string;
    year: string;
    index: number;
}

export function ProjectCard({ title, category, year, index }: ProjectCardProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-10%" }}
            transition={{ duration: 0.8, delay: index * 0.1 }}
            className="group relative w-full aspect-[4/5] bg-white/5 border border-white/10 overflow-hidden cursor-pointer"
        >
            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/80 opacity-60 transition-opacity duration-500 group-hover:opacity-80" />

            <div className="absolute inset-0 p-6 flex flex-col justify-between">
                <div className="flex justify-between items-start">
                    <span className="text-xs uppercase tracking-widest text-white/60">{year}</span>
                    <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center backdrop-blur-sm transition-transform duration-500 group-hover:rotate-45 group-hover:bg-accent group-hover:text-black">
                        <ArrowUpRight size={16} />
                    </div>
                </div>

                <div>
                    <span className="text-xs uppercase tracking-widest text-accent mb-2 block">{category}</span>
                    <h3 className="text-3xl font-heading font-bold uppercase leading-none group-hover:translate-x-2 transition-transform duration-500">
                        {title}
                    </h3>
                </div>
            </div>

            {/* Hover Reveal Image (Placeholder) */}
            <div className="absolute inset-0 z-[-1] bg-neutral-800 transition-transform duration-700 group-hover:scale-110" />
        </motion.div>
    );
}
