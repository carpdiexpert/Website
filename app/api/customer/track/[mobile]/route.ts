import { NextResponse } from "next/server";
import { createHash } from "node:crypto";
import { adminDb } from "@/lib/firebase-admin";

const noStore = { "Cache-Control": "no-store, max-age=0, private" };

function serialize(value: any): any {
  if (value === null || value === undefined) return value ?? null;
  if (typeof value?.toDate === "function") return value.toDate().toISOString();
  if (Array.isArray(value)) return value.map(serialize);
  if (typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value)
        .filter(([key]) => !/(password|token|secret|privatekey|serviceaccount)/i.test(key))
        .map(([key, entry]) => [key, serialize(entry)]),
    );
  }
  return value;
}

function bookingForCustomer(id: string, raw: Record<string, any>) {
  return {
    id,
    name: typeof raw.name === "string" ? raw.name : "",
    brand: typeof raw.brand === "string" ? raw.brand : (typeof raw.carBrand === "string" ? raw.carBrand : ""),
    model: typeof raw.model === "string" ? raw.model : (typeof raw.carModel === "string" ? raw.carModel : ""),
    location: typeof raw.location === "string" ? raw.location : (typeof raw.address === "string" ? raw.address : ""),
    slot: typeof raw.slot === "string" ? raw.slot : "",
    date: typeof raw.date === "string" ? raw.date : "",
    status: typeof raw.status === "string" ? raw.status : "unknown",
    assignedTo: typeof raw.assignedTo === "string" ? raw.assignedTo : (typeof raw.inspectorName === "string" ? raw.inspectorName : ""),
    inspectorId: typeof raw.inspectorId === "string" ? raw.inspectorId : "",
  };
}

export async function GET(
  _request: Request,
  context: { params: Promise<{ mobile: string }> },
) {
  try {
    const { mobile: token } = await context.params;

    // Tokens are 32 random bytes encoded as base64url (43 characters).
    if (!token || token.length < 40 || token.length > 60 || !/^[A-Za-z0-9_-]+$/.test(token)) {
      return NextResponse.json({ ok: false, error: "This tracking link is invalid." }, { status: 404, headers: noStore });
    }

    const trackingTokenHash = createHash("sha256").update(token).digest("hex");
    const db = adminDb();
    const bookingSnapshot = await db.collection("bookings")
      .where("trackingTokenHash", "==", trackingTokenHash)
      .limit(1)
      .get();

    if (bookingSnapshot.empty) {
      return NextResponse.json({ ok: false, error: "This tracking link is invalid or no longer available." }, { status: 404, headers: noStore });
    }

    const bookingDoc = bookingSnapshot.docs[0];
    const rawBooking = bookingDoc.data() as Record<string, any>;
    const booking = bookingForCustomer(bookingDoc.id, rawBooking);

    // Only return a report explicitly tied to this booking. Do not search reports
    // by mobile number, which could expose a different booking's report.
    let report: any = null;
    const reportSnapshot = await db.collection("reports")
      .where("bookingId", "==", bookingDoc.id)
      .limit(10)
      .get();

    if (!reportSnapshot.empty) {
      const latestReportDoc = reportSnapshot.docs[reportSnapshot.docs.length - 1];
      const rawReport = serialize(latestReportDoc.data()) as Record<string, any>;
      report = {
        meta: { ...rawReport, id: latestReportDoc.id },
        results: rawReport.checklistResults ?? rawReport.results ?? {},
        score: rawReport.healthScore ?? null,
      };
    }

    let inspector: { mobile: string } | null = null;
    if (booking.inspectorId) {
      const inspectorSnapshot = await db.collection("inspectors").doc(booking.inspectorId).get();
      const inspectorData = inspectorSnapshot.data();
      if (inspectorSnapshot.exists && inspectorData) {
        inspector = { mobile: typeof inspectorData.mobile === "string" ? inspectorData.mobile : "" };
      }
    }

    return NextResponse.json({ ok: true, booking, report, inspector }, { status: 200, headers: noStore });
  } catch (error) {
    console.error("Customer tracking API failed:", error);
    return NextResponse.json({ ok: false, error: "Unable to load tracking details right now." }, { status: 500, headers: noStore });
  }
}
