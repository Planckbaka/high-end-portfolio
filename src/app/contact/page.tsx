import type { Metadata } from "next";
import ContactClient from "./ContactClient";

export const metadata: Metadata = {
    title: "Contact",
    description: "Get in touch with me for collaborations, projects, or just to say hi!",
    openGraph: {
        title: "Contact | Akiwayne's Portfolio",
        description: "Get in touch with me for collaborations, projects, or just to say hi!",
    },
};

export default function ContactPage() {
    return <ContactClient />;
}
