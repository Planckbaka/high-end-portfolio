import { GridBackground } from "@/components/ui/GridBackground";

export default function Loading() {
    return (
        <main className="relative w-full min-h-screen flex items-center justify-center">
            <GridBackground />
            <div className="text-center">
                <div className="inline-block w-16 h-16 border-4 border-white/10 border-t-accent rounded-full animate-spin mb-4" />
                <p className="text-sm uppercase tracking-widest text-white/60">
                    Loading...
                </p>
            </div>
        </main>
    );
}
