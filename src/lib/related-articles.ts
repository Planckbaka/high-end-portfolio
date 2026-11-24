import type { ArticleSummary } from "@/types";

export function getRelatedArticles(
  current: ArticleSummary,
  allArticles: ArticleSummary[],
  options?: { excludeSlugs?: string[]; limit?: number }
): ArticleSummary[] {
  const limit = options?.limit ?? 3;
  const excluded = new Set([current.slug, ...(options?.excludeSlugs || [])]);
  const published = allArticles.filter((a) => !a.draft && !excluded.has(a.slug));
  const bySlug = new Map(published.map((a) => [a.slug, a]));

  const picked: ArticleSummary[] = [];
  const pickedSlugs = new Set<string>();

  // Honor explicit frontmatter `related` slugs first
  for (const slug of current.related || []) {
    const target = bySlug.get(slug);
    if (target && !pickedSlugs.has(slug)) {
      picked.push(target);
      pickedSlugs.add(slug);
      if (picked.length >= limit) return picked;
    }
  }

  const currentTags = new Set((current.tags || []).map((t) => t.toLowerCase()));

  const scored = published
    .filter((candidate) => !pickedSlugs.has(candidate.slug))
    .map((candidate) => {
      let score = 0;
      for (const tag of candidate.tags || []) {
        if (currentTags.has(tag.toLowerCase())) {
          score += 4;
        }
      }
      if (candidate.category === current.category) {
        score += 2;
      }
      if (current.labPath && candidate.labPath) {
        score += 1;
      }
      return { candidate, score };
    })
    .filter((entry) => entry.score > 0)
    .sort(
      (a, b) =>
        b.score - a.score ||
        b.candidate.date.localeCompare(a.candidate.date) ||
        a.candidate.slug.localeCompare(b.candidate.slug)
    );

  for (const entry of scored) {
    picked.push(entry.candidate);
    if (picked.length >= limit) break;
  }

  return picked;
}
