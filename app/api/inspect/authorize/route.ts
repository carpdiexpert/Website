import { NextResponse } from "next/server";
import { adminAuth, adminDb } from "@/lib/firebase-admin";

export async function GET(request: Request) {
  const authorization = request.headers.get("authorization");
  const match = authorization?.match(/^Bearer\s+(.+)$/i);

  if (!match) {
    return NextResponse.json(
      { ok: false, error: "Unauthorized: missing Firebase ID token" },
      { status: 401, headers: { "Cache-Control": "no-store, max-age=0" } },
    );
  }

  try {
    const decoded = await adminAuth().verifyIdToken(match[1]);
    const snapshot = await adminDb().collection("inspectors").doc(decoded.uid).get();
    const inspector = snapshot.data();

    if (
      !snapshot.exists ||
      inspector?.uid !== decoded.uid ||
      inspector?.role !== "inspector" ||
      inspector?.status !== "active"
    ) {
      return NextResponse.json(
        { ok: false, error: "Forbidden: active inspector access required" },
        { status: 403, headers: { "Cache-Control": "no-store, max-age=0" } },
      );
    }

    return NextResponse.json(
      {
        ok: true,
        inspector: {
          uid: decoded.uid,
          name: typeof inspector.name === "string" ? inspector.name : "",
          email: typeof inspector.email === "string" ? inspector.email : decoded.email ?? "",
          city: typeof inspector.city === "string" ? inspector.city : "",
        },
      },
      { headers: { "Cache-Control": "no-store, max-age=0" } },
    );
  } catch {
    return NextResponse.json(
      { ok: false, error: "Unauthorized: invalid or expired Firebase ID token" },
      { status: 401, headers: { "Cache-Control": "no-store, max-age=0" } },
    );
  }
}
