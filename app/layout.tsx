
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

import { CityProvider } from "@/components/CityProvider";
import SiteLayout from "./SiteLayout";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "CarpdiExpert | Professional Car Inspection",
  description:
    "Book professional new, used, luxury, and electric vehicle inspections.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" data-scroll-behavior="smooth">
      <body className={inter.className}>
        <CityProvider>
          <SiteLayout>{children}</SiteLayout>
        </CityProvider>
      </body>
    </html>
  );
}
