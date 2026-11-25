// Build a small, deterministic ZIP, a browsable source mirror, and pre-rendered Lab route data.
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import matter from "gray-matter";
import { highlightCodeHtml, renderArticle } from "./article-pipeline.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const source = path.join(root, "labs");
const output = path.join(root, "public/labs");
const dataDir = path.join(root, "src/lib/labs-data");
const extensions = new Set([".go", ".mod", ".py", ".md", ".txt", ".json", ".csv", ".svg"]);

async function collect(directory, relative = "") {
  const files = [];
  for (const entry of await fs.readdir(directory, { withFileTypes: true })) {
    if (entry.name.startsWith(".") || entry.name === "__pycache__") continue;
    const rel = path.join(relative, entry.name);
    if (entry.isDirectory()) files.push(...(await collect(path.join(directory, entry.name), rel)));
    else if (entry.isFile() && extensions.has(path.extname(entry.name))) files.push(rel);
  }
  return files.sort();
}

const files = await collect(source);
await fs.mkdir(output, { recursive: true });

const table = Array.from({ length: 256 }, (_, n) => {
  for (let k = 0; k < 8; k++) n = n & 1 ? 0xedb88320 ^ (n >>> 1) : n >>> 1;
  return n >>> 0;
});
function crc32(bytes) {
  let crc = 0xffffffff;
  for (const byte of bytes) crc = table[(crc ^ byte) & 255] ^ (crc >>> 8);
  return (crc ^ 0xffffffff) >>> 0;
}

const local = [];
const central = [];
let offset = 0;
for (const file of files) {
  const data = await fs.readFile(path.join(source, file));
  const destination = path.join(output, file);
  await fs.mkdir(path.dirname(destination), { recursive: true });
  await fs.writeFile(destination, data);
  const name = Buffer.from("labs/" + file.replaceAll(path.sep, "/"));
  const crc = crc32(data);
  const header = Buffer.alloc(30);
  header.writeUInt32LE(0x04034b50, 0);
  header.writeUInt16LE(20, 4);
  header.writeUInt16LE(0x21, 12);
  header.writeUInt32LE(crc, 14);
  header.writeUInt32LE(data.length, 18);
  header.writeUInt32LE(data.length, 22);
  header.writeUInt16LE(name.length, 26);
  local.push(header, name, data);
  const directory = Buffer.alloc(46);
  directory.writeUInt32LE(0x02014b50, 0);
  directory.writeUInt16LE(20, 4);
  directory.writeUInt16LE(20, 6);
  directory.writeUInt16LE(0x21, 14);
  directory.writeUInt32LE(crc, 16);
  directory.writeUInt32LE(data.length, 20);
  directory.writeUInt32LE(data.length, 24);
  directory.writeUInt16LE(name.length, 28);
  directory.writeUInt32LE(offset, 42);
  central.push(directory, name);
  offset += header.length + name.length + data.length;
}
const centralData = Buffer.concat(central);
const end = Buffer.alloc(22);
end.writeUInt32LE(0x06054b50, 0);
end.writeUInt16LE(files.length, 8);
end.writeUInt16LE(files.length, 10);
end.writeUInt32LE(centralData.length, 12);
end.writeUInt32LE(offset, 16);
await fs.writeFile(
  path.join(output, "engineering-labs.zip"),
  Buffer.concat([...local, centralData, end])
);

// Build article companion mapping from content/articles frontmatter
const articleDir = path.join(root, "content/articles");
const companionMap = new Map();
for (const file of (await fs.readdir(articleDir)).sort()) {
  if (!file.endsWith(".md") || ["AGENTS.md", "README.md", "CLAUDE.md"].includes(file)) continue;
  const slug = file.slice(0, -3);
  const { data } = matter(await fs.readFile(path.join(articleDir, file), "utf8"));
  if (data.draft || !data.labPath) continue;
  const list = companionMap.get(data.labPath) || [];
  list.push(slug);
  companionMap.set(data.labPath, list);
}

const RESULT_FIXTURES = {
  "labs/llm/attention": "results/attention-result.txt",
  "labs/llm/kv-cache": "results/cache-results.json",
  "labs/python/streaming": "results/stream-fixture.json",
};

