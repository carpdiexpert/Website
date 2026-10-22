////Install first : npm install pdf-lib

"use client";
import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import {
    onAuthStateChanged,
    signInWithEmailAndPassword,
    type User,
} from "firebase/auth";
import jsPDF from "jspdf";
import checklist from "@/lib/checklist";
import { auth } from "@/lib/firebase";
import { PDFDocument } from "pdf-lib";
import { buildPDF } from "@/lib/pdfGenerator";
import AdminAppShell from "../AdminAppShell";



// ============================================================
// TYRE CONDITION - MUST MATCH INSPECTOR INSPECTION FORM
// ============================================================
function getTyreCondition(depthValue: string | number) {
    const depth = Number(depthValue);

    if (!Number.isFinite(depth) || depth <= 0) {
        return { condition: "No Tread", score: 0 };
    }

    if (depth >= 6.5) return { condition: "Excellent", score: 100 };
    if (depth >= 5.5) return { condition: "Good", score: 80 };
    if (depth >= 4.5) return { condition: "Average", score: 60 };
    if (depth >= 3.5) return { condition: "Fair", score: 40 };
    if (depth >= 2.5) return { condition: "Poor", score: 20 };
    if (depth >= 1.0) return { condition: "Critical", score: 10 };

    return { condition: "Unsafe", score: 0 };
}

const VEHICLE_TYPES = ["Petrol", "Diesel", "CNG", "EV", "Automatic"];

function normalizeChecklistValue(raw: unknown): number {
    const candidate =
        typeof raw === "object" && raw !== null
            ? (raw as Record<string, unknown>).value ??
              (raw as Record<string, unknown>).status ??
              (raw as Record<string, unknown>).result
            : raw;

    if (typeof candidate === "number" && [1, 0, -1].includes(candidate)) {
        return candidate;
    }

    const normalized = String(candidate ?? "").trim().toLowerCase();
    if (["0", "issue", "failed", "fail", "not passed", "false"].includes(normalized)) return 0;
    if (["-1", "not applicable", "na", "n/a"].includes(normalized)) return -1;
    if (["1", "passed", "pass", "condition verified", "true", ""].includes(normalized)) return 1;

    const numeric = Number(candidate);
    return Number.isFinite(numeric) && [1, 0, -1].includes(numeric) ? numeric : 1;
}

async function loadDisclaimerBytes(): Promise<ArrayBuffer> {
    const response = await fetch("/Disclaimer.pdf", { cache: "no-store" });
    if (!response.ok) {
        throw new Error(`Could not load Disclaimer.pdf (${response.status}). Check that it exists in the public folder.`);
    }
    return response.arrayBuffer();
}

function extractEditableComment(value: unknown): string {
    const text = String(value ?? "").trim();

    if (!text || /^Not Applicable$/i.test(text)) {
        return "";
    }

    // These are status labels, NOT findings.
    if (/^Condition Verified$/i.test(text)) {
        return "";
    }

    if (/^PASSED$/i.test(text)) {
        return "";
    }

    if (/^ISSUE$/i.test(text)) {
        return "";
    }

    return text
        .replace(/^ISSUE\s*-\s*/i, "")
        .replace(/^Condition Verified\s*-\s*Findings\s*-\s*/i, "")
        .replace(/^Condition Verified\s*-\s*/i, "")
        .trim();
}



// Apply server-side PDF permission restrictions after every PDF has been merged.
// Preview, Preview AI Report, Merge, and Share all pass their final merged PDF
// through this same endpoint, which invokes qpdf on the server.
async function protectPdfBytes(bytes: ArrayBuffer | Uint8Array): Promise<Uint8Array> {
    // Blob accepts a definite ArrayBuffer and avoids TS DOM BodyInit errors
    // caused by Uint8Array<ArrayBufferLike> in newer TypeScript versions.
    const bodyBuffer = new Uint8Array(bytes).slice().buffer as ArrayBuffer;
    const response = await fetch("/api/protect-pdf", {
        method: "POST",
        headers: { "Content-Type": "application/pdf" },
        body: new Blob([bodyBuffer], { type: "application/pdf" }),
    });

    if (!response.ok) {
        const responseText = await response.text().catch(() => "");
        let message = `PDF protection failed (${response.status}).`;

        if (responseText) {
            try {
                const payload = JSON.parse(responseText) as { error?: string };
                message = payload.error || message;
            } catch {
                message = responseText.slice(0, 500) || message;
            }
        }

        throw new Error(message);
    }

    return new Uint8Array(await response.arrayBuffer());
}

async function adminApiRequest<T = any>(
    url: string,
    method: "GET" | "PATCH",
    body?: unknown,
): Promise<T> {
    const user = auth.currentUser;
    if (!user) {
        throw new Error("You are not signed in. Please sign in again.");
    }

    const token = await user.getIdToken();
    const response = await fetch(url, {
        method,
        headers: {
            Authorization: `Bearer ${token}`,
            ...(body !== undefined ? { "Content-Type": "application/json" } : {}),
        },
        ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
        cache: "no-store",
    });

    const payload = await response.json().catch(() => ({}));
    if (!response.ok) {
        throw new Error(
            typeof payload?.error === "string"
                ? payload.error
                : `Request failed (${response.status}).`,
        );
    }

    return payload as T;
}

