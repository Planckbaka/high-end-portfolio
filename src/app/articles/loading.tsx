import { ArticlesSkeletonGrid } from "@/components/ui/ArticleSkeleton";
import { GridBackground } from "@/components/ui/GridBackground";

export default function ArticlesLoading() {
    return (
        <main className="relative w-full min-h-screen overflow-hidden">
            <GridBackground />

            <section className="relative z-10 px-4 md:px-12 lg:px-24 py-24 md:py-32">
                {/* Header skeleton */}
                <div className="mb-16 md:mb-24 animate-pulse">
                    <div className="h-12 md:h-20 w-48 md:w-72 bg-foreground/10 rounded mb-4" />
                    <div className="h-4 w-64 bg-foreground/5 rounded" />
                </div>

                {/* Articles grid skeleton */}
                <ArticlesSkeletonGrid count={6} />

                {/* Pagination skeleton */}
                <div className="mt-16 flex justify-center animate-pulse">
                    <div className="flex gap-2">
                        {[1, 2, 3, 4, 5].map((i) => (
                            <div key={i} className="w-10 h-10 bg-foreground/5 rounded" />
                        ))}
                    </div>
                </div>
            </section>
        </main>
    );
}
