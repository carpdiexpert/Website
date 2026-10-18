
import { NextResponse } from "next/server";
import { adminAuth, adminDb, requireAdmin } from "@/lib/firebase-admin";
import { CITIES } from "@/lib/cities";

function errorResponse(
  error: unknown,
  fallback: string,
  defaultStatus = 500,
) {
  const message = error instanceof Error ? error.message : fallback;

  const status = message.startsWith("Unauthorized")
    ? 401
    : message.startsWith("Forbidden")
      ? 403
      : defaultStatus;

  return NextResponse.json(
    { error: message || fallback },
    { status },
  );
}

export async function GET(request: Request) {
  try {
    await requireAdmin(request);

    const snapshot = await adminDb()
      .collection("inspectors")
      .orderBy("name")
      .get();

    const inspectors = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return NextResponse.json({ inspectors });
  } catch (error) {
    return errorResponse(error, "Could not load inspectors");
  }
}

export async function POST(request: Request) {
  let createdUid: string | null = null;

  try {
    await requireAdmin(request);

    const body = await request.json();

    for (const key of ["name", "mobile", "email", "city"] as const) {
      if (typeof body[key] !== "string" || !body[key].trim()) {
        return NextResponse.json(
          { error: `${key} is required` },
          { status: 400 },
        );
      }
    }

    if (typeof body.password !== "string" || !body.password) {
      return NextResponse.json(
        { error: "An initial password is required." },
        { status: 400 },
      );
    }

    const name = body.name.trim().replace(/\s+/g, " ").slice(0, 120);
    const mobile = body.mobile.trim().slice(0, 30);
    const email = body.email.trim().toLowerCase();
    const city = body.city.trim();
    const password = body.password;

    // No company-domain restriction. Firebase validates email format.
    if (email.length > 254 || /[\s\u0000-\u001F\u007F]/.test(email)) {
      return NextResponse.json(
        { error: "Enter a valid email address." },
        { status: 400 },
      );
    }

    if (password.length < 8 || password.length > 128) {
      return NextResponse.json(
        { error: "Password must be between 8 and 128 characters." },
        { status: 400 },
      );
    }

    if (/[\u0000-\u001F\u007F]/.test(password)) {
      return NextResponse.json(
        { error: "Password contains unsupported control characters." },
        { status: 400 },
      );
    }

    const validCities = Object.values(CITIES).map((item) => item.name);

    if (!validCities.includes(city)) {
      return NextResponse.json(
        { error: "Invalid city. Select a city from the list." },
        { status: 400 },
      );
    }

    const digits = mobile.replace(/\D/g, "");
    const phoneNumber = mobile.startsWith("+")
      ? `+${digits}`
      : digits.length === 10
        ? `+91${digits}`
        : `+${digits}`;

    if (!/^\+[1-9]\d{7,14}$/.test(phoneNumber)) {
      return NextResponse.json(
        { error: "Enter a valid mobile number with country code." },
        { status: 400 },
      );
    }

    const auth = adminAuth();
    const db = adminDb();

    const user = await auth.createUser({
      email,
      password,
      displayName: name,
      phoneNumber,
      disabled: false,
    });

    createdUid = user.uid;

    await auth.setCustomUserClaims(user.uid, {
      role: "inspector",
      status: "active",
    });

    await db.collection("inspectors").doc(user.uid).set({
      name,
      mobile,
      email,
      city,
      role: "inspector",
      status: "active",
      uid: user.uid,
      createdAt: new Date(),
    });

    return NextResponse.json(
      {
        ok: true,
        uid: user.uid,
        message: "Inspector account created successfully.",
      },
      { status: 201 },
    );
  } catch (error) {
    if (createdUid) {
      // Best-effort rollback if a later creation step fails.
      try {
        await adminAuth().deleteUser(createdUid);
      } catch {
        // Preserve the original error.
      }
    }

    const code =
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      typeof error.code === "string"
        ? error.code
        : "";

    if (
      code === "auth/email-already-exists" ||
      (error instanceof Error &&
        error.message.includes("email-already-exists"))
    ) {
      return NextResponse.json(
        { error: "An account already exists with this email address." },
        { status: 409 },
      );
    }

    if (
      code === "auth/invalid-password" ||
      code === "auth/weak-password"
    ) {
      return NextResponse.json(
        { error: "Firebase rejected this password. Choose a stronger password." },
        { status: 400 },
      );
    }

    return errorResponse(error, "Inspector could not be created", 400);
  }
}

export async function PATCH(request: Request) {
  try {
    await requireAdmin(request);

    const body = await request.json();

    if (
      typeof body.id !== "string" ||
      !body.id.trim() ||
      !["active", "inactive"].includes(body.status)
    ) {
      return NextResponse.json(
        { error: "Provide a valid inspector ID and status." },
        { status: 400 },
      );
    }

    const db = adminDb();
    const ref = db.collection("inspectors").doc(body.id);
    const existing = await ref.get();

    if (!existing.exists) {
      return NextResponse.json(
        { error: "Inspector not found." },
        { status: 404 },
      );
    }

    const status = body.status as "active" | "inactive";

    await adminAuth().setCustomUserClaims(body.id, {
      role: "inspector",
      status,
    });

    await adminAuth().updateUser(body.id, {
      disabled: status === "inactive",
    });

    await ref.update({ status });

    return NextResponse.json({ ok: true });
  } catch (error) {
    return errorResponse(
      error,
      "Inspector status could not be updated",
      400,
    );
  }
}
