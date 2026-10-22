import { NextResponse } from "next/server";
import { FieldValue } from "firebase-admin/firestore";
import { adminAuth, adminDb } from "@/lib/firebase-admin";

export async function POST(request: Request) {
  const authorization = request.headers.get("authorization");
  const match = authorization?.match(/^Bearer\s+(.+)$/i);

  if (!match) {
    return NextResponse.json({ error: "Unauthorized: missing Firebase ID token" }, { status: 401 });
  }

  try {
    const decoded = await adminAuth().verifyIdToken(match[1]);
    const body = await request.json().catch(() => null);
    const lat = body?.lat;
    const lng = body?.lng;

    if (
      typeof lat !== "number" || !Number.isFinite(lat) || lat < -90 || lat > 90 ||
      typeof lng !== "number" || !Number.isFinite(lng) || lng < -180 || lng > 180
    ) {
      return NextResponse.json({ error: "Valid latitude and longitude are required." }, { status: 400 });
    }

    const inspectorRef = adminDb().collection("inspectors").doc(decoded.uid);
    const snapshot = await inspectorRef.get();
    const inspector = snapshot.data();

    if (
      !snapshot.exists ||
      inspector?.uid !== decoded.uid ||
      inspector?.role !== "inspector" ||
      inspector?.status !== "active"
    ) {
      return NextResponse.json({ error: "Forbidden: active inspector access required" }, { status: 403 });
    }

    await inspectorRef.update({
      lat,
      lng,
      locationUpdatedAt: FieldValue.serverTimestamp(),
    });

    return NextResponse.json({ ok: true, lat, lng });
  } catch (error) {
    if (error instanceof SyntaxError) {
      return NextResponse.json({ error: "Invalid JSON request body." }, { status: 400 });
    }
    return NextResponse.json({ error: "Could not verify inspector or save location." }, { status: 401 });
  }
}
