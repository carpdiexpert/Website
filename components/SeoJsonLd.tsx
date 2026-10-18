import { SITE_NAME, SITE_URL } from "@/lib/seo";

type SeoJsonLdProps = {
  pagePath?: string;
  pageTitle?: string;
  pageDescription?: string;
};

/** Use only on public pages. Add only business facts verified on the website. */
export default function SeoJsonLd({
  pagePath = "/",
  pageTitle = "Car inspection services | CarpdiExpert",
  pageDescription = "CarpdiExpert provides car inspection options for new and used vehicles.",
}: SeoJsonLdProps) {
  const pageUrl = new URL(pagePath, SITE_URL).toString();
  const graph = {
    "@context": "https://schema.org",
    "@graph": [
      { "@type": "Organization", "@id": `${SITE_URL}/#organization`, name: SITE_NAME, url: SITE_URL },
      { "@type": "WebSite", "@id": `${SITE_URL}/#website`, name: SITE_NAME, url: SITE_URL, publisher: { "@id": `${SITE_URL}/#organization` }, inLanguage: "en-IN" },
      { "@type": "WebPage", "@id": `${pageUrl}#webpage`, url: pageUrl, name: pageTitle, description: pageDescription, isPartOf: { "@id": `${SITE_URL}/#website` }, inLanguage: "en-IN" },
    ],
  };
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(graph).replace(/</g, "\\u003c") }} />;
}
