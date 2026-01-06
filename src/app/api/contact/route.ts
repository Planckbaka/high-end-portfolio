import { NextRequest, NextResponse } from 'next/server';
import { siteConfig } from '@/config/site';

export const runtime = 'edge';

interface ContactFormData {
    name: string;
    email: string;
    message: string;
}

// 输入长度限制
const MAX_NAME_LENGTH = 100;
const MAX_EMAIL_LENGTH = 254;
const MAX_MESSAGE_LENGTH = 5000;

/**
 * HTML 转义函数 - 防止 XSS 攻击
 */
function escapeHtml(text: string): string {
    const map: Record<string, string> = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;',
    };
    return text.replace(/[&<>"']/g, (char) => map[char]);
}

export async function POST(request: NextRequest) {
    try {
        const body: ContactFormData = await request.json();
        const { name, email, message } = body;

        // 验证必填字段
        if (!name || !email || !message) {
            return NextResponse.json(
                { error: 'All fields are required' },
                { status: 400 }
            );
        }

        // 验证输入长度
        if (name.length > MAX_NAME_LENGTH) {
            return NextResponse.json(
                { error: `Name must be less than ${MAX_NAME_LENGTH} characters` },
                { status: 400 }
            );
        }
        if (email.length > MAX_EMAIL_LENGTH) {
            return NextResponse.json(
                { error: `Email must be less than ${MAX_EMAIL_LENGTH} characters` },
                { status: 400 }
            );
        }
        if (message.length > MAX_MESSAGE_LENGTH) {
            return NextResponse.json(
                { error: `Message must be less than ${MAX_MESSAGE_LENGTH} characters` },
                { status: 400 }
            );
        }

        // 验证邮箱格式
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return NextResponse.json(
                { error: 'Invalid email format' },
                { status: 400 }
            );
        }

        // 获取配置
        const resendApiKey = process.env.RESEND_API_KEY;
        const contactEmail = process.env.CONTACT_EMAIL || siteConfig.author.email;

        if (!resendApiKey) {
            console.error('RESEND_API_KEY is not configured');
            return NextResponse.json(
                { error: 'Email service is not configured. Please contact the administrator.' },
                { status: 500 }
            );
        }

        // 转义用户输入防止 XSS
        const safeName = escapeHtml(name);
        const safeEmail = escapeHtml(email);
        const safeMessage = escapeHtml(message);

        // 发送邮件
        const response = await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${resendApiKey}`,
            },
            body: JSON.stringify({
                from: 'Portfolio Contact <onboarding@resend.dev>',
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
                  Sent at ${new Date().toLocaleString('en-US', {
                    timeZone: 'Asia/Shanghai',
                    dateStyle: 'full',
                    timeStyle: 'long'
                })}
                </p>
              </div>
            </body>
          </html>
        `,
            }),
        });

        const data = await response.json();

        if (!response.ok) {
            console.error('Resend API error:', data);
            return NextResponse.json(
                { error: 'Failed to send email. Please try again later.' },
                { status: 500 }
            );
        }

        return NextResponse.json(
            {
                success: true,
                message: 'Email sent successfully!',
                id: data.id
            },
            { status: 200 }
        );

    } catch (error) {
        console.error('Contact form error:', error);
        return NextResponse.json(
            { error: 'An unexpected error occurred. Please try again later.' },
            { status: 500 }
        );
    }
}
