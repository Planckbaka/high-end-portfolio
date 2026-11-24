import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

/**
 * Human date for `YYYY-MM-DD` frontmatter dates, pinned to UTC so the rendered
 * day matches the written day in every timezone.
 */
export function formatDate(isoDate: string): string {
    return new Date(`${isoDate}T00:00:00Z`).toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        timeZone: "UTC",
    });
}
