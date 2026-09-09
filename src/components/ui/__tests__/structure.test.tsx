import { render, screen } from "@testing-library/react";
import { Hero } from "@/components/ui/Hero";
import { SelfIntro } from "@/components/ui/SelfIntro";
import { SiteFooter } from "@/components/ui/SiteFooter";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { WritingBacklog } from "@/components/ui/WritingBacklog";
import ArticlesClient from "@/app/articles/ArticlesClient";
import ArticleClient from "@/app/articles/[slug]/ArticleClient";
import ContactClient from "@/app/contact/ContactClient";
import type { Article } from "@/types";

const article: Article = {
  id: "1",
  title: "Transaction in DDIA",
  date: "2025-12-31",
  category: "DDIA",
  excerpt: "An excerpt.",
  slug: "transaction-in-DDIA",
  content: "<p>Body copy.</p><pre><code>package main</code></pre>",
  readingTime: "3 min read",
};

describe("landmark structure", () => {
  /*
   * The root layout renders <main id="main-content">. Each page client used to
   * render its own <main> inside that, producing nested main landmarks —
   * invalid HTML, and two "main" regions announced to screen readers.
   */
  it.each([
    ["ArticlesClient", <ArticlesClient key="a" articles={[article]} />],
    ["ArticleClient", <ArticleClient key="b" article={article} />],
    ["ContactClient", <ContactClient key="c" />],
  ])("%s does not render its own <main>", (_name, element) => {
    const { container } = render(element);
    expect(container.querySelectorAll("main")).toHaveLength(0);
  });
});

describe("no dead affordances", () => {
  it.each([
    ["Hero", <Hero key="h" />],
    ["SelfIntro", <SelfIntro key="s" />],
    ["SiteFooter", <SiteFooter key="f" />],
    ["WritingBacklog", <WritingBacklog key="w" />],
    ["ContactClient", <ContactClient key="c" />],
    ["ArticleClient", <ArticleClient key="a" article={article} />],
  ])('%s renders no href="#" links', (_name, element) => {
    const { container } = render(element);
    expect(container.querySelectorAll('a[href="#"]')).toHaveLength(0);
  });

  it("footer exposes back-to-top as a real button, not inert text", () => {
    render(<SiteFooter />);
    expect(screen.getByRole("button", { name: /back to top/i })).toBeInTheDocument();
  });

  it("article share controls are actionable", () => {
    render(<ArticleClient article={article} />);
    // Two share targets + a copy-link button, per rendered breakpoint copy.
    expect(screen.getAllByRole("link", { name: /share on x/i }).length).toBeGreaterThan(0);
    expect(screen.getAllByRole("button", { name: /copy link/i }).length).toBeGreaterThan(0);
  });

  it("hero scroll cue points at a real in-page target", () => {
    const { container } = render(<Hero />);
    const cue = container.querySelector('a[href^="#"]');
    expect(cue).not.toBeNull();
    expect(cue!.getAttribute("href")).toBe("#work");
  });
});

describe("accent surfaces use the token, not hardcoded black/white", () => {
  /*
   * `--accent-foreground` exists precisely so text on an accent fill flips with
   * the theme. Several call sites hardcoded `text-black` / `text-white`, which
   * pinned the contrast to whichever theme the author happened to be in.
   */
  it.each([
    ["ArticlesClient", <ArticlesClient key="a" articles={[article]} />],
    ["ContactClient", <ContactClient key="c" />],
  ])("%s pairs accent backgrounds with accent-foreground", (_name, element) => {
    const { container } = render(element);
    const offenders = [...container.querySelectorAll("[class]")].filter((el) => {
      const cls = el.className.toString();
      return (
        /(^|[\s:])(bg-accent|group-hover:bg-accent)/.test(cls) &&
        /text-(black|white)(\s|$)|:text-(black|white)(\s|$)/.test(cls)
      );
    });
    expect(offenders.map((e) => e.className.toString())).toEqual([]);
  });
});

describe("ThemeToggle", () => {
  it("marks an option active even when theme is 'system'", () => {
    /*
     * The control compared `theme`, which is the literal string "system" when
     * the user has not chosen explicitly — matching neither option and
     * leaving the toggle with no visible selection. It reads `resolvedTheme`
     * now; the mock resolves to dark.
     */
    render(<ThemeToggle />);
    const pressed = screen
      .getAllByRole("button")
      .filter((b) => b.getAttribute("aria-pressed") === "true");
    expect(pressed).toHaveLength(1);
    expect(pressed[0]).toHaveAccessibleName(/dark/i);
  });

  it("offers both themes", () => {
    render(<ThemeToggle />);
    expect(screen.getByRole("button", { name: /light/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /dark/i })).toBeInTheDocument();
  });
});

describe("article content is not gated behind a JS animation", () => {
  it("renders body copy without inline opacity:0", () => {
    const { container } = render(<ArticleClient article={article} />);
    const hidden = [...container.querySelectorAll<HTMLElement>("[style]")].filter(
      (el) => el.style.opacity !== "" && Number(el.style.opacity) === 0
    );
    expect(hidden).toEqual([]);
    expect(container.querySelector(".prose")?.innerHTML).toContain("Body copy.");
  });
});
