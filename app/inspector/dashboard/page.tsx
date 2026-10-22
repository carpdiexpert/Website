"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import type { User } from "firebase/auth";
import InspectorAppShell from "@/app/inspector/InspectorAppShell";
import { useInspectorSession } from "@/lib/useInspectorSession";
import { getTiming, type Booking } from "@/app/inspector/booking-utils";

export default function InspectorDashboardPage() {
  const { user, profile, loading } = useInspectorSession();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loadingBookings, setLoadingBookings] = useState(true);
  const [bookingsError, setBookingsError] = useState("");
  const [now, setNow] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const [locationError, setLocationError] = useState("");
  const [locationMessage, setLocationMessage] = useState("");

  const loadBookings = useCallback(async (currentUser: User, silent = false) => {
    if (!silent) setLoadingBookings(true);
    setBookingsError("");
    try {
      const token = await currentUser.getIdToken();
      const response = await fetch("/api/inspector/bookings", { headers: { Authorization: `Bearer ${token}` }, cache: "no-store" });
      const result = await response.json().catch(() => null);
      if (!response.ok || !result?.ok) throw new Error(result?.error || "Could not load assigned bookings.");
      setBookings(Array.isArray(result.bookings) ? result.bookings : []);
    } catch (error) {
      setBookingsError(error instanceof Error ? error.message : "Could not load assigned bookings.");
    } finally {
      setLoadingBookings(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { setNow(Date.now()); const timer = window.setInterval(() => setNow(Date.now()), 30_000); return () => window.clearInterval(timer); }, []);
  useEffect(() => { if (user) void loadBookings(user); }, [user, loadBookings]);
  useEffect(() => { if (!user) return; const timer = window.setInterval(() => void loadBookings(user, true), 60_000); return () => window.clearInterval(timer); }, [user, loadBookings]);

  const saveLocation = useCallback(async (currentUser: User) => {
    setLocationError(""); setLocationMessage("");
    if (!navigator.geolocation) { setLocationError("This browser does not support location access."); return; }
    navigator.geolocation.getCurrentPosition(async (position) => {
      try {
        const lat = position.coords.latitude, lng = position.coords.longitude;
        const token = await currentUser.getIdToken();
        const response = await fetch("/api/inspector/location", {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify({ lat, lng }), cache: "no-store",
        });
        const result = await response.json().catch(() => null);
        if (!response.ok || !result?.ok) throw new Error(result?.error || "Could not save location.");
        setLocationMessage("Your current location was saved.");
      } catch (error) { setLocationError(error instanceof Error ? error.message : "Could not save location."); }
    }, (error) => {
      setLocationError(error.code === error.PERMISSION_DENIED ? "Location permission was denied. You can enable it in browser settings. The dashboard will still work." : error.code === error.TIMEOUT ? "Location lookup timed out. You can retry from your Profile page." : "Location is unavailable. Check device location services or retry from your Profile page.");
    }, { enableHighAccuracy: true, timeout: 15000, maximumAge: 60000 });
  }, []);
  useEffect(() => { if (user && profile?.uid) void saveLocation(user); }, [user, profile?.uid, saveLocation]);

  const counts = useMemo(() => {
    const labels = bookings.map((b) => getTiming(b, now).label);
    return {
      all: bookings.length,
      immediate: labels.filter((v) => v === "Immediate").length,
      upcoming: labels.filter((v) => v === "Upcoming").length,
      scheduled: labels.filter((v) => v === "Scheduled").length,
      late: labels.filter((v) => v === "Late").length,
      completed: labels.filter((v) => v === "Completed").length,
    };
  }, [bookings, now]);

  if (loading || !user || !profile) return <main className="flex min-h-screen items-center justify-center bg-slate-100 p-6"><div className="rounded-2xl border border-slate-200 bg-white px-5 py-4 text-sm font-semibold text-slate-600 shadow-sm">Verifying inspector access…</div></main>;

  const cards = [
    { label: "Assigned PDIs", value: counts.all, filter: "all", description: "View all assigned inspections", icon: "▣", tone: "border-sky-200 bg-white text-slate-900", iconTone: "bg-sky-50 text-sky-700" },
    { label: "Immediate PDI", value: counts.immediate, filter: "immediate", description: "Starting within 60 minutes", icon: "◷", tone: "border-amber-200 bg-amber-50/70 text-amber-950", iconTone: "bg-amber-100 text-amber-800" },
    { label: "Upcoming PDI", value: counts.upcoming, filter: "upcoming", description: "Starting within 1–6 hours", icon: "◴", tone: "border-sky-200 bg-sky-50/70 text-sky-950", iconTone: "bg-sky-100 text-sky-800" },
    { label: "Scheduled PDI", value: counts.scheduled, filter: "scheduled", description: "Later appointments", icon: "▦", tone: "border-indigo-200 bg-indigo-50/70 text-indigo-950", iconTone: "bg-indigo-100 text-indigo-800" },
    { label: "Late PDI", value: counts.late, filter: "late", description: "Appointment time has passed", icon: "!", tone: "border-rose-200 bg-rose-50/70 text-rose-950", iconTone: "bg-rose-100 text-rose-800" },
    { label: "Completed PDI", value: counts.completed, filter: "completed", description: "Inspections completed", icon: "✓", tone: "border-emerald-200 bg-emerald-50/70 text-emerald-950", iconTone: "bg-emerald-100 text-emerald-800" },
  ];

  return <InspectorAppShell profile={profile}>
    <section className="mb-7 overflow-hidden rounded-3xl bg-gradient-to-br from-[#0B1220] via-slate-900 to-blue-950 p-6 text-white shadow-lg sm:p-8">
      <p className="text-xs font-bold uppercase tracking-[.2em] text-sky-300">Inspector workspace</p>
      <h1 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl">Inspector Dashboard</h1>
      <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300">Select a PDI summary card to open the matching inspections. Booking lists and account details are available in the app drawer.</p>
    </section>
    {locationMessage && <p role="status" className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm font-semibold text-emerald-800">{locationMessage}</p>}
    {locationError && <p role="status" className="mb-4 rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">Location was not saved: {locationError} You can retry from Profile.</p>}
    {bookingsError && <div role="alert" className="mb-4 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm font-semibold text-rose-700">{bookingsError}<button type="button" onClick={() => user && void loadBookings(user)} className="ml-3 underline">Try again</button></div>}
    <div className="mb-4 flex flex-wrap items-end justify-between gap-3"><div><p className="text-xs font-bold uppercase tracking-[.18em] text-sky-600">Overview</p><h2 className="mt-1 text-2xl font-black tracking-tight">PDI Summary</h2><p className="mt-1 text-sm text-slate-500">Tap any card to view that filtered PDI list.</p></div><button type="button" onClick={() => { if (user) { setRefreshing(true); void loadBookings(user, true); } }} disabled={refreshing || loadingBookings} className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 shadow-sm hover:border-sky-300 disabled:opacity-60">{refreshing ? "Refreshing…" : "↻ Refresh"}</button></div>
    {loadingBookings ? <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center text-sm font-semibold text-slate-500">Loading PDI summary…</div> : <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">{cards.map((card) => <Link key={card.filter} href={`/inspector/mypdis?filter=${card.filter}`} className={`group rounded-2xl border p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md focus:outline-none focus:ring-4 focus:ring-sky-200 ${card.tone}`}><div className="flex items-start justify-between gap-3"><div><p className="text-sm font-bold">{card.label}</p><p className="mt-1 text-xs opacity-70">{card.description}</p></div><span className={`flex h-11 w-11 items-center justify-center rounded-xl text-xl font-black ${card.iconTone}`}>{card.icon}</span></div><div className="mt-5 flex items-end justify-between"><p className="text-4xl font-black tracking-tight tabular-nums">{card.value}</p><span className="text-sm font-bold opacity-70 transition group-hover:translate-x-1">View PDIs →</span></div></Link>)}</div>}
    <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-5"><p className="font-extrabold">Quick links</p><div className="mt-3 flex flex-wrap gap-3">
        <Link
  href="/inspector/mypdis?filter=all"
  className="inline-flex min-h-12 items-center justify-center rounded-xl !bg-blue-600 px-4 py-3 text-sm font-bold !text-white shadow-sm transition-colors hover:!bg-blue-700"
>
  View My Assigned PDIs
</Link>

<Link
  href="/inspector/profile"
  className="inline-flex min-h-12 items-center justify-center rounded-xl !bg-blue-600 px-4 py-2.5 text-sm font-bold !text-white shadow-sm transition-colors hover:!bg-blue-700"
>
  My Profile
</Link>
        </div></div>
  </InspectorAppShell>;
}
