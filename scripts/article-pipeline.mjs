import fs from "node:fs/promises";
import path from "node:path";
import matter from "gray-matter";
import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import remarkRehype from "remark-rehype";
import rehypeSanitize, { defaultSchema } from "rehype-sanitize";
import rehypeKatex from "rehype-katex";
import rehypeSlug from "rehype-slug";
import rehypeStringify from "rehype-stringify";
import { createHighlighter } from "shiki";

const categories = ["Go", "Python", "LLM", "Systems", "Interface"];
export const SUPPORTED_LANGUAGES = [
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
  "markdown",
];

// Allow semantic <details>, <summary>, <figure>, <figcaption>, and remark-math classes
// while still running rehype-sanitize before rehype-katex.
const sanitizeSchema = {
  ...defaultSchema,
  tagNames: [...(defaultSchema.tagNames || []), "details", "summary", "figure", "figcaption"],
  attributes: {
    ...defaultSchema.attributes,
    code: [
      ...(defaultSchema.attributes?.code || []),
      ["className", /^language-/, "math-inline", "math-display"],
    ],
    span: [
      ...(defaultSchema.attributes?.span || []),
      ["className", "math-inline", "math-display", "katex-badge", "sec-num", "eq-num"],
    ],
    div: [
      ...(defaultSchema.attributes?.div || []),
      ["className", "math-display", "ledger-callout", "derivation-box", "equation-row"],
    ],
    details: ["className", "open", "name"],
    summary: ["className"],
    figure: ["className", "id"],
    figcaption: ["className"],
  },
};

let highlighterPromise;
export async function getHighlighter() {
  highlighterPromise ||= createHighlighter({
    themes: ["github-light", "github-dark"],
    langs: SUPPORTED_LANGUAGES.filter((l) => l !== "text"),
  });
  return highlighterPromise;
}

