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
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }
    const parsed = contactSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Please check your name, email and message." },
        { status: 400 }
      );
    }
    const { name, email, message } = parsed.data;
    const idempotencyKey = request.headers.get("idempotency-key");
    if (idempotencyKey && !/^[a-zA-Z0-9_-]{16,128}$/.test(idempotencyKey)) {
      return NextResponse.json({ error: "Invalid submission identifier" }, { status: 400 });
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
          <html>
            <head>
              <meta charset="utf-8">
              <style>
                body {
                  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
                  line-height: 1.6;
                  color: #333;
                  max-width: 600px;
                  margin: 0 auto;
                  padding: 20px;
                }
                .header {
                  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                  color: white;
                  padding: 30px;
                  border-radius: 10px 10px 0 0;
                  text-align: center;
                }
                .content {
                  background: #f9fafb;
                  padding: 30px;
                  border: 1px solid #e5e7eb;
                  border-top: none;
                }
                .field {
                  margin-bottom: 20px;
                }
                .label {
                  font-weight: 600;
                  color: #6b7280;
                  font-size: 12px;
                  text-transform: uppercase;
                  letter-spacing: 0.5px;
                  margin-bottom: 5px;
                }
                .value {
                  color: #111827;
                  font-size: 16px;
                }
                .message-box {
                  background: white;
                  padding: 20px;
                  border-radius: 8px;
                  border-left: 4px solid #667eea;
                  margin-top: 10px;
                  white-space: pre-wrap;
                  word-wrap: break-word;
                }
                .footer {
                  background: #f3f4f6;
                  padding: 20px;
                  border-radius: 0 0 10px 10px;
                  text-align: center;
                  font-size: 12px;
                  color: #6b7280;
                  border: 1px solid #e5e7eb;
                  border-top: none;
                }
                .button {
                  display: inline-block;
                  background: #667eea;
                  color: white;
                  padding: 12px 24px;
                  text-decoration: none;
                  border-radius: 6px;
                  margin-top: 15px;
                  font-weight: 600;
                }
              </style>
            </head>
            <body>
              <div class="header">
                <h1 style="margin: 0; font-size: 24px;">📬 New Contact Form Message</h1>
                <p style="margin: 10px 0 0 0; opacity: 0.9;">From your portfolio website</p>
              </div>

              <div class="content">
                <div class="field">
                  <div class="label">Name</div>
                  <div class="value">${safeName}</div>
                </div>

                <div class="field">
                  <div class="label">Email</div>
                  <div class="value">
                    <a href="mailto:${safeEmail}" style="color: #667eea; text-decoration: none;">${safeEmail}</a>
                  </div>
                </div>

                <div class="field">
                  <div class="label">Message</div>
                  <div class="message-box">${safeMessage}</div>
                </div>

                <div style="text-align: center;">
                  <a href="mailto:${safeEmail}" class="button">Reply to ${safeName}</a>
                </div>
              </div>

              <div class="footer">
                <p style="margin: 0;">
                  This email was sent from your portfolio contact form<br>
                  <strong>${siteConfig.url}</strong>
                </p>
                <p style="margin: 10px 0 0 0; font-size: 11px; opacity: 0.7;">
                  Sent at ${new Date().toLocaleString("en-US", {
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
      error &&
      typeof error === "object" &&
      "name" in error &&
      ["TimeoutError", "AbortError"].includes(String(error.name))
    ) {
      return NextResponse.json(
        { error: "Email service timed out. Please retry the same message." },
        { status: 504 }
      );
    }
    console.error("Contact form error");
    return NextResponse.json(
      { error: "An unexpected error occurred. Please try again later." },
      { status: HTTP_STATUS.INTERNAL_SERVER_ERROR }
    );
  }
}