const EXT_TO_LANG = {
  ".go": "go",
  ".mod": "text",
  ".py": "python",
  ".json": "json",
  ".txt": "text",
  ".sh": "bash",
  ".yaml": "yaml",
};

const LAB_SUMMARIES = {
  "labs/llm/attention":
    "Numerical verification of scaled dot-product causal attention, shape invariants, and zero-leakage future masking on CPU.",
  "labs/llm/block-diffusion":
    "Block-causal masking, confidence-thresholded parallel unmasking, and KV-cached prefix reuse for discrete diffusion LLMs.",
  "labs/llm/deepseek-mla-grpo":
    "Low-rank KV latent compression, RoPE key decoupling, weight-matrix absorption, and critic-free GRPO advantage normalization.",
  "labs/llm/flagship-2026":
    "Asymmetric compressed-encoder decoding (CED), depth-wise attention residuals (AttnRes), and 5-step Newton-Schulz Muon orthogonalization.",
  "labs/llm/kv-cache":
    "Incremental key-value state caching vs. full recomputation, verifying exact floating-point logit parity across decode steps.",
  "labs/llm/looped-transformer":
    "Recurrent shared-weight depth iteration, terminal-loop constant KV cache, and adaptive compute halting criteria.",
  "labs/llm/modern-transformer":
    "Complex-plane RoPE rotation invariance, SwiGLU gating dynamics, and RMSNorm gradient stability checks in pure PyTorch.",
  "labs/llm/roofline-flash":
    "Online Softmax blockwise tiling and HBM/SRAM arithmetic-intensity roofline verification against naive quadratic attention.",
  "labs/go/agent":
    "Deterministic tool-use state machine with bounded step budgets, structured error recovery, and context-driven cancellation.",
  "labs/go/gateway":
    "Semaphore-bounded admission control, per-request timeout propagation, and graceful server draining tested under Go's race detector.",
  "labs/python/concurrency":
    "Structured asyncio.TaskGroup fan-out, semaphore backpressure, and fail-fast cancellation across heterogeneous tool calls.",
  "labs/python/streaming":
    "Time-to-first-token (TTFT) and inter-token latency (ITL) quantile telemetry over asynchronous server-sent event streams.",
};

