"use client";

import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
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
    const shouldReduceMotion = useReducedMotion();

    const { scrollYProgress } = useScroll({
        target: ref,
        offset: ["start end", "end start"]
    });

    // Parallax drift on the artwork. Flattened to 0 for reduced-motion users
    // rather than removed, so the hook order stays stable across renders.
    const y = useTransform(scrollYProgress, [0, 1], shouldReduceMotion ? [0, 0] : [50, -50]);

    const formattedIndex = String(index + 1).padStart(2, "0");
    const isLinked = Boolean(project.url);

    const specs = [
        { label: "Grid", value: project.grid },
        { label: "Margins", value: project.margins },
        { label: "Power Lines", value: project.powerLines },
        { label: "Paddings System", value: project.paddingsSystem },
    ];

    const cardContent = (
        /*
         * Entrance reveal is CSS (`reveal-on-scroll`) so the project never
         * depends on JS to become visible. framer-motion is kept only for the
         * scroll-linked parallax below, which genuinely needs a scroll value.
         */
        <div
            ref={ref}
            className={`reveal-on-scroll group relative border-t border-hairline py-16 md:py-24 transition-colors duration-500 ${
                isLinked ? "cursor-pointer hover:bg-surface" : ""
            }`}
        >
            <div className="flex flex-col lg:flex-row gap-8 lg:gap-16">
                {/* Left column: details */}
                <div className="lg:w-2/5 flex flex-col justify-between gap-8">
                    <div>
                        {/* Project number & title */}
                        <div className="mb-6">
                            <div className="flex items-baseline gap-4 mb-3">
                                <span className="text-xs font-mono nums-tabular text-foreground/40 group-hover:text-accent transition-colors duration-300">
                                    {formattedIndex}
                                </span>
                                <div className="flex items-center gap-3">
                                    <span
                                        aria-hidden="true"
                                        className="w-2 h-2 rounded-full bg-foreground/20 group-hover:bg-accent group-hover:scale-150 transition-all duration-300"
                                    />
                                    <h3 className="text-display-md font-heading uppercase group-hover:translate-x-1 transition-transform duration-300">
                                        {project.title}
                                    </h3>
                                </div>
                            </div>
                            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 pl-12 md:pl-16 text-eyebrow uppercase">
                                <span className="text-accent">{project.category}</span>
                                <span aria-hidden="true" className="text-foreground/30">•</span>
                                <span className="text-foreground/55">{project.agency}</span>
                                <span aria-hidden="true" className="text-foreground/30">•</span>
                                <span className="font-mono nums-tabular text-foreground/55">{project.year}</span>
                            </div>
                        </div>

                        {/* Specs table */}
                        <dl className="border-t border-hairline mt-8">
                            {specs.map((spec) => (
                                <div
                                    key={spec.label}
                                    className="flex justify-between items-center gap-4 py-3 border-b border-hairline"
                                >
                                    <dt className="text-eyebrow uppercase text-muted-foreground">
                                        {spec.label}
                                    </dt>
                                    <dd className="text-sm font-medium text-foreground/90 nums-tabular">
                                        {spec.value}
                                    </dd>
                                </div>
                            ))}
                        </dl>
                    </div>

                    {/* View case affordance — only meaningful when there is somewhere to go */}
                    {isLinked && (
                        <div className="hidden lg:flex items-center gap-2 text-eyebrow uppercase text-accent opacity-0 group-hover:opacity-100 transition-all duration-500 group-hover:translate-x-2">
                            <span>View Case</span>
                            <ArrowUpRight size={16} className="group-hover:rotate-45 transition-transform duration-300" />
                        </div>
                    )}
                </div>

                {/* Right column: image */}
                <div className="lg:w-3/5 relative">
                    <motion.div
                        style={{ y }}
                        className="relative aspect-4/3 overflow-hidden bg-surface-raised rounded-sm will-change-transform"
                    >
                        {/* Overlay gradient */}
                        <div
                            aria-hidden="true"
                            className="absolute inset-0 bg-gradient-to-br from-background/20 to-transparent z-10 group-hover:opacity-0 transition-opacity duration-700"
                        />

                        {/* Fallback wordmark behind the image */}
                        <span
                            aria-hidden="true"
                            className="absolute inset-0 flex items-center justify-center text-foreground/5 font-heading text-display-xl uppercase select-none pointer-events-none z-0"
                        >
                            {project.title}
                        </span>

                        <Image
                            src={project.image}
                            alt={`${project.title} — ${project.category}`}
                            fill
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 60vw, 50vw"
                            className="object-cover grayscale group-hover:grayscale-0 group-hover:scale-105 transition-all duration-700"
                        />

                        {/* Hover indicator */}
                        {isLinked && (
                            <span
                                aria-hidden="true"
                                className="absolute top-4 right-4 w-12 h-12 rounded-full border border-accent/0 group-hover:border-accent/50 grid place-items-center opacity-0 group-hover:opacity-100 transition-all duration-500 z-20"
                            >
                                <ArrowUpRight size={20} className="text-accent" />
                            </span>
                        )}
                    </motion.div>
                </div>
            </div>
        </div>
    );

    if (project.url) {
        return (
            <Link
                href={project.url}
                target="_blank"
                rel="noopener noreferrer"
                className="block"
                aria-label={`View ${project.title} project (opens in a new tab)`}
                data-cursor="view"
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
