import { NextRequest, NextResponse } from "next/server";
import { siteConfig } from "@/config/site";
import { RATE_LIMIT, HTTP_STATUS, ERROR_MESSAGES } from "@/config/constants";
import { contactSchema } from "@/lib/contact-schema";

// OpenNext runs Next.js routes through Workers' Node.js compatibility layer.
export const runtime = "nodejs";

// NOTE: This rate limiter provides deterrence against casual abuse only.
// State is local to an isolate and is lost when that isolate is replaced.
// For production-grade rate limiting, use Cloudflare WAF Rate Limiting rules.
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

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

function escapeHtml(text: string): string {
  const map: Record<string, string> = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;",
  };
  return text.replace(/[&<>"']/g, (char) => map[char]);
}

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const ip = request.headers.get("cf-connecting-ip") || "unknown";
    if (!checkRateLimit(ip)) {
      return NextResponse.json(
        { error: ERROR_MESSAGES.RATE_LIMIT_EXCEEDED },
        { status: HTTP_STATUS.TOO_MANY_REQUESTS }
      );
    }

    // Origin validation (CSRF protection)
    const origin = request.headers.get("origin");
    const allowedOrigins = [siteConfig.url, "http://localhost:3000"];
    if (origin && !allowedOrigins.includes(origin)) {
      return NextResponse.json({ error: "Invalid origin" }, { status: HTTP_STATUS.FORBIDDEN });
    }

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: HTTP_STATUS.BAD_REQUEST });
    }
    const parsed = contactSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Please check your name, email and message." },
        { status: HTTP_STATUS.BAD_REQUEST }
      );
    }
    const { name, email, message } = parsed.data;
    const idempotencyKey = request.headers.get("idempotency-key");
    if (idempotencyKey && !/^[a-zA-Z0-9_-]{16,128}$/.test(idempotencyKey)) {
      return NextResponse.json({ error: "Invalid submission identifier" }, { status: HTTP_STATUS.BAD_REQUEST });
    }

    // Get config
    const resendApiKey = process.env.RESEND_API_KEY;
    const contactEmail = process.env.CONTACT_EMAIL || siteConfig.author.email;

    if (!resendApiKey) {
      console.error("RESEND_API_KEY is not configured");
      return NextResponse.json(
        { error: "Email service is not configured. Please contact the administrator." },
        { status: HTTP_STATUS.INTERNAL_SERVER_ERROR }
      );
    }

    // Escape user input to prevent XSS
    const safeName = escapeHtml(name);
    const safeEmail = escapeHtml(email);
    const safeMessage = escapeHtml(message);

    // Send email
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      signal: AbortSignal.timeout(10000),
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${resendApiKey}`,
        ...(idempotencyKey ? { "Idempotency-Key": `contact/${idempotencyKey}` } : {}),
      },
      body: JSON.stringify({
        from: process.env.CONTACT_FROM || "Portfolio Contact <onboarding@resend.dev>",
        to: [contactEmail],
        reply_to: email,
        subject: `New Contact Form Message from ${safeName}`,
        html: `
          <!DOCTYPE html>
          <html lang="en">
            <head>
              <meta charset="utf-8">
              <style>
                /* Matches the site's quiet-editorial palette:
                   cream paper, ink text, rust accent. */
                body {
                  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, 'PingFang SC', sans-serif;
                  line-height: 1.6;
                  color: #232521;
                  background: #f7f6f2;
                  max-width: 600px;
                  margin: 0 auto;
                  padding: 20px;
                }
                .header {
                  border-bottom: 2px solid #232521;
                  padding: 20px 0 16px;
                }
                .header h1 {
                  margin: 0;
                  font-size: 20px;
                  font-weight: 600;
                  letter-spacing: -0.02em;
                }
                .header .kicker {
                  font-family: 'SF Mono', Menlo, Consolas, monospace;
                  font-size: 11px;
                  text-transform: uppercase;
                  letter-spacing: 0.12em;
                  color: #a33f2e;
                  margin-bottom: 6px;
                }
                .content {
                  padding: 24px 0;
                }
                .field {
                  margin-bottom: 20px;
                }
                .label {
                  font-family: 'SF Mono', Menlo, Consolas, monospace;
                  font-size: 11px;
                  text-transform: uppercase;
                  letter-spacing: 0.1em;
                  color: #62665e;
                  margin-bottom: 4px;
                }
                .value {
                  font-size: 16px;
                  color: #232521;
                }
                .message-box {
                  background: #fdfcf9;
                  border: 1px solid #d8d9d0;
                  border-left: 3px solid #a33f2e;
                  padding: 16px;
                  font-size: 15px;
                  white-space: pre-wrap;
                  word-wrap: break-word;
                }
                .footer {
                  border-top: 1px solid #d8d9d0;
                  padding: 16px 0 4px;
                  font-size: 12px;
                  color: #62665e;
                }
                .button {
                  display: inline-block;
                  background: #232521;
                  color: #f7f6f2;
                  padding: 10px 18px;
                  text-decoration: none;
                  font-size: 14px;
                  font-weight: 500;
                  margin-top: 8px;
                }
              </style>
            </head>
            <body>
              <div class="header">
                <div class="kicker">Portfolio / Contact</div>
                <h1>New message from ${safeName}</h1>
              </div>

              <div class="content">
                <div class="field">
                  <div class="label">Name</div>
                  <div class="value">${safeName}</div>
                </div>

                <div class="field">
                  <div class="label">Email</div>
                  <div class="value">
                    <a href="mailto:${safeEmail}" style="color: #a33f2e; text-decoration: none;">${safeEmail}</a>
                  </div>
                </div>

                <div class="field">
                  <div class="label">Message</div>
                  <div class="message-box">${safeMessage}</div>
                </div>

                <a href="mailto:${safeEmail}" class="button">Reply to ${safeName}</a>
              </div>

              <div class="footer">
                <p style="margin: 0 0 8px 0;">
                  Sent from the contact form at <strong>${siteConfig.url}</strong>
                </p>
                <p style="margin: 0; font-size: 11px;">
                  ${new Date().toLocaleString("en-US", {
                    timeZone: "Asia/Shanghai",
                    dateStyle: "full",
                    timeStyle: "long",
                  })}
                </p>
              </div>
            </body>
          </html>
        `,
      }),
    });

    if (!response.ok) {
      console.error("Resend API error:", response.status);
      return NextResponse.json(
        { error: "Failed to send email. Please try again later." },
        { status: HTTP_STATUS.INTERNAL_SERVER_ERROR }
      );
    }

    return NextResponse.json(
      { success: true, message: "Email sent successfully!" },
      { status: HTTP_STATUS.OK }
    );
  } catch (error) {
    if (
      (error instanceof DOMException || error instanceof Error) &&
      ["TimeoutError", "AbortError"].includes(error.name)
    ) {
      return NextResponse.json(
        { error: "Email service timed out. Please retry the same message." },
        { status: HTTP_STATUS.GATEWAY_TIMEOUT }
      );
    }
    console.error("Contact form error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred. Please try again later." },
      { status: HTTP_STATUS.INTERNAL_SERVER_ERROR }
    );
  }
}
