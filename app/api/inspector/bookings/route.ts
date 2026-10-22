import { NextResponse } from "next/server";
import { adminAuth, adminDb } from "@/lib/firebase-admin";
import { FieldValue } from "firebase-admin/firestore";



async function getActiveInspector(request: Request) {
  const authorization = request.headers.get("authorization");
  const match = authorization?.match(/^Bearer\s+(.+)$/i);
  if (!match) throw new Error("UNAUTHORIZED");

  const decoded = await adminAuth().verifyIdToken(match[1]);
  const snapshot = await adminDb().collection("inspectors").doc(decoded.uid).get();
  const inspector = snapshot.data();

  if (
    !snapshot.exists ||
    inspector?.uid !== decoded.uid ||
    inspector?.role !== "inspector" ||
    inspector?.status !== "active"
  ) {
    throw new Error("FORBIDDEN");
  }

  return { uid: decoded.uid, inspector };
}

export async function GET(request: Request) {
  try {
    const { uid } = await getActiveInspector(request);
    const snapshot = await adminDb()
      .collection("bookings")
      .where("inspectorId", "==", uid)
      .get();

    const bookings = snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        address: typeof data.address === "string" ? data.address : "",
        location: typeof data.location === "string" ? data.location : "",
        city: typeof data.city === "string" ? data.city : "",
        date: typeof data.date === "string" ? data.date : "",
        slot: typeof data.slot === "string" ? data.slot : "",
        carBrand: typeof data.carBrand === "string" ? data.carBrand : "",
        carModel: typeof data.carModel === "string" ? data.carModel : "",
        inspectionLabel: typeof data.inspectionLabel === "string" ? data.inspectionLabel : "PDI",
        inspectionType: typeof data.inspectionType === "string" ? data.inspectionType : "",
        name: typeof data.name === "string" ? data.name : "",
        mobile: typeof data.mobile === "string" ? data.mobile : "",
        price: typeof data.price === "number" ? data.price : null,
        status: typeof data.status === "string" ? data.status : "unknown",
        inspectorId: typeof data.inspectorId === "string" ? data.inspectorId : "",
        inspectorName: typeof data.inspectorName === "string" ? data.inspectorName : "",
      };
    });

    return NextResponse.json({ ok: true, bookings }, {
      headers: { "Cache-Control": "no-store, max-age=0" },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "";
    const status = message === "UNAUTHORIZED" ? 401 : message === "FORBIDDEN" ? 403 : 401;
    return NextResponse.json(
      { ok: false, error: status === 403 ? "Active inspector access required" : "Unauthorized" },
      { status, headers: { "Cache-Control": "no-store, max-age=0" } },
    );
  }
}


// The only booking mutation allowed for an inspector is the status transition
// after a completed report belonging to that inspector has been saved.
export async function PATCH(request: Request) {
  try {
    const { uid } = await getActiveInspector(request);
    const body = await request.json().catch(() => null);
    const bookingId = typeof body?.bookingId === "string" ? body.bookingId.trim() : "";
    const reportId = typeof body?.reportId === "string" ? body.reportId.trim() : "";

    if (!bookingId || !reportId) {
      return NextResponse.json({ ok: false, error: "bookingId and reportId are required" }, { status: 400 });
    }

    const db = adminDb();
    const bookingRef = db.collection("bookings").doc(bookingId);
    const reportRef = db.collection("reports").doc(reportId);

    const result = await db.runTransaction(async (transaction) => {
      const [bookingSnapshot, reportSnapshot] = await Promise.all([
        transaction.get(bookingRef),
        transaction.get(reportRef),
      ]);

      if (!bookingSnapshot.exists) return { status: 404 as const, error: "Booking not found" };
      if (!reportSnapshot.exists) return { status: 400 as const, error: "Submitted report not found" };

      const booking = bookingSnapshot.data()!;
      const report = reportSnapshot.data()!;
      if (booking.inspectorId !== uid) return { status: 403 as const, error: "This booking is not assigned to you" };
      if (report.bookingId !== bookingId || report.inspectorUid !== uid || String(report.status ?? "").toLowerCase() !== "completed") {
        return { status: 403 as const, error: "A completed report belonging to this inspector is required" };
      }

      const currentStatus = String(booking.status ?? "").toLowerCase();
      if (currentStatus === "completed") return { status: 200 as const, alreadyCompleted: true };
      if (currentStatus !== "confirmed") {
        return { status: 409 as const, error: "Only confirmed bookings can be completed" };
      }

      // Intentionally update only these two fields. No booking details supplied
      // by the client are copied to the booking document.
      transaction.update(bookingRef, {
        status: "completed",
        updatedAt: FieldValue.serverTimestamp(),
      });
      return { status: 200 as const, alreadyCompleted: false };
    });

    if (result.status !== 200) {
      return NextResponse.json({ ok: false, error: result.error }, { status: result.status });
    }
    return NextResponse.json({ ok: true, status: "completed", alreadyCompleted: result.alreadyCompleted ?? false });
  } catch (error) {
    const message = error instanceof Error ? error.message : "";
    const status = message === "UNAUTHORIZED" ? 401 : message === "FORBIDDEN" ? 403 : 401;
    return NextResponse.json({ ok: false, error: status === 403 ? "Active inspector access required" : "Unauthorized" }, { status });
  }
}
