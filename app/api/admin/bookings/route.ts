import { NextResponse } from "next/server";
import { FieldValue, type DocumentData } from "firebase-admin/firestore";
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
    // Legacy records without a status are treated as Pending.
    status: typeof data.status === "string" && data.status.trim()
      ? data.status.trim().toLowerCase()
      : "pending",
    createdAt: isoTimestamp(data.createdAt),
    updatedAt: isoTimestamp(data.updatedAt),
    assignedAt: isoTimestamp(data.assignedAt),
  };
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
      if (inspector.status !== "active") {
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
      // Assigning an inspector moves the booking to Confirmed unless an explicit status was supplied.
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
