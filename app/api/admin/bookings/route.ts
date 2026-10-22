import { NextResponse } from "next/server";
import {
  FieldValue,
  type DocumentData,
  type Query,
} from "firebase-admin/firestore";
import { adminDb, requireAdmin } from "@/lib/firebase-admin";

const BOOKING_STATUSES = [
  "pending",
  "confirmed",
  "completed",
  "approved",
  "cancelled",
] as const;

type BookingStatus = (typeof BOOKING_STATUSES)[number];

type BookingUpdate = {
  id?: unknown;
  inspectorId?: unknown;
  inspectorName?: unknown;
  status?: unknown;
  date?: unknown;
  slot?: unknown;
  time?: unknown;
};

function localDate() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
}

function errorResponse(error: unknown, fallback: string) {
  const message = error instanceof Error ? error.message : fallback;
  const status = message.startsWith("Forbidden")
    ? 403
    : message.startsWith("Unauthorized")
      ? 401
      : message.startsWith("Booking not found")
        ? 404
        : message.startsWith("Slot unavailable") || message.startsWith("Blocked")
          ? 409
          : message.startsWith("Invalid") || message.startsWith("A valid") || message.startsWith("Select") || message.startsWith("Only") || message.startsWith("Assign")
            ? 400
            : 500;
  return NextResponse.json({ error: message || fallback }, { status });
}

function isoTimestamp(value: unknown) {
  if (value && typeof value === "object" && "toDate" in value) {
    const toDate = (value as { toDate?: () => Date }).toDate;
    if (typeof toDate === "function") return toDate.call(value).toISOString();
  }
  return value ?? null;
}

function serializeBooking(id: string, data: DocumentData) {
  return {
    id,
    ...data,
    status: typeof data.status === "string" && data.status.trim()
      ? data.status.trim().toLowerCase()
      : "pending",
    createdAt: isoTimestamp(data.createdAt),
    updatedAt: isoTimestamp(data.updatedAt),
    assignedAt: isoTimestamp(data.assignedAt),
  };
}

function normalizeSlot(value: unknown) {
  return String(value ?? "").trim().replace(/^0/, "");
}

function consumesCapacity(status: unknown) {
  const value = String(status || "confirmed").trim().toLowerCase();
  return value !== "cancelled" && value !== "canceled" && value !== "completed";
}

