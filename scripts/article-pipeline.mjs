import fs from "node:fs/promises";
import path from "node:path";
import matter from "gray-matter";
import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkGfm from "remark-gfm";
import remarkRehype from "remark-rehype";
import rehypeSanitize from "rehype-sanitize";
import rehypeSlug from "rehype-slug";
import rehypeStringify from "rehype-stringify";
import { createHighlighter } from "shiki";

const categories = ["Go", "Python", "LLM", "Systems", "Interface"];
const languages = [
  "go",
  "python",
  "bash",
  "json",
  "yaml",
  "typescript",
  "tsx",
  "sql",
  "text",
  "http",
  "dockerfile",
];
let highlighter;
function walk(node, fn) {
  fn(node);
  for (const child of node.children || []) walk(child, fn);
}
function text(node) {
  return node.value || (node.children || []).map(text).join("");
}
function date(value, field, slug) {
  if (
    typeof value !== "string" ||
    !/^\d{4}-\d{2}-\d{2}$/.test(value) ||
    !Number.isFinite(Date.parse(value)) ||
    new Date(value).toISOString().slice(0, 10) !== value
  )
    throw new Error(`${slug}: invalid ${field}`);
}
export function validateMetadata(data, slug) {
  for (const key of ["title", "date", "category", "excerpt"])
    if (typeof data[key] !== "string" || !data[key].trim())
      throw new Error(`${slug}: missing or invalid ${key}`);
  date(data.date, "date", slug);
  if (data.updatedAt) {
    date(data.updatedAt, "updatedAt", slug);
    if (data.updatedAt < data.date) throw new Error(`${slug}: update precedes publication`);
  }
  if (!categories.includes(data.category)) throw new Error(`${slug}: unsupported category`);
  for (const key of ["draft", "featured"])
    if (data[key] !== undefined && typeof data[key] !== "boolean")
      throw new Error(`${slug}: ${key} must be boolean`);
  if (
    data.tags !== undefined &&
    (!Array.isArray(data.tags) || data.tags.some((v) => typeof v !== "string" || !v.trim()))
  )
    throw new Error(`${slug}: invalid tags`);
  if (data.lang !== undefined && data.lang !== "en")
    throw new Error(`${slug}: public articles must be English`);
  if (
    data.series &&
    (typeof data.series !== "string" || !Number.isInteger(data.seriesOrder) || data.seriesOrder < 1)
  )
    throw new Error(`${slug}: invalid series order`);
  if (data.seriesOrder && !data.series) throw new Error(`${slug}: series order without series`);
  if (
    data.labPath &&
    (typeof data.labPath !== "string" || !/^labs\/(go|python|llm)\/[a-z0-9-]+$/.test(data.labPath))
  )
    throw new Error(`${slug}: invalid labPath`);
}
export function readingTime(content) {
  const prose = content.replace(/```[\s\S]*?```/g, " ");
  const cjk = (prose.match(/[\u3400-\u9fff]/g) || []).length;
  const words = (prose.replace(/[\u3400-\u9fff]/g, " ").match(/\b[\w'-]+\b/g) || []).length;
  const codeLines = (content.match(/```[\s\S]*?```/g) || []).reduce(
    (n, block) => n + block.split("\n").length - 2,
    0
  );
  return `${Math.max(1, Math.ceil(words / 220 + cjk / 400 + codeLines / 40))} min read`;
}
export async function expandLabs(content, root) {
  if (content.includes("<!-- result: cache -->")) {
    const record = JSON.parse(
      await fs.readFile(path.join(root, "labs/results/cache-results.json"), "utf8")
    );
    const table = [
      "| Positions | Full prefix, median ms | Cached, median ms | KV tensor bytes |",
      "|---|---:|---:|---:|",
      ...record.rows.map(
        (row) =>
          `| ${row.tokens} | ${row.median_ms.full.toFixed(3)} | ${row.median_ms.cached.toFixed(3)} | ${row.cache_bytes} |`
      ),
    ].join("\n");
    content = content.replace("<!-- result: cache -->", table);
  }
  const expression = /<!-- lab: ([a-zA-Z0-9_./-]+)(?:#([\w-]+))? -->/g;
  let output = "";
  let cursor = 0;
  for (const match of content.matchAll(expression)) {
    const relative = match[1];
    const resolved = path.resolve(root, relative);
    if (!resolved.startsWith(path.resolve(root, "labs") + path.sep) || relative.includes("/."))
      throw new Error(`Invalid snippet path: ${relative}`);
    let source = await fs.readFile(resolved, "utf8");
    if (match[2]) {
      const start = `region:${match[2]}`;
      const end = `endregion:${match[2]}`;
      const lines = source.split("\n");
      const a = lines.findIndex((line) => line.includes(start));
      const b = lines.findIndex((line) => line.includes(end));
      if (a < 0 || b <= a) throw new Error(`Missing snippet ${match[0]}`);
      source = lines.slice(a + 1, b).join("\n");
    }
    const language = { ".go": "go", ".py": "python", ".json": "json", ".sh": "bash" }[
      path.extname(relative)
    ];
    if (!language) throw new Error(`Unsupported snippet extension: ${relative}`);
    output +=
      content.slice(cursor, match.index) + `\n\n\`\`\`${language}\n${source.trimEnd()}\n\`\`\`\n\n`;
    cursor = match.index + match[0].length;
  }
  return output + content.slice(cursor);
}
export async function renderArticle(content) {
  highlighter ||= createHighlighter({
    themes: ["github-light", "github-dark"],
    langs: languages.filter((l) => l !== "text"),
  });
  const hl = await highlighter;
  const toc = [];
  function enhance() {
    return (tree) => {
      walk(tree, (node) => {
        if (node.type === "element" && /^h[23]$/.test(node.tagName))
          toc.push({
            id: String(node.properties.id),
            text: text(node),
            depth: Number(node.tagName[1]),
          });
      });
      function replace(parent) {
        if (!parent.children) return;
        parent.children = parent.children.map((node) => {
          if (
            node.type === "element" &&
            node.tagName === "pre" &&
            node.children?.[0]?.tagName === "code"
          ) {
            const code = node.children[0];
            const source = text(code);
            const requested =
              (code.properties.className || []).find((c) => c.startsWith("language-"))?.slice(9) ||
              "text";
            const lang = languages.includes(requested) ? requested : "text";
            const highlighted = hl.codeToHast(source.trimEnd(), {
              lang,
              themes: { light: "github-light", dark: "github-dark" },
              // GitHub light orange is only 3.48:1 on white; deepen it for AA.
              colorReplacements: { "github-light": { "#e36209": "#a04408" } },
            }).children[0];
            return {
              type: "element",
              tagName: "div",
              properties: { className: ["code-block"] },
              children: [
                {
                  type: "element",
                  tagName: "div",
                  properties: { className: ["code-toolbar"] },
                  children: [
                    {
                      type: "element",
                      tagName: "span",
                      properties: {},
                      children: [{ type: "text", value: requested }],
                    },
                  ],
                },
                highlighted,
              ],
            };
          }
          replace(node);
          if (node.type === "element" && node.tagName === "table")
            return {
              type: "element",
              tagName: "div",
              properties: {
                className: ["table-scroll"],
                tabIndex: 0,
                role: "region",
                "aria-label": "Scrollable table",
              },
              children: [node],
            };
          return node;
        });
      }
      replace(tree);
    };
  }
  const result = await unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkRehype)
    .use(rehypeSanitize)
    .use(rehypeSlug)
    .use(enhance)
    .use(rehypeStringify)
    .process(content);
  return { content: String(result), toc };
}
export async function loadArticles(directory, root) {
  const files = (await fs.readdir(directory))
    .filter(
      (file) =>
        file.endsWith(".md") &&
        !file.startsWith(".") &&
        !["AGENTS.md", "README.md", "CLAUDE.md"].includes(file)
    )
    .sort();
  const articles = [];
  const series = new Set();
  for (const file of files) {
    const slug = file.slice(0, -3);
    const { data, content } = matter(await fs.readFile(path.join(directory, file), "utf8"));
    validateMetadata(data, slug);
    if (data.draft) continue;
    if (data.series) {
      const key = `${data.series}:${data.seriesOrder}`;
      if (series.has(key)) throw new Error(`Duplicate series position ${key}`);
      series.add(key);
    }
    if (data.labPath) await fs.access(path.join(root, data.labPath, "README.md"));
    const expanded = await expandLabs(content, root);
    const rendered = await renderArticle(expanded);
    articles.push({
      id: slug,
      slug,
      title: data.title,
      date: data.date,
      updatedAt: data.updatedAt,
      category: data.category,
      excerpt: data.excerpt,
      tags: data.tags || [],
      series: data.series,
      seriesOrder: data.seriesOrder,
      featured: data.featured || false,
      draft: false,
      lang: "en",
      labPath: data.labPath,
      ...rendered,
      readingTime: readingTime(expanded),
    });
  }
  return articles.sort(
    (a, b) =>
      b.date.localeCompare(a.date) ||
      (a.seriesOrder || 99) - (b.seriesOrder || 99) ||
      a.slug.localeCompare(b.slug)
  );
}
