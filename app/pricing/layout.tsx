import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Car Inspection Prices by City and Package",
  description: "Compare CarpdiExpert prices for new-car PDI, luxury-car inspection, EV inspection and used-car PPI across available cities.",
  path: "/pricing",
});

export default function PricingLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children;
}