function parseReadmeHeader(markdown, fallbackName) {
  const lines = markdown.split("\n");
  let title = fallbackName;
  let titleLineIdx = -1;
  for (let i = 0; i < lines.length; i++) {
    const m = lines[i].match(/^#\s+(.+)$/);
    if (m) {
      title = m[1].replace(/\s*\(`labs\/[^`]+`\)\s*$/, "").trim();
      titleLineIdx = i;
      break;
    }
  }
  const bodyMd = titleLineIdx >= 0 ? lines.slice(titleLineIdx + 1).join("\n").trim() : markdown;

  // Extract first conceptual prose paragraph as summary (skipping CLI setup lines or trailing colons)
  const paragraphs = bodyMd
    .replace(/```[\s\S]*?```/g, "")
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(
      (p) =>
        p &&
        !p.startsWith("#") &&
        !p.startsWith("1.") &&
        !p.startsWith("- ") &&
        !/^Run\s+(from|via|with|this)/i.test(p) &&
        !p.endsWith(":")
    );
  const rawSummary = (paragraphs[0] || "")
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/\$[^$]+\$/g, "")
    .replace(/\s+/g, " ")
    .trim();

  // Extract sh/bash commands
  const runCommands = [];
  for (const m of bodyMd.matchAll(/```(?:sh|bash)\n([\s\S]*?)```/g)) {
    for (const cmd of m[1].split("\n").map((l) => l.trim()).filter(Boolean)) {
      runCommands.push(cmd);
    }
  }

  return { title, bodyMd, summary: rawSummary, runCommands };
}

function classifyLabFile(fileName, isResult = false) {
  if (isResult) return "result";
  if (fileName.startsWith("test_") || fileName.endsWith("_test.go")) return "test";
  return "impl";
}

await fs.rm(dataDir, { recursive: true, force: true });
await fs.mkdir(dataDir, { recursive: true });

const rootReadmeRaw = await fs.readFile(path.join(source, "README.md"), "utf8");
const { bodyMd: overviewBodyMd } = parseReadmeHeader(rootReadmeRaw, "Engineering Labs");
const overviewRendered = await renderArticle(overviewBodyMd, {
  numberedHeadings: false,
  linkCitations: false,
});

const TRACK_ORDER = ["llm", "go", "python"];
const labSummaries = [];
const loaderEntries = [];

for (const track of TRACK_ORDER) {
  const trackPath = path.join(source, track);
  const subdirs = (await fs.readdir(trackPath, { withFileTypes: true }))
    .filter((e) => e.isDirectory() && !e.name.startsWith(".") && e.name !== "__pycache__")
    .map((e) => e.name)
    .sort();

  for (const name of subdirs) {
    const labPath = `labs/${track}/${name}`;
    const dirFull = path.join(trackPath, name);
    const readmeRaw = await fs.readFile(path.join(dirFull, "README.md"), "utf8");
    const { title, bodyMd, summary, runCommands } = parseReadmeHeader(readmeRaw, name);
    const rewrittenMd = bodyMd.replaceAll("(/labs/README.md)", "(/labs)");
    const renderedReadme = await renderArticle(rewrittenMd, {
      numberedHeadings: false,
      linkCitations: false,
    });

    const dirEntries = (await fs.readdir(dirFull))
      .filter((f) => f !== "README.md" && !f.startsWith(".") && extensions.has(path.extname(f)))
      .sort((a, b) => {
        const rank = (f) => (classifyLabFile(f) === "impl" ? 0 : 1);
        return rank(a) - rank(b) || a.localeCompare(b);
      });

    const labFiles = [];
    let openedPrimary = false;
    for (const fileName of dirEntries) {
      const rawSource = await fs.readFile(path.join(dirFull, fileName), "utf8");
      const ext = path.extname(fileName);
      const language = EXT_TO_LANG[ext] || "text";
      const kind = classifyLabFile(fileName, false);
      const defaultOpen = kind === "impl" && !openedPrimary;
      if (defaultOpen) openedPrimary = true;
      labFiles.push({
        name: fileName,
        relativePath: `${labPath}/${fileName}`,
        language,
        kind,
        defaultOpen,
        html: await highlightCodeHtml(rawSource, language),
        lineCount: rawSource.trimEnd().split("\n").length,
      });
    }

    const resultRel = RESULT_FIXTURES[labPath];
    if (resultRel) {
      const resultFull = path.join(source, resultRel);
      const rawResult = await fs.readFile(resultFull, "utf8");
      const ext = path.extname(resultRel);
      const language = EXT_TO_LANG[ext] || "text";
      labFiles.push({
        name: path.basename(resultRel),
        relativePath: `labs/${resultRel}`,
        language,
        kind: "result",
        defaultOpen: false,
        html: await highlightCodeHtml(rawResult, language),
        lineCount: rawResult.trimEnd().split("\n").length,
      });
    }

    const companionSlugs = companionMap.get(labPath) || [];
    const curatedSummary = LAB_SUMMARIES[labPath] || summary;
    const summaryRecord = {
      track,
      name,
      labPath,
      title,
      summary: curatedSummary,
      runCommands,
      fileCount: labFiles.length,
      companionSlugs,
    };
    labSummaries.push(summaryRecord);

    const detailKey = `${track}/${name}`;
    const detailFile = `${track}--${name}.json`;
    await fs.writeFile(
      path.join(dataDir, detailFile),
      JSON.stringify({
        ...summaryRecord,
        readmeHtml: renderedReadme.content,
        files: labFiles,
      })
    );
    loaderEntries.push(
      `  ${JSON.stringify(detailKey)}: () => import(${JSON.stringify(`./${detailFile}`)}),`
    );
  }
}

await fs.writeFile(
  path.join(dataDir, "manifest.json"),
  JSON.stringify({
    overviewHtml: overviewRendered.content,
    labs: labSummaries,
  })
);

await fs.writeFile(
  path.join(dataDir, "index.ts"),
  [
    "// Auto-generated by scripts/package-labs.mjs — do not edit manually.",
    "export const labDetailLoaders: Record<string, () => Promise<{ default: unknown }>> = {",
    ...loaderEntries,
    "};",
    "",
  ].join("\n")
);

console.log(
  `Packaged ${files.length} lab source/result files and pre-rendered ${labSummaries.length} interactive Lab pages.`
);
