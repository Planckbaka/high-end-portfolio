"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRef } from "react";
import type { Project } from "@/types";

interface ProjectListProps {
    projects: Project[];
}

function ProjectItem({ project, index }: { project: Project; index: number }) {
    const ref = useRef<HTMLDivElement>(null);
    const { scrollYProgress } = useScroll({
        target: ref,
        offset: ["start end", "end start"]
    });

    const y = useTransform(scrollYProgress, [0, 1], [50, -50]);
    const opacity = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0, 1, 1, 0]);

    const formattedIndex = String(index + 1).padStart(2, '0');

    // 项目卡片内容
    const cardContent = (
        <motion.div
            ref={ref}
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-10%" }}
            transition={{ duration: 0.8, delay: index * 0.1 }}
            className="group relative border-t border-foreground/10 py-16 md:py-24 cursor-pointer hover:bg-foreground/[0.02] transition-colors duration-500"
        >
            <div className="flex flex-col lg:flex-row gap-8 lg:gap-16">
                {/* Left Column: Details */}
                <div className="lg:w-2/5 flex flex-col justify-between gap-8">
                    <div>
                        {/* Project Number & Title */}
                        <div className="mb-6">
                            <div className="flex items-baseline gap-4 mb-3">
                                <span className="text-xs font-mono text-foreground/40 group-hover:text-accent transition-colors duration-300">
                                    {formattedIndex}
                                </span>
                                <div className="flex items-center gap-3">
                                    <div className="w-2 h-2 rounded-full bg-foreground/20 group-hover:bg-accent group-hover:scale-150 transition-all duration-300" />
                                    <h3 className="text-3xl md:text-5xl lg:text-6xl font-heading font-bold uppercase tracking-tighter leading-none group-hover:translate-x-1 transition-transform duration-300">
                                        {project.title}
                                    </h3>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 pl-12 md:pl-16">
                                <span className="text-xs uppercase tracking-wider text-accent font-medium">
                                    {project.category}
                                </span>
                                <span className="text-xs text-foreground/40">•</span>
                                <span className="text-xs uppercase tracking-wider text-foreground/60">
                                    {project.agency}
                                </span>
                                <span className="text-xs text-foreground/40">•</span>
                                <span className="text-xs font-mono text-foreground/60">
                                    {project.year}
                                </span>
                            </div>
                        </div>

                        {/* Specs Table */}
                        <div className="space-y-0 border-t border-foreground/10 mt-8">
                            <div className="flex justify-between items-center py-3 border-b border-foreground/5 hover:bg-foreground/[0.02] transition-colors duration-200">
                                <span className="text-xs uppercase tracking-wider text-foreground/50">Grid</span>
                                <span className="text-sm font-medium text-foreground/90">{project.grid}</span>
                            </div>
                            <div className="flex justify-between items-center py-3 border-b border-foreground/5 hover:bg-foreground/[0.02] transition-colors duration-200">
                                <span className="text-xs uppercase tracking-wider text-foreground/50">Margins</span>
                                <span className="text-sm font-medium text-foreground/90">{project.margins}</span>
                            </div>
                            <div className="flex justify-between items-center py-3 border-b border-foreground/5 hover:bg-foreground/[0.02] transition-colors duration-200">
                                <span className="text-xs uppercase tracking-wider text-foreground/50">Power Lines</span>
                                <span className="text-sm font-medium text-foreground/90">{project.powerLines}</span>
                            </div>
                            <div className="flex justify-between items-center py-3 border-b border-foreground/5 hover:bg-foreground/[0.02] transition-colors duration-200">
                                <span className="text-xs uppercase tracking-wider text-foreground/50">Paddings System</span>
                                <span className="text-sm font-medium text-foreground/90">{project.paddingsSystem}</span>
                            </div>
                        </div>
                    </div>

                    {/* View Case Link */}
                    <div className="hidden lg:flex items-center gap-2 text-sm uppercase tracking-widest text-accent opacity-0 group-hover:opacity-100 transition-all duration-500 group-hover:translate-x-2">
                        <span>View Case</span>
                        <ArrowUpRight size={16} className="group-hover:rotate-45 transition-transform duration-300" />
                    </div>
                </div>

                {/* Right Column: Image */}
                <div className="lg:w-3/5 relative">
                    <motion.div
                        style={{ y }}
                        className="relative aspect-[4/3] overflow-hidden bg-foreground/5 rounded-sm"
                    >
                        {/* Overlay gradient */}
                        <div className="absolute inset-0 bg-gradient-to-br from-background/20 to-transparent z-10 opacity-100 group-hover:opacity-0 transition-opacity duration-700" />

                        {/* Fallback text */}
                        <div className="absolute inset-0 flex items-center justify-center text-foreground/5 font-heading text-7xl md:text-9xl font-bold uppercase select-none pointer-events-none z-0">
                            {project.title}
                        </div>

                        {/* Image */}
                        <div className="relative w-full h-full">
                            <Image
                                src={project.image}
                                alt={project.title}
                                fill
                                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 60vw, 50vw"
                                className="object-cover grayscale group-hover:grayscale-0 transition-all duration-700 scale-100 group-hover:scale-105"
                            />
                        </div>

                        {/* Hover indicator */}
                        <div className="absolute top-4 right-4 w-12 h-12 rounded-full border border-accent/0 group-hover:border-accent/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-500 z-20">
                            <ArrowUpRight size={20} className="text-accent" />
                        </div>
                    </motion.div>
                </div>
            </div>
        </motion.div>
    );

    // 如果有 URL，用 Link 包装；否则直接返回卡片
    if (project.url) {
        return (
            <Link
                href={project.url}
                target="_blank"
                rel="noopener noreferrer"
                className="block"
                aria-label={`View ${project.title} project`}
            >
                {cardContent}
            </Link>
        );
    }

    return cardContent;
}

export function ProjectList({ projects }: ProjectListProps) {
    return (
        <div className="w-full">
            {projects.map((project, index) => (
                <ProjectItem key={project.id || project.title} project={project} index={index} />
            ))}
        </div>
    );
}
