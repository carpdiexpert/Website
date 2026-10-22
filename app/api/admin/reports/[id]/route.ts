
import { NextResponse } from "next/server";
import {
  FieldValue,
} from "firebase-admin/firestore";
import { requireAdmin, adminDb } from "@/lib/firebase-admin";


type RouteContext = {
  params: Promise<{ id: string }>;
};

function errorResponse(error: unknown) {
  const message =
    error instanceof Error ? error.message : "Request failed.";

  const status = message.startsWith("Unauthorized")
    ? 401
    : message.startsWith("Forbidden")
      ? 403
      : 500;

  if (status === 500) {
    console.error("Admin report update API error:", error);
  }

  return NextResponse.json(
    {
      error:
        status === 500 ? "Unable to update report." : message,
    },
    { status }
  );
}

export async function PATCH(
  request: Request,
  context: RouteContext
) {
  try {
    await requireAdmin(request);

    const { id } = await context.params;

    if (!id || id.includes("/")) {
      return NextResponse.json(
        { error: "Invalid report ID." },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { action } = body ?? {};

    const reportRef = adminDb()
      .collection("reports")
      .doc(id);

    const reportSnapshot = await reportRef.get();

    if (!reportSnapshot.exists) {
      return NextResponse.json(
        { error: "Report not found." },
        { status: 404 }
      );
    }

    if (action === "approve") {
      await reportRef.update({
        status: "Approved",
        approved: true,
        approvedAt: FieldValue.serverTimestamp(),
      });

      return NextResponse.json({
        success: true,
        message: "Report approved.",
      });
    }

    if (action === "summary") {
      const summary = body.summary;

      const summaryFields = [
        "overallCondition",
        "keyHighlights",
        "criticalIssues",
        "recommendations",
        "verdict",
      ] as const;

      if (
        !summary ||
        typeof summary !== "object" ||
        Array.isArray(summary) ||
        !summaryFields.every(
          (field) => typeof summary[field] === "string"
        )
      ) {
        return NextResponse.json(
          { error: "Invalid AI summary. All five fields must be strings." },
          { status: 400 }
        );
      }

      await reportRef.update({
        aiGeneratedSummary: {
          overallCondition: summary.overallCondition.trim(),
          keyHighlights: summary.keyHighlights.trim(),
          criticalIssues: summary.criticalIssues.trim(),
          recommendations: summary.recommendations.trim(),
          verdict: summary.verdict.trim(),
        },
        aiSummaryUpdatedAt: FieldValue.serverTimestamp(),
      });

      return NextResponse.json({
        success: true,
        message: "AI summary saved.",
      });
    }

    if (action === "save") {
      const data = body.data;

      if (
        !data ||
        typeof data !== "object" ||
        Array.isArray(data)
      ) {
        return NextResponse.json(
          { error: "Invalid report data." },
          { status: 400 }
        );
      }

      const allowedFields = [
        "checklistResults",
        "checklistComments",
        "comments",
        "tyreData",
        "healthScore",
        "vehicleType",
        "inspectorComments",
      ] as const;

      const updates: Record<string, unknown> = {};

      for (const field of allowedFields) {
        if (Object.prototype.hasOwnProperty.call(data, field)) {
          updates[field] = data[field];
        }
      }

      if (Object.keys(updates).length === 0) {
        return NextResponse.json(
          { error: "No valid report fields were provided." },
          { status: 400 }
        );
      }

      if (
        "healthScore" in updates &&
        (
          typeof updates.healthScore !== "number" ||
          !Number.isFinite(updates.healthScore) ||
          updates.healthScore < 0 ||
          updates.healthScore > 100
        )
      ) {
        return NextResponse.json(
          { error: "Health score must be between 0 and 100." },
          { status: 400 }
        );
      }

      if (
        "vehicleType" in updates &&
        typeof updates.vehicleType !== "string"
      ) {
        return NextResponse.json(
          { error: "Invalid vehicle type." },
          { status: 400 }
        );
      }

      if (
        "inspectorComments" in updates &&
        (
          !Array.isArray(updates.inspectorComments) ||
          !updates.inspectorComments.every(
            (comment) => typeof comment === "string"
          )
        )
      ) {
        return NextResponse.json(
          { error: "Inspector comments must be an array of strings." },
          { status: 400 }
        );
      }

      await reportRef.update({
        ...updates,
        updatedAt: FieldValue.serverTimestamp(),
      });

      return NextResponse.json({
        success: true,
        message: "Report changes saved.",
      });
    }

    return NextResponse.json(
      { error: "Unsupported action. Use save, summary, or approve." },
      { status: 400 }
    );
  } catch (error) {
    return errorResponse(error);
  }
}
