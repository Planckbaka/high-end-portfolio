"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useRef } from "react";
import { ThemeToggle } from "./ThemeToggle";
import { navItems } from "@/config/data";
export function Navbar() {
  const pathname = usePathname();
  const menu = useRef<HTMLDetailsElement>(null);
  const links = navItems.map((item) => (
    <Link
      key={item.path}
      href={item.path}
      aria-current={
        pathname === item.path || (item.path !== "/" && pathname.startsWith(item.path + "/"))
          ? "page"
          : undefined
      }
      onClick={() => {
        if (menu.current) menu.current.open = false;
      }}
    >
      {item.name}
    </Link>
  ));
  return (
    <header className="site-header">
      <div className="site-shell header-inner">
        <Link href="/" className="wordmark">
          <span className="wordmark-icon" aria-hidden="true">
            a.
          </span>
          akiwayne
          <span className="text-muted-foreground ml-2 hidden text-xs tracking-normal lg:inline">
            / engineering notes
          </span>
        </Link>
        <nav className="nav-links" aria-label="Main navigation">
          {links}
        </nav>
        <div className="header-actions">
          <ThemeToggle />
          <details
            ref={menu}
            className="mobile-menu"
            onKeyDown={(event) => {
              if (event.key === "Escape" && menu.current) {
                menu.current.open = false;
                menu.current.querySelector("summary")?.focus();
              }
            }}
            onBlur={(event) => {
              // Collapse once focus travels outside the menu (tab or click away).
              if (menu.current?.open && !menu.current.contains(event.relatedTarget as Node)) {
                menu.current.open = false;
              }
            }}
          >
            <summary>Menu</summary>
            <nav aria-label="Mobile navigation">{links}</nav>
          </details>
        </div>
      </div>
    </header>
  );
}
