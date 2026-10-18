import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/seo";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: "*", allow: "/", disallow: ["/api/", "/account/", "/dashboard/", "/booking/confirmation/"] },
      { userAgent: "Googlebot", allow: "/", disallow: ["/api/", "/account/", "/dashboard/", "/booking/confirmation/"] },
      { userAgent: "OAI-SearchBot", allow: "/", disallow: ["/api/", "/account/", "/dashboard/", "/booking/confirmation/"] },
      { userAgent: "GPTBot", allow: "/", disallow: ["/api/", "/account/", "/dashboard/", "/booking/confirmation/"] },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
