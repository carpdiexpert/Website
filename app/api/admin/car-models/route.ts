import { NextResponse } from "next/server";
import { adminDb, requireAdmin } from "@/lib/firebase-admin";

const COLLECTION = "carModels";
const CATEGORIES = ["standard", "luxury", "ev"] as const;
type Category = (typeof CATEGORIES)[number];

function respond(error: unknown, fallback: string) {
  const message = error instanceof Error ? error.message : fallback;
  const status = message.startsWith("Unauthorized")
    ? 401
    : message.startsWith("Forbidden")
      ? 403
      : 500;
  return NextResponse.json({ error: message || fallback }, { status });
}

function normalize(value: string) {
  return value.trim().replace(/\s+/g, " ").toLowerCase();
}

function cleanName(value: string) {
  return value.trim().replace(/\s+/g, " ");
}

function parseCategory(value: unknown): Category | null {
  if (typeof value !== "string") return null;
  const category = value.trim().toLowerCase();
  return CATEGORIES.includes(category as Category) ? (category as Category) : null;
}

function parseActive(value: unknown, defaultValue = true): boolean | null {
  if (value === undefined || value === null || value === "") return defaultValue;
  if (value === true || value === "true" || value === "Active" || value === "active") return true;
  if (value === false || value === "false" || value === "Inactive" || value === "inactive") return false;
  return null;
}

type IncomingModel = {
  brand: string;
  model: string;
  category: Category;
  active: boolean;
};

function parseSingleModel(body: Record<string, unknown>): IncomingModel | { error: string } {
  if (typeof body.brand !== "string" || !body.brand.trim()) {
    return { error: "Brand is required." };
  }
  if (typeof body.model !== "string" || !body.model.trim()) {
    return { error: "Model is required." };
  }

  const brand = cleanName(body.brand);
  const model = cleanName(body.model);
  if (brand.length > 100) return { error: "Brand must be 100 characters or fewer." };
  if (model.length > 120) return { error: "Model must be 120 characters or fewer." };

  const category = parseCategory(body.category ?? body.type ?? "standard");
  if (!category) return { error: "Category must be Standard, Luxury or EV." };

  const active = parseActive(body.active, true);
  if (active === null) return { error: "Status must be Active or Inactive." };

  return { brand, model, category, active };
}

function isError(value: IncomingModel | { error: string }): value is { error: string } {
  return "error" in value;
}

// Accepts the original catalogue JSON shape: { brands: [{ brand, models: [{ name, type }] }] }.
function parseBulkPayload(body: Record<string, unknown>): IncomingModel[] | { error: string } {
  if (!Array.isArray(body.brands)) return { error: 'Bulk import expects a JSON object containing a "brands" array.' };
  const models: IncomingModel[] = [];

  for (let brandIndex = 0; brandIndex < body.brands.length; brandIndex++) {
    const brandEntry = body.brands[brandIndex];
    if (!brandEntry || typeof brandEntry !== "object" || Array.isArray(brandEntry)) {
      return { error: `Brand entry at index ${brandIndex} is invalid.` };
    }

    const entry = brandEntry as Record<string, unknown>;
    if (typeof entry.brand !== "string" || !entry.brand.trim()) {
      return { error: `Brand name is required at index ${brandIndex}.` };
    }
    if (entry.brand.trim().length > 100) {
      return { error: `Brand at index ${brandIndex} exceeds 100 characters.` };
    }
    if (!Array.isArray(entry.models)) {
      return { error: `Models must be an array for brand "${entry.brand}".` };
    }

    for (let modelIndex = 0; modelIndex < entry.models.length; modelIndex++) {
      const modelEntry = entry.models[modelIndex];
      if (!modelEntry || typeof modelEntry !== "object" || Array.isArray(modelEntry)) {
        return { error: `Invalid model entry for brand "${entry.brand}" at index ${modelIndex}.` };
      }
      const item = modelEntry as Record<string, unknown>;
      if (typeof item.name !== "string" || !item.name.trim()) {
        return { error: `Model name is required for brand "${entry.brand}" at index ${modelIndex}.` };
      }
      if (item.name.trim().length > 120) {
        return { error: `Model "${item.name}" exceeds 120 characters.` };
      }

      // The uploaded JSON uses `type`; category is also accepted for convenience.
      const category = parseCategory(item.type ?? item.category ?? "standard");
      if (!category) {
        return { error: `Invalid category for ${entry.brand} ${item.name}. Use Standard, Luxury or EV.` };
      }

      models.push({
        brand: cleanName(entry.brand),
        model: cleanName(item.name),
        category,
        // The catalogue JSON has no active field; imported models are active by default.
        active: parseActive(item.active, true) ?? true,
      });
    }
  }

  if (models.length === 0) return { error: "The JSON contains no car models to import." };
  if (models.length > 450) {
    return { error: `This import contains ${models.length} models. Import at most 450 models per request.` };
  }
  return models;
}