export default function ApprovePDIsPage() {
    const [user, setUser] = useState<User | null>(null);
    const [authReady, setAuthReady] = useState(false);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loginLoading, setLoginLoading] = useState(false);
    const [reports, setReports] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [reportsError, setReportsError] = useState("");
    const [photoPDFs, setPhotoPDFs] = useState<{ [key: string]: File }>({});
    const [filter, setFilter] = useState<"pending" | "approved">("pending");
    const [editingReport, setEditingReport] = useState<any>(null);
    const [search, setSearch] = useState("");

    // ============================================================
    // ADMIN AI SUMMARY - SEPARATE FROM INSPECTOR EDITOR
    // ============================================================
    const [aiSummaryReport, setAiSummaryReport] = useState<any>(null);

    const [aiSummary, setAiSummary] = useState({
        overallCondition: "",
        keyHighlights: "",
        criticalIssues: "",
        recommendations: "",
        verdict: "",
    });

    // ============================================================
    // OPEN EDITOR
    // Uses the SAME result structure as /inspect:
    // checklistResults -> numeric 1 / 0 / -1
    // checklistComments -> final remarks
    // tyreData -> tyre measurements + condition + score
    // ============================================================
    const openEditor = (report: any) => {
        const sourceResults =
            report?.checklistResults ||
            report?.results ||
            {};

        const sourceComments =
            report?.checklistComments ||
            report?.comments ||
            {};

        const sourceTyreData =
            report?.tyreData ||
            {};

        const normalizedResults: Record<
            string,
            { value: number; comment: string }
        > = {};

        checklist.forEach((section) => {
            section.items.forEach((item: any, index: number) => {
                const id =
                    typeof item === "object" && item.label
                        ? item.label
                        : String(section.startNo + index);

                const raw = sourceResults?.[id];

                const value = normalizeChecklistValue(raw);

                const objectComment =
                    typeof raw === "object" && raw !== null
                        ? String(
                            raw.comment ??
                            raw.finding ??
                            raw.remarks ??
                            raw.remark ??
                            ""
                        )
                        : "";

                const savedComment =
                    objectComment || String(sourceComments?.[id] ?? "");

                normalizedResults[id] = {
                    value: Number.isFinite(value) ? value : 1,
                    comment: extractEditableComment(savedComment),
                };
            });
        });

        setSearch("");

        setEditingReport({
            ...report,
            results: normalizedResults,
            tyreData: { ...sourceTyreData },
            inspectorComments: Array.isArray(report?.inspectorComments)
                ? [...report.inspectorComments]
                : [],
            vehicleType:
                report?.vehicleType ||
                report?.meta?.vehicleType ||
                "",
        });
    };
    // ============================================================
    // ADMIN AI SUMMARY FLOW
    // ============================================================

    const openAISummary = (report: any) => {
        setAiSummaryReport(report);

        setAiSummary({
            overallCondition:
                report?.aiGeneratedSummary?.overallCondition || "",
            keyHighlights:
                report?.aiGeneratedSummary?.keyHighlights || "",
            criticalIssues:
                report?.aiGeneratedSummary?.criticalIssues || "",
            recommendations:
                report?.aiGeneratedSummary?.recommendations || "",
            verdict:
                report?.aiGeneratedSummary?.verdict || "",
        });
    };

    const saveAISummary = async () => {
        if (!aiSummaryReport) return;

        const summaryToSave = {
            overallCondition: aiSummary.overallCondition.trim(),
            keyHighlights: aiSummary.keyHighlights.trim(),
            criticalIssues: aiSummary.criticalIssues.trim(),
            recommendations: aiSummary.recommendations.trim(),
            verdict: aiSummary.verdict.trim(),
        };

        try {
            await adminApiRequest(
                `/api/admin/reports/${encodeURIComponent(aiSummaryReport.id)}`,
                "PATCH",
                { action: "summary", summary: summaryToSave },
            );

            setReports((current) => current.map((report) =>
                report.id === aiSummaryReport.id
                    ? { ...report, aiGeneratedSummary: summaryToSave }
                    : report
            ));
            setAiSummaryReport(null);
        } catch (error) {
            console.error("Failed to save AI summary:", error);
            alert("Failed to save AI Summary. Please try again.");
        }
    };

    const generateAIReport = async (report: any) => {
        if (!report?.aiGeneratedSummary) {
            alert("Please insert and save the AI Summary first.");
            return;
        }

        try {
            const reportDoc = new jsPDF();

            await buildPDF({
                doc: reportDoc,
                report,
                isCustomer: false,
                includeAISummary: true,
            });

            const pdfBytes = reportDoc.output("arraybuffer");
            const mergedPdf = await PDFDocument.create();

            const mainPdf = await PDFDocument.load(pdfBytes);
            const mainPages = await mergedPdf.copyPages(
                mainPdf,
                mainPdf.getPageIndices()
            );
            mainPages.forEach((page) => mergedPdf.addPage(page));

            const disclaimerBytes = await loadDisclaimerBytes();
            const disclaimerPdf = await PDFDocument.load(disclaimerBytes);
            const disclaimerPages = await mergedPdf.copyPages(
                disclaimerPdf,
                disclaimerPdf.getPageIndices()
            );
            disclaimerPages.forEach((page) => mergedPdf.addPage(page));

            const finalBytes = await mergedPdf.save();
            const protectedBytes = await protectPdfBytes(finalBytes);
            const blob = new Blob(
                [protectedBytes.buffer.slice(protectedBytes.byteOffset, protectedBytes.byteOffset + protectedBytes.byteLength) as ArrayBuffer],
                { type: "application/pdf" }
            );

            const url = URL.createObjectURL(blob);
            const previewWindow = window.open(url, "_blank");

            if (!previewWindow) {
                alert(
                    "The AI Report preview was blocked by the browser. Please allow pop-ups for this site."
                );
            }

            setTimeout(() => URL.revokeObjectURL(url), 60000);
        } catch (error) {
            // Surface the actual stage/error so failures can be diagnosed.
            // The protection endpoint intentionally returns safe messages only.
            const message = error instanceof Error
                ? error.message
                : "Unknown error";
            console.error("Failed to generate AI Report:", message);
            alert(`Failed to generate AI Report. ${message}`);
        }
    };


    // Authenticate the admin, then load reports through the server API.
    // Client Firestore reads remain disabled by the project's security rules.
    useEffect(() => {
        let cancelled = false;

        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            if (cancelled) return;
            setUser(currentUser);
            setAuthReady(true);

            if (!currentUser) {
                setReports([]);
                setLoading(false);
                setReportsError("");
                return;
            }

            try {
                setLoading(true);
                setReportsError("");

                const token = await currentUser.getIdToken();
                const response = await fetch("/api/admin/reports", {
                    headers: { Authorization: `Bearer ${token}` },
                    cache: "no-store",
                });
                const result = await response.json().catch(() => ({}));

                if (!response.ok) {
                    throw new Error(result.error || `Could not load reports (${response.status}).`);
                }

                if (cancelled) return;
                const data = Array.isArray(result.reports) ? result.reports : [];
                setReports(data.map((report: any) => ({
                    ...report,
                    results: report.checklistResults ?? report.results ?? {},
                })));
                setReportsError("");
            } catch (error) {
                if (cancelled) return;
                console.error("Failed to load reports for approval:", error);
                setReportsError(
                    error instanceof Error
                        ? error.message
                        : "Reports could not be loaded. Please refresh and try again."
                );
            } finally {
                if (!cancelled) setLoading(false);
            }
        });

        return () => {
            cancelled = true;
            unsubscribe();
        };
    }, []);

    async function handleLogin(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setLoginLoading(true);
        setReportsError("");

        try {
            await signInWithEmailAndPassword(auth, email.trim(), password);
            setPassword("");
        } catch (error) {
            setReportsError(error instanceof Error ? error.message : "Sign in failed.");
        } finally {
            setLoginLoading(false);
        }
    }

    // 🔥 FULL PDF GENERATOR (same as customer)
    const generatePDF = async (report: any) => {
        try {
            const reportDoc = new jsPDF();
            await buildPDF({ doc: reportDoc, report, isCustomer: false });

            const mergedPdf = await PDFDocument.create();
            const reportPdf = await PDFDocument.load(reportDoc.output("arraybuffer"));
            const reportPages = await mergedPdf.copyPages(reportPdf, reportPdf.getPageIndices());
            reportPages.forEach((page) => mergedPdf.addPage(page));

            const disclaimerPdf = await PDFDocument.load(await loadDisclaimerBytes());
            const disclaimerPages = await mergedPdf.copyPages(disclaimerPdf, disclaimerPdf.getPageIndices());
            disclaimerPages.forEach((page) => mergedPdf.addPage(page));

            const protectedBytes = await protectPdfBytes(await mergedPdf.save());
            const safeBuffer = protectedBytes.buffer.slice(
                protectedBytes.byteOffset,
                protectedBytes.byteOffset + protectedBytes.byteLength
            ) as ArrayBuffer;
            const blob = new Blob([safeBuffer], { type: "application/pdf" });
            const url = URL.createObjectURL(blob);
            const anchor = document.createElement("a");
            anchor.href = url;
            anchor.download = `Report_${String(report.name || report.id || "PDI").replace(/[\\/:*?"<>|]/g, "_")}.pdf`;
            document.body.appendChild(anchor);
            anchor.click();
            anchor.remove();
            window.setTimeout(() => URL.revokeObjectURL(url), 1000);
        } catch (error) {
            console.error("Failed to generate PDI PDF:", error);
            alert(error instanceof Error ? `Failed to generate PDF: ${error.message}` : "Failed to generate PDF. Please try again.");
        }
    };



    // Modify the signature to return the blob
    const generateMergedPDF = async (report: any, photoFile?: File, shouldDownload = true) => {
        const doc = new jsPDF();
        await generatePDFInternal(doc, report);
        const pdfBytes = doc.output("arraybuffer");

        const mergedPdf = await PDFDocument.create();
        const mainPdf = await PDFDocument.load(pdfBytes);
        const mainPages = await mergedPdf.copyPages(mainPdf, mainPdf.getPageIndices());
        mainPages.forEach((p) => mergedPdf.addPage(p));

        if (photoFile) {
            const photoBytes = await photoFile.arrayBuffer();
            const photoPdf = await PDFDocument.load(photoBytes);
            const photoPages = await mergedPdf.copyPages(photoPdf, photoPdf.getPageIndices());
            photoPages.forEach((p) => mergedPdf.addPage(p));
        }
        // Append disclaimer as the LAST page
        const disclaimerBytes = await loadDisclaimerBytes();

        const disclaimerPdf = await PDFDocument.load(disclaimerBytes);

        const disclaimerPages = await mergedPdf.copyPages(
            disclaimerPdf,
            disclaimerPdf.getPageIndices()
        );

        disclaimerPages.forEach(page => mergedPdf.addPage(page));
        const finalPdfBytes = await mergedPdf.save();
        const protectedBytes = await protectPdfBytes(finalPdfBytes);
        const safeBuffer = protectedBytes.buffer.slice(
            protectedBytes.byteOffset,
            protectedBytes.byteOffset + protectedBytes.byteLength
        ) as ArrayBuffer;
        const blob = new Blob([safeBuffer], { type: "application/pdf" });
        const fileName = `Report_${report.name}_${report.model}.pdf`;

        if (shouldDownload) {
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = fileName;
            document.body.appendChild(a);
            a.click();
            a.remove();
            window.setTimeout(() => URL.revokeObjectURL(url), 1000);
        }

        // Return these so the Share function can use them
        return { blob, fileName };
    };


    const generatePDFInternal = async (doc: jsPDF, report: any) => {
        await buildPDF({
            doc,
            report,
            isCustomer: false,
            includeAISummary: !!report?.aiGeneratedSummary,
        });
    };

    // ============================================================
    // SAVE EDITED REPORT
    // Produces the same Firebase structure as /inspect/page.tsx
    // ============================================================
    const saveEdit = async () => {
        if (!editingReport) return;

        try {
            const checklistResults: Record<string, number> = {};
            const checklistComments: Record<string, string> = {};
            const rawComments: Record<string, string> = {};

            checklist.forEach((section) => {
                section.items.forEach((item: any, index: number) => {
                    const id =
                        typeof item === "object" && item.label
                            ? item.label
                            : String(section.startNo + index);

                    const isNA =
                        typeof item === "object" &&
                        Array.isArray(item.notFor) &&
                        !!editingReport.vehicleType &&
                        item.notFor.includes(editingReport.vehicleType);

                    if (isNA) {
                        checklistResults[id] = -1;
                        checklistComments[id] = "Not Applicable";
                        rawComments[id] = "";
                        return;
                    }

                    const data = editingReport.results?.[id];

                    const value =
                        typeof data === "number"
                            ? data
                            : Number(data?.value ?? 1);

                    const safeValue =
                        value === 0 || value === -1 ? value : 1;

let comment = String(data?.comment ?? "").trim();

// Normalize old/status-only values.
// These are not actual findings.
if (
    /^Condition Verified$/i.test(comment) ||
    /^PASSED$/i.test(comment)
) {
    comment = "";
}

// Remove status wrappers if an older report already contains them.
comment = comment
    .replace(/^Condition Verified\s*-\s*Findings\s*-\s*/i, "")
    .replace(/^Condition Verified\s*-\s*/i, "")
    .replace(/^ISSUE\s*-\s*/i, "")
    .trim();

checklistResults[id] = safeValue;
rawComments[id] = comment;

if (safeValue === 0) {
    checklistComments[id] = comment
        ? `ISSUE - ${comment}`
        : "ISSUE";
} else if (safeValue === -1) {
    checklistComments[id] = "Not Applicable";
    rawComments[id] = "";
} else {
    // PASSED always starts clean unless Admin explicitly entered
    // a new finding in the textbox.
    checklistComments[id] = comment
        ? `Condition Verified - Findings - ${comment}`
        : "Condition Verified";
}
                });
            });

            // Rebuild tyreData exactly like the inspector form.
            const tyreData: Record<string, any> = {};

            checklist.forEach((section) => {
                section.items.forEach((item: any, index: number) => {
                    if (
                        typeof item !== "object" ||
                        item.type !== "TYRE"
                    ) {
                        return;
                    }

                    const id = item.label
                        ? item.label
                        : String(section.startNo + index);

                    const tyre = editingReport.tyreData?.[id] || {};
                    const depth = String(tyre.depth ?? "").trim();
                    const condition = depth
                        ? getTyreCondition(depth)
                        : { condition: "", score: 0 };

                    tyreData[id] = {
                        week: String(tyre.week ?? ""),
                        year: String(tyre.year ?? ""),
                        depth,
                        manufacturer: String(tyre.manufacturer ?? ""),
                        condition: condition.condition,
                        score: condition.score,
                    };
                });
            });

            const numericValues = Object.values(checklistResults).filter(
                (value): value is number =>
                    typeof value === "number" && value !== -1
            );

            const healthScore =
                numericValues.length === 0
                    ? 0
                    : Math.round(
                        (numericValues.filter(value => value === 1).length /
                            numericValues.length) *
                        100
                    );

            const inspectorComments = Array.isArray(
                editingReport.inspectorComments
            )
                ? editingReport.inspectorComments
                    .map((comment: string) => String(comment).trim())
                    .filter(Boolean)
                : [];

            const savedData = {
                checklistResults,
                checklistComments,
                // Kept for compatibility with older report consumers.
                comments: rawComments,
                tyreData,
                healthScore,
                vehicleType: editingReport.vehicleType || "",
                inspectorComments,
            };

            await adminApiRequest(
                `/api/admin/reports/${encodeURIComponent(editingReport.id)}`,
                "PATCH",
                { action: "save", data: savedData },
            );

            setReports((current) => current.map((report) =>
                report.id === editingReport.id
                    ? { ...report, ...savedData, results: checklistResults }
                    : report
            ));
            setEditingReport(null);
            setSearch("");
        } catch (error) {
            console.error("Failed to save edited report:", error);
            alert("Failed to save changes. Please try again.");
        }
    };

    // 🔥 APPROVE
    const handleApprove = async (id: string) => {
        try {
            await adminApiRequest(
                `/api/admin/reports/${encodeURIComponent(id)}`,
                "PATCH",
                { action: "approve" },
            );
            setReports((current) => current.map((report) =>
                report.id === id
                    ? { ...report, status: "Approved", approved: true }
                    : report
            ));
        } catch (error) {
            console.error("Failed to approve report:", error);
            alert(error instanceof Error
                ? `Could not approve this report. ${error.message}`
                : "Could not approve this report. Please try again.");
        }
    };

    const shareToWhatsApp = async (report: any, photoFile?: File) => {
        try {
            const { blob, fileName } = await generateMergedPDF(report, photoFile, false);
            const file = new File([blob], fileName, { type: "application/pdf" });

            if (navigator.canShare && navigator.canShare({ files: [file] })) {
                // The browser opens the share sheet here
                await navigator.share({
                    files: [file],
                    title: 'Vehicle Inspection Report',
                    text: `Here is the inspection report for ${report.model}`,
                });

                console.log("Report shared successfully!");
            } else {
                alert("Sharing is not supported on this browser. Try downloading instead.");
            }
        } catch (error: any) {
            // 🔥 Handle the "Cancel" or "Abort" error
            if (error.name === 'AbortError') {
                console.log("User closed the share menu (Share canceled).");
                // You don't usually need to alert the user here, 
                // as they know they clicked 'cancel'.
            } else {
                // Handle actual errors (e.g., file too large, network issues)
                console.error("Actual sharing error:", error);
                alert("An error occurred while trying to share the PDF.");
            }
        }
    };



    if (!authReady) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-slate-100">
                <p className="text-sm font-semibold text-slate-500">Loading admin...</p>
            </div>
        );
    }

    if (!user) {
        return (
            <main className="flex min-h-screen items-center justify-center bg-slate-100 p-5">
                <form onSubmit={handleLogin} className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-8 shadow-xl">
                    <p className="text-xs font-bold uppercase tracking-[0.18em] text-sky-600">CarPDIExpert CRM</p>
                    <h1 className="mt-2 text-2xl font-black text-slate-900">Admin sign in</h1>
                    <p className="mt-2 text-sm text-slate-500">Sign in to review and approve PDI reports.</p>
                    <label className="mt-5 block text-sm font-semibold text-slate-700">
                        Email
                        <input className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100" type="email" autoComplete="username" value={email} onChange={(event) => setEmail(event.target.value)} required />
                    </label>
                    <label className="mt-4 block text-sm font-semibold text-slate-700">
                        Password
                        <input className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100" type="password" autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} required />
                    </label>
                    {reportsError && <p role="alert" className="mt-4 rounded-xl bg-rose-50 p-3 text-sm text-rose-700">{reportsError}</p>}
                    <button type="submit" disabled={loginLoading} className="mt-5 inline-flex w-full items-center justify-center rounded-xl bg-sky-600 px-4 py-3 text-sm font-bold text-white transition hover:bg-sky-700 disabled:cursor-not-allowed disabled:opacity-50">
                        {loginLoading ? "Signing in…" : "Sign in"}
                    </button>
                </form>
            </main>
        );
    }

    if (loading) {
        return (
            <AdminAppShell email={user.email}>
                <div className="rounded-2xl border border-slate-200 bg-white p-8 text-sm text-slate-500">Loading PDI reports…</div>
            </AdminAppShell>
        );
    }

    return (
        <AdminAppShell email={user.email}>
        <div className="space-y-6">
            <header className="mb-6 flex flex-wrap items-end justify-between gap-3">
                <div>
                    <p className="text-xs font-bold uppercase tracking-[0.18em] text-sky-600">Operations / Approvals</p>
                    <h1 className="mt-1 text-3xl font-black tracking-tight text-slate-900">PDI Report Approvals</h1>
                    <p className="mt-2 text-sm text-slate-500">Review, edit, preview and approve inspection reports.</p>
                </div>
                <div className="flex items-center gap-3">
                    <span className="rounded-full bg-sky-50 px-3 py-2 text-xs font-bold text-sky-700">{reports.length} reports</span>
                    <button type="button" onClick={() => window.location.reload()} className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-50">Refresh</button>
                </div>
            </header>
            {reportsError && (
                <div role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                    {reportsError}
                </div>
            )}
            <div className="space-y-4 border-t border-slate-200 pt-5">

                <div className="flex flex-wrap items-center justify-between gap-3">
                    <select
                        value={filter}
                        onChange={(e) => setFilter(e.target.value as any)}
                        className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-semibold text-slate-700 outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
                    >
                        <option value="pending">To Be Approved</option>
                        <option value="approved">Approved</option>
                    </select>
                </div>
                {reports
                    .filter((r) =>
                        filter === "pending"
                            ? r.status === "Completed"
                            : r.status === "Approved"
                    )

                    .sort((a, b) => {
                        const toMillis = (value: any) => {
                            if (typeof value?.toMillis === "function") return value.toMillis();
                            if (value instanceof Date) return value.getTime();
                            const parsed = value ? new Date(value).getTime() : 0;
                            return Number.isFinite(parsed) ? parsed : 0;
                        };
                        return toMillis(b.createdAt) - toMillis(a.createdAt); // newest first
                    })
                    .map((r) => (

                        <div key={r.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-sky-200 hover:shadow-md">
                            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-sky-600">
                                ID: {r.id.substring(0, 8)}
                            </p>

                            <p className="font-bold text-lg text-slate-900">
                                {r.name}
                            </p>

                            <p className="text-slate-700 font-medium">
                                {r.brand} {r.model}
                            </p>
                            <p className="text-sm text-slate-500">
                                📅 {r.date} • {r.inspector}
                            </p>
<p className="text-sm text-slate-500">
    📍 {r.city || "—"}
</p>
                            <p className="text-sm text-slate-500">
                                {r.mobile}
                            </p>

                            <div className="flex flex-wrap gap-2 mt-4 pt-3 border-t border-slate-100">
                                <span className={`text-xs font-bold px-2 py-1 rounded-full ${r.status === "Approved"
                                    ? "bg-emerald-50 text-emerald-700"
                                    : "bg-amber-50 text-amber-800"
                                    }`}>
                                    {r.status}
                                </span>
                                <button
                                    onClick={() => openEditor(r)}
                                    className="rounded-xl bg-sky-600 px-3 py-2 text-xs font-bold text-white transition hover:bg-sky-700"
                                >
                                    Edit
                                </button>
                                <button
                                    onClick={() => generatePDF(r)}
                                    className="rounded-xl bg-slate-800 px-3 py-2 text-xs font-bold text-white transition hover:bg-slate-900"
                                >
                                    Preview
                                </button>

                                <button
                                    onClick={() => openAISummary(r)}
                                    className="rounded-xl bg-sky-600 px-3 py-2 text-xs font-bold text-white transition hover:bg-sky-700"
                                >
                                    Insert AI Summary
                                </button>

                                <button
                                    onClick={() => generateAIReport(r)}
                                    disabled={!r.aiGeneratedSummary}
                                    className={`rounded-xl px-3 py-2 text-xs font-bold transition ${r.aiGeneratedSummary
                                        ? "bg-sky-700 text-white hover:bg-sky-800"
                                        : "bg-slate-200 text-slate-400 cursor-not-allowed"
                                        }`}
                                >
                                    Preview AI Report
                                </button>

                                <label className="cursor-pointer rounded-xl bg-slate-800 px-3 py-2 text-xs font-bold text-white transition hover:bg-slate-900">
                                    Upload PDF
                                    <input
                                        type="file"
                                        accept="application/pdf"
                                        onChange={(e) => {
                                            if (e.target.files?.[0]) {
                                                setPhotoPDFs(prev => ({
                                                    ...prev,
                                                    [r.id]: e.target.files![0]
                                                }));
                                            }
                                        }}
                                        className="hidden"
                                    />
                                </label>

                                <button
                                    onClick={() => {
                                        void generateMergedPDF(r, photoPDFs[r.id]).catch((error) => {
                                            console.error("Failed to merge report PDF:", error);
                                            alert(error instanceof Error ? `Failed to merge PDF: ${error.message}` : "Failed to merge PDF. Please try again.");
                                        });
                                    }}
                                    className="rounded-xl bg-slate-700 px-3 py-2 text-xs font-bold text-white transition hover:bg-slate-800"
                                >
                                    Merge
                                </button>

                                <button
                                    onClick={() => shareToWhatsApp(r, photoPDFs[r.id])}
                                    className="rounded-xl bg-emerald-600 px-3 py-2 text-xs font-bold text-white transition hover:bg-emerald-700"
                                >
                                    Share
                                </button>

                                {r.status !== "Approved" && (
                                    <button
                                        onClick={() => handleApprove(r.id)}
                                        className="rounded-xl bg-emerald-600 px-3 py-2 text-xs font-bold text-white transition hover:bg-emerald-700"
                                    >
                                        Approve
                                    </button>
                                )}

                            </div>
                        </div>
                    ))}
            </div>
            {aiSummaryReport && (
                <div
                    className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center p-4"
                    onClick={() => setAiSummaryReport(null)}
                >
                    <div
                        className="bg-white w-full max-w-3xl max-h-[90vh] rounded-2xl shadow-xl flex flex-col"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="sticky top-0 z-20 bg-white border-b px-6 py-4 flex justify-between items-center rounded-t-2xl">
                            <div>
                                <h2 className="text-lg font-black text-slate-800">
                                    Insert AI Summary
                                </h2>
                                <p className="text-xs text-slate-400 mt-1">
                                    {aiSummaryReport.name} • {aiSummaryReport.brand} {aiSummaryReport.model}
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={() => setAiSummaryReport(null)}
                                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-sm font-bold"
                            >
                                ✕
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
                            <div>
                                <label className="block text-xs font-black text-slate-700 mb-2">
                                    OVERALL CONDITION:
                                </label>
                                <textarea
                                    rows={4}
                                    value={aiSummary.overallCondition}
                                    onChange={(e) =>
                                        setAiSummary((prev) => ({
                                            ...prev,
                                            overallCondition: e.target.value,
                                        }))
                                    }
                                    placeholder="Paste the overall condition summary here..."
                                    className="w-full border border-slate-200 rounded-xl bg-slate-50 p-3 text-sm resize-y focus:outline-none focus:ring-2 focus:ring-sky-100"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-black text-slate-700 mb-2">
                                    KEY HIGHLIGHTS:
                                </label>
                                <textarea
                                    rows={5}
                                    value={aiSummary.keyHighlights}
                                    onChange={(e) =>
                                        setAiSummary((prev) => ({
                                            ...prev,
                                            keyHighlights: e.target.value,
                                        }))
                                    }
                                    placeholder="Paste the key highlights here..."
                                    className="w-full border border-slate-200 rounded-xl bg-slate-50 p-3 text-sm resize-y focus:outline-none focus:ring-2 focus:ring-sky-100"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-black text-slate-700 mb-2">
                                    CRITICAL ISSUES:
                                </label>
                                <textarea
                                    rows={5}
                                    value={aiSummary.criticalIssues}
                                    onChange={(e) =>
                                        setAiSummary((prev) => ({
                                            ...prev,
                                            criticalIssues: e.target.value,
                                        }))
                                    }
                                    placeholder="Paste the critical issues here..."
                                    className="w-full border border-slate-200 rounded-xl bg-slate-50 p-3 text-sm resize-y focus:outline-none focus:ring-2 focus:ring-sky-100"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-black text-slate-700 mb-2">
                                    RECOMMENDATIONS:
                                </label>
                                <textarea
                                    rows={5}
                                    value={aiSummary.recommendations}
                                    onChange={(e) =>
                                        setAiSummary((prev) => ({
                                            ...prev,
                                            recommendations: e.target.value,
                                        }))
                                    }
                                    placeholder="Paste the recommendations here..."
                                    className="w-full border border-slate-200 rounded-xl bg-slate-50 p-3 text-sm resize-y focus:outline-none focus:ring-2 focus:ring-sky-100"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-black text-slate-700 mb-2">
                                    VERDICT:
                                </label>
                                <textarea
                                    rows={4}
                                    value={aiSummary.verdict}
                                    onChange={(e) =>
                                        setAiSummary((prev) => ({
                                            ...prev,
                                            verdict: e.target.value,
                                        }))
                                    }
                                    placeholder="Paste the final verdict here..."
                                    className="w-full border border-slate-200 rounded-xl bg-slate-50 p-3 text-sm resize-y focus:outline-none focus:ring-2 focus:ring-sky-100"
                                />
                            </div>
                        </div>

                        <div className="sticky bottom-0 bg-white border-t px-6 py-4 flex justify-end gap-3 rounded-b-2xl">
                            <button
                                type="button"
                                onClick={() => setAiSummaryReport(null)}
                                className="bg-slate-200 hover:bg-slate-300 px-5 py-2 rounded-xl text-sm font-black"
                            >
                                Cancel
                            </button>

                            <button
                                type="button"
                                onClick={saveAISummary}
                                className="bg-sky-600 hover:bg-sky-700 text-white px-5 py-2 rounded-xl text-sm font-black"
                            >
                                Save AI Summary
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {editingReport && (
                <div
                    className="fixed inset-0 bg-black/60 z-50 flex justify-center items-start p-3 sm:p-6"
                    onClick={() => {
                        setEditingReport(null);
                        setSearch("");
                    }}
                >
                    <div
                        className="bg-white w-full max-w-5xl h-[95vh] rounded-[2rem] flex flex-col shadow-2xl overflow-hidden"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* HEADER */}
                        <div className="shrink-0 bg-white border-b px-5 py-4 flex justify-between items-center">
                            <div className="min-w-0">
                                <h2 className="text-lg font-black text-slate-900 truncate">
                                    Edit PDI - {editingReport.name}
                                </h2>
                                <p className="text-[10px] text-slate-400 font-bold mt-1 uppercase tracking-wider">
                                    {editingReport.brand} {editingReport.model} • {editingReport.date || "-"}
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={() => {
                                    setEditingReport(null);
                                    setSearch("");
                                }}
                                className="w-9 h-9 shrink-0 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-sm font-bold"
                            >
                                ✕
                            </button>
                        </div>

                        {/* SCROLL AREA */}
                        <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-5 space-y-5">
                            {/* VEHICLE TYPE */}
                            <div className="bg-white border border-slate-100 rounded-[1.5rem] p-4 shadow-sm">
                                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3">
                                    Vehicle Type
                                </p>

                                <div className="flex gap-2 flex-wrap">
                                    {VEHICLE_TYPES.map((type) => (
                                        <button
                                            key={type}
                                            type="button"
                                            onClick={() =>
                                                setEditingReport((prev: any) => ({
                                                    ...prev,
                                                    vehicleType: type,
                                                }))
                                            }
                                            className={`flex-1 min-w-[90px] px-4 py-3 rounded-2xl text-xs font-black border transition-all ${
                                                editingReport.vehicleType === type
                                                    ? "bg-sky-600 text-white border-indigo-600 shadow-md"
                                                    : "bg-slate-50 text-slate-500 border-slate-200"
                                            }`}
                                        >
                                            {type}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* INSPECTOR COMMENTS */}
                            <div className="bg-white border border-slate-100 rounded-[1.5rem] p-4 shadow-sm space-y-3">
                                <div className="flex items-center justify-between gap-3">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                                        Inspector Comments
                                    </label>

                                    <button
                                        type="button"
                                        onClick={() =>
                                            setEditingReport((prev: any) => ({
                                                ...prev,
                                                inspectorComments: [
                                                    ...(prev.inspectorComments || []),
                                                    "",
                                                ],
                                            }))
                                        }
                                        className="bg-sky-600 text-white px-3 py-2 rounded-xl text-[10px] font-black"
                                    >
                                        + Add Comment
                                    </button>
                                </div>

                                {(editingReport.inspectorComments || []).map(
                                    (comment: string, index: number) => (
                                        <textarea
                                            key={index}
                                            rows={2}
                                            value={comment}
                                            placeholder={`Comment ${index + 1}`}
                                            onChange={(e) => {
                                                setEditingReport((prev: any) => {
                                                    const updated = [
                                                        ...(prev.inspectorComments || []),
                                                    ];
                                                    updated[index] = e.target.value;
                                                    return {
                                                        ...prev,
                                                        inspectorComments: updated,
                                                    };
                                                });
                                            }}
                                            className="w-full border border-slate-200 rounded-2xl bg-slate-50 p-3 text-sm resize-none"
                                        />
                                    )
                                )}
                            </div>

                            {/* SEARCH - SAME FILTERING BEHAVIOUR AS INSPECT */}
                            <div className="sticky top-0 z-10 bg-white/95 backdrop-blur-sm pb-2">
                                <input
                                    type="text"
                                    placeholder="Search inspection item..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="w-full px-4 py-3 border border-slate-200 rounded-2xl text-sm font-medium outline-none focus:ring-2 focus:ring-sky-100"
                                />
                            </div>

                            {/* CHECKLIST */}
                            <div className="space-y-6">
                                {(() => {
                                    const filteredSections = checklist
                                        .map((section) => ({
                                            ...section,
                                            items: section.items
                                                .map((item: any, originalIndex: number) => ({
                                                    item,
                                                    originalIndex,
                                                }))
                                                .filter(({ item }: { item: any }) => {
                                                    if (!search.trim()) return true;

                                                    const text =
                                                        typeof item === "object"
                                                            ? String(item.text || "")
                                                            : String(item);

                                                    return text
                                                        .toLowerCase()
                                                        .includes(search.trim().toLowerCase());
                                                }),
                                        }))
                                        .filter((section) => section.items.length > 0);

                                    if (filteredSections.length === 0) {
                                        return (
                                            <div className="bg-slate-50 border border-slate-200 rounded-[2rem] p-10 text-center">
                                                <p className="text-sm font-black text-slate-500">
                                                    No inspection items found
                                                </p>
                                                <p className="text-xs text-slate-400 mt-1">
                                                    Try a different search term.
                                                </p>
                                            </div>
                                        );
                                    }

                                    return filteredSections.map((section) => (
                                        <div key={section.section} className="space-y-3">
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">
                                                {section.section}
                                            </p>

                                            <div className="bg-white rounded-[2rem] shadow-sm border border-slate-100 divide-y divide-slate-50 overflow-hidden">
                                                {section.items.map(({ item, originalIndex }: { item: any; originalIndex: number }) => {
                                                    const id =
                                                        typeof item === "object" && item.label
                                                            ? item.label
                                                            : String(section.startNo + originalIndex);

                                                    const text =
                                                        typeof item === "object"
                                                            ? item.text
                                                            : item;

                                                    const isTyre =
                                                        typeof item === "object" &&
                                                        item.type === "TYRE";

                                                    const isNA =
                                                        typeof item === "object" &&
                                                        Array.isArray(item.notFor) &&
                                                        !!editingReport.vehicleType &&
                                                        item.notFor.includes(editingReport.vehicleType);

                                                    const data =
                                                        editingReport.results?.[id] || {
                                                            value: 1,
                                                            comment: "",
                                                        };

                                                    const currentValue = isNA
                                                        ? -1
                                                        : Number(data?.value ?? 1);

                                                    const comment = String(
                                                        data?.comment ?? ""
                                                    );

                                                    const tyre =
                                                        editingReport.tyreData?.[id] || {
                                                            week: "",
                                                            year: "",
                                                            depth: "",
                                                            manufacturer: "",
                                                        };

                                                    const tyreCondition = tyre.depth
                                                        ? getTyreCondition(tyre.depth)
                                                        : null;

                                                    return (
                                                        <div
                                                            key={`${section.section}-${id}`}
                                                            className="p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4"
                                                        >
                                                            {/* ITEM TEXT */}
                                                            <div className="flex-1 min-w-0">
                                                                <p className="text-[9px] text-slate-300 font-black">
                                                                    #{id}
                                                                </p>
                                                                <p className="text-xs font-bold text-slate-700 break-words">
                                                                    {text}
                                                                </p>
                                                            </div>

                                                            {/* TYRE */}
                                                            {isTyre ? (
                                                                <div className="flex flex-col gap-2 w-full lg:w-[320px] shrink-0">
                                                                    <div className="grid grid-cols-2 gap-2">
                                                                        <select
                                                                            className="w-full p-2 bg-slate-100 rounded-xl text-xs text-center font-bold"
                                                                            value={tyre.week || ""}
                                                                            onChange={(e) =>
                                                                                setEditingReport((prev: any) => ({
                                                                                    ...prev,
                                                                                    tyreData: {
                                                                                        ...prev.tyreData,
                                                                                        [id]: {
                                                                                            ...prev.tyreData?.[id],
                                                                                            week: e.target.value,
                                                                                        },
                                                                                    },
                                                                                }))
                                                                            }
                                                                        >
                                                                            <option value="">Week</option>
                                                                            {Array.from({ length: 52 }, (_, i) =>
                                                                                String(i + 1).padStart(2, "0")
                                                                            ).map((week) => (
                                                                                <option key={week} value={week}>
                                                                                    {week}
                                                                                </option>
                                                                            ))}
                                                                        </select>

                                                                        <input
                                                                            type="text"
                                                                            inputMode="numeric"
                                                                            maxLength={4}
                                                                            placeholder="Year"
                                                                            value={tyre.year || ""}
                                                                            onChange={(e) => {
                                                                                const value = e.target.value.replace(/\D/g, "").slice(0, 4);
                                                                                setEditingReport((prev: any) => ({
                                                                                    ...prev,
                                                                                    tyreData: {
                                                                                        ...prev.tyreData,
                                                                                        [id]: {
                                                                                            ...prev.tyreData?.[id],
                                                                                            year: value,
                                                                                        },
                                                                                    },
                                                                                }));
                                                                            }}
                                                                            className="w-full p-2 bg-slate-100 rounded-xl text-xs text-center font-bold"
                                                                        />
                                                                    </div>

                                                                    <div className="grid grid-cols-2 gap-2">
                                                                        <input
                                                                            type="number"
                                                                            inputMode="decimal"
                                                                            step="0.1"
                                                                            min="0"
                                                                            placeholder="Depth mm"
                                                                            value={tyre.depth || ""}
                                                                            onChange={(e) =>
                                                                                setEditingReport((prev: any) => ({
                                                                                    ...prev,
                                                                                    tyreData: {
                                                                                        ...prev.tyreData,
                                                                                        [id]: {
                                                                                            ...prev.tyreData?.[id],
                                                                                            depth: e.target.value,
                                                                                        },
                                                                                    },
                                                                                }))
                                                                            }
                                                                            className="w-full p-2 bg-slate-100 rounded-xl text-xs text-center font-bold"
                                                                        />

                                                                        <input
                                                                            type="text"
                                                                            placeholder="Manufacturer"
                                                                            value={tyre.manufacturer || ""}
                                                                            onChange={(e) =>
                                                                                setEditingReport((prev: any) => ({
                                                                                    ...prev,
                                                                                    tyreData: {
                                                                                        ...prev.tyreData,
                                                                                        [id]: {
                                                                                            ...prev.tyreData?.[id],
                                                                                            manufacturer: e.target.value,
                                                                                        },
                                                                                    },
                                                                                }))
                                                                            }
                                                                            className="w-full p-2 bg-slate-100 rounded-xl text-xs font-bold"
                                                                        />
                                                                    </div>

                                                                    {tyreCondition && (
                                                                        <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-slate-100">
                                                                            <span className="text-[10px] font-black text-slate-500">
                                                                                {tyreCondition.condition}
                                                                            </span>
                                                                            <span className="text-[10px] font-black text-slate-700">
                                                                                {tyreCondition.score}%
                                                                            </span>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            ) : (
                                                                /* NORMAL CHECKLIST */
                                                                <div className="flex flex-col gap-2 w-full lg:w-[320px] shrink-0">
                                                                    <div className={`flex p-1 rounded-2xl ${isNA ? "bg-slate-200 opacity-60" : "bg-slate-100"}`}>
                                                                        <button
                                                                            type="button"
                                                                            disabled={isNA}
onClick={() =>
    !isNA &&
    setEditingReport((prev: any) => ({
        ...prev,
        results: {
            ...prev.results,
            [id]: {
                ...(prev.results?.[id] || {}),
                value: 1,
                comment: "",
            },
        },
    }))
}
                                                                            className={`flex-1 px-3 py-2 text-[10px] font-black rounded-xl ${
                                                                                currentValue === 1
                                                                                    ? "bg-emerald-600 text-white"
                                                                                    : "text-slate-500"
                                                                            }`}
                                                                        >
                                                                            PASSED
                                                                        </button>

                                                                        <button
                                                                            type="button"
                                                                            disabled={isNA}
                                                                            onClick={() =>
                                                                                !isNA &&
                                                                                setEditingReport((prev: any) => ({
                                                                                    ...prev,
                                                                                    results: {
                                                                                        ...prev.results,
                                                                                        [id]: {
                                                                                            ...(prev.results?.[id] || {}),
                                                                                            value: 0,
                                                                                        },
                                                                                    },
                                                                                }))
                                                                            }
                                                                            className={`flex-1 px-3 py-2 text-[10px] font-black rounded-xl ${
                                                                                currentValue === 0
                                                                                    ? "bg-red-500 text-white"
                                                                                    : "text-slate-500"
                                                                            }`}
                                                                        >
                                                                            ISSUE
                                                                        </button>
                                                                    </div>

                                                                    {isNA ? (
                                                                        <span className="text-[10px] font-black text-slate-400 text-right">
                                                                            NOT APPLICABLE
                                                                        </span>
                                                                    ) : (
                                                                        <textarea
                                                                            rows={2}
                                                                            placeholder={
                                                                                currentValue === 0
                                                                                    ? "ISSUE / Findings"
                                                                                    : "Condition Verified / Findings"
                                                                            }
                                                                            value={comment}
                                                                            onChange={(e) =>
                                                                                setEditingReport((prev: any) => ({
                                                                                    ...prev,
                                                                                    results: {
                                                                                        ...prev.results,
                                                                                        [id]: {
                                                                                            ...(prev.results?.[id] || {}),
                                                                                            value: currentValue === -1 ? 1 : currentValue,
                                                                                            comment: e.target.value,
                                                                                        },
                                                                                    },
                                                                                }))
                                                                            }
                                                                            className={`w-full p-2 rounded-xl text-[10px] resize-none ${
                                                                                currentValue === 0
                                                                                    ? "bg-red-50 border border-red-200"
                                                                                    : "bg-slate-50 border border-slate-200"
                                                                            }`}
                                                                        />
                                                                    )}
                                                                </div>
                                                            )}
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    ));
                                })()}
                            </div>
                        </div>

                        {/* FOOTER */}
                        <div className="shrink-0 bg-white border-t px-5 py-3 flex justify-end gap-3">
                            <button
                                type="button"
                                onClick={() => {
                                    setEditingReport(null);
                                    setSearch("");
                                }}
                                className="bg-slate-200 hover:bg-slate-300 px-5 py-2.5 rounded-xl text-sm font-black"
                            >
                                Cancel
                            </button>

                            <button
                                type="button"
                                onClick={saveEdit}
                                className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-xl text-sm font-black"
                            >
                                Save Changes
                            </button>
                        </div>
                    </div>
                </div>
            )}

        </div>
        </AdminAppShell>
    );
}