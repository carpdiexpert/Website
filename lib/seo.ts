export const SITE_URL = "https://carpdiexpert.com";
export const SITE_NAME = "CarpdiExpert";

export const DEFAULT_DESCRIPTION =
  "Book a car inspection with CarpdiExpert. Explore pre-delivery inspection (PDI), used-car pre-purchase inspection (PPI), EV inspection options, pricing and city coverage.";

export function absoluteUrl(path = "/"): string {
  return new URL(path.startsWith("/") ? path : `/${path}`, SITE_URL).toString();
}

export function pageMetadata({
  title,
  description,
  path,
  keywords,
}: {
  title: string;
  description: string;
  path: string;
  keywords?: string[];
}) {
  const canonical = absoluteUrl(path);
  return {
    title,
    description,
    keywords,
    alternates: { canonical },
    openGraph: {
      type: "website" as const,
      siteName: SITE_NAME,
      title,
      description,
      url: canonical,
      locale: "en_IN",
    },
    twitter: { card: "summary_large_image" as const, title, description },
  };
}
