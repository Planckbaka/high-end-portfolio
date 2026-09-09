"use client";
import { socialLinks } from "@/config/data";
export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="site-shell footer-signature" aria-hidden="true">
        <span>akiwayne.</span>
        <span>
          Keep asking
          <br />
          how it works.
        </span>
      </div>
      <div className="site-shell footer-inner">
        <span>© {new Date().getFullYear()} Akiwayne · Built with care, tested with curiosity.</span>
        <nav aria-label="Social links">
          {socialLinks
            .filter((link) => link.url !== "#")
            .map((link) => (
              <a key={link.name} href={link.url} target="_blank" rel="noopener noreferrer">
                {link.name} ↗
              </a>
            ))}
          <a href="/feed.xml">RSS ↗</a>
          <button type="button" onClick={() => window.scrollTo({ top: 0, behavior: "instant" })}>
            Back to top ↑
          </button>
        </nav>
      </div>
    </footer>
  );
}
