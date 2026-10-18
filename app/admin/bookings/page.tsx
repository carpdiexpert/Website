
"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  type User,
} from "firebase/auth";
import { auth } from "@/lib/firebase";
import AdminAppShell from "../AdminAppShell";

type Booking = {
  id: string;
  name?: string;
  customerName?: string;
  mobile?: string;
  phone?: string;
  email?: string;
  city?: string;
  address?: string;
  location?: string;
  carBrand?: string;
  carModel?: string;
  inspectionType?: string;
  date?: string;
  time?: string;
  slot?: string;
  status?: string;
  amount?: number | string;
  price?: number | string;
  totalAmount?: number | string;
  inspectorId?: string;
  inspectorName?: string;
  [key: string]: unknown;
};

type Inspector = {
  id: string;
  name?: string;
  email?: string;
  city?: string;
  status?: string;
};

type BlockedSlot = {
  id: string;
  city?: string;
  citySlug?: string;
  date: string;
  type: "day" | "slot";
  slot?: string | null;
  reason?: string;
};

type SortOption = "date-asc" | "date-desc" | "customer-asc";
type BookingStatus = "pending" | "confirmed" | "completed" | "approved" | "cancelled";

const BOOKING_STATUSES: BookingStatus[] = ["pending", "confirmed", "completed", "approved", "cancelled"];

const inputClass =
  "w-full rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm text-slate-900 outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100";

const buttonClass =
  "rounded-lg bg-blue-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-blue-700 disabled:opacity-50";

const compactInputClass =
  "w-full min-w-0 rounded-lg border border-slate-200 bg-white px-2.5 py-2 text-xs text-slate-900 outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100";

function pad(n: number) {
  return String(n).padStart(2, "0");
}

function toDateString(date: Date) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

function monthStart(date: Date) {
  return toDateString(new Date(date.getFullYear(), date.getMonth(), 1));
}

function monthEnd(date: Date) {
  return toDateString(new Date(date.getFullYear(), date.getMonth() + 1, 0));
}

function parseDate(value?: string) {
  if (!value) return Number.MAX_SAFE_INTEGER;
  const match = value.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/);

  if (match) {
    return new Date(
      Number(match[1]),
      Number(match[2]) - 1,
      Number(match[3]),
    ).getTime();
  }

  const parsed = new Date(value).getTime();
  return Number.isNaN(parsed) ? Number.MAX_SAFE_INTEGER : parsed;
}

function parseTime(value?: string) {
  if (!value) return Number.MAX_SAFE_INTEGER;

  const match = value.trim().toUpperCase().match(
    /^(\d{1,2})(?::(\d{2}))?\s*(AM|PM)?$/,
  );

  if (!match) return Number.MAX_SAFE_INTEGER;

  let hours = Number(match[1]);
  const minutes = Number(match[2] || 0);
  const meridiem = match[3];

  if (minutes > 59 || hours > 24) return Number.MAX_SAFE_INTEGER;

  if (meridiem) {
    if (hours < 1 || hours > 12) return Number.MAX_SAFE_INTEGER;
    if (meridiem === "AM" && hours === 12) hours = 0;
    if (meridiem === "PM" && hours !== 12) hours += 12;
  }

  return hours * 60 + minutes;
}

function customerName(b: Booking) {
  return b.name || b.customerName || "Customer";
}

function bookingTime(b: Booking) {
  return b.time || b.slot || "";
}

function vehicleName(b: Booking) {
  return [b.carBrand, b.carModel].filter(Boolean).join(" ") || "Car";
}

function bookingAmount(b: Booking) {
  const value = b.amount ?? b.totalAmount ?? b.price;
  const amount = Number(value);
  return Number.isFinite(amount) && amount >= 0 ? amount : null;
}

