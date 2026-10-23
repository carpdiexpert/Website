
"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useCity } from "@/components/CityProvider";
import { CITIES } from "@/lib/cities";
import { CITY_OPTIONS } from "@/lib/cityOptions";
import { BOOKING_SLOTS } from "@/lib/slots";

const cities = CITY_OPTIONS;

const typeLabels: Record<string, string> = {
  standard: "Standard PDI",
  luxury: "Luxury PDI",
  ev: "EV PDI",
  used: "Used-car PPI",
};

const slotLabels: Record<string, string> = {
  "09:00": "9:00 AM",
  "10:30": "10:30 AM",
  "12:00": "12:00 PM",
  "13:30": "1:30 PM",
  "15:00": "3:00 PM",
  "16:30": "4:30 PM",
  "18:00": "6:00 PM",
};

type CarModelRecord = {
  id: string;
  brand: string;
  model: string;
  category?: string;
  active?: boolean;
};

const inputClass =
  "w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-100";

type DayAvailability = {
  available: number | null;
  total: number;
  booked: number | null;
  blocked?: boolean;
};

function getLocalDateString(date = new Date()) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
    2,
    "0"
  )}-${String(date.getDate()).padStart(2, "0")}`;
}

function getDateFromKey(key: string) {
  const [year, month, day] = key.split("-").map(Number);
  return new Date(year, month - 1, day);
}

function getMonthKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
    2,
    "0"
  )}`;
}

function price(city: string, type: string): number | null {
  const config = CITIES[city as keyof typeof CITIES];

  if (!config) return null;
  if (type === "standard") return config.newCars.standardCars;
  if (type === "luxury") return config.newCars.luxuryCars;
  if (type === "ev") return config.newCars.evCars;
  if (type === "used") return config.usedCar;

  return null;
}

function normalizeCarCategory(category?: string): "standard" | "luxury" | "ev" {
  const normalized = category?.trim().toLowerCase();
  if (normalized === "luxury" || normalized === "ev") return normalized;
  return "standard";
}

function getHeatmapStyle(info?: DayAvailability) {
  if (info?.blocked) {
    return {
      background: "bg-red-600",
      text: "text-white",
      border: "border-red-700",
      label: "Unavailable · blocked by admin",
    };
  }

  if (!info || info.available === null || info.booked === null) {
    return {
      background: "bg-slate-100",
      text: "text-slate-500",
      border: "border-slate-200",
      label: "Availability not loaded",
    };
  }

  if (info.booked === 0) {
    return {
      background: "bg-green-500",
      text: "text-white",
      border: "border-green-600",
      label: "Empty · 0 bookings",
    };
  }

  if (info.available === 0) {
    return {
      background: "bg-red-500",
      text: "text-white",
      border: "border-red-600",
      label: `Fully booked · ${info.booked} booked slots`,
    };
  }

  const occupancy = info.booked / Math.max(info.total, 1);

  if (occupancy <= 0.25) {
    return {
      background: "bg-lime-400",
      text: "text-slate-900",
      border: "border-lime-500",
      label: `Low occupancy · ${info.booked} booked`,
    };
  }

  if (occupancy <= 0.5) {
    return {
      background: "bg-yellow-400",
      text: "text-slate-900",
      border: "border-yellow-500",
      label: `Medium occupancy · ${info.booked} booked`,
    };
  }

  if (occupancy <= 0.75) {
    return {
      background: "bg-orange-400",
      text: "text-slate-900",
      border: "border-orange-500",
      label: `High occupancy · ${info.booked} booked`,
    };
  }

  return {
    background: "bg-orange-600",
    text: "text-white",
    border: "border-orange-700",
    label: `Nearly full · ${info.booked} booked`,
  };
}

function parseAvailability(data: unknown): {
  slots: string[];
  info: DayAvailability;
} | null {
  if (!data || typeof data !== "object" || !("slots" in data)) {
    return null;
  }

  const responseData = data as { slots?: unknown; dayBlocked?: boolean };
  const rawSlots = responseData.slots;

  if (!Array.isArray(rawSlots)) return null;

  const dayBlocked = responseData.dayBlocked === true;

  if (rawSlots.length === 0) {
    return {
      slots: [...BOOKING_SLOTS],
      info: {
        available: dayBlocked ? 0 : BOOKING_SLOTS.length,
        total: BOOKING_SLOTS.length,
        booked: dayBlocked ? BOOKING_SLOTS.length : 0,
        blocked: dayBlocked,
      },
    };
  }

  const slots = rawSlots as { slot?: string; available?: boolean }[];

  const availableSlots = slots
    .filter((item) => item.available === true && typeof item.slot === "string")
    .map((item) => item.slot as string);

  return {
    slots: availableSlots,
    info: {
      available: availableSlots.length,
      total: slots.length,
      booked: slots.length - availableSlots.length,
      blocked: dayBlocked,
    },
  };
}

