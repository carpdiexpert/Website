import { NextResponse } from "next/server";
import { FieldValue } from "firebase-admin/firestore";
import { adminDb } from "@/lib/firebase-admin";
import { CITIES, getCity } from "@/lib/cities";
import { BOOKING_SLOTS } from "@/lib/slots";

const cityNames: Record<string, string> = Object.fromEntries(
  Object.entries(CITIES).map(([slug, city]) => [slug, city.name])
);

const ACTIVE_BOOKING_STATUSES = ["confirmed", "pending"] as const;
const BOOKING_WINDOW_DAYS = 10;

type InspectionType = "standard" | "luxury" | "ev" | "used";

const inspectionLabels: Record<InspectionType, string> = {
  standard: "Standard PDI",
  luxury: "Luxury PDI",
  ev: "EV PDI",
  used: "Used-car PPI",
};

function getTodayInIndia(): string {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());
  const part = (type: string) => parts.find((item) => item.type === type)?.value ?? "";
  return `${part("year")}-${part("month")}-${part("day")}`;
}

function addDays(dateKey: string, days: number): string {
  const [year, month, day] = dateKey.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day + days));
  return [
    date.getUTCFullYear(),
    String(date.getUTCMonth() + 1).padStart(2, "0"),
    String(date.getUTCDate()).padStart(2, "0"),
  ].join("-");
}

function isValidDateKey(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  return date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day;
}

function isWithinBookingWindow(date: string): boolean {
  if (!isValidDateKey(date)) return false;
  const today = getTodayInIndia();
  return date >= today && date <= addDays(today, BOOKING_WINDOW_DAYS - 1);
}

function priceFor(city: string, type: string): number | null {
  const config = getCity(city);
  if (!config) return null;
  if (type === "standard") return config.newCars.standardCars;
  if (type === "luxury") return config.newCars.luxuryCars;
  if (type === "ev") return config.newCars.evCars;
  if (type === "used") return config.usedCar;
  return null;
}

function isInspectionType(value: string): value is InspectionType {
  return Object.prototype.hasOwnProperty.call(inspectionLabels, value);
}

function dayBlockId(city: string, date: string) {
  return `${city}_${date}_day`;
}

function slotBlockId(city: string, date: string, slot: string) {
  return `${city}_${date}_${slot.replace(":", "-")}`;
}

function blockReason(data: FirebaseFirestore.DocumentData | undefined): string {
  return typeof data?.reason === "string" && data.reason.trim()
    ? data.reason.trim()
    : "Unavailable by admin";
}

