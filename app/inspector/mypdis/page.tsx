"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { User } from "firebase/auth";
import { useRouter } from "next/navigation";
import InspectorAppShell from "@/app/inspector/InspectorAppShell";
import { useInspectorSession } from "@/lib/useInspectorSession";
import { appointmentDateTime, formatDate, getTiming, type Booking, type Timing } from "@/app/inspector/booking-utils";

const filters = [
  { value: "all", label: "All PDIs" },
  { value: "immediate", label: "Immediate" },
  { value: "upcoming", label: "Upcoming" },
  { value: "scheduled", label: "Scheduled" },
  { value: "late", label: "Late" },
  { value: "completed", label: "Completed" },
  { value: "cancelled", label: "Cancelled" },
];

const pad = (value: number) => String(value).padStart(2, "0");
const dateKey = (date: Date) => `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
function bookingDateKey(booking: Booking): string {
  const date = appointmentDateTime(booking);
  if (date && Number.isFinite(date.getTime())) return dateKey(date);
  const raw = String(booking.date || "").trim();
  const match = raw.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/);
  if (match) return `${match[1]}-${pad(Number(match[2]))}-${pad(Number(match[3]))}`;
  const parsed = new Date(raw);
  return Number.isFinite(parsed.getTime()) ? dateKey(parsed) : "";
}
const monthLabel = (date: Date) => date.toLocaleDateString("en-IN", { month: "long", year: "numeric" });

export default function InspectorMyPdisPage() {
  const { user, profile, loading } = useInspectorSession();
  const router = useRouter();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loadingBookings, setLoadingBookings] = useState(true);
  const [error, setError] = useState("");
  const [now, setNow] = useState(0);
  const [filter, setFilter] = useState("all");
  const [refreshing, setRefreshing] = useState(false);
  // Use a stable initial value during prerender; set the real month after hydration.
  const [calendarMonth, setCalendarMonth] = useState(() => new Date(2000, 0, 1));
  const [selectedDate, setSelectedDate] = useState("");

  useEffect(() => {
    const currentDate = new Date();
    setCalendarMonth(new Date(currentDate.getFullYear(), currentDate.getMonth(), 1));
    setNow(Date.now());
    const timer = window.setInterval(() => setNow(Date.now()), 30_000);
    const syncFilter = () => {
      const value = new URLSearchParams(window.location.search).get("filter") || "all";
      setFilter(filters.some((item) => item.value === value) ? value : "all");
    };
    syncFilter();
    window.addEventListener("popstate", syncFilter);
    return () => { window.clearInterval(timer); window.removeEventListener("popstate", syncFilter); };
  }, []);

  const loadBookings = useCallback(async (currentUser: User, silent = false) => {
    if (!silent) setLoadingBookings(true);
    setError("");
    try {
      const token = await currentUser.getIdToken();
      const response = await fetch("/api/inspector/bookings", { headers: { Authorization: `Bearer ${token}` }, cache: "no-store" });
      const result = await response.json().catch(() => null);
      if (!response.ok || !result?.ok) throw new Error(result?.error || "Could not load assigned PDIs.");
      setBookings(Array.isArray(result.bookings) ? result.bookings : []);
    } catch (e) { setError(e instanceof Error ? e.message : "Could not load assigned PDIs."); }
    finally { setLoadingBookings(false); setRefreshing(false); }
  }, []);
  useEffect(() => { if (user) void loadBookings(user); }, [user, loadBookings]);

  // Sort calendar dates newest-first, but keep appointments within each date
  // in chronological order (e.g. 9:00 AM, 10:30 AM, 3:30 PM).
  const sorted = useMemo(() => [...bookings].sort((a, b) => {
    const dateA = bookingDateKey(a);
    const dateB = bookingDateKey(b);
    if (dateA !== dateB) {
      if (!dateA) return 1;
      if (!dateB) return -1;
      return dateB.localeCompare(dateA);
    }

    const timeA = appointmentDateTime(a)?.getTime();
    const timeB = appointmentDateTime(b)?.getTime();
    if (Number.isFinite(timeA) && Number.isFinite(timeB) && timeA !== timeB) {
      return timeA! - timeB!;
    }

    // Fallback for records whose combined appointment date/time cannot be parsed.
    const parseSlotMinutes = (slot: string) => {
      const value = String(slot || '').trim().toUpperCase();
      const match = value.match(/(\d{1,2})(?::(\d{2}))?\s*(AM|PM)?/);
      if (!match) return Number.MAX_SAFE_INTEGER;
      let hours = Number(match[1]);
      const minutes = Number(match[2] || 0);
      if (match[3] === 'PM' && hours < 12) hours += 12;
      if (match[3] === 'AM' && hours === 12) hours = 0;
      return hours * 60 + minutes;
    };
    return parseSlotMinutes(a.slot || '') - parseSlotMinutes(b.slot || '');
  }), [bookings]);
  const counts = useMemo(() => filters.reduce<Record<string, number>>((acc, item) => {
    acc[item.value] = item.value === "all" ? bookings.length : bookings.filter((booking) => getTiming(booking, now).label.toLowerCase() === item.value).length;
    return acc;
  }, {}), [bookings, now]);
  const dayCounts = useMemo(() => {
    const result: Record<string, number> = {};
    bookings.forEach((booking) => {
      const key = bookingDateKey(booking);
      if (key) result[key] = (result[key] || 0) + 1;
    });
    return result;
  }, [bookings]);
  const filtered = useMemo(() => sorted.filter((booking) => {
    if (selectedDate && bookingDateKey(booking) !== selectedDate) return false;
    if (filter === "all") return true;
    return getTiming(booking, now).label.toLowerCase() === filter;
  }), [sorted, filter, now, selectedDate]);

  const calendarDays = useMemo(() => {
    const year = calendarMonth.getFullYear();
    const month = calendarMonth.getMonth();
    const firstWeekday = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const cells: Array<{ key: string; day: number; count: number } | null> = Array(firstWeekday).fill(null);
    for (let day = 1; day <= daysInMonth; day++) {
      const key = `${year}-${pad(month + 1)}-${pad(day)}`;
      cells.push({ key, day, count: dayCounts[key] || 0 });
    }
    while (cells.length % 7) cells.push(null);
    return cells;
  }, [calendarMonth, dayCounts]);

  function chooseFilter(value: string) {
    setFilter(value);
    const url = new URL(window.location.href);
    if (value === "all") url.searchParams.delete("filter"); else url.searchParams.set("filter", value);
    window.history.replaceState({}, "", `${url.pathname}${url.search}${url.hash}`);
  }
  function startPdi(booking: Booking) {
    window.localStorage.setItem("active_pdi", JSON.stringify({
      id: booking.id, name: booking.name, mobile: booking.mobile,
      brand: booking.carBrand, model: booking.carModel,
      inspector: profile?.name || booking.inspectorName || "",
      date: booking.date, slot: booking.slot, location: booking.location || booking.address,
      city: booking.city, inspectionLabel: booking.inspectionLabel, inspectionType: booking.inspectionType,
    }));
    router.push("/inspect");
  }

  if (loading || !user || !profile) return <main className="flex min-h-screen items-center justify-center bg-slate-100 p-6"><div className="rounded-2xl border border-slate-200 bg-white px-5 py-4 text-sm font-semibold text-slate-600 shadow-sm">Verifying inspector access…</div></main>;

  return <InspectorAppShell profile={profile}>
        <section className="mb-7 overflow-hidden rounded-3xl bg-gradient-to-br from-[#0B1220] via-slate-900 to-blue-950 p-6 text-white shadow-lg sm:p-8">
      <p className="text-xs font-bold uppercase tracking-[.2em] text-sky-300">Inspections</p>
      <h1 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl">My Assigned PDIs</h1>
      <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300">Choose a date on the calendar to see that day’s assigned inspections.</p>
    </section>
    <section className="mb-5 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
      <div className="mb-4 flex items-center justify-between gap-3"><div><h2 className="text-lg font-black text-slate-900">PDI Calendar</h2><p className="text-sm text-slate-600">Numbers show assigned PDIs per day.</p></div><div className="flex items-center gap-2"><button type="button" aria-label="Previous month" onClick={() => setCalendarMonth((d) => new Date(d.getFullYear(), d.getMonth() - 1, 1))} className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-lg font-bold text-slate-700 hover:bg-slate-50">‹</button><span className="min-w-32 text-center text-sm font-extrabold text-slate-800">{monthLabel(calendarMonth)}</span><button type="button" aria-label="Next month" onClick={() => setCalendarMonth((d) => new Date(d.getFullYear(), d.getMonth() + 1, 1))} className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-lg font-bold text-slate-700 hover:bg-slate-50">›</button></div></div>
      <div className="grid grid-cols-7 gap-1.5 sm:gap-2">{["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => <div key={day} className="py-1 text-center text-[11px] font-bold uppercase tracking-wide text-slate-400 sm:text-xs">{day}</div>)}
        {calendarDays.map((cell, index) => cell ? <button key={cell.key} type="button" onClick={() => setSelectedDate((current) => current === cell.key ? "" : cell.key)} aria-pressed={selectedDate === cell.key} className={`relative flex min-h-12 flex-col items-center justify-center rounded-xl border p-1 transition sm:min-h-14 ${selectedDate === cell.key ? "border-blue-600 !bg-blue-600 !text-white shadow-sm" : cell.count ? "border-blue-100 bg-blue-50 text-slate-800 hover:border-blue-300" : "border-transparent bg-slate-50 text-slate-600 hover:border-slate-200 hover:bg-white"}`}><span className="text-sm font-bold">{cell.day}</span>{cell.count > 0 && <span className={`mt-0.5 min-w-5 rounded-full px-1 text-[10px] font-extrabold leading-4 ${selectedDate === cell.key ? "bg-white/20 text-white" : "bg-blue-600 text-white"}`}>{cell.count}</span>}</button> : <div key={`blank-${index}`} className="min-h-12 sm:min-h-14" />)}
      </div>
      <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 pt-3"><p className="text-sm text-slate-600">{selectedDate ? <><span className="font-bold text-slate-900">{dayCounts[selectedDate] || 0} PDI{dayCounts[selectedDate] === 1 ? "" : "s"}</span> on {new Date(`${selectedDate}T12:00:00`).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</> : <><span className="font-bold text-slate-900">{bookings.length} total</span> assigned PDIs across all dates</>}</p>{selectedDate && <button type="button" onClick={() => setSelectedDate("")} className="text-sm font-bold text-blue-700 hover:text-blue-900">Clear selected date</button>}</div>
    </section>

    <div className="mb-5 flex flex-wrap gap-2">{filters.map((item) => <button key={item.value} type="button" onClick={() => chooseFilter(item.value)} className={`rounded-xl border px-3 py-2 text-sm font-bold transition ${filter === item.value ? "border-blue-600 !bg-blue-600 !text-white shadow-sm" : "border-slate-200 bg-white text-slate-700 hover:border-blue-300"}`}>{item.label}<span className={`ml-2 rounded-md px-1.5 py-0.5 text-xs ${filter === item.value ? "bg-white/20 text-white" : "bg-slate-100 text-slate-600"}`}>{counts[item.value] ?? 0}</span></button>)}</div>
    {error && <div role="alert" className="mb-4 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm font-semibold text-rose-700">{error}<button type="button" onClick={() => user && void loadBookings(user)} className="ml-3 underline">Try again</button></div>}
    <div className="mb-3 flex items-center justify-between gap-3"><p className="text-base font-semibold text-slate-600">Showing {filtered.length} {filtered.length === 1 ? "PDI" : "PDIs"}{selectedDate ? " for selected date" : ""}</p><button type="button" onClick={() => { if (user) { setRefreshing(true); void loadBookings(user, true); } }} disabled={refreshing || loadingBookings} className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-base font-bold text-slate-700 shadow-sm hover:border-blue-300 disabled:opacity-60">{refreshing ? "Refreshing…" : "↻ Refresh"}</button></div>
    {loadingBookings ? (
      <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-base font-semibold text-slate-500">
        Loading your assigned PDIs…
      </div>
    ) : filtered.length === 0 ? (
      <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-5 py-10 text-center">
        <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-xl text-blue-700">▣</span>
        <h2 className="mt-3 text-xl font-black">No {filter === "all" ? "assigned" : filter} PDIs{selectedDate ? " on this date" : ""}</h2>
        <p className="mx-auto mt-1 max-w-md text-base leading-6 text-slate-500">Try another date or filter, or refresh your assigned bookings.</p>
        <button type="button" onClick={() => { chooseFilter("all"); setSelectedDate(""); }} className="mt-3 rounded-xl !bg-blue-600 px-4 py-2.5 text-sm font-bold !text-white hover:!bg-blue-700">Show all PDIs</button>
      </div>
    ) : (
      <>
        {/* Mobile: compact stacked booking cards, with no horizontal scrolling. */}
        <div className="space-y-3 md:hidden">
          {filtered.map((booking) => {
            const timing: Timing = getTiming(booking, now);
            const confirmed = booking.status.trim().toLowerCase() === "confirmed";
            const location = [booking.location || booking.address, booking.city].filter(Boolean).join(", ");
            const vehicle = [booking.carBrand, booking.carModel].filter(Boolean).join(" ");

            return (
              <article key={booking.id} className="min-w-0 overflow-hidden rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h2 className="break-words text-base font-extrabold leading-6 text-slate-900">{booking.name || "Name not provided"}</h2>
                    <p className="mt-1 break-words text-sm font-medium text-slate-600">{booking.mobile || "Contact not provided"}</p>
                  </div>
                  <span className={`shrink-0 rounded-full border px-2.5 py-1 text-xs font-extrabold ${timing.style}`}>{timing.label}</span>
                </div>

                <div className="my-3 border-t border-slate-100" />
                <div className="grid grid-cols-2 gap-x-3 gap-y-4">
                  <div className="min-w-0">
                    <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">Date &amp; time</p>
                    <p className="mt-1 break-words text-sm font-bold text-slate-800">{formatDate(booking.date)}</p>
                    <p className="mt-0.5 break-words text-sm text-slate-600">{booking.slot || "Time not set"}</p>
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">Vehicle</p>
                    <p className="mt-1 break-words text-sm font-extrabold text-slate-900">{vehicle || "Vehicle details pending"}</p>
                    <p className="mt-0.5 break-words text-xs text-slate-600">{booking.inspectionLabel || booking.inspectionType || "Standard PDI"}</p>
                  </div>
                  <div className="col-span-2 min-w-0">
                    <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">Location</p>
                    <p className="mt-1 break-words text-sm font-semibold leading-5 text-slate-800">{location || "Location not provided"}</p>
                  </div>
                </div>

                {timing.detail && <p className="mt-3 text-xs leading-5 text-slate-500">{timing.detail}</p>}
                <p className="mt-3 break-all text-[11px] font-medium text-slate-400">Booking ID: {booking.id}</p>
                <div className="mt-4">
                  {confirmed ? (
                    <button type="button" onClick={() => startPdi(booking)} className="inline-flex min-h-11 w-full items-center justify-center rounded-xl !bg-blue-600 px-4 py-3 text-sm font-extrabold !text-white shadow-sm transition-colors hover:!bg-blue-700">Start PDI →</button>
                  ) : (
                    <div className="rounded-xl bg-slate-50 px-3 py-2.5 text-center text-sm font-bold text-slate-500">
                      {timing.label === "Completed" ? "Report completed" : "Not available"}
                    </div>
                  )}
                </div>
              </article>
            );
          })}
        </div>

        {/* Desktop/tablet: retain the detailed table layout. */}
        <div className="hidden overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm md:block">
          <div className="min-w-[1050px]">
            <div className="grid grid-cols-[1.1fr_1.2fr_1.25fr_1.45fr_150px] items-center gap-4 border-b border-slate-200 bg-slate-50 px-5 py-4 text-sm font-extrabold text-slate-700">
              <div>Name</div>
              <div>Date &amp; Time</div>
              <div>Location</div>
              <div>Brand &amp; Model</div>
              <div className="text-center">Start PDI</div>
            </div>
            <div className="divide-y divide-slate-100">
              {filtered.map((booking) => {
                const timing: Timing = getTiming(booking, now);
                const confirmed = booking.status.trim().toLowerCase() === "confirmed";
                const location = [booking.location || booking.address, booking.city].filter(Boolean).join(", ");
                const vehicle = [booking.carBrand, booking.carModel].filter(Boolean).join(" ");

                return (
                  <div key={booking.id} className="grid grid-cols-[1.1fr_1.2fr_1.25fr_1.45fr_150px] items-center gap-4 px-5 py-5 transition hover:bg-blue-50/40">
                    <div className="min-w-0">
                      <p className="break-words text-base font-extrabold leading-6 text-slate-900">{booking.name || "Name not provided"}</p>
                      <p className="mt-1 text-sm font-medium text-slate-600">{booking.mobile || "Contact not provided"}</p>
                      <p className="mt-1 text-xs font-semibold text-slate-500">Booking ID: {booking.id}</p>
                    </div>
                    <div className="min-w-0">
                      <p className="text-base font-bold leading-6 text-slate-900">{formatDate(booking.date)}</p>
                      <p className="mt-1 text-sm font-semibold text-slate-700">{booking.slot || "Time not set"}</p>
                      <span className={`mt-2 inline-flex rounded-full border px-2.5 py-1 text-xs font-extrabold ${timing.style}`}>{timing.label}</span>
                      {timing.detail && <p className="mt-1 text-xs font-medium leading-5 text-slate-500">{timing.detail}</p>}
                    </div>
                    <div className="min-w-0">
                      <p className="break-words text-base font-semibold leading-6 text-slate-800">{location || "Location not provided"}</p>
                    </div>
                    <div className="min-w-0">
                      <p className="break-words text-base font-extrabold leading-6 text-slate-900">{vehicle || "Vehicle details pending"}</p>
                      <p className="mt-1 text-sm font-medium text-slate-600">{booking.inspectionLabel || booking.inspectionType || "Standard PDI"}</p>
                      <p className="mt-1 text-xs font-semibold text-slate-500">Booking status: <span className="capitalize">{booking.status || "Unknown"}</span></p>
                    </div>
                    <div className="flex justify-center">
                      {confirmed ? (
                        <button type="button" onClick={() => startPdi(booking)} className="inline-flex min-h-12 w-full items-center justify-center rounded-xl !bg-blue-600 px-4 py-3 text-sm font-extrabold !text-white shadow-sm transition-colors hover:!bg-blue-700">Start PDI →</button>
                      ) : (
                        <span className="text-center text-sm font-bold text-slate-500">{timing.label === "Completed" ? "Report completed" : "Not available"}</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </>
    )}
    <div aria-hidden="true" className="h-16 sm:h-20 lg:h-24" />
  </InspectorAppShell>;
}
function Info({ label, value }: { label: string; value: string }) { return <div className="min-w-0"><p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">{label}</p><p className="mt-0.5 break-words text-xs font-bold leading-4 text-slate-800">{value}</p></div>; }
