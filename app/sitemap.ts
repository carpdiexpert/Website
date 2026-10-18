import type { MetadataRoute } from "next";
import { CITY_OPTIONS } from "@/lib/cityOptions";
import { SITE_URL } from "@/lib/seo";

const PUBLIC_ROUTES = [
  { path: "/", priority: 1.0, changeFrequency: "weekly" as const },
  { path: "/about", priority: 0.7, changeFrequency: "monthly" as const },
  { path: "/services", priority: 0.8, changeFrequency: "monthly" as const },
  { path: "/pricing", priority: 0.8, changeFrequency: "monthly" as const },
  { path: "/how-it-works", priority: 0.7, changeFrequency: "monthly" as const },
  { path: "/info/faqs", priority: 0.7, changeFrequency: "monthly" as const },
  { path: "/info/privacy-policy", priority: 0.3, changeFrequency: "yearly" as const },
  { path: "/info/terms-of-service", priority: 0.3, changeFrequency: "yearly" as const },
  { path: "/info/cancellation-policy", priority: 0.4, changeFrequency: "yearly" as const },
];

export default function sitemap(): MetadataRoute.Sitemap {
  const staticEntries: MetadataRoute.Sitemap = PUBLIC_ROUTES.map((route) => ({
    url: `${SITE_URL}${route.path}`,
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }));

  const cityEntries: MetadataRoute.Sitemap = CITY_OPTIONS.map((city) => ({
    url: `${SITE_URL}/${encodeURIComponent(city.slug)}`,
    changeFrequency: "monthly" as const,
    priority: 0.75,
  }));

  const seen = new Set<string>();
  return [...staticEntries, ...cityEntries].filter((entry) => {
    if (seen.has(entry.url)) return false;
    seen.add(entry.url);
    return true;
  });
}