export default function BookingChatbot() {
  const { city: sharedCity, setCity } = useCity();

  const [open, setOpen] = useState(false);
  const [city, setLocalCity] = useState(sharedCity);
  const [date, setDate] = useState("");
  const [minDate, setMinDate] = useState("");
  const [slot, setSlot] = useState("");
  const [available, setAvailable] = useState<string[]>([]);
  const [carModels, setCarModels] = useState<CarModelRecord[]>([]);
  const [carModelsLoading, setCarModelsLoading] = useState(true);
  const [carModelsError, setCarModelsError] = useState("");
  const [dateAvailability, setDateAvailability] = useState<
    Record<string, DayAvailability>
  >({});

  // Load the active car catalogue from the public, read-only API backed by Firebase.
  useEffect(() => {
    let cancelled = false;

    async function loadCarModels() {
      setCarModelsLoading(true);
      setCarModelsError("");

      try {
        const response = await fetch("/api/car-models", { cache: "no-store" });
        const data: unknown = await response.json();

        if (!response.ok) {
          const errorMessage =
            data && typeof data === "object" && "error" in data &&
            typeof data.error === "string"
              ? data.error
              : "Could not load car brands and models.";
          throw new Error(errorMessage);
        }

        const rawModels = Array.isArray(data)
          ? data
          : data && typeof data === "object" && "models" in data && Array.isArray(data.models)
            ? data.models
            : [];

        const cleaned: CarModelRecord[] = rawModels
          .filter((item): item is Record<string, unknown> => Boolean(item) && typeof item === "object")
          .filter((item) => item.active === true)
          .filter((item) => typeof item.brand === "string" && item.brand.trim() && typeof item.model === "string" && item.model.trim())
          .map((item) => ({
            id: typeof item.id === "string" ? item.id : `${String(item.brand)}-${String(item.model)}`,
            brand: (item.brand as string).trim(),
            model: (item.model as string).trim(),
            category: typeof item.category === "string" ? item.category : undefined,
            active: true,
          }));

        if (!cancelled) setCarModels(cleaned);
      } catch (error) {
        if (!cancelled) {
          setCarModels([]);
          setCarModelsError(
            error instanceof Error ? error.message : "Could not load car brands and models."
          );
        }
      } finally {
        if (!cancelled) setCarModelsLoading(false);
      }
    }

    void loadCarModels();
    return () => {
      cancelled = true;
    };
  }, []);

  const carBrands = useMemo(
    () => Array.from(new Set(carModels.map((item) => item.brand))).sort((a, b) => a.localeCompare(b)),
    [carModels]
  );

  // Stable initial state prevents current-time prerender errors.
  const [calendarMonth, setCalendarMonth] = useState(
    () => new Date(2000, 0, 1)
  );

  const [calendarReady, setCalendarReady] = useState(false);
  const [calendarLoading, setCalendarLoading] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [bookingConfirmed, setBookingConfirmed] = useState(false);
  const [bookingReference, setBookingReference] = useState("");
  const [trackingUrl, setTrackingUrl] = useState("");

  const chatbotRef = useRef<HTMLElement | null>(null);
  const launcherRef = useRef<HTMLButtonElement | null>(null);

  const [form, setForm] = useState({
    name: "",
    mobile: "",
    location: "",
    address: "",
    carBrand: "",
    carModel: "",
    inspectionType: "standard",
  });

  const availableCarModels = useMemo(
    () => carModels
      .filter((item) => item.brand === form.carBrand)
      .map((item) => item.model)
      .filter((model, index, models) => models.indexOf(model) === index)
      .sort((a, b) => a.localeCompare(b)),
    [carModels, form.carBrand]
  );

  const selectedCarModel = useMemo(
    () => carModels.find(
      (item) => item.brand === form.carBrand && item.model === form.carModel
    ),
    [carModels, form.carBrand, form.carModel]
  );

  const selectedModelCategory = normalizeCarCategory(selectedCarModel?.category);
  const isUsedCar = form.inspectionType === "used";

  const totalPrice = useMemo(
    () => price(city, isUsedCar ? "used" : selectedModelCategory),
    [city, isUsedCar, selectedModelCategory]
  );

  const whatsapp = (process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "").replace(
    /\D/g,
    ""
  );

  const monthKey = getMonthKey(calendarMonth);

  const monthLabel = calendarMonth.toLocaleDateString("en-IN", {
    month: "long",
    year: "numeric",
  });

  const firstWeekday = new Date(
    calendarMonth.getFullYear(),
    calendarMonth.getMonth(),
    1
  ).getDay();

  const daysInMonth = new Date(
    calendarMonth.getFullYear(),
    calendarMonth.getMonth() + 1,
    0
  ).getDate();

  const calendarDays = [
    ...Array.from({ length: firstWeekday }, () => null),
    ...Array.from({ length: daysInMonth }, (_, index) => index + 1),
  ];

  // Compute current time only after the component mounts.
  useEffect(() => {
    const today = new Date();

    setMinDate(getLocalDateString(today));
    setCalendarMonth(
      new Date(today.getFullYear(), today.getMonth(), 1)
    );
    setCalendarReady(true);
  }, []);

  const todayMonth = calendarReady
    ? new Date(
        calendarMonth.getFullYear(),
        calendarMonth.getMonth(),
        1
      )
    : calendarMonth;

  const canGoPrevious =
    calendarReady && calendarMonth.getTime() > todayMonth.getTime()
      ? true
      : calendarReady &&
        (calendarMonth.getFullYear() > new Date(minDate).getFullYear() ||
          (calendarMonth.getFullYear() === new Date(minDate).getFullYear() &&
            calendarMonth.getMonth() > new Date(minDate).getMonth()));

  useEffect(() => {
    setLocalCity(sharedCity);
  }, [sharedCity]);

  useEffect(() => {
    function handleOpen() {
      setOpen(true);
    }

    window.addEventListener("open-booking-chatbot", handleOpen);

    if (
      new URLSearchParams(window.location.search).get("openBooking") === "1"
    ) {
      setOpen(true);
      window.history.replaceState(
        {},
        "",
        window.location.pathname + window.location.hash
      );
    }

    return () => {
      window.removeEventListener("open-booking-chatbot", handleOpen);
    };
  }, []);

  useEffect(() => {
    if (!open) return;

    function handleOutsidePointer(event: PointerEvent) {
      const target = event.target;

      if (!(target instanceof Node)) return;
      if (chatbotRef.current?.contains(target)) return;
      if (launcherRef.current?.contains(target)) return;

      setOpen(false);
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }

    document.addEventListener("pointerdown", handleOutsidePointer);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("pointerdown", handleOutsidePointer);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [open]);

  useEffect(() => {
    if (!city || !minDate || !calendarReady) return;

    let cancelled = false;

    async function loadMonthAvailability() {
      setCalendarLoading(true);

      const year = calendarMonth.getFullYear();
      const month = calendarMonth.getMonth();
      const count = new Date(year, month + 1, 0).getDate();

      const datesToLoad = Array.from({ length: count }, (_, index) =>
        getLocalDateString(new Date(year, month, index + 1))
      ).filter((day) => day >= minDate);

      const results = await Promise.all(
        datesToLoad.map(async (day) => {
          try {
            const response = await fetch(
              `/api/bookings?city=${encodeURIComponent(city)}&date=${encodeURIComponent(day)}`,
              { cache: "no-store" }
            );

            if (!response.ok) return { day, info: null };

            const parsed = parseAvailability(await response.json());

            return { day, info: parsed?.info ?? null };
          } catch {
            return { day, info: null };
          }
        })
      );

      if (cancelled) return;

      setDateAvailability((current) => {
        const next = { ...current };

        for (const result of results) {
          next[`${city}:${result.day}`] = result.info ?? {
            available: null,
            total: BOOKING_SLOTS.length,
            booked: null,
          };
        }

        return next;
      });

      setCalendarLoading(false);
    }

    void loadMonthAvailability();

    return () => {
      cancelled = true;
    };
  }, [city, monthKey, minDate, calendarReady]);

  useEffect(() => {
    if (!date || !city) {
      setAvailable([]);
      return;
    }

    let live = true;

    setSlot("");
    setAvailable([]);

    fetch(
      `/api/bookings?city=${encodeURIComponent(city)}&date=${encodeURIComponent(date)}`,
      { cache: "no-store" }
    )
      .then(async (response) => {
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Could not load available slots.");
        }

        return data;
      })
      .then((data) => {
        if (!live) return;

        const parsed = parseAvailability(data);

        if (!parsed) {
          setAvailable([]);
          return;
        }

        setAvailable(parsed.slots);

        setDateAvailability((current) => ({
          ...current,
          [`${city}:${date}`]: parsed.info,
        }));
      })
      .catch(() => {
        if (live) setAvailable([]);
      });

    return () => {
      live = false;
    };
  }, [city, date]);

  function update(key: string, value: string) {
    setForm((current) => {
      if (key === "carBrand") {
        return {
          ...current,
          carBrand: value,
          carModel: "",
          inspectionType: current.inspectionType === "used" ? "used" : "standard",
        };
      }

      if (key === "carModel") {
        const selected = carModels.find(
          (item) => item.brand === current.carBrand && item.model === value
        );
        return {
          ...current,
          carModel: value,
          inspectionType:
            current.inspectionType === "used"
              ? "used"
              : normalizeCarCategory(selected?.category),
        };
      }

      return { ...current, [key]: value };
    });

    setMessage("");
    setBookingConfirmed(false);
    setBookingReference("");
  }

  function selectCarCondition(condition: "new" | "used") {
    setForm((current) => {
      if (condition === "used") {
        return { ...current, inspectionType: "used" };
      }

      const selected = carModels.find(
        (item) => item.brand === current.carBrand && item.model === current.carModel
      );
      return {
        ...current,
        inspectionType: normalizeCarCategory(selected?.category),
      };
    });

    setMessage("");
    setBookingConfirmed(false);
    setBookingReference("");
  }

  function resetBookingStatus() {
    setMessage("");
    setBookingConfirmed(false);
    setBookingReference("");
    setTrackingUrl("");
  }

  function selectDate(day: number) {
    const selectedDate = getLocalDateString(
      new Date(calendarMonth.getFullYear(), calendarMonth.getMonth(), day)
    );

    if (selectedDate < minDate) return;

    setDate(selectedDate);
    setSlot("");
    resetBookingStatus();
  }

  async function refreshAvailability() {
    if (!date || !city) return;

    try {
      const response = await fetch(
        `/api/bookings?city=${encodeURIComponent(city)}&date=${encodeURIComponent(date)}`,
        { cache: "no-store" }
      );

      const data = await response.json();

      if (response.ok) {
        const parsed = parseAvailability(data);

        if (parsed) {
          setAvailable(parsed.slots);
          setDateAvailability((current) => ({
            ...current,
            [`${city}:${date}`]: parsed.info,
          }));
        }
      }
    } catch {
      // Keep the successful booking confirmation visible.
    }
  }

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    // Accept Indian mobile numbers as exactly 10 digits (no country code or separators).
    if (!/^[0-9]{10}$/.test(form.mobile)) {
      setMessage("Please enter a valid 10-digit mobile number.");
      return;
    }

    if (!slot) {
      setMessage("Please select an available time slot.");
      return;
    }

    setBusy(true);
    setMessage("");
    setBookingConfirmed(false);

    try {
      const response = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, city, date, slot }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Could not book this slot.");
      }

      const reference = String(data.bookingId || "");

      setBookingReference(reference);

      // The booking API returns a URL containing the private tracking token.
      // Convert relative URLs (for example /track/<token>) to a complete,
      // shareable link on the current site.
      const returnedTrackingUrl =
        typeof data.trackingUrl === "string" ? data.trackingUrl.trim() : "";

      if (returnedTrackingUrl) {
        try {
          const resolvedUrl = new URL(returnedTrackingUrl, window.location.origin);
          // Only allow this site's own tracking URL; do not render arbitrary API URLs.
          setTrackingUrl(
            resolvedUrl.origin === window.location.origin &&
              resolvedUrl.pathname.startsWith("/track/")
              ? resolvedUrl.href
              : ""
          );
        } catch {
          setTrackingUrl("");
        }
      } else {
        setTrackingUrl("");
      }

        setBookingConfirmed(true);
      setMessage(
        `Your booking has been confirmed! Reference: ${reference || "Confirmed"}.`
      );

      await refreshAvailability();
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Booking failed."
      );
    } finally {
      setBusy(false);
    }
  }

  const supportMessage = encodeURIComponent(
    `Hi CarpdiExpert, I have a query about my car inspection booking.${
      bookingReference ? ` Booking reference: ${bookingReference}.` : ""
    } Please assist me.`
  );

  const whatsappUrl = whatsapp
    ? `https://wa.me/${whatsapp}?text=${supportMessage}`
    : "";

  const generalWhatsappUrl = whatsapp
    ? `https://wa.me/${whatsapp}?text=${encodeURIComponent(
        "Hi CarpdiExpert, I would like help with a car inspection booking."
      )}`
    : "";

  return (
    <>
      {whatsapp && (
        <a
          href={generalWhatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Contact CarpdiExpert on WhatsApp"
          title="Chat with us on WhatsApp"
          className="fixed bottom-[5.25rem] right-5 z-[90] flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500 text-white shadow-xl transition hover:scale-105 hover:bg-emerald-600"
        >
          <span aria-hidden="true" className="text-2xl">☏</span>
        </a>
      )}

      <button
        ref={launcherRef}
        type="button"
        onClick={() => setOpen((current) => !current)}
        aria-label={open ? "Close booking assistant" : "Open booking assistant"}
        aria-expanded={open}
        className="fixed bottom-5 right-5 z-[90] rounded-full bg-sky-400 px-5 py-3.5 text-sm font-bold text-[#0B1220] shadow-xl shadow-slate-950/20 transition hover:bg-sky-300"
      >
        {open ? "Close assistant" : "Book Inspection"}
        <span className="ml-2" aria-hidden="true">
          {open ? "✕" : "↗"}
        </span>
      </button>

      {open && (
        <section
          ref={chatbotRef}
          role="dialog"
          aria-modal="false"
          aria-labelledby="booking-chatbot-title"
          className="fixed bottom-[5.5rem] right-3 z-[85] flex max-h-[min(82dvh,760px)] w-[calc(100vw-1.5rem)] max-w-[400px] flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white text-slate-900 shadow-2xl shadow-slate-950/25 sm:right-5"
        >
          <header className="flex shrink-0 items-start justify-between gap-3 border-b border-slate-100 px-4 py-4">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-sky-600">
                CarpdiExpert assistant
              </p>
              <h2 id="booking-chatbot-title" className="mt-1 text-xl font-black">
                {bookingConfirmed ? "Booking confirmed" : "Book an inspection"}
              </h2>
              <p className="mt-1 text-xs text-slate-500">
                {bookingConfirmed
                  ? "Your inspection booking has been received."
                  : "Choose your city, date and available slot."}
              </p>
            </div>

            <button
              type="button"
              onClick={() => setOpen(false)}
              className="rounded-full bg-slate-100 px-3 py-2 text-sm hover:bg-slate-200"
              aria-label="Close booking assistant"
            >
              ✕
            </button>
          </header>

          <div className="overflow-y-auto overscroll-contain px-4 pb-4">
            {bookingConfirmed ? (
              <div className="py-5">
                <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
                  <h3 className="font-bold text-emerald-900">✓ Booking confirmed!</h3>
                  <p role="status" className="mt-3 text-sm text-emerald-900">
                    {message}
                  </p>
                  <div className="mt-3 rounded-xl bg-white/80 p-3 text-sm">
                    <p className="text-slate-500">Inspection details</p>
                    <p className="mt-1 font-semibold text-slate-900">
                      {cities.find((item) => item.slug === city)?.name || city}
                      {" · "}{date}
                    </p>
                    <p className="mt-1 text-slate-700">{slotLabels[slot] || slot}</p>
                    <p className="mt-1 text-slate-700">{typeLabels[form.inspectionType]}</p>
                    <p className="mt-2 font-bold text-slate-900">
                      {totalPrice === null
                        ? "Price on request"
                        : `₹${totalPrice.toLocaleString("en-IN")}`}
                    </p>
                  </div>
                </div>

                {trackingUrl ? (
                  <div className="mt-4">
                    <a
                      href={`https://wa.me/91${form.mobile}?text=${encodeURIComponent(
                        `Hi ${form.name || "there"}, here is your CarPDIExpert booking tracking link: ${trackingUrl}\n\nUse this link anytime to check your booking status.`
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex w-full items-center justify-center rounded-xl bg-emerald-600 px-4 py-4 text-sm font-bold text-white transition hover:bg-emerald-700"
                    >
                      Send booking link to WhatsApp
                    </a>
                    <p className="mt-2 text-center text-xs leading-relaxed text-slate-500">
                      WhatsApp will open a chat with your own number and prepare the message. Tap Send in WhatsApp to save the link to your chat.
                    </p>
                  </div>
                ) : (
                  <div className="mt-3 rounded-xl border border-amber-200 bg-amber-50 p-3">
                    <p className="text-sm font-bold text-amber-900">
                      Booking confirmed, tracking link unavailable
                    </p>
                    <p className="mt-1 text-xs leading-relaxed text-amber-800">
                      Your booking was created successfully, but the booking API did not return a tracking URL. Please check that POST /api/bookings generates and returns trackingUrl.
                    </p>
                  </div>
                )}

                <button
                  type="button"
                  onClick={() => {
                    setForm({
                      name: "",
                      mobile: "",
                      location: "",
                      address: "",
                      carBrand: "",
                      carModel: "",
                      inspectionType: "standard",
                    });
                    setDate("");
                    setSlot("");
                    setAvailable([]);
                    resetBookingStatus();
                  }}
                  className="mt-3 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Make another booking
                </button>
              </div>
            ) : (
              <form onSubmit={submit} className="space-y-4 pt-4">
                <div className="grid grid-cols-2 gap-3">
                  <label className="text-xs font-semibold text-slate-700">
                    Name
                    <input
                      required
                      autoComplete="name"
                      className={`${inputClass} mt-1`}
                      value={form.name}
                      onChange={(event) => update("name", event.target.value)}
                    />
                  </label>
                  <label className="text-xs font-semibold text-slate-700">
                    Mobile number
                    <input
                      required
                      type="tel"
                      inputMode="numeric"
                      autoComplete="tel-national"
                      pattern="[0-9]{10}"
                      minLength={10}
                      maxLength={10}
                      title="Enter exactly 10 digits, without +91 or spaces."
                      placeholder="10-digit mobile number"
                      className={`${inputClass} mt-1`}
                      value={form.mobile}
                      aria-describedby="mobile-validation-help"
                      onChange={(event) => update("mobile", event.target.value.replace(/\D/g, "").slice(0, 10))}
                    />
                    <span id="mobile-validation-help" className="mt-1 block text-[11px] font-normal text-slate-500">
                      Enter exactly 10 digits. Do not include +91 or spaces.
                    </span>
                  </label>
                </div>

                <label className="block text-xs font-semibold text-slate-700">
                  City
                  <select
                    required
                    className={`${inputClass} mt-1`}
                    value={city}
                    onChange={(event) => {
                      setLocalCity(event.target.value);
                      setCity(event.target.value);
                      setDate("");
                      setSlot("");
                      setAvailable([]);
                      resetBookingStatus();
                    }}
                  >
                    {cities.map((item) => (
                      <option key={item.slug} value={item.slug}>{item.name}</option>
                    ))}
                  </select>
                </label>

                <div className="grid grid-cols-2 gap-3">
                  <label className="text-xs font-semibold text-slate-700">
                    Location / area
                    <input
                      required
                      className={`${inputClass} mt-1`}
                      value={form.location}
                      onChange={(event) => update("location", event.target.value)}
                      placeholder="e.g. Baner"
                    />
                  </label>
                  <label className="text-xs font-semibold text-slate-700">
                    Full address
                    <textarea
                      required
                      rows={2}
                      className={`${inputClass} mt-1 resize-y`}
                      value={form.address}
                      onChange={(event) => update("address", event.target.value)}
                    />
                  </label>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <label className="text-xs font-semibold text-slate-700">
                    Car brand
                    <select
                      required
                      className={`${inputClass} mt-1`}
                      value={form.carBrand}
                      onChange={(event) => update("carBrand", event.target.value)}
                    >
                      <option value="">{carModelsLoading ? "Loading brands…" : "Select brand"}</option>
                      {carBrands.map((brand) => (
                        <option key={brand} value={brand}>{brand}</option>
                      ))}
                    </select>
                  </label>
                  <label className="text-xs font-semibold text-slate-700">
                    Car model
                    <select
                      required
                      className={`${inputClass} mt-1`}
                      value={form.carModel}
                      onChange={(event) => update("carModel", event.target.value)}
                      disabled={!form.carBrand || carModelsLoading || availableCarModels.length === 0}
                    >
                      <option value="">{carModelsLoading ? "Loading models…" : "Select model"}</option>
                      {availableCarModels.map((model) => (
                        <option key={model} value={model}>{model}</option>
                      ))}
                    </select>
                  </label>
                </div>
                {carModelsError && (
                  <p role="alert" className="rounded-xl bg-amber-50 p-3 text-xs leading-relaxed text-amber-800">
                    {carModelsError} Please ensure the public read-only /api/car-models endpoint is configured.
                  </p>
                )}
                {!carModelsLoading && !carModelsError && carModels.length === 0 && (
                  <p className="rounded-xl bg-amber-50 p-3 text-xs leading-relaxed text-amber-800">
                    No active car models were found in the catalogue.
                  </p>
                )}

                <fieldset className="space-y-2">
                  <legend className="text-xs font-semibold text-slate-700">
                    What type of car do you have?
                  </legend>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      aria-pressed={!isUsedCar}
                      onClick={() => selectCarCondition("new")}
                      className={`rounded-2xl border p-3 text-left transition ${
                        !isUsedCar
                          ? "border-sky-500 bg-sky-50 ring-2 ring-sky-100"
                          : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50"
                      }`}
                    >
                      <span className="flex items-center gap-2 text-sm font-bold text-slate-900">
                        <span aria-hidden="true" className="text-lg">🚘</span>
                        New Car
                      </span>
                      <span className="mt-1 block text-[11px] leading-relaxed text-slate-500">
                        Pre-delivery inspection (PDI)
                      </span>
                      <span className="mt-2 block text-xs font-bold text-sky-700">
                        {isUsedCar ? "Select" : "Selected"}
                      </span>
                    </button>
                    <button
                      type="button"
                      aria-pressed={isUsedCar}
                      onClick={() => selectCarCondition("used")}
                      className={`rounded-2xl border p-3 text-left transition ${
                        isUsedCar
                          ? "border-sky-500 bg-sky-50 ring-2 ring-sky-100"
                          : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50"
                      }`}
                    >
                      <span className="flex items-center gap-2 text-sm font-bold text-slate-900">
                        <span aria-hidden="true" className="text-lg">🚗</span>
                        Used Car
                      </span>
                      <span className="mt-1 block text-[11px] leading-relaxed text-slate-500">
                        Pre-purchase inspection (PPI)
                      </span>
                      <span className="mt-2 block text-xs font-bold text-sky-700">
                        {isUsedCar ? "Selected" : "Select"}
                      </span>
                    </button>
                  </div>
                  <p className="text-[11px] leading-relaxed text-slate-500">
                    {isUsedCar
                      ? "Used-car PPI pricing is fixed and does not change with the selected car category."
                      : `New-car PDI pricing is based on the selected model category: ${typeLabels[selectedModelCategory]}.`}
                  </p>
                </fieldset>

                <div className="rounded-2xl bg-sky-50 px-3.5 py-3">
                  <p className="text-xs text-slate-600">Estimated inspection price</p>
                  <p className="mt-0.5 text-xl font-black text-[#0B1220]">
                    {totalPrice === null
                      ? "Price on request"
                      : `₹${totalPrice.toLocaleString("en-IN")}`}
                  </p>
                </div>

                {/* Modern heatmap calendar */}
                <div className="rounded-2xl border border-slate-200 bg-white p-3.5 shadow-sm">
                  <div className="flex items-center justify-between gap-2">
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-sky-600">
                        Step 1
                      </p>
                      <h3 className="mt-1 text-sm font-bold text-slate-900">
                        Choose your date
                      </h3>
                    </div>
                    <div className="flex gap-1">
                      <button
                        type="button"
                        disabled={!canGoPrevious}
                        onClick={() => setCalendarMonth(
                          new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() - 1, 1)
                        )}
                        aria-label="Previous month"
                        className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 text-lg hover:bg-slate-50 disabled:opacity-30"
                      >
                        ‹
                      </button>
                      <button
                        type="button"
                        onClick={() => setCalendarMonth(
                          new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() + 1, 1)
                        )}
                        aria-label="Next month"
                        className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 text-lg hover:bg-slate-50"
                      >
                        ›
                      </button>
                    </div>
                  </div>

                  <div className="mt-4 flex items-center justify-between gap-2">
                    <h4 className="text-lg font-extrabold tracking-tight text-[#0B1220]">
                      {monthLabel}
                    </h4>
                    {calendarLoading && (
                      <span className="flex items-center gap-1.5 text-[10px] text-slate-500">
                        <span className="h-2 w-2 animate-pulse rounded-full bg-sky-400" />
                        Updating
                      </span>
                    )}
                  </div>

                  <div className="mt-3 grid grid-cols-7 gap-1 text-center">
                    {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((weekday) => (
                      <div key={weekday} className="py-1.5 text-[10px] font-bold uppercase tracking-wide text-slate-400">
                        {weekday}
                      </div>
                    ))}

                    {calendarDays.map((day, index) => {
                      if (day === null) {
                        return <div key={`empty-${index}`} className="aspect-square" />;
                      }

                      const dayKey = getLocalDateString(
                        new Date(calendarMonth.getFullYear(), calendarMonth.getMonth(), day)
                      );
                      const info = dateAvailability[`${city}:${dayKey}`];
                      const isPast = calendarReady && dayKey < minDate;
                      const isSelected = date === dayKey;
                      const isToday = dayKey === minDate;
                      const heat = getHeatmapStyle(info);

                      return (
                        <button
                          key={dayKey}
                          type="button"
                          disabled={!calendarReady || isPast}
                          onClick={() => selectDate(day)}
                          title={`${dayKey}: ${isPast ? "Past date" : heat.label}`}
                          aria-label={`${dayKey}, ${isPast ? "past date" : heat.label}`}
                          aria-pressed={isSelected}
                          className={`relative flex aspect-square min-w-0 flex-col items-center justify-center rounded-xl border text-xs font-bold transition ${
                            isPast
                              ? "cursor-not-allowed border-transparent bg-slate-50 text-slate-300"
                              : `${heat.background} ${heat.text} ${heat.border} hover:-translate-y-0.5 hover:shadow-sm`
                          } ${isSelected ? "z-10 ring-2 ring-[#0B1220] ring-offset-2" : ""}`}
                        >
                          <span>{day}</span>
                          {isToday && !isPast && <span className="mt-0.5 h-1 w-1 rounded-full bg-current" />}
                        </button>
                      );
                    })}
                  </div>

                  <div className="mt-4 rounded-xl bg-slate-50 p-3">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                      Booking activity
                    </p>
                    <div className="mt-2 flex flex-wrap gap-x-3 gap-y-2">
                      {[
                        { color: "bg-green-500", label: "Empty" },
                        { color: "bg-lime-400", label: "Low" },
                        { color: "bg-yellow-400", label: "Medium" },
                        { color: "bg-orange-400", label: "High" },
                        { color: "bg-red-500", label: "Full / blocked" },
                        { color: "bg-slate-300", label: "Unknown" },
                      ].map((item) => (
                        <div key={item.label} className="flex items-center gap-1.5">
                          <span className={`h-2.5 w-2.5 rounded-sm ${item.color}`} />
                          <span className="text-[10px] font-medium text-slate-600">{item.label}</span>
                        </div>
                      ))}
                    </div>
                    <p className="mt-2 text-[10px] leading-relaxed text-slate-500">
                      Red dates may be fully booked or blocked by the admin. Grey means availability could not be verified.
                    </p>
                  </div>

                  {date && (
                    <div className="mt-3 flex items-center justify-between gap-3 rounded-xl border border-sky-100 bg-sky-50 px-3 py-2.5">
                      <div>
                        <p className="text-[10px] font-semibold uppercase tracking-wide text-sky-700">Selected date</p>
                        <p className="mt-0.5 text-sm font-bold text-slate-900">
                          {getDateFromKey(date).toLocaleDateString("en-IN", {
                            weekday: "short",
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </p>
                      </div>
                      <span className="rounded-lg bg-white px-2 py-1 text-[10px] font-bold text-sky-700">
                        {dateAvailability[`${city}:${date}`]?.available == null
                          ? "Loading"
                          : `${dateAvailability[`${city}:${date}`].available} slots`}
                      </span>
                    </div>
                  )}
                </div>

                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-sky-600">Step 2</p>
                  <h3 className="mt-1 text-sm font-bold text-slate-900">Select a time slot</h3>
                  <div className="mt-3 grid grid-cols-3 gap-2">
                    {BOOKING_SLOTS.map((item) => {
                      const isAvailable = available.includes(item);
                      const isSelected = slot === item;

                      return (
                        <button
                          type="button"
                          key={item}
                          disabled={!date || !isAvailable || busy}
                          onClick={() => {
                            setSlot(item);
                            setMessage("");
                          }}
                          className={`rounded-xl border px-1.5 py-3 text-xs font-semibold transition ${
                            isSelected
                              ? "border-sky-500 bg-sky-400 text-[#0B1220] shadow-sm"
                              : "border-slate-200 bg-white text-slate-700 hover:border-sky-300 hover:bg-sky-50"
                          } disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400`}
                        >
                          {slotLabels[item] || item}
                        </button>
                      );
                    })}
                  </div>

                  {!date && <p className="mt-2 text-xs text-slate-500">Select a date above to see available times.</p>}
                  {date && available.length === 0 && (
                    <p className="mt-2 rounded-xl bg-amber-50 p-3 text-xs leading-relaxed text-amber-800">
                      {dateAvailability[`${city}:${date}`]?.blocked
                        ? "This date is blocked by our team for this city. Please choose another date."
                        : "No slots are currently available, or no active inspector is configured. Please try another date."}
                    </p>
                  )}
                </div>

                {message && (
                  <p role="alert" className="rounded-xl bg-red-50 p-3 text-xs text-red-700">{message}</p>
                )}

                <button
                  type="submit"
                  disabled={busy || !slot || totalPrice === null || !minDate}
                  className="w-full rounded-full bg-[#0B1220] px-4 py-3.5 text-sm font-bold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {busy ? "Checking & booking…" : "Confirm booking"}
                </button>

                {generalWhatsappUrl && (
                  <a
                    href={generalWhatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block text-center text-xs font-semibold text-emerald-700 hover:text-emerald-800"
                  >
                    Need help? Contact us on WhatsApp
                  </a>
                )}
              </form>
            )}
          </div>
        </section>
      )}
    </>
  );
}
