import { renderFeed } from "../feed";
import { modelSystemsArticles, MODEL_SYSTEMS_SERIES } from "../series";
import type { ArticleSummary } from "@/types";
const a: ArticleSummary = {
  id: "a",
  slug: "a",
  title: "Shapes < masks & values",
  excerpt: "A & B",
  date: "2026-09-01",
  updatedAt: "2026-09-09",
  category: "LLM",
  series: MODEL_SYSTEMS_SERIES.title,
  seriesOrder: 2,
};
it("emits valid XML, excludes drafts and preserves original publication dates", () => {
  const doc = new DOMParser().parseFromString(
    renderFeed([a, { ...a, slug: "draft", draft: true }], {
      url: "https://example.com",
      title: "A & B",
      description: "Notes < experiments",
    }),
    "application/xml"
  );
  expect(doc.querySelector("parsererror")).toBeNull();
  expect(doc.querySelectorAll("item")).toHaveLength(1);
  expect(doc.querySelector("item title")?.textContent).toBe(a.title);
  expect(doc.querySelector("item pubDate")?.textContent).toBe("Tue, 01 Sep 2026 00:00:00 GMT");
  expect(doc.querySelector("lastBuildDate")?.textContent).toBe("Wed, 09 Sep 2026 00:00:00 GMT");
});
it("orders published series chapters by their explicit order", () => {
  expect(
    modelSystemsArticles([
      a,
      { ...a, slug: "first", seriesOrder: 1 },
      { ...a, slug: "draft", draft: true },
    ]).map((x) => x.slug)
  ).toEqual(["first", "a"]);
});
