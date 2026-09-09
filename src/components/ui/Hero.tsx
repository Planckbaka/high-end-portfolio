import Link from "next/link";
import Image from "next/image";
export function Hero() {
  return (
    <section className="art-hero" aria-labelledby="hero-title">
      <div className="art-hero-top">
        <p className="eyebrow">
          <span className="eyebrow-dot" />
          Akiwayne / Engineering notes
        </p>
        <span className="eyebrow">Go · Python · LLM</span>
      </div>
      <div className="hero-composition">
        <div className="hero-editorial">
          <h1 id="hero-title">
            Systems,
            <br />
            from the
            <br />
            <em>inside out.</em>
          </h1>
          <div className="art-hero-copy">
            <p>Go backends. Python engineering. The mechanics of model inference.</p>
            <p className="art-hero-note">
              A personal notebook about how things work—and what happens when they don’t.
            </p>
            <div className="inline-links">
              <Link className="button primary" href="/articles">
                Explore the writing ↗
              </Link>
              <a className="text-link" href="#work">
                The workbench ↓
              </a>
            </div>
          </div>
        </div>
        <figure className="hero-sculpture">
          <Image
            src="/images/identity/bounded-modules.webp"
            alt=""
            width={1536}
            height={1024}
            sizes="(max-width: 767px) 100vw, 50vw"
            priority
          />
          <figcaption>
            <span>01 / Bounded by design</span>
            <span>Concept study</span>
          </figcaption>
        </figure>
      </div>
      <div className="hero-footnote">
        <span>Independent notes / Reproducible experiments</span>
        <a href="#selected-writing" aria-label="Scroll to explore selected writing">
          Scroll to explore ↓
        </a>
      </div>
    </section>
  );
}