export async function highlightCodeHast(source, requested = "text") {
  const hl = await getHighlighter();
  const lang = SUPPORTED_LANGUAGES.includes(requested) ? requested : "text";
  const highlighted = hl.codeToHast(source.trimEnd(), {
    lang,
    themes: { light: "github-light", dark: "github-dark" },
    // GitHub light orange is only 3.48:1 on white; deepen it for AA.
    colorReplacements: { "github-light": { "#e36209": "#a04408" } },
  }).children[0];
  // Clipped long lines scroll horizontally; a focusable pre lets
  // keyboard users reach them (same treatment tables get below).
  highlighted.properties.tabIndex = 0;
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

export async function highlightCodeHtml(source, requested = "text") {
  const hast = await highlightCodeHast(source, requested);
  return String(unified().use(rehypeStringify).stringify({ type: "root", children: [hast] }));
}

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
  if (
    data.related !== undefined &&
    (!Array.isArray(data.related) ||
      data.related.some((v) => typeof v !== "string" || !/^[a-zA-Z0-9-]+$/.test(v)) ||
      data.related.includes(slug))
  )
    throw new Error(`${slug}: invalid related`);
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
  if (data.papers !== undefined) {
    if (
      !Array.isArray(data.papers) ||
      data.papers.some(
        (p) =>
          !p ||
          typeof p !== "object" ||
          typeof p.title !== "string" ||
          !p.title.trim() ||
          typeof p.arxiv !== "string" ||
          !/^\d{4}\.\d{4,5}$/.test(p.arxiv) ||
          (p.year !== undefined && !Number.isInteger(p.year)) ||
          (p.tag !== undefined && typeof p.tag !== "string")
      )
    )
      throw new Error(`${slug}: invalid papers metadata`);
  }
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

function buildInlineCitationNode(fullMatch, arxivId, paper, citeId) {
  const baseId = arxivId.replace(/v\d+$/, "");
  if (!paper) {
    return {
      type: "element",
      tagName: "a",
      properties: {
        href: `https://arxiv.org/abs/${arxivId}`,
        target: "_blank",
        rel: "noopener noreferrer",
        className: ["inline-cite"],
      },
      children: [{ type: "text", value: `${fullMatch} ↗` }],
    };
  }
  const refNum = paper.refIndex;
  const metaParts = [`[${refNum}]`, paper.tag, paper.year ? String(paper.year) : null].filter(
    Boolean
  );
  return {
    type: "element",
    tagName: "span",
    properties: {
      id: citeId,
      className: ["inline-cite-wrap"],
    },
    children: [
      {
        type: "element",
        tagName: "a",
        properties: {
          href: `#ref-${refNum}`,
          className: ["inline-cite"],
        },
        children: [
          { type: "text", value: fullMatch },
          {
            type: "element",
            tagName: "sup",
            properties: { className: ["inline-cite-num"] },
            children: [{ type: "text", value: `[${refNum}]` }],
          },
        ],
      },
      {
        type: "element",
        tagName: "span",
        properties: { className: ["inline-cite-card"] },
        children: [
          {
            type: "element",
            tagName: "span",
            properties: { className: ["inline-cite-card-meta"] },
            children: [{ type: "text", value: metaParts.join(" · ") }],
          },
          {
            type: "element",
            tagName: "span",
            properties: { className: ["inline-cite-card-title"] },
            children: [{ type: "text", value: paper.title }],
          },
          {
            type: "element",
            tagName: "a",
            properties: {
              href: `https://arxiv.org/abs/${baseId}`,
              target: "_blank",
              rel: "noopener noreferrer",
              className: ["inline-cite-card-link"],
            },
            children: [{ type: "text", value: `Open arXiv:${baseId} ↗` }],
          },
        ],
      },
    ],
  };
}

export async function renderArticle(content, options = {}) {
  const hl = await getHighlighter();
  const numberedHeadings = options.numberedHeadings !== false;
  const paperList = Array.isArray(options.papers) ? options.papers : [];
  const paperMap = new Map(paperList.map((p, idx) => [p.arxiv, { ...p, refIndex: idx + 1 }]));
  const citeCounts = new Map();
  const firstCiteIds = new Map();

  const toc = [];
  let h2Count = 0;
  let h3Count = 0;
  let figCount = 0;
  let eqCount = 0;

  function enhancePreKatex() {
    return (tree) => {
      walk(tree, (node) => {
        if (node.type === "element" && node.tagName === "h2") {
          h2Count += 1;
          h3Count = 0;
          const rawText = text(node);
          const id = String(node.properties.id);
          const numberedText = numberedHeadings ? `${h2Count}. ${rawText}` : rawText;
          toc.push({ id, text: numberedText, depth: 2 });
          node.properties.className = [...(node.properties.className || []), "paper-sec-heading"];
          node.children = [
            ...(numberedHeadings
              ? [
                  {
                    type: "element",
                    tagName: "span",
                    properties: { className: ["sec-num"] },
                    children: [{ type: "text", value: `${h2Count}.` }],
                  },
                ]
              : []),
            ...node.children,
            {
              type: "element",
              tagName: "a",
              properties: {
                className: ["heading-anchor"],
                href: `#${id}`,
                title: "Permalink to section",
                "aria-label": `Permalink to ${rawText}`,
              },
              children: [{ type: "text", value: "#" }],
            },
          ];
        } else if (node.type === "element" && node.tagName === "h3") {
          h3Count += 1;
          const rawText = text(node);
          const id = String(node.properties.id);
          const prefix = h2Count > 0 ? `${h2Count}.${h3Count}` : `${h3Count}`;
          toc.push({ id, text: numberedHeadings ? `${prefix} ${rawText}` : rawText, depth: 3 });
          node.properties.className = [
            ...(node.properties.className || []),
            "paper-subsec-heading",
          ];
          node.children = [
            ...(numberedHeadings
              ? [
                  {
                    type: "element",
                    tagName: "span",
                    properties: { className: ["sec-num"] },
                    children: [{ type: "text", value: prefix }],
                  },
                ]
              : []),
            ...node.children,
            {
              type: "element",
              tagName: "a",
              properties: {
                className: ["heading-anchor"],
                href: `#${id}`,
                title: "Permalink to subsection",
                "aria-label": `Permalink to ${rawText}`,
              },
              children: [{ type: "text", value: "#" }],
            },
          ];
        }
        if (node.type === "element" && node.tagName === "img") {
          const alt = node.properties.alt;
          if (typeof alt !== "string" || !alt.trim())
            throw new Error(`Article image missing alt text: ${node.properties.src ?? "(no src)"}`);
        }
      });
      function replace(parent) {
        if (!parent.children) return;
        parent.children = parent.children.map((node) => {
          // Wrap standalone paragraph images in a Jon Barron style <figure class="paper-figure academic-figure">
          if (
            node.type === "element" &&
            node.tagName === "p" &&
            node.children?.length === 1 &&
            node.children[0]?.tagName === "img"
          ) {
            figCount += 1;
            const img = node.children[0];
            img.properties = {
              ...img.properties,
              className: ["fig-img", "zoomable"],
              loading: "lazy",
            };
            const altText = String(img.properties.alt || "");
            const strippedCaption = altText.replace(/^Figure\s+\d+\s*:\s*/i, "");
            if (strippedCaption) {
              img.properties.alt = `Figure ${figCount}: ${strippedCaption}`;
            }
            return {
              type: "element",
              tagName: "figure",
              properties: {
                id: `fig-${figCount}`,
                className: ["paper-figure", "academic-figure"],
              },
              children: [
                {
                  type: "element",
                  tagName: "div",
                  properties: { className: ["fig-top-img-wrap"] },
                  children: [img],
                },
                {
                  type: "element",
                  tagName: "figcaption",
                  properties: { className: ["fig-caption"] },
                  children: [
                    {
                      type: "element",
                      tagName: "strong",
                      properties: { className: ["fig-label"] },
                      children: [{ type: "text", value: `Figure ${figCount}: ` }],
                    },
                    { type: "text", value: strippedCaption },
                  ],
                },
              ],
            };
          }
          if (
            node.type === "element" &&
            node.tagName === "pre" &&
            node.children?.[0]?.tagName === "code"
          ) {
            const code = node.children[0];
            const classes = code.properties.className || [];
            // Let rehype-katex handle display math blocks (<pre><code class="language-math math-display">)
            if (classes.includes("math-display") || classes.includes("language-math")) {
              return node;
            }
            const source = text(code);
            const requested =
              classes.find((c) => c.startsWith("language-"))?.slice(9) || "text";
            const lang = SUPPORTED_LANGUAGES.includes(requested) ? requested : "text";
            const highlighted = hl.codeToHast(source.trimEnd(), {
              lang,
              themes: { light: "github-light", dark: "github-dark" },
              // GitHub light orange is only 3.48:1 on white; deepen it for AA.
              colorReplacements: { "github-light": { "#e36209": "#a04408" } },
            }).children[0];
            // Clipped long lines scroll horizontally; a focusable pre lets
            // keyboard users reach them (same treatment tables get below).
            highlighted.properties.tabIndex = 0;
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
          if (node.type === "element" && node.tagName === "table") {
            node.properties = {
              ...node.properties,
              className: [...(node.properties?.className || []), "booktabs-table"],
            };
            return {
              type: "element",
              tagName: "div",
              properties: { className: ["table-card"] },
              children: [
                {
                  type: "element",
                  tagName: "div",
                  properties: {
                    className: ["table-scroll"],
                    tabIndex: 0,
                    role: "region",
                    "aria-label": "Scrollable table",
                  },
                  children: [node],
                },
              ],
            };
          }
          return node;
        });
      }
      replace(tree);
    };
  }

  // After rehype-katex runs, wrap rendered <span class="katex-display"> blocks in
  // Jon Barron style numbered `.equation-row` containers: (1), (2), ...
  // and link inline `arXiv:XXXX.XXXXX` citations to `#ref-N` with hover cards.
  function enhancePostKatex() {
    const skipTags = new Set(["a", "code", "pre", "script", "style", "math", "h1", "h2", "h3", "h4"]);
    const arxivPattern = /\barXiv:(\d{4}\.\d{4,5}(?:v\d+)?)\b/g;

    return (tree) => {
      function wrapEquations(parent) {
        if (!parent.children) return;
        parent.children = parent.children.map((node) => {
          if (
            node.type === "element" &&
            (node.tagName === "span" || node.tagName === "p") &&
            (node.properties?.className?.includes("katex-display") ||
              (node.children?.length === 1 &&
                node.children[0]?.properties?.className?.includes("katex-display")))
          ) {
            eqCount += 1;
            const katexNode = node.properties?.className?.includes("katex-display")
              ? node
              : node.children[0];
            return {
              type: "element",
              tagName: "div",
              properties: {
                id: `eq-${eqCount}`,
                className: ["equation-row"],
              },
              children: [
                {
                  type: "element",
                  tagName: "div",
                  properties: { className: ["math-display"] },
                  children: [katexNode],
                },
                {
                  type: "element",
                  tagName: "a",
                  properties: {
                    href: `#eq-${eqCount}`,
                    className: ["eq-num"],
                    title: `Equation (${eqCount})`,
                  },
                  children: [{ type: "text", value: `(${eqCount})` }],
                },
              ],
            };
          }
          wrapEquations(node);
          return node;
        });
      }

      function linkCitations(parent) {
        if (!parent.children) return;
        const classes = parent.properties?.className || [];
        if (
          parent.type === "element" &&
          (skipTags.has(parent.tagName) ||
            classes.includes("katex") ||
            classes.includes("inline-cite-wrap"))
        ) {
          return;
        }
        const nextChildren = [];
        for (const child of parent.children) {
          if (child.type === "text" && child.value.includes("arXiv:")) {
            let lastIdx = 0;
            arxivPattern.lastIndex = 0;
            for (const m of child.value.matchAll(arxivPattern)) {
              if (m.index > lastIdx) {
                nextChildren.push({ type: "text", value: child.value.slice(lastIdx, m.index) });
              }
              const fullMatch = m[0];
              const arxivId = m[1];
              const baseId = arxivId.replace(/v\d+$/, "");
              const paper = paperMap.get(baseId);
              let citeId;
              if (paper) {
                const count = (citeCounts.get(baseId) || 0) + 1;
                citeCounts.set(baseId, count);
                citeId = `cite-ref-${paper.refIndex}-${count}`;
                if (!firstCiteIds.has(baseId)) firstCiteIds.set(baseId, citeId);
              }
              nextChildren.push(buildInlineCitationNode(fullMatch, arxivId, paper, citeId));
              lastIdx = m.index + fullMatch.length;
            }
            if (lastIdx < child.value.length) {
              nextChildren.push({ type: "text", value: child.value.slice(lastIdx) });
            }
          } else {
            linkCitations(child);
            nextChildren.push(child);
          }
        }
        parent.children = nextChildren;
      }

      wrapEquations(tree);
      if (options.linkCitations !== false) linkCitations(tree);
    };
  }

  const result = await unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkMath)
    .use(remarkRehype, { allowDangerousHtml: true })
    .use(rehypeSanitize, sanitizeSchema)
    .use(rehypeSlug)
    .use(enhancePreKatex)
    .use(rehypeKatex)
    .use(enhancePostKatex)
    .use(rehypeStringify)
    .process(content);

  const enrichedPapers = paperList.length
    ? paperList.map((p) =>
        firstCiteIds.has(p.arxiv) ? { ...p, firstCiteId: firstCiteIds.get(p.arxiv) } : { ...p }
      )
    : undefined;

  return { content: String(result), toc, ...(enrichedPapers ? { papers: enrichedPapers } : {}) };
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
    const rendered = await renderArticle(expanded, { papers: data.papers });
    const { papers: enrichedPapers, ...renderedRest } = rendered;
    articles.push({
      id: slug,
      slug,
      title: data.title,
      date: data.date,
      updatedAt: data.updatedAt,
      category: data.category,
      excerpt: data.excerpt,
      tags: data.tags || [],
      ...(data.related ? { related: data.related } : {}),
      series: data.series,
      seriesOrder: data.seriesOrder,
      featured: data.featured || false,
      draft: false,
      lang: "en",
      labPath: data.labPath,
      ...(enrichedPapers ? { papers: enrichedPapers } : {}),
      ...renderedRest,
      readingTime: readingTime(expanded),
    });
  }
  const slugSet = new Set(articles.map((a) => a.slug));
  for (const article of articles) {
    for (const rel of article.related || []) {
      if (!slugSet.has(rel)) {
        throw new Error(`${article.slug}: unknown related slug ${rel}`);
      }
    }
  }
  return articles.sort(
    (a, b) =>
      b.date.localeCompare(a.date) ||
      (a.seriesOrder || 99) - (b.seriesOrder || 99) ||
      a.slug.localeCompare(b.slug)
  );
}
