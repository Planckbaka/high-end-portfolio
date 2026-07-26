"use client";

import { upcomingTopics } from "@/config/data";
import { UpcomingTopic } from "@/types";
import { Calendar, Compass, Flame } from "lucide-react";
import { useRef } from "react";

/**
 * Status presentation.
 *
 * Each status carries an explicit light/dark pair. The previous single-shade
 * values (text-purple-400, text-amber-400, …) were picked against the dark
 * theme; on the bone-white light theme those same 400-level shades sat at
 * roughly 2:1 against the background and failed WCAG AA.
 */
const statusConfig = {
    planning: {
        text: "选题规划中",
        color: "text-stone-700 dark:text-stone-300 border-stone-500/25 bg-stone-500/10",
        dotColor: "bg-stone-500 dark:bg-stone-400",
        progress: 15
    },
    outline: {
        text: "大纲设计中",
        color: "text-amber-800 dark:text-amber-300 border-amber-500/30 bg-amber-500/10",
        dotColor: "bg-amber-600 dark:bg-amber-400",
        progress: 40
    },
    drafting: {
        text: "初稿撰写中",
        color: "text-sky-800 dark:text-sky-300 border-sky-500/30 bg-sky-500/10",
        dotColor: "bg-sky-600 dark:bg-sky-400",
        progress: 75
    },
    reviewing: {
        text: "润色发布中",
        color: "text-emerald-800 dark:text-emerald-300 border-emerald-500/30 bg-emerald-500/10",
        dotColor: "bg-emerald-600 dark:bg-emerald-400",
        progress: 95
    }
} as const;

export function WritingBacklog() {
    return (
        <div className="w-full flex flex-col gap-12 relative">
            {/* Soft background glows */}
            <div
                aria-hidden="true"
                className="absolute right-0 top-1/4 w-[30vw] h-[30vw] rounded-full bg-accent/5 blur-[120px] pointer-events-none z-[-1]"
            />
            <div
                aria-hidden="true"
                className="absolute left-10 bottom-0 w-[20vw] h-[20vw] rounded-full bg-accent/[0.03] blur-[100px] pointer-events-none z-[-1]"
            />

            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-hairline pb-8">
                <div className="flex flex-col gap-3">
                    <p className="flex items-center gap-2 text-eyebrow uppercase text-accent">
                        <Flame className="w-4 h-4 animate-pulse motion-reduce:animate-none" aria-hidden="true" />
                        <span>Roadmap &amp; Backlog</span>
                    </p>
                    <h2 id="backlog-heading" className="text-display-lg font-heading uppercase">
                        Writing <span className="text-accent">Plans</span>
                    </h2>
                </div>
                <p className="text-sm text-foreground/60 max-w-sm leading-relaxed md:text-right">
                    A collection of deep technical investigations currently in my pipeline.
                    Public commitment to quality and architectural depth.
                </p>
            </div>

            <ul className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
                {upcomingTopics.map((topic: UpcomingTopic, index) => (
                    <BacklogCard
                        key={topic.id}
                        topic={topic}
                        index={index}
                    />
                ))}
            </ul>

            {/* Commitment note */}
            <p className="reveal-on-scroll w-full text-center py-6 border border-dashed border-hairline rounded-xl bg-surface text-eyebrow uppercase text-foreground/45">
                Commitment to quality — a public roadmap to keep myself writing and sharing.
            </p>
        </div>
    );
}

function BacklogCard({ topic, index }: { topic: UpcomingTopic, index: number }) {
    const cardRef = useRef<HTMLLIElement>(null);

    const cfg = statusConfig[topic.status] || statusConfig.planning;

    // Write mouse position to CSS variables directly on the card element.
    // This bypasses React state entirely — no re-render per mousemove tick.
    const handleMouseMove = (e: React.MouseEvent<HTMLLIElement>) => {
        const card = cardRef.current;
        if (!card) return;
        const rect = card.getBoundingClientRect();
        card.style.setProperty("--mx", `${e.clientX - rect.left}px`);
        card.style.setProperty("--my", `${e.clientY - rect.top}px`);
    };

    return (
        <li
            ref={cardRef}
            onMouseMove={handleMouseMove}
            className="reveal-on-scroll group relative flex flex-col justify-between p-6 md:p-8 rounded-2xl backdrop-blur-md bg-surface border border-hairline hover:border-accent/30 transition-all duration-500 overflow-hidden"
            data-cursor="coming"
        >
            {/* Cursor-tracking radial spotlight */}
            <div
                aria-hidden="true"
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none z-0"
                style={{
                    background:
                        "radial-gradient(350px circle at var(--mx, 50%) var(--my, 50%), hsl(var(--accent) / 0.1), transparent 85%)"
                }}
            />

            {/* Accent rule that draws across on hover */}
            <div
                aria-hidden="true"
                className="absolute top-0 left-0 w-0 h-px bg-accent group-hover:w-full transition-all duration-700 ease-in-out z-10"
            />

            <div className="relative z-10">
                <div className="flex flex-wrap justify-between items-center mb-6 gap-3">
                    <span className="text-eyebrow uppercase text-foreground/45 flex items-center gap-1.5 select-none">
                        <Compass className="w-3.5 h-3.5" aria-hidden="true" />
                        {topic.category}
                    </span>

                    {/* Breathing status badge */}
                    <span className={`flex items-center gap-2 px-2.5 py-1 rounded-full text-xs font-semibold border select-none ${cfg.color}`}>
                        <span aria-hidden="true" className="relative flex h-2 w-2">
                            <span className={`animate-ping motion-reduce:animate-none absolute inline-flex h-full w-full rounded-full opacity-75 ${cfg.dotColor}`} />
                            <span className={`relative inline-flex rounded-full h-2 w-2 ${cfg.dotColor}`} />
                        </span>
                        {cfg.text}
                    </span>
                </div>

                <h3 className="text-lg md:text-xl font-bold font-heading title-mixed mb-4 group-hover:text-accent transition-colors duration-300">
                    {topic.title}
                </h3>

                <p className="text-sm text-foreground/65 leading-relaxed mb-6">
                    {topic.description}
                </p>
            </div>

            {/* Estimated date & progress */}
            <div className="mt-auto pt-4 border-t border-hairline relative z-10">
                <div className="flex justify-between items-center gap-3 text-xs mb-3 text-foreground/45 font-mono nums-tabular select-none">
                    <span className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-accent/75" aria-hidden="true" />
                        Est. {topic.estimatedDate}
                    </span>
                    <span>{cfg.progress}%</span>
                </div>

                <div
                    className="w-full h-1 bg-hairline-strong rounded-full overflow-hidden"
                    role="progressbar"
                    aria-valuenow={cfg.progress}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-label={`${topic.title} — ${cfg.text}`}
                >
                    {/* Width is the real value; the grow-in is a CSS transform so the
                        bar reads correctly even if the animation never runs. */}
                    <div
                        className="h-full rounded-full bg-gradient-to-r from-accent/70 to-accent origin-left reveal-rule"
                        style={{
                            width: `${cfg.progress}%`,
                            "--reveal-delay": `${index * 0.1 + 0.3}s`,
                        } as React.CSSProperties}
                    />
                </div>
            </div>
        </li>
    );
}
