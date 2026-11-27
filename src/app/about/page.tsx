import { pageMetadata } from "@/lib/page-metadata";
import Image from "next/image";
import Link from "next/link";
import { socialLinks } from "@/config/data";
import { siteConfig } from "@/config/site";
import { breadcrumbJsonLd, personEntity, serializeJsonLd } from "@/lib/seo";
export const metadata = pageMetadata(
  "About",
  "Akiwayne’s approach to backend systems, Python engineering, and understanding model inference.",
  "/about"
);
export default function About() {
  const profileLd = {
    "@context": "https://schema.org",
    "@type": "ProfilePage",
    url: `${siteConfig.url}/about`,
    mainEntity: personEntity(),
  };
  const breadcrumbLd = breadcrumbJsonLd([
    { name: "Home", url: siteConfig.url },
    { name: "About", url: `${siteConfig.url}/about` },
  ]);
  return (
    <div className="site-shell page-bottom">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(profileLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(breadcrumbLd) }}
      />
      <header className="page-heading">
        <p className="eyebrow">
          <span className="eyebrow-dot" />
          Background &amp; methodology
        </p>
        <h1>Curiosity, made executable.</h1>
        <p>
          I’m Akiwayne. My starting point is Go backend development. My current focus is the
          engineering around AI systems, and understanding what happens inside them.
        </p>
      </header>
      <div className="about-editorial">
        <aside className="about-note">
          <div className="about-plate-frame" aria-hidden="true">
            <Image
              src="/images/editorial/about-atelier-plate.webp"
              alt=""
              width={760}
              height={567}
              priority
              className="about-plate-img"
            />
          </div>
          <span className="eyebrow">A working principle</span>
          <p>
            Make the question concrete.
            {" "}
            <br />
            Make the answer testable.
          </p>
          <span className="eyebrow">Go / Python / Model systems</span>
        </aside>
        <div className="prose">
          <h2>What I work through</h2>
          <p>
            I’m interested in the boundary between reliable services and model inference: how
            requests enter a system, how work is bounded, how cancellation propagates, and how we
            measure the result. Python and PyTorch offer another view of those questions, closer to
            tensors and the computation itself.
          </p>
          <h2>How I write</h2>
          <p>
            These notes start with an implementation or a question I can test. I explain the
            mechanism, show where a simple approach breaks, and record the assumptions that make a
            result meaningful. A local experiment is described as a local experiment.
          </p>
          <p>
            The companion labs are intentionally small. You should be able to run them, change an
            input, and discover where an explanation stops being sufficient.
          </p>
          <h2>Start here</h2>
          <p>
            Read the{" "}
            <Link href="/series/reliable-model-systems">Engineering Reliable Model Systems</Link>{" "}
            series, or explore the{" "}
            <Link href="/projects">projects and their validation boundaries</Link>.
          </p>
          <h2>Elsewhere</h2>
          <p>
            {socialLinks.map((link, i) => (
              <span key={link.name}>
                {i > 0 ? " · " : ""}
                <a href={link.url} target="_blank" rel="noopener noreferrer">
                  {link.name} ↗ <span className="sr-only">(opens in a new tab)</span>
                </a>
              </span>
            ))}{" "}
            · <Link href="/contact">Contact</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
