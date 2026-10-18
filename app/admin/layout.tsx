import type { Metadata } from "next";

export const metadata: Metadata = {
  title: { default: "Admin Workspace", template: "%s | CarpdiExpert Admin" },
  robots: { index: false, follow: false, googleBot: { index: false, follow: false } },
};

export default function AdminLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <>{children}</>;
}
