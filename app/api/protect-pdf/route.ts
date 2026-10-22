
import { NextRequest, NextResponse } from "next/server";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const execFileAsync = promisify(execFile);

const MAX_PDF_SIZE = 40 * 1024 * 1024;
const MIN_OWNER_PASSWORD_LENGTH = 12;

/**
 * Protects a completed PDF after all report, disclaimer, and photo pages
 * have been merged.
 *
 * Local development:
 *   Uses qpdf available on PATH (e.g. installed through Homebrew).
 *
 * Vercel:
 *   Uses the bundled Linux x86_64 qpdf executable at:
 *   vendor/qpdf/bin/qpdf
 *
 * PDF_OWNER_PASSWORD must be configured as a server-side environment secret.
 * The PDF opens without a password, while copying/extraction and modifications
 * are restricted in PDF readers that honor PDF permission settings.
 */
export async function POST(request: NextRequest) {
  const ownerPassword = process.env.PDF_OWNER_PASSWORD;

  if (
    !ownerPassword ||
    ownerPassword.length < MIN_OWNER_PASSWORD_LENGTH
  ) {
    return NextResponse.json(
      {
        error:
          "PDF protection is not configured correctly. Contact the administrator.",
      },
      { status: 500 },
    );
  }

  const contentType = request.headers.get("content-type") || "";

  if (!contentType.toLowerCase().includes("application/pdf")) {
    return NextResponse.json(
      { error: "Expected application/pdf data." },
      { status: 415 },
    );
  }

  const input = Buffer.from(await request.arrayBuffer());

  if (
    input.length < 5 ||
    input.subarray(0, 5).toString("ascii") !== "%PDF-"
  ) {
    return NextResponse.json(
      { error: "The uploaded content is not a valid PDF." },
      { status: 400 },
    );
  }

  if (input.length > MAX_PDF_SIZE) {
    return NextResponse.json(
      { error: "PDF exceeds the 40 MB protection limit." },
      { status: 413 },
    );
  }

  const qpdfPath = process.env.VERCEL
    ? path.join(process.cwd(), "vendor", "qpdf", "bin", "qpdf")
    : "qpdf";

  const workDir = await mkdtemp(
    path.join(tmpdir(), "protect-pdf-"),
  );

  const inputPath = path.join(workDir, "input.pdf");
  const outputPath = path.join(workDir, "protected.pdf");

  try {
    await writeFile(inputPath, input, { mode: 0o600 });

    await execFileAsync(
      qpdfPath,
      [
        "--encrypt",
        "",
        ownerPassword,
        "256",
        "--print=full",
        "--modify=none",
        "--extract=n",
        "--annotate=n",
        "--",
        inputPath,
        outputPath,
      ],
      {
        timeout: 60_000,
        maxBuffer: 1024 * 1024,
      },
    );

    const protectedPdf = await readFile(outputPath);

    return new NextResponse(new Uint8Array(protectedPdf), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition":
          'attachment; filename="protected-report.pdf"',
        "Cache-Control": "no-store",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (error) {
    // Do not log the complete execFile error: it can contain command arguments
    // and expose PDF_OWNER_PASSWORD in server logs.
    const err = error as NodeJS.ErrnoException;

    console.error("PDF encryption failed:", {
      name: err.name,
      message: err.message,
      code: err.code,
    });

    return NextResponse.json(
      {
        error:
          "PDF protection failed. Check the server configuration and deployment logs.",
      },
      { status: 500 },
    );
  } finally {
    await rm(workDir, {
      recursive: true,
      force: true,
    }).catch(() => undefined);
  }
}
