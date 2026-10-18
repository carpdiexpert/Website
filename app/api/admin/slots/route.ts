
import { NextResponse } from "next/server";
import { FieldValue } from "firebase-admin/firestore";
import { adminDb, requireAdmin } from "@/lib/firebase-admin";
import { CITIES } from "@/lib/cities";
import { BOOKING_SLOTS } from "@/lib/slots";

const cityNames: Record<string, string> = Object.fromEntries(
  Object.entries(CITIES).map(([slug, city]) => [slug, city.name]),
);

const validDate = (value: string) => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  return (
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day
  );
};

function blockId(citySlug: string, date: string, type: string, slot?: string) {
  return type === "day"
    ? `${citySlug}_${date}_day`
    : `${citySlug}_${date}_${slot!.replace(":", "-")}`;
}

function respond(error: unknown, fallback: string) {
  const message = error instanceof Error ? error.message : fallback;
  const status = message.startsWith("Unauthorized")
    ? 401
    : message.startsWith("Forbidden")
      ? 403
      : 500;

  return NextResponse.json({ error: message || fallback }, { status });
}

export async function GET(request: Request) {
  try {
    await requireAdmin(request);

    const url = new URL(request.url);
    const city = (url.searchParams.get("city") || "").trim().toLowerCase();
    const date = (url.searchParams.get("date") || "").trim();

    let query: FirebaseFirestore.Query = adminDb()
      .collection("blockedSlots");

    if (city) {
      if (!cityNames[city]) {
        return NextResponse.json({ error: "Invalid city." }, { status: 400 });
      }
      query = query.where("citySlug", "==", city);
    }

    if (date) {
      if (!validDate(date)) {
        return NextResponse.json({ error: "Invalid date." }, { status: 400 });
      }
      query = query.where("date", "==", date);
    }

    const snapshot = await query.limit(500).get();

    const blocks = snapshot.docs
      .map((doc) => ({ id: doc.id, ...doc.data() }))
      .sort((a: any, b: any) =>
        `${a.date}_${a.citySlug}_${a.type}_${a.slot || ""}`.localeCompare(
          `${b.date}_${b.citySlug}_${b.type}_${b.slot || ""}`,
        ),
      );

    return NextResponse.json(
      { blocks },
      { headers: { "Cache-Control": "no-store, max-age=0" } },
    );
  } catch (error) {
    return respond(error, "Could not load blocked slots.");
  }
}

export async function POST(request: Request) {
  try {
    await requireAdmin(request);

    const body = await request.json();
    const citySlug = String(body.citySlug ?? body.city ?? "")
      .trim()
      .toLowerCase();
    const date = String(body.date ?? "").trim();
    const type = String(body.type ?? "").trim();
    const slot = String(body.slot ?? "").trim();
    const reason = String(body.reason ?? "").trim().slice(0, 250);

    if (!cityNames[citySlug]) {
      return NextResponse.json({ error: "Select a valid city." }, { status: 400 });
    }

    if (!validDate(date)) {
      return NextResponse.json(
        { error: "Enter a valid date in YYYY-MM-DD format." },
        { status: 400 },
      );
    }

    if (type !== "day" && type !== "slot") {
      return NextResponse.json(
        { error: "Choose a whole-day block or a specific time slot." },
        { status: 400 },
      );
    }

    if (
      type === "slot" &&
      !(BOOKING_SLOTS as readonly string[]).includes(slot)
    ) {
      return NextResponse.json(
        { error: "Select a valid inspection time slot." },
        { status: 400 },
      );
    }

    if (type === "day" && slot) {
      return NextResponse.json(
        { error: "A whole-day block must not include a time slot." },
        { status: 400 },
      );
    }

    const id = blockId(citySlug, date, type, type === "slot" ? slot : undefined);
    const ref = adminDb().collection("blockedSlots").doc(id);

    await adminDb().runTransaction(async (transaction) => {
      const existing = await transaction.get(ref);

      if (existing.exists) {
        throw new Error("BLOCK_ALREADY_EXISTS");
      }

      transaction.create(ref, {
        citySlug,
        city: cityNames[citySlug],
        date,
        type,
        slot: type === "slot" ? slot : null,
        reason: reason || "Unavailable",
        createdAt: FieldValue.serverTimestamp(),
      });
    });

    return NextResponse.json({ ok: true, id }, { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.message === "BLOCK_ALREADY_EXISTS") {
      return NextResponse.json(
        { error: "This date or time slot is already blocked for that city." },
        { status: 409 },
      );
    }

    return respond(error, "Could not create block.");
  }
}

export async function DELETE(request: Request) {
  try {
    await requireAdmin(request);

    const body = await request.json();
    const id = typeof body.id === "string" ? body.id.trim() : "";

    if (!id) {
      return NextResponse.json({ error: "Block ID is required." }, { status: 400 });
    }

    const ref = adminDb().collection("blockedSlots").doc(id);
    const snapshot = await ref.get();

    if (!snapshot.exists) {
      return NextResponse.json({ error: "Block not found." }, { status: 404 });
    }

    await ref.delete();
    return NextResponse.json({ ok: true });
  } catch (error) {
    return respond(error, "Could not remove block.");
  }
}
