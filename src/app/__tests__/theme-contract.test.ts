import { globSync, readFileSync } from "node:fs";
import { join } from "node:path";

/**
 * Guards the theming contract in globals.css.
 *
 * These are source-level assertions rather than rendering assertions on purpose:
 * the bug they protect against lived entirely in the CSS cascade, and jsdom does
 * not evaluate Tailwind, so no amount of `render()` would have caught it.
 *
 * The original defect: the site themes via next-themes' `data-theme` attribute,
 * but no Tailwind `dark` variant was declared. Tailwind 4 then falls back to
 * `@media (prefers-color-scheme: dark)`, so every `dark:` utility tracked the
 * operating system while the rest of the page tracked the toggle. With the two
 * disagreeing, `dark:prose-invert` selected the wrong typography palette and
 * article body text landed on a same-lightness background (~1.05:1).
 */

const ROOT = join(__dirname, "..", "..", "..");
const CSS = readFileSync(join(ROOT, "src", "app", "globals.css"), "utf8");

describe("dark variant wiring", () => {
    it("declares a custom dark variant bound to the data-theme attribute", () => {
        // Normalise whitespace so formatting changes do not fail the test.
        const css = CSS.replace(/\s+/g, " ");
        expect(css).toMatch(/@custom-variant\s+dark\s*\(/);
        expect(css).toMatch(/@custom-variant\s+dark\s*\([^)]*\[data-theme=["']dark["']\]/);
    });

    it("does not leave the dark variant coupled to prefers-color-scheme", () => {
        // A bare `@media (prefers-color-scheme: dark)` block redefining theme
        // tokens would reintroduce the desync alongside the attribute selector.
        const themeTokenInMediaQuery =
            /@media[^{]*prefers-color-scheme:\s*dark[^{]*\{[^}]*--background\s*:/s;
        expect(CSS).not.toMatch(themeTokenInMediaQuery);
    });

    it("defines the theme tokens for both light and dark", () => {
        for (const token of [
            "--background",
            "--foreground",
            "--accent",
            "--accent-foreground",
        ]) {
            // once under :root (light) and once under [data-theme="dark"]
            const occurrences = CSS.split(`${token}:`).length - 1;
            expect(occurrences).toBeGreaterThanOrEqual(2);
        }
    });
});

describe("prose colours derive from design tokens", () => {
    /*
     * Every --tw-prose-* colour must reference a theme token. If any is left to
     * @tailwindcss/typography's built-in grey ramp, that value is fixed at one
     * lightness and will collide with one of the two themes.
     */
    const PROSE_VARS = [
        "--tw-prose-body",
        "--tw-prose-headings",
        "--tw-prose-links",
        "--tw-prose-bold",
        "--tw-prose-counters",
        "--tw-prose-bullets",
        "--tw-prose-quotes",
        "--tw-prose-captions",
        "--tw-prose-code",
        "--tw-prose-pre-code",
        "--tw-prose-pre-bg",
        "--tw-prose-th-borders",
        "--tw-prose-td-borders",
    ];

    it.each(PROSE_VARS)("%s is set from a var()", (name) => {
        const match = CSS.match(new RegExp(`${name}\\s*:\\s*([^;]+);`));
        expect(match).not.toBeNull();
        expect(match![1]).toMatch(/var\(--/);
    });

    it("keeps code-block colours theme-independent", () => {
        // Deliberate: a fixed dark code surface in both themes makes a
        // light-on-light / dark-on-dark code block structurally impossible.
        expect(CSS).toMatch(/--code-surface\s*:/);
        expect(CSS).toMatch(/--code-foreground\s*:/);

        // Locate the theme *rule* body, not the @custom-variant declaration
        // that also mentions the same attribute selector.
        const ruleStart = CSS.search(/\[data-theme=["']dark["']\]\s*\{/);
        expect(ruleStart).toBeGreaterThan(-1);
        const body = CSS.slice(ruleStart, CSS.indexOf("}", ruleStart));
        expect(body).not.toMatch(/--code-surface/);
        expect(body).not.toMatch(/--code-foreground/);
    });
});

/** Strip comments so prose *about* a utility is not mistaken for its use. */
function stripComments(src: string): string {
    return src
        .replace(/\/\*[\s\S]*?\*\//g, " ") // block comments (incl. JSX {/* */})
        .replace(/(^|[^:])\/\/.*$/gm, "$1 "); // line comments, sparing "https://"
}

describe("dark: utilities in components", () => {
    const files = globSync("src/**/*.tsx", { cwd: ROOT }).map((rel) =>
        join(ROOT, String(rel))
    );

    it("finds component files to scan", () => {
        expect(files.length).toBeGreaterThan(5);
    });

    it("only uses dark: utilities in files that pair a light value with them", () => {
        /*
         * A lone `dark:` utility with no light-theme counterpart means the light
         * theme silently inherits whatever the base utility was tuned for. Every
         * `dark:text-*` should sit next to a non-dark `text-*`, and so on.
         */
        const offenders: string[] = [];

        for (const file of files) {
            const src = stripComments(readFileSync(file, "utf8"));
            const darkUtils = src.match(/dark:([a-z-]+)-[^\s"'`]+/g) ?? [];

            for (const util of darkUtils) {
                const prop = util.replace(/^dark:/, "").split("-")[0];
                // Does a base utility for the same property appear anywhere?
                const hasBase = new RegExp(`(?<!dark:)\\b${prop}-[^\\s"'\`]+`).test(src);
                if (!hasBase) offenders.push(`${file}: ${util}`);
            }
        }

        expect(offenders).toEqual([]);
    });

    it("does not use prose-invert (prose colours are token-driven instead)", () => {
        const offenders = files.filter((f) =>
            stripComments(readFileSync(f, "utf8")).includes("prose-invert")
        );
        expect(offenders).toEqual([]);
    });
});
