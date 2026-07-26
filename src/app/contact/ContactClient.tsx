"use client";

import { GridBackground } from "@/components/ui/GridBackground";
import { ArrowUpRight, Mail, MapPin, Phone } from "lucide-react";
import { contactDetails, socialLinks } from "@/config/data";
import { logError } from "@/lib/error-logger";
import { useState } from "react";

type SubmitStatus = "idle" | "success" | "error";

export default function ContactClient() {
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        message: ""
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitStatus, setSubmitStatus] = useState<SubmitStatus>("idle");
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setSubmitStatus("idle");
        setErrorMessage(null);

        try {
            const response = await fetch('/api/contact', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to send message');
            }

            setSubmitStatus("success");
            setFormData({ name: "", email: "", message: "" });

            setTimeout(() => setSubmitStatus("idle"), 4000);
        } catch (error) {
            // Surface the real reason instead of a blanket "try again", and keep a
            // record for debugging rather than discarding the error object.
            const err = error instanceof Error ? error : new Error(String(error));
            logError(err, { source: "contact-form-submit" });
            setErrorMessage(err.message || "Something went wrong.");
            setSubmitStatus("error");
            setTimeout(() => setSubmitStatus("idle"), 6000);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData(prev => ({
            ...prev,
            [e.target.name]: e.target.value
        }));
    };

    const details = [
        {
            Icon: Mail,
            label: contactDetails.email,
            href: `mailto:${contactDetails.email}`,
        },
        {
            Icon: Phone,
            label: contactDetails.phone,
            href: `tel:${contactDetails.phone.replace(/\s+/g, "")}`,
        },
        {
            Icon: MapPin,
            label: contactDetails.location,
            href: null,
        },
    ];

    const inputClass =
        "w-full bg-surface-raised border border-hairline rounded-sm px-3 py-3 text-lg font-light " +
        "focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/40 transition-colors";

    return (
        /* <div>, not <main> — the root layout already provides the main landmark. */
        <div className="relative w-full min-h-screen overflow-x-clip pt-32 pb-24 gutter flex flex-col justify-between">
            <GridBackground />

            <div className="relative z-10">
                <div className="reveal">
                    <h1 className="text-display-xl font-heading uppercase mb-16 md:mb-24">
                        Let&apos;s <br /> <span className="text-accent">Connect</span>
                    </h1>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-20 lg:gap-24">
                    <div className="reveal [--reveal-delay:0.15s] space-y-12">
                        <section aria-labelledby="contact-details-heading">
                            <h2
                                id="contact-details-heading"
                                className="text-eyebrow uppercase text-foreground/60 mb-6"
                            >
                                Contact Details
                            </h2>
                            <ul className="space-y-6">
                                {details.map(({ Icon, label, href }) => (
                                    <li key={label} className="flex items-center gap-4 group">
                                        <span
                                            aria-hidden="true"
                                            className="w-10 h-10 rounded-full bg-surface-raised border border-hairline grid place-items-center text-foreground/70 group-hover:bg-accent group-hover:border-accent group-hover:text-accent-foreground transition-colors duration-300"
                                        >
                                            <Icon size={17} />
                                        </span>
                                        {href ? (
                                            <a
                                                href={href}
                                                className="text-lg md:text-xl font-light hover:text-accent transition-colors"
                                            >
                                                {label}
                                            </a>
                                        ) : (
                                            <span className="text-lg md:text-xl font-light">{label}</span>
                                        )}
                                    </li>
                                ))}
                            </ul>
                        </section>

                        <section aria-labelledby="socials-heading">
                            <h2
                                id="socials-heading"
                                className="text-eyebrow uppercase text-foreground/60 mb-6"
                            >
                                Socials
                            </h2>
                            <div className="flex flex-wrap gap-3">
                                {/* Placeholder "#" entries are filtered out rather than
                                    rendered as links that go nowhere. */}
                                {socialLinks
                                    .filter((social) => social.url && social.url !== "#")
                                    .map((social) => (
                                        <a
                                            key={social.name}
                                            href={social.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="px-5 py-3 border border-hairline-strong rounded-full hover:bg-foreground hover:text-background hover:border-foreground transition-all duration-300 uppercase text-eyebrow flex items-center gap-2 group"
                                        >
                                            {social.name}
                                            <ArrowUpRight
                                                size={13}
                                                aria-hidden="true"
                                                className="group-hover:-translate-y-0.5 group-hover:translate-x-0.5 transition-transform"
                                            />
                                        </a>
                                    ))}
                            </div>
                        </section>
                    </div>

                    <div className="reveal [--reveal-delay:0.3s] bg-surface border border-hairline p-8 md:p-12 rounded-sm">
                        <h2 className="text-display-sm font-heading uppercase mb-8">Send a Message</h2>
                        <form className="space-y-6" onSubmit={handleSubmit}>
                            <div className="space-y-2">
                                <label htmlFor="name" className="block text-eyebrow uppercase text-foreground/60">Name</label>
                                <input
                                    type="text"
                                    id="name"
                                    name="name"
                                    required
                                    maxLength={100}
                                    autoComplete="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    className={inputClass}
                                    placeholder="Jane Doe"
                                />
                            </div>
                            <div className="space-y-2">
                                <label htmlFor="email" className="block text-eyebrow uppercase text-foreground/60">Email</label>
                                <input
                                    type="email"
                                    id="email"
                                    name="email"
                                    required
                                    maxLength={254}
                                    autoComplete="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    className={inputClass}
                                    placeholder="jane@example.com"
                                />
                            </div>
                            <div className="space-y-2">
                                <label htmlFor="message" className="block text-eyebrow uppercase text-foreground/60">Message</label>
                                <textarea
                                    rows={5}
                                    id="message"
                                    name="message"
                                    required
                                    maxLength={5000}
                                    value={formData.message}
                                    onChange={handleChange}
                                    className={`${inputClass} resize-none`}
                                    placeholder="Tell me about your project..."
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="w-full bg-foreground text-background py-4 rounded-sm uppercase tracking-[0.2em] text-xs font-bold hover:bg-accent hover:text-accent-foreground transition-colors duration-300 mt-4 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isSubmitting
                                    ? "Sending..."
                                    : submitStatus === "success"
                                        ? "Message Sent"
                                        : submitStatus === "error"
                                            ? "Try Again"
                                            : "Send Message"}
                            </button>
                        </form>

                        {/*
                         * One live region for both outcomes. Previously the visible
                         * message and a separate sr-only region duplicated the same
                         * text, so screen readers announced it twice.
                         */}
                        <p
                            aria-live="polite"
                            aria-atomic="true"
                            className={`text-sm mt-4 text-center min-h-5 ${submitStatus === "error" ? "text-red-600 dark:text-red-400" : "text-emerald-700 dark:text-emerald-400"
                                }`}
                        >
                            {submitStatus === "success" && "Message sent successfully."}
                            {submitStatus === "error" && (errorMessage ?? "Failed to send. Please try again.")}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
