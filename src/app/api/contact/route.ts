import { NextRequest, NextResponse } from "next/server";
import { siteConfig } from "@/config/site";
import { RATE_LIMIT, HTTP_STATUS, ERROR_MESSAGES } from "@/config/constants";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { contactSchema } from "@/lib/contact-schema";

// OpenNext runs Next.js routes through Workers' Node.js compatibility layer.
export const runtime = "nodejs";

// NOTE: This rate limiter and idempotency cache provide deterrence/dedup only.
// State is local to an isolate and is lost when that isolate is replaced.
// For production-grade rate limiting, use Cloudflare WAF Rate Limiting rules.
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const idempotencyCache = new Map<string, { body: Record<string, unknown>; expiresAt: number }>();
const IDEMPOTENCY_TTL_MS = 5 * 60 * 1000;

function jsonResponse(
  body: Record<string, unknown>,
  status: number,
  idempotencyKey?: string
) {
  const headers: Record<string, string> = {
    "Cache-Control": "no-store",
    "X-Content-Type-Options": "nosniff",
  };
  if (idempotencyKey) {
    headers["Idempotency-Key"] = idempotencyKey;
  }
  return NextResponse.json(body, { status, headers });
}

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  for (const [key, entry] of rateLimitMap) {
    if (entry.resetTime <= now) rateLimitMap.delete(key);
  }
  const entry = rateLimitMap.get(ip);

  if (!entry || now > entry.resetTime) {
    if (rateLimitMap.size >= 10000) return false;
    rateLimitMap.set(ip, {
      count: 1,
      resetTime: now + RATE_LIMIT.CONTACT_FORM.WINDOW_MS,
    });
    return true;
  }

  if (entry.count >= RATE_LIMIT.CONTACT_FORM.MAX_REQUESTS) {
    return false;
  }

  entry.count++;
  return true;
}

const b64 = (text: string) => Buffer.from(text, "utf-8").toString("base64");
const oneLine = (text: string) => text.replace(/[\r\n]+/g, " ").trim();
const wrap76 = (text: string) => text.replace(/(.{76})/g, "$1\r\n");

type EmailBinding = { send(message: unknown): Promise<void> };

function buildMime(opts: { from: string; to: string; replyTo: string; subject: string; text: string; domain: string }) {
  return [
    `From: Portfolio Contact <${opts.from}>`,
    `To: ${opts.to}`,
    `Reply-To: ${opts.replyTo}`,
    `Subject: =?UTF-8?B?${b64(opts.subject)}?=`,
    `Date: ${new Date().toUTCString()}`,
    `Message-ID: <${crypto.randomUUID()}@${opts.domain}>`,
    "MIME-Version: 1.0",
    'Content-Type: text/plain; charset="UTF-8"',
    "Content-Transfer-Encoding: base64",
    "",
    wrap76(b64(opts.text)),
  ].join("\r\n");
}

export async function POST(request: NextRequest) {
  const idempotencyKey = request.headers.get("idempotency-key")?.trim() || undefined;
  try {
    // Rate limiting
    const ip = request.headers.get("cf-connecting-ip") || "unknown";
    if (!checkRateLimit(ip)) {
      return jsonResponse(
        { error: ERROR_MESSAGES.RATE_LIMIT_EXCEEDED },
        HTTP_STATUS.TOO_MANY_REQUESTS,
        idempotencyKey
      );
    }

    // Origin validation (CSRF protection)
    const origin = request.headers.get("origin");
    const allowedOrigins = [
      siteConfig.url,
      "http://localhost:3000",
      "http://localhost:8787",
      "http://127.0.0.1:8787",
    ];
    if (origin && !allowedOrigins.includes(origin)) {
      return jsonResponse({ error: "Invalid origin" }, HTTP_STATUS.FORBIDDEN, idempotencyKey);
    }

    if (idempotencyKey) {
      const now = Date.now();
      for (const [key, entry] of idempotencyCache) {
        if (entry.expiresAt <= now) idempotencyCache.delete(key);
      }
      const cached = idempotencyCache.get(`${ip}:${idempotencyKey}`);
      if (cached && cached.expiresAt > now) {
        return jsonResponse(cached.body, HTTP_STATUS.OK, idempotencyKey);
      }
    }

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return jsonResponse({ error: "Invalid JSON body" }, HTTP_STATUS.BAD_REQUEST, idempotencyKey);
    }
    const parsed = contactSchema.safeParse(body);
    if (!parsed.success) {
      return jsonResponse(
        { error: "Please check your name, email and message." },
        HTTP_STATUS.BAD_REQUEST,
        idempotencyKey
      );
    }
    const { name, email, message } = parsed.data;

    // Cloudflare Email Routing `send_email` binding (free). The recipient must be a
    // verified destination address and the sender an address on a domain with Email Routing.
    const { env } = getCloudflareContext();
    const envRecord = env as unknown as Record<string, unknown>;
    const binding = envRecord.SEND_EMAIL as EmailBinding | undefined;
    const contactEmail =
      (envRecord.CONTACT_EMAIL as string | undefined) ||
      process.env.CONTACT_EMAIL ||
      siteConfig.author.email;
    const fromAddress =
      (envRecord.CONTACT_FROM as string | undefined) || process.env.CONTACT_FROM;

    if (!binding || !fromAddress) {
      console.error("SEND_EMAIL binding or CONTACT_FROM is not configured");
      return jsonResponse(
        { error: "Email service is not configured. Please contact the administrator." },
        HTTP_STATUS.INTERNAL_SERVER_ERROR,
        idempotencyKey
      );
    }

    const safeName = oneLine(name);
    const raw = buildMime({
      from: fromAddress,
      to: contactEmail,
      replyTo: oneLine(email),
      subject: `New Contact Form Message from ${safeName}`,
      text: `Name: ${safeName}\nEmail: ${oneLine(email)}\n\n${message}\n\n-- \nSent from ${siteConfig.url}`,
      domain: fromAddress.split("@")[1] ?? "localhost",
    });

    const { EmailMessage } = await import(/* webpackIgnore: true */ /* turbopackIgnore: true */ "cloudflare:email");
    await binding.send(new EmailMessage(fromAddress, contactEmail, raw));

    const successBody = { success: true, message: "Email sent successfully!" };
    if (idempotencyKey && idempotencyCache.size < 1000) {
      idempotencyCache.set(`${ip}:${idempotencyKey}`, {
        body: successBody,
        expiresAt: Date.now() + IDEMPOTENCY_TTL_MS,
      });
    }

    return jsonResponse(successBody, HTTP_STATUS.OK, idempotencyKey);
  } catch (error) {
    if (
      (error instanceof DOMException || error instanceof Error) &&
      ["TimeoutError", "AbortError"].includes(error.name)
    ) {
      return jsonResponse(
        { error: "Email service timed out. Please retry the same message." },
        HTTP_STATUS.GATEWAY_TIMEOUT,
        idempotencyKey
      );
    }
    console.error("Contact form error:", error);
    return jsonResponse(
      { error: "An unexpected error occurred. Please try again later." },
      HTTP_STATUS.INTERNAL_SERVER_ERROR,
      idempotencyKey
    );
  }
}
