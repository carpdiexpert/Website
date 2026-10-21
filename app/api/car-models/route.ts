import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";

/**
 * Public read-only catalogue endpoint for the booking chatbot.
 * Only active car models and the fields needed by the booking form are exposed.
 */
export async function GET() {
  try {
    const snapshot = await adminDb().collection("carModels").get();

    const models = snapshot.docs
      .map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          brand: typeof data.brand === "string" ? data.brand.trim() : "",
          model: typeof data.model === "string" ? data.model.trim() : "",
          category: typeof data.category === "string" ? data.category : "standard",
          active: data.active === true,
        };
      })
      .filter((item) => item.active && item.brand && item.model)
      .sort((a, b) =>
        a.brand.localeCompare(b.brand) || a.model.localeCompare(b.model)
      );

    return NextResponse.json(
      { models },
      {
        headers: {
          "Cache-Control": "public, max-age=60, stale-while-revalidate=300",
        },
      }
    );
  } catch (error) {
    console.error("Could not load public car model catalogue:", error);
    return NextResponse.json(
      { error: "Could not load car brands and models." },
      { status: 500 }
    );
  }
}
