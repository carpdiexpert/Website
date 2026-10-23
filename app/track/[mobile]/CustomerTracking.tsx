"use client";
import { useEffect, useState } from "react";
import jsPDF from "jspdf";
import { buildPDF } from "@/lib/pdfGenerator";
import { PDFDocument } from "pdf-lib";
//Map Components


// --- TYPES ---
interface TrackingData {
    name: string;
    brand: string;
    model: string;
    location: string;
    slot: string;
    status: string;
    assignedTo?: string;
    date: string;
}

// --- HELPERS ---
function calculateRange(results: any, start: number, end: number) {
    let ok = 0;
    let total = 0;

    for (let i = start; i <= end; i++) {
        const val = results[i.toString()];

        // ✅ SKIP NA + undefined
        if (val === undefined || Number(val) === -1) continue;

        total++;
        if (Number(val) === 1) ok++;
    }

    return total === 0 ? 0 : Math.round((ok / total) * 100);
}


// --- UI COMPONENTS ---
function SummaryBadge({ label, score, icon }: any) {
    return (
        <div className="bg-sky-50 p-4 rounded-3xl border border-sky-100 flex flex-col items-center">
            <span className="text-xl mb-1">{icon}</span>
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">{label}</p>
            <p className="text-lg font-black text-slate-900">{score}%</p>
        </div>
    );
}

function DetailRow({ label, value }: any) {
    return (
        <div className="flex justify-between items-center border-b border-slate-50 pb-3 last:border-0">
            <span className="text-sm font-bold text-slate-500">{label}</span>
            <span className="text-sm font-black text-slate-900 italic text-right max-w-[60%]">{value}</span>
        </div>
    );
}

