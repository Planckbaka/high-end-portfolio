/**
 * Error logging utility
 *
 * Deliberately console-only. This is a statically-rendered portfolio on
 * Cloudflare Workers: there is no backend to receive error beacons, so a
 * client-side tracking sink would report nothing while adding code. Server
 * logs remain inspectable via `wrangler tail`; client errors surface in the
 * visitor's devtools. Revisit only if an error-tracking backend ever exists.
 */

interface ErrorContext {
    componentStack?: string | null;
    userAgent?: string;
    url?: string;
    [key: string]: unknown;
}

/** Structured console error with timestamp and context. */
export const logError = (error: Error, context?: ErrorContext): void => {
    console.error("Error logged:", {
        message: error.message,
        stack: error.stack,
        name: error.name,
        timestamp: new Date().toISOString(),
        ...context,
    });
};
