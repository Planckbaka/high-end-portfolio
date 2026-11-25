import { socialLinks } from "@/config/data";
import { BackToTop } from "./BackToTop";

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="site-shell footer-signature" aria-hidden="true">
        <span>Akiwayne</span>
        <span>
          Reading closely,
          <br />
          building deliberately.
        </span>
      </div>
      <div className="site-shell footer-inner">
        <span>© {new Date().getFullYear()} Akiwayne · Notes on systems, models, and engineering.</span>
        <nav aria-label="Social links">
          {socialLinks
            .filter((link) => link.url !== "#")
            .map((link) => (
              <a key={link.name} href={link.url} target="_blank" rel="noopener noreferrer">
                {link.name} ↗<span className="sr-only">(opens in a new tab)</span>
              </a>
            ))}
          <a href="/feed.xml">
            RSS ↗<span className="sr-only">(opens in a new tab)</span>
          </a>
        </nav>
        <BackToTop />
      </div>
    </footer>
  );
}
