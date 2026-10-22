
"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  type User,
} from "firebase/auth";
import { auth } from "@/lib/firebase";
import { CITY_OPTIONS } from "@/lib/cityOptions";
import { BOOKING_SLOTS } from "@/lib/slots";
import AdminAppShell from "../AdminAppShell";

type Booking = {
  id: string;
  name?: string;
  customerName?: string;
  mobile?: string;
  phone?: string;
  city?: string;
  citySlug?: string;
  location?: string;
  address?: string;
  carBrand?: string;
  carModel?: string;
  inspectionType?: string;
  date?: string;
  time?: string;
  slot?: string;
  status?: string;
  inspectorName?: string;
};

type AvailabilitySlot = {
  slot: string;
  available: boolean;
  remaining?: number;
};

type Availability = {
  activeInspectors: number;
  totalCapacity: number;
  bookedSlots: number;
  availableSlots: number;
  slots: AvailabilitySlot[];
};

const inputClass =
  "w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100";

const initialCity =
  CITY_OPTIONS.find((city) => city.slug === "pune")?.slug ??
  CITY_OPTIONS[0]?.slug ??
  "";

function dateKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
    2,
    "0",
  )}-${String(date.getDate()).padStart(2, "0")}`;
}

function addDays(key: string, days: number) {
  const [year, month, day] = key.split("-").map(Number);
  return dateKey(new Date(year, month - 1, day + days));
}

function displayDate(value: string) {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, month - 1, day).toLocaleDateString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function customerName(booking: Booking) {
  return booking.name || booking.customerName || "Customer";
}

function phoneNumber(booking: Booking) {
  return booking.mobile || booking.phone || "";
}

function vehicleName(booking: Booking) {
  return (
    [booking.carBrand, booking.carModel].filter(Boolean).join(" ") ||
    "Car not specified"
  );
}

function timeValue(value?: string) {
  if (!value) return Number.MAX_SAFE_INTEGER;

  const match = value.trim().toUpperCase().match(
    /^(\d{1,2})(?::(\d{2}))?\s*(AM|PM)?$/,
  );

  if (!match) return Number.MAX_SAFE_INTEGER;

  let hours = Number(match[1]);
  const minutes = Number(match[2] || 0);

  if (minutes > 59) return Number.MAX_SAFE_INTEGER;

  if (match[3]) {
    if (hours < 1 || hours > 12) return Number.MAX_SAFE_INTEGER;
    if (match[3] === "AM" && hours === 12) hours = 0;
    if (match[3] === "PM" && hours !== 12) hours += 12;
  }

  return hours * 60 + minutes;
}

function formatTime(value: string) {
  const match = value.match(/^(\d{2}):(\d{2})$/);

  if (match) {
    const [hours, minutes] = match.slice(1).map(Number);
    const date = new Date(2000, 0, 1, hours, minutes);

    return date.toLocaleTimeString("en-IN", {
      hour: "numeric",
      minute: "2-digit",
    });
  }

  return value;
}

function statusClass(status?: string) {
  switch ((status || "pending").toLowerCase()) {
    case "confirmed":
      return "bg-blue-50 text-blue-700";
    case "completed":
      return "bg-emerald-50 text-emerald-700";
    case "approved":
      return "bg-violet-50 text-violet-700";
    case "cancelled":
    case "canceled":
      return "bg-rose-50 text-rose-700";
    default:
      return "bg-amber-50 text-amber-800";
  }
}

export default function SchedulesPage() {
  const [user, setUser] = useState<User | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [today, setToday] = useState("");
  const [dateMode, setDateMode] = useState("today");
  const [customDate, setCustomDate] = useState("");
  const [city, setCity] = useState(initialCity);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [availability, setAvailability] = useState<Availability | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);

  useEffect(() => {
    setToday(dateKey(new Date()));

    return onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setAuthReady(true);
    });
  }, []);

  const selectedDate = useMemo(() => {
    if (!today) return "";
    if (dateMode === "tomorrow") return addDays(today, 1);
    if (dateMode === "custom") return customDate;
    return today;
  }, [today, dateMode, customDate]);

  const loadSchedules = useCallback(async () => {
    if (!user || !selectedDate || !city) return;

    setLoading(true);
    setError("");
    setAvailability(null);

    try {
      const token = await user.getIdToken();
      const headers = { Authorization: `Bearer ${token}` };

      const [bookingResponse, availabilityResponse] = await Promise.all([
        fetch(
          `/api/admin/bookings?start=${encodeURIComponent(selectedDate)}&end=${encodeURIComponent(selectedDate)}`,
          { headers, cache: "no-store" },
        ),
        fetch(
          `/api/bookings?city=${encodeURIComponent(city)}&date=${encodeURIComponent(selectedDate)}`,
          { cache: "no-store" },
        ),
      ]);

      const bookingData = await bookingResponse.json().catch(() => ({}));
      const availabilityData = await availabilityResponse.json().catch(() => ({}));

      if (!bookingResponse.ok) {
        throw new Error(bookingData.error || "Could not load appointments.");
      }

      if (!availabilityResponse.ok) {
        throw new Error(
          availabilityData.error || "Could not load slot availability.",
        );
      }

      const allBookings: Booking[] = Array.isArray(bookingData.bookings)
        ? bookingData.bookings
        : [];

      const selectedCity = CITY_OPTIONS.find((item) => item.slug === city);
      const cityName = selectedCity?.name ?? city;

      setBookings(
        allBookings
          .filter((booking) => {
            const bookingCity = (booking.citySlug || "").toLowerCase();
            const bookingCityName = (booking.city || "").toLowerCase();

            return (
              bookingCity === city.toLowerCase() ||
              bookingCityName === cityName.toLowerCase()
            );
          })
          .sort(
            (a, b) =>
              timeValue(a.time || a.slot) - timeValue(b.time || b.slot),
          ),
      );

      const slots: AvailabilitySlot[] = Array.isArray(availabilityData.slots)
        ? availabilityData.slots.map((slot: AvailabilitySlot) => ({
            slot: slot.slot,
            available: slot.available,
            remaining: slot.remaining,
          }))
        : [];

      setAvailability({
        activeInspectors: Number(availabilityData.activeInspectors || 0),
        totalCapacity: Number(availabilityData.totalCapacity || 0),
        bookedSlots: Number(availabilityData.bookedSlots || 0),
        availableSlots: Number(availabilityData.availableSlots || 0),
        slots,
      });
    } catch (err) {
      setBookings([]);
      setAvailability(null);
      setError(
        err instanceof Error ? err.message : "Could not load schedules.",
      );
    } finally {
      setLoading(false);
    }
  }, [user, selectedDate, city]);

  useEffect(() => {
    void loadSchedules();
  }, [loadSchedules]);

  async function login(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoginLoading(true);
    setError("");

    try {
      await signInWithEmailAndPassword(auth, email.trim(), password);
      setPassword("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sign in failed.");
    } finally {
      setLoginLoading(false);
    }
  }

  if (!authReady || !today) {
    return <div className="p-8 text-sm text-slate-500">Loading schedules…</div>;
  }

  if (!user) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-100 p-5">
        <form
          onSubmit={login}
          className="w-full max-w-md rounded-3xl bg-white p-8 shadow-xl"
        >
          <p className="text-sm font-bold text-sky-600">CarPDIExpert CRM</p>
          <h1 className="mt-2 text-2xl font-black text-slate-900">
            Admin sign in
          </h1>

          <label className="mt-5 block text-sm font-semibold text-slate-700">
            Email
            <input
              className={`${inputClass} mt-2`}
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
          </label>

          <label className="mt-4 block text-sm font-semibold text-slate-700">
            Password
            <input
              className={`${inputClass} mt-2`}
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
            />
          </label>

          {error && <p className="mt-4 text-sm text-rose-600">{error}</p>}

          <button
            className="mt-5 w-full rounded-xl bg-blue-600 px-4 py-3 text-sm font-bold text-white disabled:opacity-50"
            disabled={loginLoading}
          >
            {loginLoading ? "Signing in…" : "Sign in"}
          </button>
        </form>
      </main>
    );
  }

  const displayedSlots: AvailabilitySlot[] = availability?.slots.length
    ? availability.slots
    : BOOKING_SLOTS.map((slot): AvailabilitySlot => ({
        slot,
        available: false,
      }));

  return (
    <AdminAppShell email={user.email}>
      <header className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-sky-600">
            Operations / Schedules
          </p>
          <h1 className="mt-1 text-3xl font-black tracking-tight text-slate-900">
            Daily Schedules
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            Check appointments and available slots while speaking with customers.
          </p>
        </div>

        <button
          type="button"
          onClick={() => void loadSchedules()}
          disabled={loading}
          className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
        >
          {loading ? "Refreshing…" : "Refresh"}
        </button>
      </header>

      {error && (
        <div
          role="alert"
          className="mb-4 rounded-xl border border-rose-100 bg-rose-50 p-3 text-sm text-rose-700"
        >
          {error}
        </div>
      )}

      <section className="mb-5 grid gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:grid-cols-2">
        <label className="text-sm font-semibold text-slate-700">
          Schedule date
          <select
            className={`${inputClass} mt-2`}
            value={dateMode}
            onChange={(event) => setDateMode(event.target.value)}
          >
            <option value="today">Today — {today}</option>
            <option value="tomorrow">Tomorrow — {addDays(today, 1)}</option>
            <option value="custom">Choose a future date</option>
          </select>
        </label>

        <label className="text-sm font-semibold text-slate-700">
          City
          <select
            className={`${inputClass} mt-2`}
            value={city}
            onChange={(event) => setCity(event.target.value)}
          >
            {CITY_OPTIONS.map((item) => (
              <option key={item.slug} value={item.slug}>
                {item.name}
              </option>
            ))}
          </select>
        </label>

        {dateMode === "custom" && (
          <label className="text-sm font-semibold text-slate-700 sm:col-span-2">
            Select date
            <input
              type="date"
              min={today}
              className={`${inputClass} mt-2`}
              value={customDate}
              onChange={(event) => setCustomDate(event.target.value)}
              required
            />
          </label>
        )}
      </section>

      <div className="mb-5">
        <h2 className="text-lg font-black text-slate-900">
          {selectedDate ? displayDate(selectedDate) : "Choose a date"}
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          {CITY_OPTIONS.find((item) => item.slug === city)?.name || city}
        </p>
      </div>

      <section className="mb-6 grid grid-cols-2 gap-3 xl:grid-cols-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-4">
          <p className="text-xs font-semibold text-slate-500">Appointments</p>
          <p className="mt-1 text-2xl font-black text-slate-900">
            {loading ? "—" : bookings.length}
          </p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-4">
          <p className="text-xs font-semibold text-slate-500">Active inspectors</p>
          <p className="mt-1 text-2xl font-black text-slate-900">
            {availability?.activeInspectors ?? "—"}
          </p>
        </div>
        <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-4">
          <p className="text-xs font-semibold text-emerald-800">Available slots</p>
          <p className="mt-1 text-2xl font-black text-emerald-900">
            {availability?.availableSlots ?? "—"}
          </p>
        </div>
        <div className="rounded-2xl border border-amber-100 bg-amber-50 p-4">
          <p className="text-xs font-semibold text-amber-800">Booked capacity</p>
          <p className="mt-1 text-2xl font-black text-amber-900">
            {availability
              ? `${availability.bookedSlots} / ${availability.totalCapacity}`
              : "—"}
          </p>
        </div>
      </section>

      <section className="mb-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <div>
            <h2 className="font-black text-slate-900">Time slot availability</h2>
            <p className="mt-1 text-xs text-slate-500">
              Based on active inspectors and current reservations.
            </p>
          </div>
          <div className="flex gap-3 text-xs font-semibold">
            <span className="text-emerald-700">● Available</span>
            <span className="text-rose-700">● Full</span>
          </div>
        </div>

        {loading && !availability ? (
          <p className="py-5 text-sm text-slate-500">Checking availability…</p>
        ) : !availability ? (
          <p className="py-5 text-sm text-slate-500">
            Availability is not available right now.
          </p>
        ) : (
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
            {displayedSlots.map((slot) => (
              <div
                key={slot.slot}
                className={`rounded-xl border px-3 py-3 ${
                  slot.available
                    ? "border-emerald-200 bg-emerald-50"
                    : "border-rose-100 bg-rose-50"
                }`}
              >
                <p className="text-sm font-bold text-slate-900">
                  {formatTime(slot.slot)}
                </p>
                <p
                  className={`mt-1 text-xs font-semibold ${
                    slot.available ? "text-emerald-700" : "text-rose-700"
                  }`}
                >
                  {slot.available
                    ? `Available${
                        typeof slot.remaining === "number"
                          ? ` · ${slot.remaining} left`
                          : ""
                      }`
                    : "Booked"}
                </p>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-4 py-4">
          <h2 className="font-black text-slate-900">Scheduled appointments</h2>
          <span className="rounded-full bg-sky-50 px-3 py-1 text-xs font-bold text-sky-700">
            {bookings.length} bookings
          </span>
        </div>

        {loading ? (
          <p className="p-8 text-center text-sm text-slate-500">
            Loading appointments…
          </p>
        ) : bookings.length === 0 ? (
          <div className="p-8 text-center">
            <p className="font-bold text-slate-800">
              No appointments for this date
            </p>
            <p className="mt-1 text-sm text-slate-500">
              Use the availability grid above to tell callers which slots are open.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {bookings.map((booking) => (
              <article
                key={booking.id}
                className="flex flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-bold text-slate-900">
                      {customerName(booking)}
                    </h3>
                    <span
                      className={`rounded-full px-2 py-1 text-[11px] font-bold capitalize ${statusClass(booking.status)}`}
                    >
                      {booking.status || "Pending"}
                    </span>
                  </div>
                  <p className="mt-1 text-sm font-semibold text-slate-700">
                    {vehicleName(booking)}
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    {booking.inspectionType || "PDI/PPI"} ·{" "}
                    {booking.location ||
                      booking.address ||
                      "Location not provided"}
                  </p>
                </div>

                <div className="shrink-0 sm:text-right">
                  <p className="text-sm font-black text-slate-900">
                    {formatTime(booking.time || booking.slot || "Time not set")}
                  </p>
                  <p className="mt-1 text-xs text-slate-600">
                    Inspector: {booking.inspectorName || "Not assigned"}
                  </p>
                  {phoneNumber(booking) ? (
                    <a
                      href={`tel:${phoneNumber(booking).replace(/[^\d+]/g, "")}`}
                      className="mt-2 inline-block text-sm font-bold text-blue-700 hover:underline"
                    >
                      {phoneNumber(booking)}
                    </a>
                  ) : (
                    <p className="mt-2 text-xs text-slate-400">
                      No phone number
                    </p>
                  )}
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </AdminAppShell>
  );
}
