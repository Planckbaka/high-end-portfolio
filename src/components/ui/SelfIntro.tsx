import { technologies, selfIntroData } from "@/config/data";
import { ArrowUpRight } from "lucide-react";
import { memo } from "react";
import { MagneticButton } from "./MagneticButton";

interface StatCardProps {
    value: string;
    label: string;
    accent?: string;
}

const StatCard = memo(({ value, label, accent }: StatCardProps) => (
    <div className="bg-surface p-6 border border-hairline hover:border-accent/40 transition-colors duration-300 flex flex-col justify-between aspect-square group/card">
        <ArrowUpRight
            size={20}
            className="self-end text-foreground/25 group-hover/card:text-accent transition-colors duration-300"
            aria-hidden="true"
        />
        <div>
            <p className="text-display-md font-heading text-foreground nums-tabular">
                {value}
                {accent && <span className="text-accent">{accent}</span>}
            </p>
            <p className="text-eyebrow uppercase text-muted-foreground mt-2">
                {label}
            </p>
        </div>
    </div>
));

StatCard.displayName = "StatCard";

/**
 * "About me" panel.
 *
 * Server component: the entrance reveal is CSS (`reveal-on-scroll`), so nothing
 * here needs client JavaScript. The card is visible by default — the animation
 * is an enhancement layered on top where the browser supports scroll-driven
 * animations.
 */
export function SelfIntro() {
    return (
        <section
            className="gutter py-12 md:py-24"
            aria-labelledby="intro-heading"
        >
            <div
                className="reveal-on-scroll w-full bg-surface border border-hairline p-8 md:p-12 lg:p-16 relative overflow-hidden group"
            >
                {/* Decorative background element */}
                <div className="absolute -top-24 -right-24 w-64 h-64 bg-accent/20 rounded-full blur-[100px] pointer-events-none" aria-hidden="true" />

                <div className="absolute top-8 right-8 opacity-0 group-hover:opacity-100 transition-opacity duration-500" aria-hidden="true">
                    <ArrowUpRight className="text-accent" size={32} />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center relative z-10">
                    <div className="space-y-8">
                        <div>
                            <span className="text-eyebrow uppercase text-accent mb-4 block">
                                Introduction
                            </span>
                            <h2
                                id="intro-heading"
                                className="text-display-md font-heading uppercase text-foreground"
                            >
                                {selfIntroData.heading.main} <br />
                                <span className="text-muted-foreground">{selfIntroData.heading.sub}</span>
                            </h2>
                        </div>

                        <p className="text-base md:text-lg text-foreground/75 leading-relaxed max-w-md">
                            {selfIntroData.description}
                        </p>

                        <ul className="flex flex-wrap gap-3">
                            {selfIntroData.roles.map((role) => (
                                <li
                                    key={role}
                                    className="px-4 py-2 border border-hairline rounded-full bg-surface-raised text-eyebrow uppercase text-muted-foreground"
                                >
                                    {role}
                                </li>
                            ))}
                        </ul>

                        <div className="pt-6">
                            <MagneticButton href="/resume.pdf">
                                View Resume
                            </MagneticButton>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        {/* Stats grid */}
                        {selfIntroData.stats.map((stat) => (
                            <StatCard
                                key={stat.id}
                                value={stat.value}
                                label={stat.label}
                                accent={stat.accent}
                            />
                        ))}

                        <div className="col-span-2 bg-surface p-6 border border-hairline hover:border-accent/40 transition-colors duration-300">
                            <div className="flex justify-between items-start mb-4">
                                <h3 className="text-display-sm font-heading text-foreground">Stack</h3>
                                <ArrowUpRight size={20} className="text-foreground/25" aria-hidden="true" />
                            </div>
                            <ul className="flex flex-wrap gap-2">
                                {technologies.map((tech) => (
                                    <li
                                        key={tech.id}
                                        className="text-eyebrow uppercase text-muted-foreground bg-surface-raised px-2 py-1 rounded"
                                    >
                                        {tech.name}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
