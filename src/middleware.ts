import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Security headers for every page request.
 *
 * Next.js 16 deprecates this `middleware` file convention in favour of `proxy`
 * and warns on every build — but the migration is blocked, not merely pending:
 * `proxy` always runs on the Node.js runtime ("Route segment config is not
 * allowed in Proxy file"), and @opennextjs/cloudflare rejects Node.js
 * middleware outright ("Node.js middleware is not currently supported").
 * Renaming this file breaks `npm run build:cf`, so it stays as middleware —
 * which Next still compiles to the edge runtime — until OpenNext supports it.
 */
export function middleware(request: NextRequest) {
    const response = NextResponse.next({ request });

    // Remove X-Powered-By header (may not be added by OpenNext, but strip if present)
    response.headers.delete("X-Powered-By");

    // Security headers
    response.headers.set("X-Frame-Options", "DENY");
    response.headers.set("X-Content-Type-Options", "nosniff");
    response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
    response.headers.set(
        "Permissions-Policy",
        "camera=(), microphone=(), geolocation=()"
    );
    // CSP in Report-Only mode — React Compiler needs unsafe-eval, Framer Motion needs unsafe-inline.
    // Monitor reports, then tighten and switch to enforcement mode later.
    response.headers.set(
        "Content-Security-Policy-Report-Only",
        "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self'; connect-src 'self' https://api.resend.com; frame-ancestors 'none';"
    );

    return response;
}

export const config = {
    matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
