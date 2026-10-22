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

  const isAdminRoute =
    pathname === "/admin" || pathname.startsWith("/admin/");

  const isInspectorRoute =
    pathname === "/inspector" || pathname.startsWith("/inspector/");

  const isLoginRoute = pathname === "/login";

  const isInspectRoute =
    pathname === "/inspect" || pathname.startsWith("/inspect/");

  // Hide public-site chrome and floating chatbot/WhatsApp controls
  // on admin, inspector, login, and inspection workspace routes.
  if (isAdminRoute || isInspectorRoute || isLoginRoute || isInspectRoute) {
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