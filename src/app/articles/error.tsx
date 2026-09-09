"use client";
import Link from "next/link";
export default function ArticlesError({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="site-shell page-heading page-bottom">
      <p className="eyebrow">Something went wrong</p>
      <h1>The writing couldn’t load.</h1>
      <p>Please try again, or return to the homepage.</p>
      <div className="inline-links">
        <button className="button primary" type="button" onClick={reset}>
          Try again
        </button>
        <Link className="text-link" href="/">
          Back home
        </Link>
      </div>
    </div>
  );
}
