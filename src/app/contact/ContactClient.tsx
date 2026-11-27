"use client";
import { useRef, useState } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { contactSchema } from "@/lib/contact-schema";
import { contactDetails, socialLinks } from "@/config/data";
export default function ContactClient() {
  const [values, setValues] = useState({ name: "", email: "", message: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [pending, setPending] = useState(false);
  const [status, setStatus] = useState("");
  const [statusKind, setStatusKind] = useState<"idle" | "error" | "success">("idle");
  const honeypot = useRef("");
  const submitting = useRef(false);
  const attempt = useRef<{ payload: string; key: string } | null>(null);
  const FIELD_ORDER = ["name", "email", "message"] as const;
  type FieldName = (typeof FIELD_ORDER)[number];

  function validateField(name: FieldName, value: string) {
    const result = contactSchema.shape[name].safeParse(value);
    setErrors((previous) => {
      if (result.success) {
        if (!previous[name]) return previous;
        const next = { ...previous };
        delete next[name];
        return next;
      }
      return { ...previous, [name]: result.error.issues[0]?.message || "Invalid value." };
    });
  }

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (submitting.current) return;
    /*
     * Honeypot: the field is visually removed and out of the tab order, so
     * only a bot fills it. Answer with fake success and drop the payload —
     * never reveal the trap.
     */
    if (honeypot.current) {
      setStatusKind("success");
      setStatus("Message sent successfully. Thank you for reaching out.");
      return;
    }
    const parsed = contactSchema.safeParse(values);
    if (!parsed.success) {
      const next: Record<string, string> = {};
      for (const issue of parsed.error.issues) next[String(issue.path[0])] ||= issue.message;
      setErrors(next);
      setStatusKind("error");
      setStatus("Please check the highlighted fields.");
      const firstInvalid = FIELD_ORDER.find((field) => next[field]);
      if (firstInvalid) document.getElementById(firstInvalid)?.focus();
      return;
    }
    setErrors({});
    submitting.current = true;
    setPending(true);
    setStatusKind("idle");
    setStatus("");
    try {
      const payload = JSON.stringify(parsed.data);
      if (!attempt.current || attempt.current.payload !== payload) {
        attempt.current = { payload, key: crypto.randomUUID() };
      }
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Idempotency-Key": attempt.current.key },
        body: payload,
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok)
        throw new Error(
          typeof data.error === "string"
            ? data.error
            : "Your message could not be sent. Please try again."
        );
      setStatusKind("success");
      setStatus("Message sent successfully. Thank you for reaching out.");
      attempt.current = null;
      setValues({ name: "", email: "", message: "" });
    } catch (error) {
      setStatusKind("error");
      setStatus(error instanceof Error ? error.message : "Connection failed. Please try again.");
    } finally {
      submitting.current = false;
      setPending(false);
    }
  }
  function change(event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    const { name, value } = event.target;
    setValues((previous) => ({ ...previous, [name]: value }));
    /* Clear a field's stale error as soon as the user edits it again. */
    setErrors((previous) => {
      if (!previous[name]) return previous;
      const next = { ...previous };
      delete next[name];
      return next;
    });
  }
  return (
    <div className="site-shell">
      <header className="page-heading">
        <p className="eyebrow">
          <span className="eyebrow-dot" />
          Correspondence
        </p>
        <h1>Let’s talk systems.</h1>
        <p>
          A technical question, a thoughtful correction, or an opportunity to build something
          useful. I’d like to hear it.
        </p>
      </header>
      <div className="contact-layout">
        <div className="contact-details">
          <p className="eyebrow">Find me here</p>
          <a className="text-link" href={`mailto:${contactDetails.email}`}>
            {contactDetails.email} ↗
          </a>
          <p>{contactDetails.location}</p>
            {socialLinks.map((link) => (
            <a
              className="text-link"
              key={link.name}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
            >
              {link.name} ↗ <span className="sr-only">(opens in a new tab)</span>
            </a>
          ))}
          <p className="text-muted-foreground">
            Go backends. Python workloads.
            <br />
            Model-serving infrastructure.
          </p>
        </div>
        <div className="contact-form">
          <form onSubmit={submit} noValidate aria-label="Contact form" aria-busy={pending}>
            <p className="text-xs text-[var(--muted-foreground)]">All fields are required.</p>
            <div className="field">
              <label htmlFor="name">Name</label>
              <Input
                aria-invalid={!!errors.name}
                aria-describedby={errors.name ? "name-error" : undefined}
                id="name"
                name="name"
                autoComplete="name"
                enterKeyHint="next"
                value={values.name}
                onChange={change}
                onBlur={(event) => {
                  if (event.target.value.trim()) validateField("name", event.target.value);
                }}
                maxLength={100}
                required
                className="border-[var(--border-strong)] dark:border-[#3e3d38]"
              />
              {errors.name && (
                <p id="name-error" className="text-destructive text-sm">
                  {errors.name}
                </p>
              )}
            </div>
            <div className="field">
              <label htmlFor="email">Email</label>
              <Input
                aria-invalid={!!errors.email}
                aria-describedby={errors.email ? "email-error" : undefined}
                id="email"
                name="email"
                type="email"
                inputMode="email"
                autoComplete="email"
                autoCorrect="off"
                autoCapitalize="none"
                spellCheck={false}
                enterKeyHint="next"
                value={values.email}
                onChange={change}
                onBlur={(event) => {
                  if (event.target.value.trim()) validateField("email", event.target.value);
                }}
                maxLength={254}
                required
                className="border-[var(--border-strong)] dark:border-[#3e3d38]"
              />
              {errors.email && (
                <p id="email-error" className="text-destructive text-sm">
                  {errors.email}
                </p>
              )}
            </div>
            <div className="field">
              <label htmlFor="message">Message</label>
              <Textarea
                aria-invalid={!!errors.message}
                aria-describedby={errors.message ? "message-error" : undefined}
                id="message"
                name="message"
                value={values.message}
                onChange={change}
                onBlur={(event) => {
                  if (event.target.value.trim()) validateField("message", event.target.value);
                }}
                maxLength={5000}
                required
                placeholder="What are you working on?"
                className="border-[var(--border-strong)] dark:border-[#3e3d38]"
              />
              {errors.message && (
                <p id="message-error" className="text-destructive text-sm">
                  {errors.message}
                </p>
              )}
            </div>
            <div className="honeypot-field" aria-hidden="true">
              <label htmlFor="company-website">Company website</label>
              <input
                id="company-website"
                name="company_website"
                type="text"
                tabIndex={-1}
                autoComplete="off"
                onChange={(event) => (honeypot.current = event.target.value)}
              />
            </div>
            <button type="submit" className="button primary" disabled={pending}>
              {pending ? "Sending…" : "Send message →"}
            </button>
          </form>
          <p
            className={`status-message ${
              statusKind === "error"
                ? "text-destructive"
                : statusKind === "success"
                  ? "text-[var(--accent)]"
                  : ""
            }`}
            data-state={statusKind}
            role="status"
            aria-live="polite"
          >
            {status}
          </p>
        </div>
      </div>
    </div>
  );
}
