"use client";

import { usePathname } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import BookingChatbot from "@/components/BookingChatbot";

export default function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isAdminRoute = pathname === "/admin" || pathname.startsWith("/admin/");
  // Inspector routes are standalone application screens: no public-site chrome.
  const isInspectorRoute = pathname === "/inspector" || pathname.startsWith("/inspector/");

  if (isAdminRoute || isInspectorRoute) {
    return <>{children}</>;
  }

  return (
    <>
      <Header />
      <main>{children}</main>
      <Footer />
      <BookingChatbot />
    </>
  );
}