/** GET /api/bookings?city=pune&date=YYYY-MM-DD */
export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const city = (url.searchParams.get("city") ?? "").trim().toLowerCase();
    const date = (url.searchParams.get("date") ?? "").trim();

    if (!cityNames[city]) {
      return NextResponse.json({ error: "A valid city is required." }, { status: 400 });
    }
    if (!isValidDateKey(date)) {
      return NextResponse.json({ error: "A valid date in YYYY-MM-DD format is required." }, { status: 400 });
    }
    if (!isWithinBookingWindow(date)) {
      const today = getTodayInIndia();
      return NextResponse.json({
        error: "Availability can only be checked for the next 10 days, starting today.",
        today,
        lastBookableDate: addDays(today, BOOKING_WINDOW_DAYS - 1),
      }, { status: 400 });
    }

    const db = adminDb();
    const blocks = db.collection("blockedSlots");
    const dayRef = blocks.doc(dayBlockId(city, date));
    const slotRefs = BOOKING_SLOTS.map((slot) => blocks.doc(slotBlockId(city, date, slot)));

    const [inspectorsSnapshot, bookingsSnapshot, dayBlockSnapshot, slotBlockSnapshots] = await Promise.all([
      db.collection("inspectors")
        .where("city", "==", cityNames[city])
        .where("status", "==", "active")
        .get(),
      db.collection("bookings")
        .where("citySlug", "==", city)
        .where("date", "==", date)
        .where("status", "in", [...ACTIVE_BOOKING_STATUSES])
        .get(),
      dayRef.get(),
      Promise.all(slotRefs.map((ref) => ref.get())),
    ]);

    const dayBlocked = dayBlockSnapshot.exists && dayBlockSnapshot.data()?.type === "day";
    const dayReason = dayBlocked ? blockReason(dayBlockSnapshot.data()) : null;
    const activeInspectors = inspectorsSnapshot.size;
    const bookedCounts: Record<string, number> = {};

    for (const document of bookingsSnapshot.docs) {
      const booking = document.data();
      if (typeof booking.slot === "string" && (BOOKING_SLOTS as readonly string[]).includes(booking.slot)) {
        bookedCounts[booking.slot] = (bookedCounts[booking.slot] ?? 0) + 1;
      }
    }

    const slotBlocksBySlot = new Map<string, { reason: string; id: string }>();
    slotBlockSnapshots.forEach((snapshot, index) => {
      if (snapshot.exists && snapshot.data()?.type === "slot") {
        slotBlocksBySlot.set(BOOKING_SLOTS[index], {
          reason: blockReason(snapshot.data()),
          id: snapshot.id,
        });
      }
    });

    const slots = BOOKING_SLOTS.map((slot) => {
      const booked = bookedCounts[slot] ?? 0;
      const block = slotBlocksBySlot.get(slot);
      const blocked = Boolean(dayBlocked || block);
      const remaining = blocked ? 0 : Math.max(0, activeInspectors - booked);
      return {
        slot,
        available: !blocked && activeInspectors > 0 && remaining > 0,
        remaining,
        blocked,
        blockType: dayBlocked ? "day" : block ? "slot" : null,
        blockReason: dayBlocked ? dayReason : block?.reason ?? null,
      };
    });

    const totalCapacity = activeInspectors * slots.filter((item) => !item.blocked).length;
    const bookedSlots = slots.reduce(
      (total, item) => total + Math.min(activeInspectors, bookedCounts[item.slot] ?? 0),
      0
    );
    const today = getTodayInIndia();

    return NextResponse.json({
      city,
      date,
      today,
      lastBookableDate: addDays(today, BOOKING_WINDOW_DAYS - 1),
      activeInspectors,
      totalCapacity,
      bookedSlots,
      dayBlocked: Boolean(dayBlocked),
      dayBlockReason: dayReason,
      availableSlots: slots.filter((item) => item.available).length,
      slots,
    }, { headers: { "Cache-Control": "no-store, max-age=0" } });
  } catch (error) {
    console.error("GET /api/bookings failed:", error);
    return NextResponse.json(
      { error: "Availability is temporarily unavailable. Please try again." },
      { status: 503 }
    );
  }
}

