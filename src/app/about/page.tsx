import { pageMetadata } from "@/lib/page-metadata";
import Link from "next/link";
import { socialLinks } from "@/config/data";
export const metadata = pageMetadata(
  "About",
  "Akiwayne’s approach to backend systems, Python engineering, and understanding model inference.",
  "/about"
);
export default function About() {
  return (
    <div className="site-shell page-bottom">
      <header className="page-heading">
        <p className="eyebrow">About the author</p>
        <h1>Curiosity, made executable.</h1>
        <p>
          I’m Akiwayne. My starting point is Go backend development. My current focus is the
          engineering around AI systems—and understanding what happens inside them.
        </p>
      </header>
      <div className="about-editorial">
        <aside className="about-note">
          <span className="eyebrow">A working principle</span>
          <p>
            Make the question concrete.
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
                  {link.name}
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
