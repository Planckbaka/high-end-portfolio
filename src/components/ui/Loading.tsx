export default function Loading() {
    return (
        <div className="fixed inset-0 flex items-center justify-center bg-background z-50">
            <div className="flex flex-col items-center gap-4">
                <div className="relative w-16 h-16">
                    <div className="absolute inset-0 border-4 border-foreground/10 rounded-full" />
                    <div className="absolute inset-0 border-4 border-accent border-t-transparent rounded-full animate-spin" />
                </div>
                <p className="text-sm uppercase tracking-widest text-foreground/60">Loading...</p>
            </div>
        </div>
    );
}