function formattedDate(value?: string) {
  const timestamp = parseDate(value);
  if (!value || timestamp === Number.MAX_SAFE_INTEGER) {
    return value || "Date not set";
  }

  return new Date(timestamp).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function heatClass(count: number) {
  if (count === 0) return "bg-slate-50 border-slate-100 text-slate-600";
  if (count <= 2) return "bg-sky-100 border-sky-200 text-slate-800";
  if (count <= 5) return "bg-sky-200 border-sky-300 text-slate-800";
  if (count <= 9) return "bg-sky-300 border-sky-400 text-slate-900";
  return "bg-blue-600 border-blue-700 text-white";
}

function whatsappLink(phone: string, message: string) {
  const digits = phone.replace(/\D/g, "");
  if (!digits) return "";
  const indianNumber = digits.length === 10 ? `91${digits}` : digits;
  return `https://wa.me/${indianNumber}?text=${encodeURIComponent(message)}`;
}

export default function BookingsPage() {
  const [user, setUser] = useState<User | null>(null);
  const [ready, setReady] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Do not read the current time during prerender.
  const [calendarMonth, setCalendarMonth] = useState<Date | null>(null);
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [inspectors, setInspectors] = useState<Inspector[]>([]);
  const [blockedSlots, setBlockedSlots] = useState<BlockedSlot[]>([]);
  const [loading, setLoading] = useState(false);
  const [actionBusy, setActionBusy] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>("date-asc");
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [showAllDates, setShowAllDates] = useState(true);
  const [assignment, setAssignment] = useState<Record<string, string>>({});
  const [invoiceAmounts, setInvoiceAmounts] = useState<Record<string, string>>(
    {},
  );

  useEffect(() => {
    const now = new Date();
    const first = new Date(now.getFullYear(), now.getMonth(), 1);

    setCalendarMonth(first);
    setStart(monthStart(first));
    setEnd(monthEnd(first));

    return onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setReady(true);
    });
  }, []);

  const callApi = useCallback(
    async (
      path: string,
      method = "GET",
      body?: Record<string, unknown>,
    ) => {
      if (!user) throw new Error("Please sign in again.");

      const token = await user.getIdToken();
      const response = await fetch(path, {
        method,
        headers: {
          Authorization: `Bearer ${token}`,
          ...(body ? { "Content-Type": "application/json" } : {}),
        },
        body: body ? JSON.stringify(body) : undefined,
        cache: "no-store",
      });

      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(data.error || `Request failed (${response.status})`);
      }
      return data;
    },
    [user],
  );

  const loadBookings = useCallback(
    async (from = start, to = end) => {
      if (!user || !from || !to) return;

      if (from > to) {
        setError("Start date must be on or before end date.");
        return;
      }

      setLoading(true);
      setError("");

      try {
        const params = new URLSearchParams({ start: from, end: to });
        const data = await callApi(`/api/admin/bookings?${params}`);

        setBookings(Array.isArray(data.bookings) ? data.bookings : []);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Could not load bookings.");
        setBookings([]);
      } finally {
        setLoading(false);
      }
    },
    [user, start, end, callApi],
  );

  const loadInspectors = useCallback(async () => {
    try {
      const data = await callApi("/api/admin/inspectors");
      setInspectors(
        Array.isArray(data.inspectors)
          ? data.inspectors.filter(
              (item: Inspector) => item.status === "active",
            )
          : [],
      );
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Could not load inspectors.",
      );
    }
  }, [callApi]);

  const loadBlockedSlots = useCallback(async () => {
    try {
      const data = await callApi("/api/admin/slots");
      setBlockedSlots(Array.isArray(data.blocks) ? data.blocks : []);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Could not load blocked slots.",
      );
      setBlockedSlots([]);
    }
  }, [callApi]);

  useEffect(() => {
    if (!user || !start || !end) return;
    void loadBookings(start, end);
    void loadInspectors();
    void loadBlockedSlots();
  }, [user, start, end, loadBookings, loadInspectors, loadBlockedSlots]);

  async function login(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    try {
      await signInWithEmailAndPassword(auth, email.trim(), password);
      setPassword("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sign in failed.");
    }
  }

  function changeMonth(offset: number) {
    if (!calendarMonth) return;
    const next = new Date(
      calendarMonth.getFullYear(),
      calendarMonth.getMonth() + offset,
      1,
    );
    setCalendarMonth(next);
    setStart(monthStart(next));
    setEnd(monthEnd(next));
    setSelectedDate(null);
    setShowAllDates(true);
  }

  async function applyRange() {
    if (!start || !end || start > end) {
      setError("Choose a valid date range.");
      return;
    }

    const next = new Date(`${start}T12:00:00`);
    setCalendarMonth(new Date(next.getFullYear(), next.getMonth(), 1));
    setSelectedDate(null);
    setShowAllDates(true);
    await loadBookings(start, end);
  }

  async function assignInspector(booking: Booking) {
    const inspectorId = assignment[booking.id] || booking.inspectorId;
    const inspector = inspectors.find((item) => item.id === inspectorId);

    if (!inspectorId || !inspector) {
      setError("Select an active inspector first.");
      return;
    }

    setActionBusy(booking.id);
    setError("");
    setNotice("");

    try {
      await callApi("/api/admin/bookings", "PATCH", {
        id: booking.id,
        inspectorId: inspector.id,
        inspectorName: inspector.name || inspector.email || "Inspector",
        status: "confirmed",
      });

      setNotice(`Assigned ${inspector.name || "inspector"} to ${customerName(booking)}.`);
      await loadBookings();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Could not assign inspector. Check the bookings API PATCH handler.",
      );
    } finally {
      setActionBusy(null);
    }
  }

  async function changeBookingStatus(booking: Booking, nextStatus: BookingStatus) {
    const currentStatus = (booking.status || "pending").toLowerCase();
    if (currentStatus === nextStatus) return;
    if (nextStatus === "confirmed" && !booking.inspectorId) {
      setError("Assign an inspector before setting the booking to Confirmed.");
      return;
    }
    if (nextStatus === "approved" && currentStatus !== "completed") {
      setError("Only a Completed booking can be approved. Mark it Completed after the inspector submits the report.");
      return;
    }
    setActionBusy(booking.id);
    setError("");
    setNotice("");
    try {
      await callApi("/api/admin/bookings", "PATCH", { id: booking.id, status: nextStatus });
      setNotice(`Booking status changed to ${nextStatus[0].toUpperCase()}${nextStatus.slice(1)}.`);
      await loadBookings();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not update booking status.");
    } finally {
      setActionBusy(null);
    }
  }

  function openCustomerWhatsApp(booking: Booking, kind: "confirm" | "invoice" | "cancel") {
    const phone = booking.mobile || booking.phone || "";
    if (!phone) {
      setError("This booking has no customer mobile number.");
      return;
    }

    const name = customerName(booking);
    const vehicle = vehicleName(booking);
    const date = formattedDate(booking.date);
    const time = bookingTime(booking) || "the scheduled time";
    const amount = invoiceAmounts[booking.id] ?? String(bookingAmount(booking) ?? "");

    let message = "";

    if (kind === "confirm") {
      if (!booking.inspectorId && !assignment[booking.id]) {
        setError("Assign an inspector before notifying the customer.");
        return;
      }

      message =
        `Your booking for ${vehicle} is confirmed for ${date} at ${time}. ` +
        `${booking.inspectorName || inspectors.find((i) => i.id === assignment[booking.id])?.name || "Our inspector"} will do the PDI/PPI of your car. ` +
        `Please be available on time. Thank you, CarPDIExpert Team.`;
    } else if (kind === "invoice") {
      if (!amount.trim() || !Number.isFinite(Number(amount)) || Number(amount) < 0) {
        setError("Enter a valid invoice amount first.");
        return;
      }

      message =
        `Your booking for ${vehicle} on ${date} at ${time} is confirmed. ` +
        `Invoice amount: ₹${Number(amount).toLocaleString("en-IN")}. ` +
        `Thank you, CarPDIExpert Team.`;
    } else {
      message =
        "As per your request, your booking has been cancelled. " +
        "You are liable to pay a cancellation amount of ₹399. " +
        "For any queries, please refer to our cancellation terms. " +
        "Thank you, CarPDIExpert Team.";
    }

    const url = whatsappLink(phone, message);
    if (!url) {
      setError("Could not create a WhatsApp link for this mobile number.");
      return;
    }

    window.open(url, "_blank", "noopener,noreferrer");
  }

  async function cancelBooking(booking: Booking) {
    const confirmed = window.confirm(
      `Cancel the booking for ${customerName(booking)}? This will update its status.`,
    );
    if (!confirmed) return;

    setActionBusy(booking.id);
    setError("");
    setNotice("");

    try {
      await callApi("/api/admin/bookings", "PATCH", {
        id: booking.id,
        status: "cancelled",
      });

      setNotice("Booking cancelled. You can now send the WhatsApp cancellation message.");
      await loadBookings();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Could not cancel booking. Check the bookings API PATCH handler.",
      );
    } finally {
      setActionBusy(null);
    }
  }

  const bookingCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const booking of bookings) {
      if (booking.date) counts[booking.date] = (counts[booking.date] || 0) + 1;
    }
    return counts;
  }, [bookings]);

  const blockedByDate = useMemo(() => {
    const grouped: Record<string, BlockedSlot[]> = {};
    for (const block of blockedSlots) {
      if (!block.date) continue;
      if (!grouped[block.date]) grouped[block.date] = [];
      grouped[block.date].push(block);
    }
    return grouped;
  }, [blockedSlots]);

  const bookingsByDate = useMemo(() => {
    const grouped: Record<string, Booking[]> = {};
    for (const booking of bookings) {
      if (!booking.date) continue;
      if (!grouped[booking.date]) grouped[booking.date] = [];
      grouped[booking.date].push(booking);
    }
    for (const dayBookings of Object.values(grouped)) {
      dayBookings.sort((a, b) => {
        const timeDifference = parseTime(bookingTime(a)) - parseTime(bookingTime(b));
        return timeDifference || customerName(a).localeCompare(customerName(b));
      });
    }
    return grouped;
  }, [bookings]);

  const calendarCells = useMemo(() => {
    if (!calendarMonth) return [];
    const year = calendarMonth.getFullYear();
    const month = calendarMonth.getMonth();
    const blanks = (new Date(year, month, 1).getDay() + 6) % 7;
    const count = new Date(year, month + 1, 0).getDate();
    const cells: Array<{ date: string; day: number } | null> = [];

    for (let i = 0; i < blanks; i++) cells.push(null);
    for (let day = 1; day <= count; day++) {
      cells.push({ date: toDateString(new Date(year, month, day)), day });
    }
    while (cells.length % 7) cells.push(null);
    return cells;
  }, [calendarMonth]);

  const visibleBookings = useMemo(() => {
    const query = search.trim().toLowerCase();

    return bookings
      .filter((booking) => {
        if (!showAllDates && selectedDate && booking.date !== selectedDate) {
          return false;
        }

        if (!query) return true;

        return [
          customerName(booking),
          booking.mobile,
          booking.phone,
          booking.email,
          booking.city,
          booking.address,
          booking.location,
          booking.carBrand,
          booking.carModel,
          booking.inspectionType,
          booking.status,
          booking.date,
          bookingTime(booking),
          booking.inspectorName,
          booking.id,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase()
          .includes(query);
      })
      .sort((a, b) => {
        if (sortBy === "customer-asc") {
          return customerName(a).localeCompare(customerName(b));
        }

        const dateDifference = parseDate(a.date) - parseDate(b.date);
        const timeDifference = parseTime(bookingTime(a)) - parseTime(bookingTime(b));

        return sortBy === "date-desc"
          ? -dateDifference || timeDifference
          : dateDifference || timeDifference;
      });
  }, [bookings, search, selectedDate, showAllDates, sortBy]);

  if (!ready || !calendarMonth) {
    return <div className="p-10 text-sm text-slate-500">Loading admin…</div>;
  }

  if (!user) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-100 p-5">
        <form onSubmit={login} className="w-full max-w-md rounded-3xl bg-white p-8 shadow-xl">
          <p className="text-sm font-bold text-sky-600">CarPDIExpert CRM</p>
          <h1 className="mt-2 text-2xl font-black">Admin sign in</h1>
          <label className="mt-5 block text-sm font-semibold">
            Email
            <input className={`${inputClass} mt-2`} type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </label>
          <label className="mt-4 block text-sm font-semibold">
            Password
            <input className={`${inputClass} mt-2`} type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </label>
          {error && <p role="alert" className="mt-4 text-sm text-rose-600">{error}</p>}
          <button className={`${buttonClass} mt-5 w-full`}>Sign in</button>
        </form>
      </main>
    );
  }

  return (
    <AdminAppShell email={user.email}>
      <header className="mb-6">
        <p className="text-sm font-bold text-sky-600">Operations / Bookings</p>
        <h1 className="mt-1 text-3xl font-black tracking-tight text-slate-900">Bookings</h1>
        <p className="mt-2 text-sm text-slate-500">Manage booking status, inspector assignments, customer notifications, invoices and cancellations.</p>
      </header>

      {error && <p role="alert" className="mb-4 rounded-xl bg-rose-50 p-4 text-sm text-rose-700">{error}</p>}
      {notice && <p role="status" className="mb-4 rounded-xl bg-sky-50 p-4 text-sm text-sky-800">{notice}</p>}

      <section className="mb-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-black">Booking calendar</h2>
            <p className="mt-1 text-sm text-slate-500">Each date shows booking counts and city-specific blocked days or slots.</p>
          </div>
          <div className="flex items-center gap-2">
            <button type="button" onClick={() => changeMonth(-1)} className="rounded-lg border px-4 py-2" aria-label="Previous month">‹</button>
            <strong>{calendarMonth.toLocaleDateString("en-IN", { month: "long", year: "numeric" })}</strong>
            <button type="button" onClick={() => changeMonth(1)} className="rounded-lg border px-4 py-2" aria-label="Next month">›</button>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
          {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => (
            <div key={day} className="pb-2 text-center text-xs font-bold text-slate-500">{day}</div>
          ))}
          {calendarCells.map((cell, index) =>
            cell ? (
              <div key={cell.date} className="group relative min-w-0">
                <button
                  type="button"
                  title={`${bookingCounts[cell.date] || 0} bookings${(blockedByDate[cell.date] || []).length ? ` · ${(blockedByDate[cell.date] || []).length} blocks: ${(blockedByDate[cell.date] || []).map((block) => `${block.city || block.citySlug || "City"} ${block.type === "day" ? "whole day" : block.slot || "slot"}`).join(", ")}` : ""}`}
                  onClick={() => { setSelectedDate(cell.date); setShowAllDates(false); }}
                  className={`flex min-h-16 w-full flex-col items-center justify-center rounded-xl border p-1 sm:min-h-20 ${ (blockedByDate[cell.date] || []).some((block) => block.type === "day") ? "border-rose-300 bg-rose-100 text-rose-900" : heatClass(bookingCounts[cell.date] || 0)} ${!showAllDates && selectedDate === cell.date ? "ring-2 ring-blue-600 ring-offset-1" : ""}`}
                >
                  <span className="font-bold">{cell.day}</span>
                  <span className="mt-1 text-[10px] font-semibold sm:text-xs">{bookingCounts[cell.date] || 0} bookings</span>
                  {(blockedByDate[cell.date] || []).length > 0 && (
                    <span className="mt-0.5 max-w-full truncate rounded bg-rose-600 px-1 py-0.5 text-[9px] font-bold text-white sm:text-[10px]">
                      {(blockedByDate[cell.date] || []).some((block) => block.type === "day")
                        ? `${(blockedByDate[cell.date] || []).filter((block) => block.type === "day").length} day block`
                        : `${(blockedByDate[cell.date] || []).length} blocked`}
                    </span>
                  )}
                </button>
                <div className="pointer-events-none absolute left-1/2 bottom-full mb-2 z-30 hidden w-64 -translate-x-1/2 pt-2 group-hover:block group-focus-within:block sm:w-72">
                  <div className="rounded-xl border border-slate-200 bg-white p-3 text-left shadow-xl ring-1 ring-black/5">
                    <p className="mb-2 border-b border-slate-100 pb-2 text-xs font-black text-slate-900">{formattedDate(cell.date)} · {bookingsByDate[cell.date]?.length || 0} bookings</p>
                    {(bookingsByDate[cell.date] || []).length > 0 ? (
                      <div className="max-h-56 space-y-2 overflow-y-auto">
                        {(bookingsByDate[cell.date] || []).map((booking) => (
                          <div key={booking.id} className="border-b border-slate-100 pb-2 last:border-0 last:pb-0">
                            <p className="text-xs font-bold text-slate-900">{bookingTime(booking) || "Time not set"} · {customerName(booking)}</p>
                            <p className="mt-0.5 truncate text-[11px] text-slate-600">{String(booking.location || booking.address || "Location not set")}</p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-slate-500">No bookings for this day.</p>
                    )}
                  </div>
                </div>
              </div>
            ) : <div key={`blank-${index}`} className="min-h-16 sm:min-h-20" />,
          )}
        </div>

        {selectedDate && (blockedByDate[selectedDate] || []).length > 0 && (
          <div className="mt-4 rounded-xl border border-rose-200 bg-rose-50 p-4">
            <h3 className="text-sm font-black text-rose-900">Blocked availability · {formattedDate(selectedDate)}</h3>
            <ul className="mt-2 space-y-1.5">
              {(blockedByDate[selectedDate] || []).map((block) => (
                <li key={block.id} className="text-xs text-rose-800">
                  <strong>{block.city || block.citySlug || "City"}</strong>: {block.type === "day" ? "Entire day blocked" : `Blocked at ${block.slot || "time not specified"}`}
                  {block.reason ? ` · ${block.reason}` : ""}
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <span>Less</span>
            {[0, 1, 3, 6, 10].map((n) => <span key={n} className={`h-5 w-7 rounded border ${heatClass(n)}`} />)}
            <span>More</span>
          </div>
          <button type="button" onClick={() => { setSelectedDate(null); setShowAllDates(true); }} className="rounded-lg border px-3 py-2 text-sm font-bold">Show all dates</button>
        </div>
      </section>

      <section className="mb-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <label className="text-sm font-semibold">Start date<input type="date" className={`${inputClass} mt-2`} value={start} onChange={(e) => setStart(e.target.value)} /></label>
          <label className="text-sm font-semibold">End date<input type="date" className={`${inputClass} mt-2`} value={end} onChange={(e) => setEnd(e.target.value)} /></label>
          <label className="text-sm font-semibold">Sort by
            <select className={`${inputClass} mt-2`} value={sortBy} onChange={(e) => setSortBy(e.target.value as SortOption)}>
              <option value="date-asc">Date and time: earliest first</option>
              <option value="date-desc">Date: latest first</option>
              <option value="customer-asc">Customer: A–Z</option>
            </select>
          </label>
          <div className="flex items-end"><button type="button" className={`${buttonClass} w-full`} onClick={() => void applyRange()} disabled={loading}>{loading ? "Loading…" : "Apply date range"}</button></div>
        </div>
        <label className="mt-4 block text-sm font-semibold">Search bookings
          <input type="search" className={`${inputClass} mt-2`} placeholder="Customer, phone, car, inspector, city…" value={search} onChange={(e) => setSearch(e.target.value)} />
        </label>
      </section>

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b p-5">
          <h2 className="font-black">Booking records</h2>
          <span className="rounded-full bg-sky-50 px-3 py-1 text-sm font-bold text-sky-700">{visibleBookings.length} bookings</span>
        </div>

        {loading ? <p className="p-8 text-center text-slate-500">Loading bookings…</p> : visibleBookings.length === 0 ? <p className="p-10 text-center text-slate-500">No bookings found for these filters.</p> : (
          <div className="divide-y divide-slate-100">
            {visibleBookings.map((booking) => {
              const phone = booking.mobile || booking.phone || "";
              const assignedInspector = inspectors.find((i) => i.id === (assignment[booking.id] || booking.inspectorId));
              const amount = invoiceAmounts[booking.id] ?? String(bookingAmount(booking) ?? "");
              const status = ((booking.status || "pending").toLowerCase() === "canceled" ? "cancelled" : (booking.status || "pending").toLowerCase()) as BookingStatus;
              const cancelled = status === "cancelled";

              return (
                <article key={booking.id} className="px-3 py-3 transition hover:bg-slate-50 sm:px-4">
                  <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_minmax(420px,1.25fr)] lg:items-center">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-sm font-bold text-slate-900">{customerName(booking)}</h3>
                        <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold capitalize text-slate-700">{status}</span>
                      </div>
                      <p className="mt-0.5 text-xs text-slate-500">{phone || "No customer mobile"}{booking.email ? ` · ${booking.email}` : ""}</p>
                      <p className="mt-1 text-sm font-semibold text-slate-800">{vehicleName(booking)} <span className="font-normal text-slate-500">· {booking.inspectionType || "PDI/PPI"}</span></p>
                      <p className="mt-1 text-xs text-slate-600"><strong>{formattedDate(booking.date)} · {bookingTime(booking) || "Time not set"}</strong> · {booking.city || "City not set"}</p>
                      <p className="mt-0.5 truncate text-xs text-slate-500" title={String(booking.location || booking.address || "")}>Location: {String(booking.location || booking.address || "—")}</p>
                      <p className="mt-0.5 text-xs text-slate-500">Inspector: {booking.inspectorName || assignedInspector?.name || "Not assigned"} · ID: {booking.id}</p>
                    </div>

                    <div className="flex min-w-0 flex-wrap items-end gap-2">
                      <label className="w-full min-w-[150px] flex-1 text-[10px] font-bold text-slate-500 sm:w-auto">Status
                        <select aria-label={`Status for ${customerName(booking)}`} className={`${compactInputClass} mt-1 capitalize`} value={status} disabled={actionBusy === booking.id} onChange={(e) => void changeBookingStatus(booking, e.target.value as BookingStatus)}>
                          {BOOKING_STATUSES.map((item) => <option key={item} value={item}>{item[0].toUpperCase() + item.slice(1)}</option>)}
                        </select>
                      </label>
                      <label className="w-full min-w-[165px] flex-1 text-[10px] font-bold text-slate-500 sm:w-auto">Inspector
                        <select aria-label={`Inspector for ${customerName(booking)}`} className={`${compactInputClass} mt-1`} value={assignment[booking.id] ?? booking.inspectorId ?? ""} onChange={(e) => setAssignment((current) => ({ ...current, [booking.id]: e.target.value }))} disabled={cancelled || actionBusy === booking.id}>
                          <option value="">Select inspector</option>
                          {inspectors.map((inspector) => <option key={inspector.id} value={inspector.id}>{inspector.name || inspector.email}{inspector.city ? ` · ${inspector.city}` : ""}</option>)}
                        </select>
                      </label>
                      <button type="button" className={buttonClass} disabled={cancelled || actionBusy === booking.id || !inspectors.length} onClick={() => void assignInspector(booking)}>{actionBusy === booking.id ? "Saving…" : "Assign"}</button>
                      <button type="button" className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-800 hover:bg-emerald-100 disabled:opacity-50" disabled={cancelled || !phone} onClick={() => openCustomerWhatsApp(booking, "confirm")}>Notify</button>
                      <label className="w-28 text-[10px] font-bold text-slate-500">Invoice ₹
                        <input className={`${compactInputClass} mt-1`} type="number" min="0" step="1" value={amount} onChange={(e) => setInvoiceAmounts((current) => ({ ...current, [booking.id]: e.target.value }))} placeholder="Amount" />
                      </label>
                      <button type="button" className="rounded-lg border border-sky-200 bg-sky-50 px-3 py-2 text-xs font-semibold text-sky-800 hover:bg-sky-100 disabled:opacity-50" disabled={!phone || cancelled} onClick={() => openCustomerWhatsApp(booking, "invoice")}>Invoice</button>
                      {!cancelled ? <button type="button" className="rounded-lg border border-rose-200 px-3 py-2 text-xs font-semibold text-rose-700 hover:bg-rose-50 disabled:opacity-50" disabled={actionBusy === booking.id} onClick={() => void cancelBooking(booking)}>Cancel</button> : <button type="button" className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-semibold text-rose-700 disabled:opacity-50" disabled={!phone} onClick={() => openCustomerWhatsApp(booking, "cancel")}>WhatsApp cancellation</button>}
                      {!cancelled && <button type="button" className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-semibold text-rose-700 hover:bg-rose-100 disabled:opacity-50" disabled={!phone} onClick={() => openCustomerWhatsApp(booking, "cancel")}>Cancel message</button>}
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </AdminAppShell>
  );
}
