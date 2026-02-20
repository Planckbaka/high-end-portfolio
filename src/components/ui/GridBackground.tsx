"use client";

import { cn } from "@/lib/utils";

export function GridBackground({ className }: { className?: string }) {
    return (
        <div
            className={cn(
                "fixed inset-0 z-[-1] pointer-events-none flex justify-between px-4 md:px-12 lg:px-24 w-full h-full",
                className
            )}
        >
            {/* Ambient Radial Glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80vw] h-[80vw] max-w-[800px] max-h-[800px] bg-accent/10 md:bg-accent/5 rounded-full blur-[100px] mix-blend-screen opacity-50 dark:opacity-100" />
            
            {/* Vertical Lines */}
            <div className="relative z-10 w-px h-full bg-foreground/[0.02]" />
            <div className="relative z-10 w-px h-full bg-foreground/[0.02]" />
            <div className="relative z-10 w-px h-full bg-foreground/[0.02]" />
            <div className="relative z-10 w-px h-full bg-foreground/[0.02] hidden md:block" />
            <div className="relative z-10 w-px h-full bg-foreground/[0.02] hidden lg:block" />
        </div>
    );
}
