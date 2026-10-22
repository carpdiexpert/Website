"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import type { InspectorProfile } from "@/lib/useInspectorSession";

const items = [
  { label: "Dashboard", href: "/inspector/dashboard", icon: "📊" },
  { label: "My Assigned PDIs", href: "/inspector/mypdis", icon: "✅" },
  { label: "Profile", href: "/inspector/profile", icon: "👤" },
  {
    label: "Request Password Reset",
    href: "/inspector/resetpassword",
    icon: "🔐",
  },
];

export default function InspectorAppShell({
  profile,
  children,
}: {
  profile: InspectorProfile;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const displayName = profile.name.trim() || "Inspector";
  const initials =
    displayName
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join("") || "I";

  async function logout() {
    setLoggingOut(true);
    try {
      await signOut(auth);
      router.replace("/login");
    } finally {
      setLoggingOut(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900">
      {drawerOpen && (
        <button
          type="button"
          aria-label="Close navigation menu"
          onClick={() => setDrawerOpen(false)}
          className="fixed inset-0 z-40 bg-slate-950/50 lg:hidden"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-72 flex-col bg-[#0B1220] text-white shadow-2xl transition-transform duration-200 lg:translate-x-0 ${
          drawerOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Single inspector profile at the top */}
        <div className="flex shrink-0 items-center gap-3 border-b border-white/10 px-5 py-5">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-sky-400 text-sm font-black text-slate-950">
            {initials}
          </div>

          <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-bold text-sky-300">
              CarPDIExpert
            </p>
            <p className="truncate text-sm font-bold text-white">
              {displayName}
            </p>
            <p className="mt-1 truncate text-xs text-slate-400">
              📍 {profile.city || "City not assigned"}
            </p>
            <p className="mt-1 truncate text-xs text-slate-500">
              ✉️ {profile.email || "No email"}
            </p>
          </div>

          <button
            type="button"
            aria-label="Close menu"
            onClick={() => setDrawerOpen(false)}
            className="rounded-lg p-2 text-slate-400 hover:bg-white/10 lg:hidden"
          >
            ✕
          </button>
        </div>

        {/* Navigation only — no second profile card */}
        <div className="flex-1 overflow-y-auto px-4 pb-4 pt-5">
          <p className="px-3 text-[10px] font-bold uppercase tracking-[.2em] text-slate-500">
            Inspector Workspace
          </p>

          <nav className="mt-3 space-y-1">
            {items.map((item) => {
              const active =
                pathname === item.href ||
                (item.href === "/inspector/mypdis" &&
                  pathname.startsWith("/inspector/mypdis"));

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setDrawerOpen(false)}
                  className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold transition ${
                    active
                      ? "bg-sky-400/15 text-sky-300 ring-1 ring-inset ring-sky-400/20"
                      : "text-slate-300 hover:bg-white/5 hover:text-white"
                  }`}
                >
                  <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/5 text-lg">
                    {item.icon}
                  </span>
                  <span>{item.label}</span>
                  {active && (
                    <span className="ml-auto h-2 w-2 rounded-full bg-sky-400" />
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="shrink-0 border-t border-white/10 p-4">
          <button
            type="button"
            onClick={logout}
            disabled={loggingOut}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-white/10 px-4 py-3 text-sm font-bold text-slate-200 transition hover:border-rose-400/40 hover:bg-rose-400/10 hover:text-rose-200 disabled:opacity-60"
          >
            <span>↪️</span>
            {loggingOut ? "Logging out…" : "Logout"}
          </button>
        </div>
      </aside>

      <div className="min-h-screen lg:pl-72">
        <button
          type="button"
          aria-label="Open navigation menu"
          onClick={() => setDrawerOpen(true)}
          className="fixed left-4 top-4 z-30 flex h-11 w-11 items-center justify-center rounded-xl border border-slate-200 bg-white text-xl text-slate-700 shadow-md hover:border-sky-300 hover:text-sky-700 lg:hidden"
        >
          ☰
        </button>

        <main className="mx-auto max-w-7xl p-4 pt-20 sm:p-6 sm:pt-20 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}