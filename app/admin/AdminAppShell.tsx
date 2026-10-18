"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";

const items = [
  { label: "Dashboard", href: "/admin", icon: "▦" },
  { label: "Bookings", href: "/admin/bookings", icon: "▤" },
  { label: "Today's Schedules", href: "/admin/todays-schedules", icon: "◷" },
  { label: "Manage Inspectors", href: "/admin/manage-inspectors", icon: "♙" },
  { label: "Manage Slots", href: "/admin/manage-slots", icon: "◫" },
  { label: "Analytics", href: "/admin/analytics", icon: "▥" },
  { label: "Manage Car Models", href: "/admin/manage-car-models", icon: "▱" },
];

export default function AdminAppShell({ children, email }: { children: React.ReactNode; email?: string | null }) {
  const pathname = usePathname();
  const router = useRouter();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);

  async function logout() {
    setSigningOut(true);
    try {
      await signOut(auth);
      router.replace("/admin");
    } finally {
      setSigningOut(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900">
      {drawerOpen && <button aria-label="Close navigation" onClick={() => setDrawerOpen(false)} className="fixed inset-0 z-40 bg-slate-950/50 lg:hidden" />}
      <aside className={`fixed inset-y-0 left-0 z-50 flex w-[275px] flex-col bg-[#0B1220] text-white transition-transform duration-200 lg:translate-x-0 ${drawerOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="flex h-20 items-center justify-between border-b border-white/10 px-6">
          <Link href="/admin" className="text-xl font-black tracking-tight" onClick={() => setDrawerOpen(false)}>CarPDI<span className="text-sky-400">Expert</span><span className="mt-1 block text-[10px] font-semibold uppercase tracking-[.2em] text-slate-400">Admin workspace</span></Link>
          <button onClick={() => setDrawerOpen(false)} className="rounded-lg p-2 text-slate-300 hover:bg-white/10 lg:hidden" aria-label="Close menu">✕</button>
        </div>
        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-5">
          <p className="px-3 pb-2 text-[10px] font-bold uppercase tracking-[.2em] text-slate-500">Workspace</p>
          {items.map(item => {
            const active = item.href === "/admin" ? pathname === item.href : pathname === item.href || pathname.startsWith(item.href + "/");
            return <Link key={item.href} href={item.href} onClick={() => setDrawerOpen(false)} className={`flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold transition ${active ? "bg-sky-400 text-[#0B1220] shadow-lg shadow-sky-950/20" : "text-slate-300 hover:bg-white/[.07] hover:text-white"}`}><span className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/[.07] text-base">{item.icon}</span>{item.label}</Link>;
          })}
        </nav>
        <div className="border-t border-white/10 p-4">
          <div className="mb-3 truncate px-2 text-xs text-slate-400">{email || "Administrator"}</div>
          <button onClick={() => void logout()} disabled={signingOut} className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-bold text-slate-200 transition hover:bg-rose-500/10 hover:text-rose-300 disabled:opacity-50"><span className="flex h-8 w-8 items-center justify-center rounded-lg bg-rose-400/10">↪</span>{signingOut ? "Signing out…" : "Logout"}</button>
        </div>
      </aside>
      <div className="min-h-screen lg:pl-[275px]">
        <header className="sticky top-0 z-30 flex h-[72px] items-center justify-between border-b border-slate-200 bg-white/90 px-4 backdrop-blur sm:px-7">
          <div className="flex items-center gap-3">
            <button onClick={() => setDrawerOpen(true)} className="rounded-xl border border-slate-200 px-3 py-2 text-lg lg:hidden" aria-label="Open navigation">☰</button>
            <div><p className="text-xs font-bold uppercase tracking-[.16em] text-sky-600">CarPDIExpert CRM</p><p className="text-sm font-bold text-slate-800">Operations workspace</p></div>
          </div>
          <div className="hidden items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-600 sm:flex"><span className="h-2 w-2 rounded-full bg-emerald-500" /> Admin session</div>
        </header>
        <div className="mx-auto max-w-[1600px] p-4 sm:p-7 lg:p-8">{children}</div>
      </div>
    </div>
  );
}
