import { getAllArticles } from "@/lib/markdown";
import { renderFeed } from "@/lib/feed";
import { siteConfig } from "@/config/site";
export const dynamic = "force-static";
export async function GET() {
  return new Response(renderFeed(await getAllArticles(), siteConfig), {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
