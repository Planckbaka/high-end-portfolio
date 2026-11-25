"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useRef, useState } from "react";
import { ThemeToggle } from "./ThemeToggle";
import { directoryItems, socialLinks } from "@/config/data";

export function Navbar() {
  const pathname = usePathname() || "/";
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [menuOpen, setMenuOpen] = useState(false);

  const openMenu = () => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    setMenuOpen(true);
    if (typeof dialog.showModal === "function") {
      if (!dialog.open) dialog.showModal();
    } else {
      dialog.setAttribute("open", "");
    }
  };

  const closeMenu = () => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (typeof dialog.close === "function" && dialog.open) {
      dialog.close();
    } else {
      dialog.removeAttribute("open");
      setMenuOpen(false);
    }
  };

  const isRouteActive = (path: string) =>
    pathname === path || (path !== "/" && pathname.startsWith(path + "/"));

  return (
    <header className="site-header">
      <div className="site-shell header-inner">
        <Link href="/" className="wordmark" aria-label="Akiwayne home">
          <span className="wordmark-seal" aria-hidden="true" />
          <span>Akiwayne</span>
        </Link>

        <nav className="nav-links" aria-label="Main navigation">
          {directoryItems.map((item) => (
            <Link
              key={item.path}
              href={item.path}
              aria-current={isRouteActive(item.path) ? "page" : undefined}
            >
              {item.name}
            </Link>
          ))}
        </nav>

        <div className="header-actions">
          <ThemeToggle />
          <button
            type="button"
            className="mobile-index-trigger"
            onClick={openMenu}
            aria-haspopup="dialog"
            aria-expanded={menuOpen}
            aria-controls="site-nav-dialog"
            aria-label="Open navigation index"
          >
            Index
          </button>
        </div>
      </div>

      <dialog
        id="site-nav-dialog"
        ref={dialogRef}
        className="nav-dialog"
        aria-labelledby="nav-dialog-heading"
        onClose={() => setMenuOpen(false)}
      >
        <div className="nav-dialog-shell">
          <div className="nav-dialog-topbar">
            <h1 id="nav-dialog-heading" className="nav-dialog-title">
              Index
            </h1>
            <button type="button" className="nav-dialog-close" onClick={closeMenu} autoFocus>
              Close
            </button>
          </div>

          <nav className="nav-dialog-links" aria-label="Mobile navigation">
            {directoryItems.map((item) => (
              <Link
                key={item.path}
                href={item.path}
                className="nav-dialog-link"
                aria-current={isRouteActive(item.path) ? "page" : undefined}
                onClick={closeMenu}
              >
                <span className="nav-dialog-name">{item.name}</span>
                <span className="nav-dialog-desc">{item.description}</span>
              </Link>
            ))}
          </nav>

          <div className="nav-dialog-footer">
            <span>Notes on systems, models, and engineering.</span>
            <div style={{ display: "flex", gap: 18 }}>
              {socialLinks
                .filter((link) => link.url !== "#")
                .map((link) => (
                  <a
                    key={link.name}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {link.name} ↗
                  </a>
                ))}
              <a href="/feed.xml">RSS ↗</a>
            </div>
          </div>
        </div>
      </dialog>
    </header>
  );
}