function modelKey(brand: string, model: string) {
  return `${normalize(brand)}\u0000${normalize(model)}`;
}

// GET: List car models.
// export async function GET(request: Request) {
//   try {
//     await requireAdmin(request);
//     const snapshot = await adminDb().collection(COLLECTION).orderBy("brand").limit(1000).get();
//     return NextResponse.json({ models: snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })) });
//   } catch (error) {
//     return respond(error, "Could not load car models.");
//   }
// }

// POST: Creates one model or imports the original nested catalogue JSON in bulk.
export async function POST(request: Request) {
  try {
    await requireAdmin(request);
    const body: unknown = await request.json();
    if (!body || typeof body !== "object" || Array.isArray(body)) {
      return NextResponse.json({ error: "Request body must be a JSON object." }, { status: 400 });
    }

    const payload = body as Record<string, unknown>;
    const isBulk = Array.isArray(payload.brands);
    const parsed = isBulk ? parseBulkPayload(payload) : parseSingleModel(payload);
    if ("error" in parsed) {
      return NextResponse.json({ error: parsed.error }, { status: 400 });
    }

    const db = adminDb();
    const collection = db.collection(COLLECTION);

    if (!isBulk) {
      const model = parsed as IncomingModel;
      const ref = collection.doc();
      const result = await db.runTransaction(async (transaction) => {
        const snapshot = await transaction.get(collection);
        const existingKeys = new Set<string>();
        for (const doc of snapshot.docs) {
          const data = doc.data();
          const brand = typeof data.brandKey === "string" ? data.brandKey : data.brand;
          const modelName = typeof data.modelKey === "string" ? data.modelKey : data.model;
          if (typeof brand === "string" && typeof modelName === "string") {
            existingKeys.add(modelKey(brand, modelName));
          }
        }
        if (existingKeys.has(modelKey(model.brand, model.model))) return false;
        transaction.set(ref, {
          ...model,
          brandKey: normalize(model.brand),
          modelKey: normalize(model.model),
          createdAt: new Date(),
          updatedAt: new Date(),
        });
        return true;
      });

      if (!result) {
        return NextResponse.json({ error: "This brand and model combination already exists." }, { status: 409 });
      }
      return NextResponse.json({ ok: true, id: ref.id }, { status: 201 });
    }

    const incoming = parsed as IncomingModel[];
    const result = await db.runTransaction(async (transaction) => {
      // Read all existing models before writing anything; this also checks legacy documents.
      const snapshot = await transaction.get(collection);
      const knownKeys = new Set<string>();
      for (const doc of snapshot.docs) {
        const data = doc.data();
        const brand = typeof data.brandKey === "string" ? data.brandKey : data.brand;
        const modelName = typeof data.modelKey === "string" ? data.modelKey : data.model;
        if (typeof brand === "string" && typeof modelName === "string") {
          knownKeys.add(modelKey(brand, modelName));
        }
      }

      const toAdd: IncomingModel[] = [];
      let skipped = 0;
      for (const model of incoming) {
        const key = modelKey(model.brand, model.model);
        if (knownKeys.has(key)) {
          skipped++;
          continue;
        }
        knownKeys.add(key); // Prevent duplicates within the uploaded JSON too.
        toAdd.push(model);
      }

      for (const model of toAdd) {
        const ref = collection.doc();
        transaction.set(ref, {
          ...model,
          brandKey: normalize(model.brand),
          modelKey: normalize(model.model),
          createdAt: new Date(),
          updatedAt: new Date(),
        });
      }

      return { added: toAdd.length, skipped, total: incoming.length };
    });

    return NextResponse.json({ ok: true, ...result }, { status: 200 });
  } catch (error) {
    return respond(error, "Could not create or import car models.");
  }
}

