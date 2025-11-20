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
            {/* Vertical Lines */}
            <div className="w-px h-full bg-white/5" />
            <div className="w-px h-full bg-white/5" />
            <div className="w-px h-full bg-white/5" />
            <div className="w-px h-full bg-white/5 hidden md:block" />
            <div className="w-px h-full bg-white/5 hidden lg:block" />
        </div>
    );
}
