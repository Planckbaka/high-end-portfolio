import { generateMetadata } from "../page";
import { metadata as rootMetadata } from "@/app/layout";
import { siteConfig } from "@/config/site";

/**
 * The root layout sets `title.template = "%s | <site name>"`. The article page
 * also appended the site name to its own title, so pages rendered as
 * "… | Akiwayne's Portfolio | Akiwayne's Portfolio".
 */

const params = (slug: string) => Promise.resolve({ slug });

describe("article metadata", () => {
    it("root template supplies the site-name suffix", () => {
        const title = rootMetadata.title as { template?: string };
        expect(title.template).toBe(`%s | ${siteConfig.name}`);
    });

    it("page title omits the suffix the template already adds", async () => {
        const meta = await generateMetadata({ params: params("transaction-in-DDIA") });
        expect(typeof meta.title).toBe("string");
        expect(meta.title as string).not.toMatch(new RegExp(siteConfig.name));
    });

    it("rendered title contains the site name exactly once", async () => {
        const meta = await generateMetadata({ params: params("transaction-in-DDIA") });
        const rendered = (rootMetadata.title as { template: string }).template.replace(
            "%s",
            meta.title as string
        );
        const occurrences = rendered.split(siteConfig.name).length - 1;
        expect(occurrences).toBe(1);
    });

    it("declares a canonical URL and an OG image", async () => {
        const meta = await generateMetadata({ params: params("transaction-in-DDIA") });
        expect(meta.alternates?.canonical).toContain("/articles/transaction-in-DDIA");
        expect(JSON.stringify(meta.openGraph?.images)).toContain("og");
        expect(JSON.stringify(meta.twitter?.images)).toContain("og");
    });

    it("falls back cleanly for an unknown slug", async () => {
        const meta = await generateMetadata({ params: params("does-not-exist") });
        expect(meta.title).toBe("Article Not Found");
    });
});
