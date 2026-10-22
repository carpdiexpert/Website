"use client";

import { useEffect, useState } from "react";
import { onAuthStateChanged, signOut, type User } from "firebase/auth";
import { auth } from "@/lib/firebase";
import Link from "next/link";
import { useRouter } from "next/navigation";
import AdminAppShell from "../AdminAppShell";

type Stats = { total: number; today: number; inspectors: number };
const nav = [
  { label: "Bookings", href: "/admin/bookings", desc: "Review and search all inspection requests", icon: "▤" },
  { label: "Today's Schedules", href: "/admin/todays-schedules", desc: "See appointments scheduled for today", icon: "◷" },
  { label: "Manage Inspectors", href: "/admin/manage-inspectors", desc: "Create inspectors and manage their status", icon: "♙" },
  { label: "Manage Slots", href: "/admin/manage-slots", desc: "Configure inspection slot availability", icon: "◫" },
  { label: "Analytics", href: "/admin/analytics", desc: "Review booking volume and status summaries", icon: "▥" },
  { label: "Manage Car Models", href: "/admin/manage-car-models", desc: "Maintain supported vehicle models", icon: "▱" },
];
async function verifyAdmin(token: string) {
  const response = await fetch("/api/admin/analytics", { headers: { Authorization: `Bearer ${token}` }, cache: "no-store" });
  return response.ok;
}

export default function AdminDashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [ready, setReady] = useState(false);
  const [checkingRole, setCheckingRole] = useState(false);
  const [stats, setStats] = useState<Stats>({ total: 0, today: 0, inspectors: 0 });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let active = true;
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (!active) return;
      if (!currentUser) { setUser(null); setReady(true); router.replace("/login"); return; }
      setCheckingRole(true);
      try {
        const token = await currentUser.getIdToken();
        if (await verifyAdmin(token)) { if (active) setUser(currentUser); }
        else {
          const inspectorResponse = await fetch("/api/auth/inspector", { headers: { Authorization: `Bearer ${token}` }, cache: "no-store" });
          if (inspectorResponse.ok) router.replace("/inspector/dashboard");
          else { await signOut(auth).catch(() => undefined); router.replace("/login"); }
        }
      } catch {
        await signOut(auth).catch(() => undefined);
        router.replace("/login");
      } finally { if (active) { setCheckingRole(false); setReady(true); } }
    });
    return () => { active = false; unsubscribe(); };
  }, [router]);

  useEffect(() => {
    if (!user) return;
    let live = true;
    (async () => {
      setLoading(true);
      try {
        const token = await user.getIdToken();
        const response = await fetch("/api/admin/analytics", { headers: { Authorization: `Bearer ${token}` }, cache: "no-store" });
        const data = await response.json();
        if (response.ok && live) setStats({ total: Number(data.totalBookings) || 0, today: Number(data.todayBookings) || 0, inspectors: Number(data.activeInspectors) || 0 });
      } catch { /* Keep the dashboard usable if analytics are temporarily unavailable. */ }
      finally { if (live) setLoading(false); }
    })();
    return () => { live = false; };
  }, [user]);

  if (!ready || checkingRole || !user) return <main className="flex min-h-screen items-center justify-center bg-slate-100 p-6 text-sm font-semibold text-slate-600">Verifying account access…</main>;
  return <AdminAppShell email={user.email}>
    <div className="mb-8 flex flex-wrap items-end justify-between gap-4"><div><p className="text-xs font-bold uppercase tracking-[.18em] text-sky-600">Overview</p><h1 className="mt-2 text-3xl font-black tracking-tight sm:text-4xl">Dashboard</h1><p className="mt-2 text-sm text-slate-500">Your inspection operations at a glance.</p></div><span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-bold text-emerald-700">● Admin workspace</span></div>
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">{[
      { label: "All bookings", value: stats.total, icon: "▤", hint: "Total records" },
      { label: "Today's bookings", value: stats.today, icon: "◷", hint: "Appointments today" },
      { label: "Active inspectors", value: stats.inspectors, icon: "♙", hint: "Currently active" },
    ].map((stat) => <article key={stat.label} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><div className="flex items-start justify-between"><span className="text-sm font-semibold text-slate-500">{stat.label}</span><span className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-50 text-lg text-blue-700">{stat.icon}</span></div><p className="mt-4 text-3xl font-black">{loading ? "—" : stat.value.toLocaleString("en-IN")}</p><p className="mt-1 text-xs text-slate-400">{stat.hint}</p></article>)}</div>
    <div className="mb-4 mt-10 flex items-center justify-between"><h2 className="text-xl font-black">Workspace</h2><span className="text-xs text-slate-500">Choose a module</span></div>
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">{nav.map((item) => <Link key={item.href} href={item.href} className="group rounded-2xl border border-slate-200 bg-white p-5 transition hover:-translate-y-0.5 hover:border-sky-300 hover:shadow-lg"><div className="flex items-center justify-between"><span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#0B1220] text-xl text-sky-300">{item.icon}</span><span className="text-slate-400 transition group-hover:translate-x-1 group-hover:text-blue-600">↗</span></div><h3 className="mt-5 font-black">{item.label}</h3><p className="mt-2 text-sm leading-6 text-slate-500">{item.desc}</p></Link>)}</div>
  </AdminAppShell>;
}
