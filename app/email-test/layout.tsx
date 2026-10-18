import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Email Test Utility | CarpdiExpert",
  robots: { index: false, follow: false, googleBot: { index: false, follow: false } },
};

export default function EmailTestLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children;
}