// PATCH: Edit a model or change only its active status.
export async function PATCH(request: Request) {
  try {
    await requireAdmin(request);
    const body: unknown = await request.json();
    if (!body || typeof body !== "object" || Array.isArray(body)) {
      return NextResponse.json({ error: "Request body must be a JSON object." }, { status: 400 });
    }
    const payload = body as Record<string, unknown>;
    if (typeof payload.id !== "string" || !payload.id.trim()) {
      return NextResponse.json({ error: "A valid model ID is required." }, { status: 400 });
    }

    const db = adminDb();
    const ref = db.collection(COLLECTION).doc(payload.id);
    const statusOnly = typeof payload.active === "boolean" && payload.brand === undefined && payload.model === undefined && payload.category === undefined;

    if (statusOnly) {
      const existing = await ref.get();
      if (!existing.exists) return NextResponse.json({ error: "Car model not found." }, { status: 404 });
      await ref.update({ active: payload.active, updatedAt: new Date() });
      return NextResponse.json({ ok: true });
    }

    const parsed = parseSingleModel(payload);
    if (isError(parsed)) return NextResponse.json({ error: parsed.error }, { status: 400 });

    const result = await db.runTransaction(async (transaction) => {
      const existing = await transaction.get(ref);
      if (!existing.exists) return "not-found" as const;
      const snapshot = await transaction.get(db.collection(COLLECTION));
      for (const doc of snapshot.docs) {
        if (doc.id === ref.id) continue;
        const data = doc.data();
        const brand = typeof data.brandKey === "string" ? data.brandKey : data.brand;
        const modelName = typeof data.modelKey === "string" ? data.modelKey : data.model;
        if (typeof brand === "string" && typeof modelName === "string" && modelKey(brand, modelName) === modelKey(parsed.brand, parsed.model)) {
          return "duplicate" as const;
        }
      }
      transaction.update(ref, {
        ...parsed,
        brandKey: normalize(parsed.brand),
        modelKey: normalize(parsed.model),
        updatedAt: new Date(),
      });
      return "updated" as const;
    });

    if (result === "not-found") return NextResponse.json({ error: "Car model not found." }, { status: 404 });
    if (result === "duplicate") return NextResponse.json({ error: "Another model with this brand and model already exists." }, { status: 409 });
    return NextResponse.json({ ok: true });
  } catch (error) {
    return respond(error, "Could not update car model.");
  }
}

// DELETE: Remove a model.
export async function DELETE(request: Request) {
  try {
    await requireAdmin(request);
    const body: unknown = await request.json();
    if (!body || typeof body !== "object" || Array.isArray(body)) {
      return NextResponse.json({ error: "Request body must be a JSON object." }, { status: 400 });
    }
    const payload = body as Record<string, unknown>;
    if (typeof payload.id !== "string" || !payload.id.trim()) {
      return NextResponse.json({ error: "A valid model ID is required." }, { status: 400 });
    }
    const ref = adminDb().collection(COLLECTION).doc(payload.id);
    const snapshot = await ref.get();
    if (!snapshot.exists) return NextResponse.json({ error: "Car model not found." }, { status: 404 });
    await ref.delete();
    return NextResponse.json({ ok: true });
  } catch (error) {
    return respond(error, "Could not delete car model.");
  }
}


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