function isValidDate(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const parsed = new Date(`${value}T12:00:00`);
  return !Number.isNaN(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value;
}

export async function GET(request: Request) {
  try {
    await requireAdmin(request);
    const url = new URL(request.url);
    const today = localDate();
    const start = url.searchParams.get("today") === "1" ? today : url.searchParams.get("start") ?? today;
    const end = url.searchParams.get("today") === "1" ? today : url.searchParams.get("end") ?? start;

    if (!/^\d{4}-\d{2}-\d{2}$/.test(start) || !/^\d{4}-\d{2}-\d{2}$/.test(end) || start > end) {
      return NextResponse.json({ error: "Invalid booking date range." }, { status: 400 });
    }

    const snapshot = await adminDb()
      .collection("bookings")
      .where("date", ">=", start)
      .where("date", "<=", end)
      .orderBy("date")
      .get();
    const bookings = snapshot.docs.map((doc) => serializeBooking(doc.id, doc.data()));
    return NextResponse.json({ bookings, total: bookings.length, start, end });
  } catch (error) {
    return errorResponse(error, "Could not load bookings.");
  }
}

export async function PATCH(request: Request) {
  try {
    await requireAdmin(request);
    let body: BookingUpdate;
    try {
      body = (await request.json()) as BookingUpdate;
    } catch {
      return NextResponse.json({ error: "Request body must contain valid JSON." }, { status: 400 });
    }

    const id = typeof body.id === "string" ? body.id.trim() : "";
    if (!id || id.length > 200 || id.includes("/")) {
      return NextResponse.json({ error: "A valid booking ID is required." }, { status: 400 });
    }

    const hasDate = body.date !== undefined;
    const hasSlot = body.slot !== undefined || body.time !== undefined;
    const isReschedule = hasDate || hasSlot;

    if (isReschedule) {
      const nextDate = typeof body.date === "string" ? body.date.trim() : "";
      const nextSlot = typeof (body.slot ?? body.time) === "string"
        ? String(body.slot ?? body.time).trim()
        : "";

      if (!isValidDate(nextDate)) {
        return NextResponse.json({ error: "Invalid reschedule date. Use YYYY-MM-DD." }, { status: 400 });
      }
      if (!nextSlot || nextSlot.length > 80) {
        return NextResponse.json({ error: "Invalid time slot. Enter a valid time slot." }, { status: 400 });
      }

      const db = adminDb();
      const bookingRef = db.collection("bookings").doc(id);
      const updatedBooking = await db.runTransaction(async (transaction) => {
        const currentSnapshot = await transaction.get(bookingRef);
        if (!currentSnapshot.exists) {
          throw new Error("Booking not found.");
        }
        const current = currentSnapshot.data() ?? {};
        const city = typeof current.city === "string" && current.city.trim()
          ? current.city.trim()
          : "Pune";

        const sameDate = nextDate === String(current.date ?? "").trim();
        const sameSlot = normalizeSlot(nextSlot) === normalizeSlot(current.slot ?? current.time);
        if (sameDate && sameSlot) {
          return serializeBooking(currentSnapshot.id, current);
        }

        const targetBookingsQuery = db.collection("bookings").where("date", "==", nextDate);
        const targetBlocksQuery = db.collection("blockedSlots").where("date", "==", nextDate);
        const inspectorsQuery = db.collection("inspectors") as Query<DocumentData>;
        const [bookingsSnapshot, blocksSnapshot, inspectorsSnapshot] = await Promise.all([
          transaction.get(targetBookingsQuery),
          transaction.get(targetBlocksQuery),
          transaction.get(inspectorsQuery),
        ]);

        const blocked = blocksSnapshot.docs.some((doc) => {
          const block = doc.data();
          const blockCity = typeof block.city === "string" && block.city.trim() ? block.city.trim() : "Pune";
          if (blockCity.toLowerCase() !== city.toLowerCase()) return false;
          if (String(block.date ?? "").trim() !== nextDate) return false;
          if (block.type === "date" || block.type === "day") return true;
          return block.type === "slot" && normalizeSlot(block.slot).toLowerCase() === normalizeSlot(nextSlot).toLowerCase();
        });

        if (blocked) {
          throw new Error("Blocked: This date or time slot is blocked by the admin for this city. Choose another slot.");
        }

        const inspectorCount = inspectorsSnapshot.docs.filter((doc) => {
          const inspector = doc.data();
          const status = String(inspector.status ?? "").trim().toLowerCase();
          const inspectorCity = typeof inspector.city === "string" && inspector.city.trim()
            ? inspector.city.trim()
            : "Pune";
          return status === "active" && inspectorCity.toLowerCase() === city.toLowerCase();
        }).length;

        const activeBookingsAtSlot = bookingsSnapshot.docs.filter((doc) => {
          if (doc.id === id) return false;
          const booking = doc.data();
          const bookingCity = typeof booking.city === "string" && booking.city.trim()
            ? booking.city.trim()
            : "Pune";
          if (bookingCity.toLowerCase() !== city.toLowerCase()) return false;
          if (!consumesCapacity(booking.status)) return false;
          return normalizeSlot(booking.slot ?? booking.time).toLowerCase() === normalizeSlot(nextSlot).toLowerCase();
        }).length;

        if (inspectorCount < 1 || activeBookingsAtSlot >= inspectorCount) {
          throw new Error(`Slot unavailable: ${city} on ${nextDate} at ${nextSlot} is already fully booked or no active inspector is available.`);
        }

        transaction.update(bookingRef, {
          date: nextDate,
          slot: nextSlot,
          time: nextSlot,
          updatedAt: FieldValue.serverTimestamp(),
        });

        return serializeBooking(id, {
          ...current,
          date: nextDate,
          slot: nextSlot,
          time: nextSlot,
        });
      });

      return NextResponse.json({
        success: true,
        message: `Booking rescheduled to ${nextDate} at ${nextSlot}. Availability was checked.`,
        booking: updatedBooking,
      });
    }

    const db = adminDb();
    const bookingRef = db.collection("bookings").doc(id);
    const bookingSnapshot = await bookingRef.get();
    if (!bookingSnapshot.exists) {
      return NextResponse.json({ error: "Booking not found." }, { status: 404 });
    }

    const currentBooking = bookingSnapshot.data() ?? {};
    const currentStatus = typeof currentBooking.status === "string"
      ? currentBooking.status.toLowerCase()
      : "pending";
    const updates: Record<string, unknown> = { updatedAt: FieldValue.serverTimestamp() };
    const hasInspectorId = body.inspectorId !== undefined;
    const hasInspectorName = body.inspectorName !== undefined;
    const hasStatus = body.status !== undefined;

    if (hasInspectorId || hasInspectorName) {
      if (typeof body.inspectorId !== "string" || !body.inspectorId.trim() || body.inspectorId.trim().length > 200 || body.inspectorId.includes("/")) {
        return NextResponse.json({ error: "Select a valid inspector." }, { status: 400 });
      }
      const inspectorId = body.inspectorId.trim();
      const inspectorSnapshot = await db.collection("inspectors").doc(inspectorId).get();
      if (!inspectorSnapshot.exists) {
        return NextResponse.json({ error: "The selected inspector does not exist." }, { status: 404 });
      }
      const inspector = inspectorSnapshot.data() ?? {};
      if (String(inspector.status ?? "").trim().toLowerCase() !== "active") {
        return NextResponse.json({ error: "Only active inspectors can be assigned." }, { status: 400 });
      }
      const inspectorName = typeof inspector.name === "string" && inspector.name.trim()
        ? inspector.name.trim()
        : typeof inspector.displayName === "string" && inspector.displayName.trim()
          ? inspector.displayName.trim()
          : typeof body.inspectorName === "string" ? body.inspectorName.trim() : "";
      if (!inspectorName) {
        return NextResponse.json({ error: "The selected inspector has no display name." }, { status: 400 });
      }
      updates.inspectorId = inspectorId;
      updates.inspectorName = inspectorName;
      updates.assignedAt = FieldValue.serverTimestamp();
      if (!hasStatus && currentStatus !== "cancelled") updates.status = "confirmed";
    }

    if (hasStatus) {
      if (typeof body.status !== "string") {
        return NextResponse.json({ error: "Invalid booking status." }, { status: 400 });
      }
      const status = body.status.trim().toLowerCase() as BookingStatus;
      if (!BOOKING_STATUSES.includes(status)) {
        return NextResponse.json({ error: `Status must be one of: ${BOOKING_STATUSES.join(", ")}.` }, { status: 400 });
      }
      if (status === "confirmed" && !currentBooking.inspectorId && !hasInspectorId) {
        return NextResponse.json({ error: "Assign an inspector before setting the booking to Confirmed." }, { status: 400 });
      }
      if (status === "approved" && currentStatus !== "completed") {
        return NextResponse.json({ error: "Only a Completed booking can be approved." }, { status: 400 });
      }
      updates.status = status;
    }

    if (Object.keys(updates).length === 1) {
      return NextResponse.json({ error: "No supported booking updates were provided." }, { status: 400 });
    }

    await bookingRef.update(updates);
    const updatedSnapshot = await bookingRef.get();
    const updatedBooking = serializeBooking(updatedSnapshot.id, updatedSnapshot.data() ?? {});
    const finalStatus = String(updates.status ?? currentStatus);

    return NextResponse.json({
      success: true,
      message: updates.inspectorId
        ? "Inspector assigned and booking confirmed successfully."
        : `Booking status updated to ${finalStatus}.`,
      booking: updatedBooking,
    });
  } catch (error) {
    return errorResponse(error, "Could not update booking.");
  }
}

export async function DELETE(request: Request) {
  try {
    await requireAdmin(request);

    let body: { id?: unknown };
    try {
      body = (await request.json()) as { id?: unknown };
    } catch {
      return NextResponse.json(
        { error: "Request body must contain valid JSON." },
        { status: 400 },
      );
    }

    const id = typeof body.id === "string" ? body.id.trim() : "";
    if (!id || id.length > 200 || id.includes("/")) {
      return NextResponse.json(
        { error: "A valid booking ID is required." },
        { status: 400 },
      );
    }

    const bookingRef = adminDb().collection("bookings").doc(id);
    const bookingSnapshot = await bookingRef.get();

    if (!bookingSnapshot.exists) {
      return NextResponse.json(
        { error: "Booking not found." },
        { status: 404 },
      );
    }

    await bookingRef.delete();

    return NextResponse.json({
      success: true,
      id,
      message: "Booking deleted successfully.",
    });
  } catch (error) {
    return errorResponse(error, "Could not delete booking.");
  }
}
