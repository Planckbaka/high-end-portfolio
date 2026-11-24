"use client";
import Link from "next/link";
import { logError } from "@/lib/error-logger";

export default function RootError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  logError(error, { digest: error.digest, url: typeof window !== "undefined" ? window.location.href : undefined });
  return (
    <div className="site-shell page-heading page-bottom">
      <h1>This section couldn’t load.</h1>
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
