import Link from "next/link";
export default function NotFound() {
  return (
    <div className="site-shell page-bottom">
      <header className="page-heading">
        <p className="eyebrow">404 / Not found</p>
        <h1>This page isn’t here.</h1>
        <p>The address may be incorrect. There is still plenty to explore.</p>
        <div className="inline-links">
          <Link className="button primary" href="/articles">
            Browse the writing ↗
          </Link>
          <Link className="text-link" href="/">
            Back home
          </Link>
        </div>
      </header>
    </div>
  );
}
