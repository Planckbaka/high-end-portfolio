"use client";

import { technologies, selfIntroData } from "@/config/data";
import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { memo } from "react";
import { MagneticButton } from "./MagneticButton";

interface StatCardProps {
    value: string;
    label: string;
    accent?: string;
}

const StatCard = memo(({ value, label, accent }: StatCardProps) => (
    <div className="bg-foreground/5 p-6 border border-foreground/5 hover:border-accent/50 transition-colors duration-300 flex flex-col justify-between aspect-square group/card">
        <ArrowUpRight
            size={20}
            className="self-end text-foreground/20 group-hover/card:text-accent transition-colors duration-300"
            aria-hidden="true"
        />
        <div>
            <h3 className="text-4xl font-heading font-bold text-foreground">
                {value}
                {accent && <span className="text-accent">{accent}</span>}
            </h3>
            <p className="text-[10px] uppercase tracking-widest text-foreground/60 mt-2">
                {label}
            </p>
        </div>
    </div>
));

StatCard.displayName = "StatCard";

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1,
            delayChildren: 0.3
        }
    }
};

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.5, ease: "easeOut" as const }
    }
};

export function SelfIntro() {
    return (
        <section
            className="px-4 md:px-12 lg:px-24 py-12 md:py-24"
            aria-labelledby="intro-heading"
        >
            <motion.div
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-10%" }}
                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                className="w-full bg-foreground/5 border border-foreground/10 p-8 md:p-12 lg:p-16 relative overflow-hidden group"
            >
                {/* Decorative Background Element */}
                <div className="absolute -top-24 -right-24 w-64 h-64 bg-accent/20 rounded-full blur-[100px] pointer-events-none" aria-hidden="true" />

                <div className="absolute top-8 right-8 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                    <ArrowUpRight className="text-accent" size={32} aria-hidden="true" />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center relative z-10">
                    <div className="space-y-8">
                        <div>
                            <span className="text-accent uppercase tracking-widest text-xs font-bold mb-4 block">
                                Introduction
                            </span>
                            <h2
                                id="intro-heading"
                                className="text-4xl md:text-5xl lg:text-6xl font-heading font-bold uppercase leading-[0.9] tracking-tight"
                            >
                                {selfIntroData.heading.main} <br />
                                <span className="text-foreground/50">{selfIntroData.heading.sub}</span>
                            </h2>
                        </div>

                        <p className="text-base md:text-lg text-foreground/70 leading-relaxed max-w-md font-light">
                            {selfIntroData.description}
                        </p>

                        <motion.div
                            className="flex flex-wrap gap-4"
                            variants={containerVariants}
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true }}
                        >
                            {selfIntroData.roles.map((role) => (
                                <motion.div
                                    key={role}
                                    variants={itemVariants}
                                    className="px-4 py-2 border border-foreground/10 rounded-full bg-foreground/5 text-xs uppercase tracking-wider text-foreground/60 hover:bg-foreground/10 transition-colors cursor-default"
                                >
                                    {role}
                                </motion.div>
                            ))}
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0 }}
                            whileInView={{ opacity: 1 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.8, delay: 0.5 }}
                            className="pt-6"
                        >
                            <MagneticButton href="/resume.pdf">
                                View Resume
                            </MagneticButton>
                        </motion.div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        {/* Stats Grid */}
                        {selfIntroData.stats.map((stat) => (
                            <StatCard
                                key={stat.id}
                                value={stat.value}
                                label={stat.label}
                                accent={stat.accent}
                            />
                        ))}

                        <div className="col-span-2 bg-foreground/5 p-6 border border-foreground/5 hover:border-accent/50 transition-colors duration-300">
                            <div className="flex justify-between items-start mb-4">
                                <h3 className="text-lg font-heading font-bold text-foreground">Stack</h3>
                                <ArrowUpRight size={20} className="text-foreground/20" aria-hidden="true" />
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {technologies.map((tech) => (
                                    <span key={tech.id} className="text-[10px] uppercase tracking-wider text-foreground/60 bg-foreground/5 px-2 py-1 rounded hover:text-foreground transition-colors">
                                        {tech.name}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </motion.div>
        </section>
    );
}
