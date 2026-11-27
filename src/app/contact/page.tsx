import { pageMetadata } from "@/lib/page-metadata";
import ContactClient from "./ContactClient";
import { siteConfig } from "@/config/site";
import { breadcrumbJsonLd, personEntity, serializeJsonLd, WEBSITE_ID } from "@/lib/seo";

export const metadata = pageMetadata(
  "Contact",
  "Get in touch about Go backends, Python workloads, and model-serving infrastructure.",
  "/contact"
);

export default function ContactPage() {
  const contactUrl = `${siteConfig.url}/contact`;
  const contactLd = {
    "@context": "https://schema.org",
    "@type": "ContactPage",
    name: "Contact",
    description:
      "Get in touch about Go backends, Python workloads, and model-serving infrastructure.",
    url: contactUrl,
    isPartOf: { "@id": WEBSITE_ID },
    mainEntity: personEntity(),
  };
  const breadcrumbLd = breadcrumbJsonLd([
    { name: "Home", url: siteConfig.url },
    { name: "Contact", url: contactUrl },
  ]);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(contactLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(breadcrumbLd) }}
      />
      <ContactClient />
    </>
  );
}