/** POST /api/bookings */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const city = String(body.city ?? "").trim().toLowerCase();
    const type = String(body.inspectionType ?? "").trim();
    const date = String(body.date ?? "").trim();
    const slot = String(body.slot ?? "").trim();

    if (!cityNames[city]) return NextResponse.json({ error: "Please select a valid city." }, { status: 400 });
    if (!isInspectionType(type) || priceFor(city, type) === null) {
      return NextResponse.json({ error: "Please select a valid inspection type." }, { status: 400 });
    }
    if (!(BOOKING_SLOTS as readonly string[]).includes(slot)) {
      return NextResponse.json({ error: "Please select a valid time slot." }, { status: 400 });
    }
    if (!isValidDateKey(date)) return NextResponse.json({ error: "Please select a valid booking date." }, { status: 400 });
    if (!isWithinBookingWindow(date)) {
      return NextResponse.json({ error: "Bookings are available only for the next 10 days, starting today." }, { status: 400 });
    }

    const requiredFields = ["name", "mobile", "location", "address", "carBrand", "carModel"] as const;
    for (const key of requiredFields) {
      if (typeof body[key] !== "string" || !body[key].trim()) {
        return NextResponse.json({ error: `${key} is required.` }, { status: 400 });
      }
    }

    const db = adminDb();
    const inspectorQuery = db.collection("inspectors")
      .where("city", "==", cityNames[city])
      .where("status", "==", "active");
    const initialInspectors = await inspectorQuery.get();
    if (initialInspectors.empty) {
      return NextResponse.json({
        error: "No active inspector is configured for this city yet. Please contact our team.",
      }, { status: 409 });
    }

    const bookingRef = db.collection("bookings").doc();
    const lockSlot = slot.replace(":", "-");
    const dayRef = db.collection("blockedSlots").doc(dayBlockId(city, date));
    const slotRef = db.collection("blockedSlots").doc(slotBlockId(city, date, slot));

    await db.runTransaction(async (transaction) => {
      if (!isWithinBookingWindow(date)) throw new Error("DATE_OUTSIDE_WINDOW");

      // All block checks happen inside the transaction, before any writes.
      const [daySnapshot, slotSnapshot, freshInspectors] = await Promise.all([
        transaction.get(dayRef),
        transaction.get(slotRef),
        transaction.get(inspectorQuery),
      ]);

      if (daySnapshot.exists && daySnapshot.data()?.type === "day") {
        throw new Error(`DAY_BLOCKED:${blockReason(daySnapshot.data())}`);
      }
      if (slotSnapshot.exists && slotSnapshot.data()?.type === "slot") {
        throw new Error(`SLOT_BLOCKED:${blockReason(slotSnapshot.data())}`);
      }

      const inspectors = freshInspectors.docs;
      if (inspectors.length === 0) throw new Error("NO_ACTIVE_INSPECTORS");

      const lockRefs = inspectors.map((inspector) => db.collection("slotReservations")
        .doc(`${city}_${date}_${lockSlot}_${inspector.id}`));
      const lockSnapshots = await Promise.all(lockRefs.map((ref) => transaction.get(ref)));
      const freeIndex = lockSnapshots.findIndex((lock) => !lock.exists);
      if (freeIndex === -1) throw new Error("SLOT_FULL");

      const assignedInspector = inspectors[freeIndex];
      transaction.create(lockRefs[freeIndex], {
        citySlug: city,
        city: cityNames[city],
        date,
        slot,
        inspectorId: assignedInspector.id,
        bookingId: bookingRef.id,
        createdAt: FieldValue.serverTimestamp(),
      });
      transaction.create(bookingRef, {
        name: body.name.trim().slice(0, 120),
        mobile: body.mobile.trim().slice(0, 30),
        city: cityNames[city],
        citySlug: city,
        location: body.location.trim().slice(0, 200),
        address: body.address.trim().slice(0, 500),
        carBrand: body.carBrand.trim().slice(0, 100),
        carModel: body.carModel.trim().slice(0, 100),
        inspectionType: type,
        inspectionLabel: inspectionLabels[type],
        price: priceFor(city, type),
        date,
        slot,
        status: "pending",
        inspectorId: assignedInspector.id,
        inspectorName: assignedInspector.data().name ?? "",
        createdAt: FieldValue.serverTimestamp(),
      });
    });

    return NextResponse.json({
      ok: true,
      bookingId: bookingRef.id,
      price: priceFor(city, type),
      city,
      date,
      slot,
    }, { status: 201 });
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === "SLOT_FULL") {
        return NextResponse.json({ error: "That slot has just been booked. Please select another slot." }, { status: 409 });
      }
      if (error.message === "NO_ACTIVE_INSPECTORS") {
        return NextResponse.json({ error: "No active inspector is configured for this city yet. Please contact our team." }, { status: 409 });
      }
      if (error.message === "DATE_OUTSIDE_WINDOW") {
        return NextResponse.json({ error: "That date is outside the current 10-day booking window." }, { status: 400 });
      }
      if (error.message.startsWith("DAY_BLOCKED:")) {
        const reason = error.message.slice("DAY_BLOCKED:".length);
        return NextResponse.json({ error: `Bookings are unavailable for this city on this date. ${reason}` }, { status: 409 });
      }
      if (error.message.startsWith("SLOT_BLOCKED:")) {
        const reason = error.message.slice("SLOT_BLOCKED:".length);
        return NextResponse.json({ error: `This time slot is unavailable. ${reason}` }, { status: 409 });
      }
    }

    console.error("POST /api/bookings failed:", error);
    return NextResponse.json({
      error: "Booking could not be completed. Please try again or WhatsApp our team.",
    }, { status: 503 });
  }
}
