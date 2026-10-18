import { NextResponse } from "next/server";
import { adminDb, requireAdmin } from "@/lib/firebase-admin";
function respond(error: unknown, fallback: string) {
  const message = error instanceof Error ? error.message : fallback;
  const status = message.startsWith("Unauthorized") ? 401 : message.startsWith("Forbidden") ? 403 : 500;
  return NextResponse.json({ error: message || fallback }, { status });
}
export async function GET(request: Request) {
  try {
    await requireAdmin(request);
    const snapshot = await adminDb().collection("carModels").orderBy("brand").limit(1000).get();
    return NextResponse.json({ models: snapshot.docs.map(d => ({ id: d.id, ...d.data() })) });
  } catch (e) { return respond(e, "Could not load car models"); }
}
export async function POST(request: Request) {
  try {
    await requireAdmin(request);
    const body = await request.json();
    for (const key of ["brand", "model"] as const) {
      if (typeof body[key] !== "string" || !body[key].trim()) return NextResponse.json({ error: `${key} is required` }, { status: 400 });
    }
    const category = typeof body.category === "string" ? body.category.trim().toLowerCase() : "standard";
    if (!["standard", "luxury", "ev", "used"].includes(category)) return NextResponse.json({ error: "Category must be standard, luxury, ev or used." }, { status: 400 });
    const ref = await adminDb().collection("carModels").add({
      brand: body.brand.trim().slice(0, 100), model: body.model.trim().slice(0, 120),
      category, active: body.active !== "false" && body.active !== false, createdAt: new Date(),
    });
    return NextResponse.json({ ok: true, id: ref.id }, { status: 201 });
  } catch (e) { return respond(e, "Could not create car model"); }
}
export async function PATCH(request: Request) {
  try {
    await requireAdmin(request);
    const body = await request.json();
    if (typeof body.id !== "string" || !body.id.trim() || typeof body.active !== "boolean") return NextResponse.json({ error: "Provide a model ID and active boolean." }, { status: 400 });
    const ref = adminDb().collection("carModels").doc(body.id);
    if (!(await ref.get()).exists) return NextResponse.json({ error: "Car model not found." }, { status: 404 });
    await ref.update({ active: body.active, updatedAt: new Date() });
    return NextResponse.json({ ok: true });
  } catch (e) { return respond(e, "Could not update car model"); }
}
