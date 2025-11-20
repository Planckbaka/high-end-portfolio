"use client";

import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";

export function SelfIntro() {
    return (
        <section className="px-4 md:px-12 lg:px-24 py-12 md:py-24">
            <motion.div
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-10%" }}
                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                className="w-full bg-white/5 border border-white/10 p-8 md:p-12 lg:p-16 relative overflow-hidden group"
            >
                {/* Decorative Background Element */}
                <div className="absolute -top-24 -right-24 w-64 h-64 bg-accent/20 rounded-full blur-[100px] pointer-events-none" />

                <div className="absolute top-8 right-8 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                    <ArrowUpRight className="text-accent" size={32} />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center relative z-10">
                    <div className="space-y-8">
                        <div>
                            <span className="text-accent uppercase tracking-widest text-xs font-bold mb-4 block">
                        // Introduction
                            </span>
                            <h2 className="text-4xl md:text-5xl lg:text-6xl font-heading font-bold uppercase leading-[0.9] tracking-tight">
                                Crafting Digital <br />
                                <span className="text-white/50">Perfection</span>
                            </h2>
                        </div>

                        <p className="text-base md:text-lg text-white/70 leading-relaxed max-w-md font-light">
                            I'm a creative developer obsessed with the intersection of design and engineering.
                            I build pixel-perfect, performant, and accessible interfaces that delight users.
                            My goal is to turn complex problems into simple, beautiful solutions.
                        </p>

                        <div className="flex flex-wrap gap-4">
                            <div className="px-4 py-2 border border-white/10 rounded-full bg-white/5 text-xs uppercase tracking-wider text-white/60">
                                Creative Dev
                            </div>
                            <div className="px-4 py-2 border border-white/10 rounded-full bg-white/5 text-xs uppercase tracking-wider text-white/60">
                                UI/UX Design
                            </div>
                            <div className="px-4 py-2 border border-white/10 rounded-full bg-white/5 text-xs uppercase tracking-wider text-white/60">
                                Motion
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        {/* Stats Grid */}
                        <div className="bg-black/20 p-6 border border-white/5 hover:border-accent/50 transition-colors duration-300 flex flex-col justify-between aspect-square">
                            <ArrowUpRight size={20} className="self-end text-white/20" />
                            <div>
                                <h3 className="text-4xl font-heading font-bold text-white">05<span className="text-accent">+</span></h3>
                                <p className="text-[10px] uppercase tracking-widest text-white/40 mt-2">Years Exp.</p>
                            </div>
                        </div>

                        <div className="bg-black/20 p-6 border border-white/5 hover:border-accent/50 transition-colors duration-300 flex flex-col justify-between aspect-square">
                            <ArrowUpRight size={20} className="self-end text-white/20" />
                            <div>
                                <h3 className="text-4xl font-heading font-bold text-white">50<span className="text-accent">+</span></h3>
                                <p className="text-[10px] uppercase tracking-widest text-white/40 mt-2">Projects</p>
                            </div>
                        </div>

                        <div className="col-span-2 bg-black/20 p-6 border border-white/5 hover:border-accent/50 transition-colors duration-300">
                            <div className="flex justify-between items-start mb-4">
                                <h3 className="text-lg font-heading font-bold text-white">Stack</h3>
                                <ArrowUpRight size={20} className="text-white/20" />
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {['React', 'Next.js', 'TypeScript', 'WebGL', 'Tailwind'].map((tech) => (
                                    <span key={tech} className="text-[10px] uppercase tracking-wider text-white/60 bg-white/5 px-2 py-1 rounded">
                                        {tech}
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
