export function ArticleSkeleton() {
    return (
        <div className="group relative border border-foreground/10 overflow-hidden animate-pulse">
            <div className="p-6 md:p-8 flex flex-col h-full">
                {/* Category badge skeleton */}
                <div className="mb-4">
                    <div className="h-4 w-20 bg-foreground/5 rounded" />
                </div>

                {/* Title skeleton */}
                <div className="mb-4 space-y-2">
                    <div className="h-6 w-full bg-foreground/10 rounded" />
                    <div className="h-6 w-3/4 bg-foreground/10 rounded" />
                </div>

                {/* Excerpt skeleton */}
                <div className="mb-6 space-y-2 flex-grow">
                    <div className="h-4 w-full bg-foreground/5 rounded" />
                    <div className="h-4 w-full bg-foreground/5 rounded" />
                    <div className="h-4 w-2/3 bg-foreground/5 rounded" />
                </div>

                {/* Meta info skeleton */}
                <div className="pt-4 border-t border-foreground/5 flex items-center justify-between">
                    <div className="h-4 w-24 bg-foreground/5 rounded" />
                    <div className="h-4 w-16 bg-foreground/5 rounded" />
                </div>
            </div>
        </div>
    );
}

export function ArticlesSkeletonGrid({ count = 5 }: { count?: number }) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: count }).map((_, i) => (
                <ArticleSkeleton key={i} />
            ))}
        </div>
    );
}
