import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Car PDI and Used Car Inspection FAQs",
  description: "Find answers about pre-delivery inspection, used-car inspection, booking, reports, service coverage and CarpdiExpert pricing.",
  path: "/info/faqs",
});

export default function FAQsLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children;
}
