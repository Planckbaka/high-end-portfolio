import { pageMetadata } from "@/lib/page-metadata";
import ContactClient from "./ContactClient";

export const metadata = pageMetadata(
  "Contact",
  "Get in touch about Go backends, Python workloads, and model-serving infrastructure.",
  "/contact"
);

export default function ContactPage() {
  return <ContactClient />;
}