// --- MAIN ---
export default function CustomerTracking({
    trackingToken,
}: {
    trackingToken: string;
}) {
    // trackingToken is passed by app/track/[mobile]/page.tsx.

    const [data, setData] = useState<TrackingData | null>(null);
    const [report, setReport] = useState<any>(null);
    const [inspector, setInspector] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [loadError, setLoadError] = useState("");

    // No customer login is required. Possession of the unguessable token
    // authorizes access to this one booking through the server API.
    useEffect(() => {
        let cancelled = false;
        let timer: ReturnType<typeof setInterval> | undefined;

        const loadTracking = async () => {
            try {
                const response = await fetch(
                    `/api/customer/track/${encodeURIComponent(trackingToken)}`,
                    { method: "GET", cache: "no-store" }
                );

                const payload = await response.json().catch(() => ({}));
                if (!response.ok) {
                    throw new Error(payload?.error || "Unable to load customer tracking details.");
                }
                if (cancelled) return;

                setData(payload.booking ?? null);
                setReport(payload.report ?? null);
                setInspector(payload.inspector ?? null);
                setLoadError("");
            } catch (error) {
                if (cancelled) return;
                console.error("Unable to load customer tracking:", error);
                setLoadError(error instanceof Error ? error.message : "Unable to load tracking details.");
            } finally {
                if (!cancelled) setLoading(false);
            }
        };

        setLoading(true);
        void loadTracking();
        timer = setInterval(() => { void loadTracking(); }, 30000);

        return () => {
            cancelled = true;
            if (timer) clearInterval(timer);
        };
    }, [trackingToken]);

    const generatePDF = async () => {
        if (!report) return;

        const doc = new jsPDF();

        await buildPDF({
            doc,
            report,
            isCustomer: true,
        });

        const pdfBytes = doc.output("arraybuffer");

        const mergedPdf = await PDFDocument.create();

        // Report pages
        const reportPdf = await PDFDocument.load(pdfBytes);
        const reportPages = await mergedPdf.copyPages(
            reportPdf,
            reportPdf.getPageIndices()
        );

        reportPages.forEach(page => mergedPdf.addPage(page));

        // Disclaimer (always last)
        const disclaimerBytes = await fetch("/Disclaimer.pdf")
            .then(r => r.arrayBuffer());

        const disclaimerPdf = await PDFDocument.load(disclaimerBytes);

        const disclaimerPages = await mergedPdf.copyPages(
            disclaimerPdf,
            disclaimerPdf.getPageIndices()
        );

        disclaimerPages.forEach(page => mergedPdf.addPage(page));

        // Save
        const finalPdfBytes = await mergedPdf.save();
        const safeBuffer = new Uint8Array(finalPdfBytes).buffer;

        const blob = new Blob([safeBuffer], {
            type: "application/pdf",
        });

        const url = URL.createObjectURL(blob);

        const a = document.createElement("a");
        a.href = url;
        a.download = `Report_${report.meta.name}.pdf`;
        a.click();

        URL.revokeObjectURL(url);
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-sky-50">
                <div className="w-10 h-10 border-4 border-sky-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    if (loadError) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-sky-50 px-6">
                <div className="max-w-md rounded-3xl bg-white p-8 text-center shadow-xl">
                    <h1 className="text-xl font-black text-slate-900">Unable to load tracking</h1>
                    <p className="mt-3 text-sm text-slate-600">{loadError}</p>
                    <button onClick={() => window.location.reload()} className="mt-6 rounded-xl bg-sky-600 px-5 py-3 text-sm font-bold text-white">Try again</button>
                </div>
            </div>
        );
    }

    if (!data) {
        return <div className="p-20 text-center font-black">NO BOOKING FOUND</div>;
    }
    const overall = report
        ? calculateRange(report.results, 1, 300)
        : 0;    // 🔥 STEP LOGIC
    let currentStep = 0;

    const bookingStatus = String(data.status ?? "");
    const reportStatus = String(report?.meta?.status ?? "");
    if (bookingStatus.toLowerCase() === "confirmed") currentStep = 0;
    else if (data.assignedTo && bookingStatus.toLowerCase() === "assigned") currentStep = 1;
    else if (bookingStatus.toLowerCase() === "live") currentStep = 2;
    else if (reportStatus.toLowerCase() === "approved") currentStep = 4;
    else if (bookingStatus.toLowerCase() === "completed") currentStep = 3;

    const isDone = bookingStatus.toLowerCase() === "completed";
    const getGreeting = () => {
        const h = new Date().getHours();
        if (h < 12) return "Good Morning";
        if (h < 18) return "Good Afternoon";
        return "Good Evening";
    };
    return (
        <div className="min-h-screen bg-sky-50 pb-20">

            {/* HEADER (MERGED) */}
            <div className="bg-gradient-to-br from-sky-800 via-sky-600 to-sky-500 text-white pt-16 pb-28 px-6 rounded-b-[3rem] text-center shadow-2xl relative">

                <p className="text-sky-200 font-black uppercase tracking-[0.3em] text-[10px] mb-4">
                    InspectMyCar Pune
                </p>

                <h1 className="text-3xl font-black mb-6">
                    {isDone ? "Inspection Results" : "PDI Live Tracking"}
                </h1>

                {/* 👇 INNER GREETING CARD */}
                <div className="bg-white/10 backdrop-blur-xl rounded-[2rem] p-6 mx-2 border border-white/20">

                    <p className="text-[10px] font-black uppercase tracking-[0.3em] opacity-70 mb-2">
                        {getGreeting()}
                    </p>

                    <h2 className="text-2xl font-black mb-1">
                        {data.name}
                    </h2>

                    <p className="text-sm font-black italic">
                        Your {data.brand} {data.model} PDI is {data.status}
                    </p>

                    <p className="text-[10px] font-black mt-2 opacity-70">
                        Please find your PDI details below
                    </p>

                </div>
            </div>

            {/* CONTENT */}
            <div className="max-w-md mx-auto -mt-16 px-6 space-y-6 relative z-10">

                {/* DETAILS */}
                <div className="bg-white rounded-[2.5rem] p-8 border border-sky-100 shadow-xl">
                    <DetailRow label="Vehicle" value={`${data.brand} ${data.model}`} />
                    <DetailRow label="Location" value={data.location} />
                    <DetailRow label="Time Slot" value={`${data.slot} • ${data.date}`} />
                </div>
                {/* Cancellation Policy */}
                {(bookingStatus.toLowerCase() === "confirmed" || bookingStatus.toLowerCase() === "assigned") && (
                    <div className="mt-6 rounded-3xl border border-amber-200 bg-amber-50 p-6">
                        <div className="flex items-start gap-4">
                            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-amber-100 text-xl">
                                ⚠️
                            </div>

                            <div>
                                <h3 className="font-black text-amber-900">
                                    Cancellation & Rescheduling Policy
                                </h3>

                                <p className="mt-2 text-sm leading-relaxed text-amber-800">
                                    Bookings can be <b>cancelled or rescheduled free of charge up to 2 hours before</b> the scheduled inspection time.
                                    Requests made within <b>2 hours of the appointment</b> may not be accommodated, and a <b>₹399 cancellation charge</b> will apply.
                                </p>
                            </div>
                        </div>
                    </div>
                )}
                {/* REPORT */}
                {isDone && report && (
                    <div className="bg-white rounded-[2.5rem] p-8 shadow-xl border border-sky-100">
                        <div className="flex justify-between mb-6">
                            <p className="text-[10px] font-black uppercase text-slate-400">
                                Overall Health
                            </p>
                            <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-black">
                                <span>{overall}%</span>
                            </span>
                        </div>



                        <div className="grid grid-cols-2 gap-4">
                            <SummaryBadge
                                label="Engine Assembly"
                                score={calculateRange(report.results, 1, 80)}
                                icon="⚙️"
                            />

                            <SummaryBadge
                                label="Transmission Assembly"
                                score={calculateRange(report.results, 81, 105)}
                                icon="🔩"
                            />

                            <SummaryBadge
                                label="Exterior Body"
                                score={calculateRange(report.results, 106, 219)}
                                icon="🚗"
                            />

                            <SummaryBadge
                                label="Interior & Safety"
                                score={calculateRange(report.results, 220, 262)}
                                icon="💺"
                            />

                            <SummaryBadge
                                label=" Steering Brakes & Suspension"
                                score={calculateRange(report.results, 263, 274)}
                                icon="🧭"
                            />

                            <SummaryBadge
                                label="Wheels & Tyres"
                                score={calculateRange(report.results, 275, 300)}
                                icon="🛞"
                            />
                        </div>


                        {reportStatus.toLowerCase() === "completed" && (
                            <p className="text-yellow-600 font-bold text-sm">
                                Report under review. Available soon.
                            </p>
                        )}
                        {reportStatus.toLowerCase() === "approved" && (
                            <button
                                onClick={generatePDF}
                                className="w-full mt-8 bg-slate-900 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest"
                            >
                                Download Full Report PDF 📄
                            </button>
                        )}
                    </div>
                )}

                {/* STATUS TRACKER */}
                <div className="bg-white rounded-[2.5rem] p-8 shadow-xl border border-sky-100">

                    <div className="flex justify-between items-center mb-8">
                        <div>
                            <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">
                                Current Status
                            </p>
                            <p className="text-xl font-black italic text-slate-900">
                                {report?.meta?.status === "Approved"
                                    ? "PDI Completed"
                                    : bookingStatus.toLowerCase() === "completed"
                                        ? "Processing Report"
                                        : data.status}
                            </p>
                        </div>

                        <div className="w-12 h-12 bg-sky-50 rounded-2xl flex items-center justify-center relative">

                            {isDone ? (
                                // ✅ CHECK ICON (pure CSS)
                                <div className="w-6 h-6 border-2 border-green-600 rounded-full flex items-center justify-center">
                                    <div className="w-2.5 h-1.5 border-l-2 border-b-2 border-green-600 rotate-[-45deg] mb-[2px]" />
                                </div>
                            ) : (
                                // 📡 LIVE PULSE DOT
                                <div className="relative flex items-center justify-center">
                                    <span className="absolute w-6 h-6 rounded-full bg-sky-400 opacity-30 animate-ping"></span>
                                    <span className="w-3 h-3 bg-sky-600 rounded-full"></span>
                                </div>
                            )}

                        </div>
                    </div>

                    <div className="flex justify-between relative mb-4 px-2">

                        <div className="absolute top-1/2 left-0 w-full h-1 bg-slate-100 -translate-y-1/2"></div>

                        <div
                            className="absolute top-1/2 left-0 h-1 bg-sky-600 -translate-y-1/2 transition-all duration-700"
                            style={{ width: `${(currentStep / 4) * 100}%` }}
                        ></div>

                        {[0, 1, 2, 3, 4].map((i) => (
                            <div
                                key={i}
                                className={`w-4 h-4 rounded-full border-4 border-white ${i <= currentStep ? "bg-sky-600" : "bg-slate-200"
                                    }`}
                            />
                        ))}
                    </div>

                    <div className="flex justify-between text-[8px] font-black uppercase text-slate-400">
                        <span>Confirmed</span>
                        <span>Assigned</span>
                        <span>Live</span>
                        <span>Processing</span>
                        <span>Done</span>
                    </div>
                </div>

                {/* INSPECTOR */}
                {!isDone && bookingStatus.toLowerCase() === "confirmed" && (
                    <div className="bg-gradient-to-br from-sky-800 via-sky-800 to-cyan-500 rounded-[2.5rem] p-8 text-white shadow-xl shadow-sky-100">
                        <p className="text-[10px] font-black uppercase opacity-60 mb-6">
                            Expert Assigned
                        </p>

                        <h3 className="text-xl font-black">
                            {data.assignedTo || "Assigning..."}
                        </h3>

                        {inspector?.mobile && (
                            <a
                                href={`tel:+91${inspector.mobile}`}
                                className="block mt-6 bg-sky-600 text-black py-4 rounded-xl font-black text-center"
                            >
                                Contact PDI Inspector 📞
                            </a>
                        )}
                    </div>
                )}



            </div>
        </div>
    );
}