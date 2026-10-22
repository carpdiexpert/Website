import { NextResponse } from "next/server";
import { adminAuth, adminDb } from "@/lib/firebase-admin";

export async function GET(request: Request) {
  const authorization = request.headers.get("authorization");
  const match = authorization?.match(/^Bearer\s+(.+)$/i);

  if (!match) {
    return NextResponse.json({ error: "Unauthorized: missing Firebase ID token" }, { status: 401 });
  }

  try {
    const decoded = await adminAuth().verifyIdToken(match[1]);
    const inspectorSnapshot = await adminDb().collection("inspectors").doc(decoded.uid).get();
    const inspector = inspectorSnapshot.data();

    if (
      !inspectorSnapshot.exists ||
      inspector?.uid !== decoded.uid ||
      inspector?.role !== "inspector" ||
      inspector?.status !== "active"
    ) {
      return NextResponse.json({ error: "Forbidden: active inspector access required" }, { status: 403 });
    }

    return NextResponse.json({
      ok: true,
      inspector: {
        uid: decoded.uid,
        name: typeof inspector.name === "string" ? inspector.name : "",
        email: typeof inspector.email === "string" ? inspector.email : decoded.email ?? "",
        city: typeof inspector.city === "string" ? inspector.city : "",
        lat: typeof inspector.lat === "number" ? inspector.lat : null,
        lng: typeof inspector.lng === "number" ? inspector.lng : null,
      },
    });
  } catch {
    return NextResponse.json({ error: "Unauthorized: invalid or expired Firebase ID token" }, { status: 401 });
  }
}
