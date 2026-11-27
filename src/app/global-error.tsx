"use client";

/*
 * Last-resort boundary: renders when the root layout itself throws, so it
 * must own <html>/<body>. Global-error UI stays minimal on purpose — no
 * fonts, no layout shell, just the message and a way back.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      {/* Light palette only, on purpose: this boundary owns <html> so no
          theme CSS is guaranteed to load. The token block is declared inline
          for that reason: the values are literals in exactly one place, and
          every rule below reads them by name. */}
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "grid",
          placeItems: "center",
          background: "var(--background)",
          color: "var(--foreground)",
          fontFamily:
            "-apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, 'PingFang SC', sans-serif",
        }}
      >
        <style>{`:root {
          --background: #faf9f5;
          --foreground: #141413;
          --muted-foreground: #5e5d59;
          --accent: #a8492a;
        }
        .global-error-btn:focus-visible {
          outline: 2px solid var(--accent);
          outline-offset: 4px;
        }`}</style>
        <main style={{ maxWidth: "34rem", padding: "2rem", textAlign: "center" }}>
          <h1 style={{ fontSize: "1.75rem", fontWeight: 500, letterSpacing: "-0.03em" }}>
            Something went wrong.
          </h1>
          <p style={{ color: "var(--muted-foreground)", margin: "1rem 0 1.75rem" }}>
            The site hit an unexpected error
            {error.digest ? (
              <>
                {" "}
                (reference <code>{error.digest}</code>)
              </>
            ) : null}
            . Please try again.
          </p>
          <button
            type="button"
            className="global-error-btn"
            onClick={reset}
            style={{
              minHeight: "44px",
              padding: "0.75rem 1.375rem",
              border: "1px solid var(--foreground)",
              borderRadius: "999px",
              background: "var(--foreground)",
              color: "var(--background)",
              fontSize: "0.90625rem",
              fontWeight: 500,
              cursor: "pointer",
            }}
          >
            Try again
          </button>
        </main>
      </body>
    </html>
  );
}
