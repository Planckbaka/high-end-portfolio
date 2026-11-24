"use client";
import Link from "next/link";
import { logError } from "@/lib/error-logger";

export default function ArticlesError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  logError(error, { digest: error.digest });
  return (
    <div className="site-shell page-heading page-bottom">
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
