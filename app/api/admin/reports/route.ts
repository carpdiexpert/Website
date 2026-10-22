
import { NextResponse } from "next/server";
import { requireAdmin, adminDb } from "@/lib/firebase-admin";
import { Timestamp } from "firebase-admin/firestore";

function serialize(value: any): any {
  if (value instanceof Timestamp) {
    return value.toMillis();
  }

  if (Array.isArray(value)) {
    return value.map(serialize);
  }

  if (value && typeof value === "object") {
    const result: Record<string, any> = {};

    for (const [key, item] of Object.entries(value)) {
      result[key] = serialize(item);
    }

    return result;
  }

  return value;
}

function errorResponse(error: unknown) {
  const message =
    error instanceof Error ? error.message : "Request failed.";

  const status = message.startsWith("Unauthorized")
    ? 401
    : message.startsWith("Forbidden")
      ? 403
      : 500;

  if (status === 500) {
    console.error("Admin reports API error:", error);
  }

  return NextResponse.json(
    {
      error:
        status === 500 ? "Unable to process reports request." : message,
    },
    { status }
  );
}

export async function GET(request: Request) {
  try {
    await requireAdmin(request);

    const snapshot = await adminDb()
      .collection("reports")
      .get();

    const reports = snapshot.docs.map((reportDoc) => ({
      id: reportDoc.id,
      ...serialize(reportDoc.data()),
    }));

    return NextResponse.json(
      { reports },
      {
        headers: {
          "Cache-Control": "private, no-store",
        },
      }
    );
  } catch (error) {
    return errorResponse(error);
  }
}
