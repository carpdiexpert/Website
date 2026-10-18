import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";

/* ================================================================
   SAMPLE INSPECTION DATA
================================================================ */

const inspectionSections = [
    {
        name: "Engine Assembly",
        points: 70,
        score: 99,
        description:
            "Engine condition, fluids, leaks, belts, mounts, cooling system, battery, electrical components and related mechanical checks.",
        checks: [
            "Engine oil level and condition",
            "Engine oil leakage",
            "Coolant level and leakage",
            "Brake fluid level",
            "Battery condition and terminals",
            "Engine mounting condition",
            "Belts and hoses",
            "Radiator and cooling system",
        ],
    },
    {
        name: "Transmission Assembly",
        points: 55,
        score: 100,
        description:
            "Transmission, clutch, gearbox, driveshaft, CV joints and related components are inspected for condition and abnormal signs.",
        checks: [
            "Gearbox casing condition",
            "Transmission oil leakage",
            "Gear shifting operation",
            "Clutch operation",
            "CV joints and boots",
            "Drive shafts",
            "Transmission mounting",
            "Abnormal noise or vibration",
        ],
    },
    {
        name: "Exterior Body",
        points: 60,
        score: 96,
        description:
            "Body panels, paint, alignment, dents, scratches, glass, lights and signs of previous repair or repainting are checked.",
        checks: [
            "Bonnet condition",
            "Roof condition",
            "Doors and door gaps",
            "Quarter panels",
            "Pillars",
            "Bumpers",
            "Paint consistency",
            "Windshield and glass",
            "Headlights and DRLs",
            "Panel alignment",
        ],
    },
    {
        name: "Interior & Safety",
        points: 55,
        score: 100,
        description:
            "Interior condition, safety equipment, dashboard functions, controls, airbags, seat belts and electronic systems are checked.",
        checks: [
            "Dashboard warning lights",
            "Airbag system indicators",
            "Seat belt operation",
            "Power windows",
            "Central locking",
            "Infotainment system",
            "AC and climate control",
            "Interior trim",
            "Horn and controls",
        ],
    },
    {
        name: "Steering, Brakes & Suspension",
        points: 80,
        score: 100,
        description:
            "Steering components, braking system, suspension, shock absorbers, mounts and underbody components are inspected.",
        checks: [
            "Steering operation",
            "Steering rack",
            "Brake pads",
            "Brake discs",
            "Brake fluid",
            "Shock absorbers",
            "Suspension bushes",
            "Lower arms",
            "Ball joints",
            "Underbody components",
        ],
    },
    {
        name: "Wheels & Tyres",
        points: 80,
        score: 100,
        description:
            "Tyre condition, tread depth, tyre age, wheel condition, spare tyre and related components are documented.",
        checks: [
            "Front-left tyre",
            "Front-right tyre",
            "Rear-left tyre",
            "Rear-right tyre",
            "Spare tyre",
            "Tread depth",
            "Tyre manufacturing date",
            "Wheel condition",
            "Tyre pressure",
        ],
    },
];

const issues = [
    {
        title: "Heat Shield",
        check: "Check for damage",
        finding: "Heat shield needs to be fixed properly.",
    },
    {
        title: "Left Side Pillars",
        check: "Check for repainted",
        finding: "Left A pillar repainted.",
    },
    {
        title: "Dickey Floor",
        check: "Check for cracks & bends",
        finding: "Dickey door trim needs to be fixed properly.",
    },
    {
        title: "Roof",
        check: "Check for cracks & bent",
        finding: "Roof panel has minor dent.",
    },
    {
        title: "Quarter Panels",
        check: "Check for scratches and dents",
        finding: "Left quarter panel has minor dent and scratches.",
    },
    {
        title: "Headlights & DRL",
        check: "Check for cracks & moisture ingress",
        finding: "Both headlights have minor damage.",
    },
    {
        title: "Windshields",
        check: "Check for chips, cracks & scratches",
        finding: "Front windshield replaced.",
    },
];

const tyres = [
    {
        position: "LHS Front Tyre",
        condition: "Excellent",
        depth: "6.7 mm",
        score: 100,
        remark: "40/2024 Michelin",
        action: "Drive normally.",
    },
    {
        position: "RHS Front Tyre",
        condition: "Good",
        depth: "5.7 mm",
        score: 80,
        remark: "25/2023 Michelin",
        action: "Drive normally.",
    },
    {
        position: "LHS Rear Tyre",
        condition: "Good",
        depth: "5.6 mm",
        score: 80,
        remark: "06/2023 Michelin",
        action: "Drive normally.",
    },
    {
        position: "RHS Rear Tyre",
        condition: "Fair",
        depth: "4 mm",
        score: 40,
        remark: "16/2021 Michelin",
        action: "Drive normally.",
    },
    {
        position: "Spare Tyre",
        condition: "Average",
        depth: "5 mm",
        score: 60,
        remark: "11/2019 Michelin",
        action: "Drive normally.",
    },
];


const evidencePhotos = [
    {
        src: "/sample-report/panel-gap.png",
        title: "Panel Gap Measurement",
        description:
            "A physical measurement is recorded to identify abnormal panel gaps and possible previous repair or alignment work.",
        category: "Exterior Body",
    },
    {
        src: "/sample-report/front-left-tyre.png",
        title: "Tyre Tread Measurement",
        description:
            "Tread depth is measured using a digital tread depth gauge. The measurement is recorded as part of the tyre-condition assessment.",
        category: "Wheels & Tyres",
    },
    {
        src: "/sample-report/gearbox-view.png",
        title: "Gearbox / Underbody View",
        description:
            "Underside components are photographed to document gearbox, mounting, driveshaft and surrounding mechanical components.",
        category: "Transmission Assembly",
    },
    {
        src: "/sample-report/brake-oil.png",
        title: "Brake Fluid Level",
        description:
            "Brake fluid reservoir and level are visually inspected and documented as part of the braking-system inspection.",
        category: "Steering, Brakes & Suspension",
    },
    {
        src: "/sample-report/coolant-level.png",
        title: "Coolant Level",
        description:
            "Coolant reservoir condition and fluid level are documented during the engine and cooling-system inspection.",
        category: "Engine Assembly",
    },
    {
    src: "/sample-report/paint-gauge.png",
    title: "Paint Thickness Gauge",
    description:
        "Paint thickness is measured at key body panels using a paint thickness gauge to identify repainting, body repairs, or variations in paint thickness.",
    category: "Exterior & Body",
},
];

const reportFeatures = [
    {
        number: "01",
        title: "400-Point Inspection",
        text:
            "A structured inspection framework covering major mechanical, electrical, exterior, interior, safety, suspension, braking and tyre components.",
    },
    {
        number: "02",
        title: "Condition Scoring",
        text:
            "Inspection results are converted into category-wise scores and an overall vehicle-health score for quick understanding.",
    },
    {
        number: "03",
        title: "Issue Documentation",
        text:
            "Issues are clearly listed with the inspected component, expected condition and actual observation.",
    },
    {
        number: "04",
        title: "Photographic Evidence",
        text:
            "Important findings can be supported with photographs showing the actual vehicle condition at the time of inspection.",
    },
    {
        number: "05",
        title: "Tyre Analysis",
        text:
            "Each tyre can include manufacturing date, tread depth, condition classification, score and recommended action.",
    },
    {
        number: "06",
        title: "AI Summary & Recommendations",
        text:
            "Inspection findings are analysed into an easy-to-understand summary covering highlights, critical issues, recommendations and an overall verdict.",
    },
];

/* ================================================================
   HELPERS
================================================================ */

function scoreLabel(score: number) {
    if (score >= 90) return "Excellent";
    if (score >= 75) return "Good";
    if (score >= 50) return "Average";
    return "Needs Attention";
}

function conditionClass(condition: string) {
    switch (condition.toLowerCase()) {
        case "excellent":
            return "text-emerald-600";
        case "good":
            return "text-green-600";
        case "fair":
            return "text-orange-500";
        case "average":
            return "text-amber-500";
        default:
            return "text-red-600";
    }
}

/* ================================================================
   PAGE
================================================================ */

export default function CarPDIExpertSampleReportPage() {
    const totalPoints = inspectionSections.reduce(
        (total, section) => total + section.points,
        0
    );

    return (
<main className="min-h-screen overflow-hidden bg-white text-slate-900">
            {/* HERO — left-aligned copy with animated AI report scanning visual */}
            <section className="relative overflow-hidden bg-[#0B1220] text-white">
<div className="relative mx-auto grid max-w-[1440px] items-center gap-10 px-5 pt-6 pb-12 sm:gap-12 sm:px-8 sm:pt-8 sm:pb-16 lg:grid-cols-[0.95fr_1.05fr] lg:gap-16 lg:px-12 lg:pt-10 lg:pb-20">
                    {/* Left: hero content */}
                    <div className="relative z-0 text-left">

                        <p className="text-xs font-bold uppercase tracking-[0.2em] text-sky-400">
                            See What a Professional Vehicle Inspection Report Looks Like
                        </p>
                        <h1 className="mt-5 max-w-2xl text-4xl font-black leading-tight tracking-[-0.055em] sm:text-5xl lg:text-6xl">
                            CarPDIExpert
                            <span className="mt-2 block text-sky-400">Sample Report</span>
                        </h1>
                        <p className="mt-6 max-w-xl text-base leading-8 text-slate-300 sm:text-lg">
                            A comprehensive vehicle inspection report combines a structured 400-point inspection, vehicle-health scoring, issue documentation, AI-powered analysis, tyre assessment and photographic evidence.
                        </p>
                        <div className="mt-8 flex flex-wrap justify-start gap-2.5 sm:gap-3">
                            <span className="rounded-full border border-white/15 bg-white/[0.06] px-3.5 py-2 text-xs font-semibold text-slate-100 sm:text-sm">✓ 400-Point Inspection</span>
                            <span className="rounded-full border border-white/15 bg-white/[0.06] px-3.5 py-2 text-xs font-semibold text-slate-100 sm:text-sm">✓ AI Summary</span>
                            <span className="rounded-full border border-white/15 bg-white/[0.06] px-3.5 py-2 text-xs font-semibold text-slate-100 sm:text-sm">✓ Photo Evidence</span>
                            <span className="rounded-full border border-white/15 bg-white/[0.06] px-3.5 py-2 text-xs font-semibold text-slate-100 sm:text-sm">✓ Tyre Analysis</span>
                            <span className="rounded-full border border-white/15 bg-white/[0.06] px-3.5 py-2 text-xs font-semibold text-slate-100 sm:text-sm">✓ Overall Health Score</span>
                        </div>
                    </div>

                    {/* Right: animated AI report scanning illustration */}
                    <div className="relative mx-auto w-full max-w-[600px]">
                        <div aria-hidden="true" className="absolute -inset-5 rounded-[2.5rem] bg-sky-400/10 blur-2xl" />
                        <div className="relative overflow-hidden rounded-[1.75rem] border border-sky-300/25 bg-[#101D31] p-4 shadow-[0_25px_90px_rgba(0,0,0,0.4)] sm:p-6">
                            <div className="flex items-center justify-between border-b border-white/10 pb-4">
                                <div className="flex items-center gap-3">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-sky-300/25 bg-sky-400/10 text-sky-300">
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" className="h-6 w-6" aria-hidden="true"><path d="M7 3.5h7l4 4V21H7z" strokeLinejoin="round"/><path d="M14 3.5V8h4M10 12h5M10 15h5M10 18h3" strokeLinecap="round"/></svg>
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-white">AI Report Analyzer</p>
                                        <p className="mt-0.5 text-xs text-slate-400">Reading inspection findings</p>
                                    </div>
                                </div>
                                <span className="inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-emerald-300"><span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-300"/>Analyzing</span>
                            </div>

                            <div className="relative mt-5 overflow-hidden rounded-2xl border border-white/10 bg-[#0B1423] p-4 sm:p-5">
                                <div className="mb-5 flex items-start justify-between gap-4">
                                    <div>
                                        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-sky-300">Vehicle inspection report</p>
                                        <p className="mt-2 text-lg font-black text-white sm:text-xl">Inspection Summary</p>
                                        <p className="mt-1 text-xs text-slate-400">Sample vehicle · Report analysis</p>
                                    </div>
                                    <div className="flex h-16 w-16 shrink-0 flex-col items-center justify-center rounded-full border-4 border-emerald-400/70 bg-emerald-400/10 shadow-[0_0_25px_rgba(52,211,153,0.12)]">
                                        <span className="text-lg font-black text-emerald-300">98%</span>
                                        <span className="text-[8px] font-bold uppercase tracking-wider text-slate-300">Health</span>
                                    </div>
                                </div>
                                <div className="space-y-3">
                                    {[
                                        ["Engine & mechanical", "99%", "w-[99%]"],
                                        ["Transmission", "100%", "w-full"],
                                        ["Exterior body", "96%", "w-[96%]"],
                                    ].map(([label, score, width]) => (
                                        <div key={label} className="rounded-xl border border-white/[0.07] bg-white/[0.035] p-3">
                                            <div className="mb-2 flex items-center justify-between gap-3"><span className="text-xs font-medium text-slate-300">{label}</span><span className="text-xs font-bold text-sky-300">{score}</span></div>
                                            <div className="h-1.5 overflow-hidden rounded-full bg-white/10"><div className={`h-full rounded-full bg-gradient-to-r from-sky-500 to-cyan-300 ${width}`} /></div>
                                        </div>
                                    ))}
                                </div>
                                {/* Horizontal blue scan line travels through the report */}
                                <style>{`
                                  @keyframes pdi-report-horizontal-scan {
                                    0% { top: 0%; opacity: 0.25; }
                                    8% { opacity: 1; }
                                    92% { opacity: 1; }
                                    100% { top: 100%; opacity: 0.25; }
                                  }
                                  @media (prefers-reduced-motion: reduce) {
                                    .pdi-report-scan-line { animation: none !important; }
                                  }
                                `}</style>
                                <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden rounded-2xl">
                                    <div className="absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-cyan-300/[0.08] to-transparent" />
                                    <div className="pdi-report-scan-line absolute inset-x-3 h-px bg-sky-300 shadow-[0_0_8px_2px_rgba(56,189,248,0.55)]" style={{ animation: "pdi-report-horizontal-scan 2.8s linear infinite" }} />
                                </div>
                            </div>

                            <div className="mt-4 grid grid-cols-2 gap-3">
                                <div className="rounded-xl border border-white/10 bg-white/[0.035] p-3.5">
                                    <div className="flex items-center gap-2 text-sky-300"><span className="text-base">✦</span><span className="text-[10px] font-bold uppercase tracking-wider">AI insights</span></div>
                                    <p className="mt-2 text-xs leading-5 text-slate-300">Findings organized into clear recommendations.</p>
                                </div>
                                <div className="rounded-xl border border-white/10 bg-white/[0.035] p-3.5">
                                    <div className="flex items-center gap-2 text-emerald-300"><span className="text-base">✓</span><span className="text-[10px] font-bold uppercase tracking-wider">Report ready</span></div>
                                    <p className="mt-2 text-xs leading-5 text-slate-300">Scores, issues and evidence in one view.</p>
                                </div>
                            </div>
                            <p className="mt-4 text-center text-[10px] font-medium uppercase tracking-[0.18em] text-slate-500">Inspect · Analyze · Understand</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* =========================================================
                REPORT SCREENSHOTS
            ========================================================= */}

            <section className="bg-slate-50 py-16 sm:py-20">

                <div className="mx-auto max-w-[1440px] px-5 sm:px-8 lg:px-12">

                    <div className="max-w-3xl">

                        <span className="text-xs font-bold uppercase tracking-[0.2em] text-blue-700">
                            Sample Report Pages
                        </span>

                        <h2 className="mt-3 text-3xl font-black leading-tight tracking-[-0.045em] text-slate-900 sm:text-4xl">
                            See the Actual Customer Report Format
                        </h2>

                        <p className="mt-4 text-slate-600">
                            These examples show how the inspection information
                            can be presented in the generated report.
                        </p>

                    </div>

                    <div className="mt-10 grid gap-8 md:grid-cols-2">

<ReportScreenshot
    src="/sample-report/report-cover.png"
    title="Vehicle Information"
/>

<ReportScreenshot
    src="/sample-report/overall-health.png"
    title="Overall Vehicle Health"
/>

<ReportScreenshot
    src="/sample-report/issues-summary.png"
    title="PDI Issues Summary"
/>

<ReportScreenshot
    src="/sample-report/ai-summary.png"
    title="AI Summary & Recommendations"
/>
<ReportScreenshot
    src="/sample-report/car_photo_points.jpg"
    title="Car Photos Points"
/>
<ReportScreenshot
    src="/sample-report/tyre-report.png"
    title="Tyre Condition Report"
/>

                    </div>
                </div>
            </section>

            {/* =========================================================
                PHOTO EVIDENCE
            ========================================================= */}

            <section className="mx-auto max-w-[1440px] px-5 py-16 sm:px-8 lg:px-12">

                <SectionHeading
                    eyebrow="PHOTO EVIDENCE"
                    title="Inspection Photos & Evidence"
                    description="Important inspection findings can be supported by photographs captured by the inspector during the inspection."
                />

                <div className="mt-10 grid gap-8 md:grid-cols-2">

                    {evidencePhotos.map((photo) => (
                        <article
                            key={photo.title}
                            className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm"
                        >

                            <div className="relative aspect-[4/3] overflow-hidden bg-slate-100">

                                <Image
                                    src={photo.src}
                                    alt={photo.title}
                                    fill
                                    sizes="(max-width: 768px) 100vw, 50vw"
                                    className="object-cover transition duration-500 hover:scale-105"
                                />

                            </div>

                            <div className="p-6">

                                <div className="text-xs font-bold uppercase tracking-wider text-blue-700">
                                    {photo.category}
                                </div>

                                <h3 className="mt-2 text-xl font-bold text-slate-900">
                                    {photo.title}
                                </h3>

                                <p className="mt-3 text-sm leading-6 text-slate-600">
                                    {photo.description}
                                </p>

                            </div>

                        </article>
                    ))}

                </div>

                {/* MORE PHOTOS */}

                <div className="mt-10 rounded-3xl border border-sky-100 bg-sky-50 p-8 text-center">

                    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-600 text-2xl text-white">
                        📷
                    </div>

                    <h3 className="mt-5 text-2xl font-black text-slate-900">
                        And Many More Inspection Photos
                    </h3>

                    <p className="mx-auto mt-3 max-w-2xl text-sm leading-6 text-slate-600">
                        A complete inspection report can contain many
                        additional photographs covering body panels, paint
                        condition, underbody components, engine bay, tyres,
                        suspension, brakes, electrical components, interior
                        and specific issues identified during the inspection.
                    </p>

                    <div className="mt-6 flex flex-wrap justify-center gap-2">

                        {[
                            "Exterior",
                            "Engine Bay",
                            "Underbody",
                            "Suspension",
                            "Brakes",
                            "Tyres",
                            "Interior",
                            "Electrical",
                            "Damage Evidence",
                            "Measurements",
                        ].map((item) => (
                            <span
                                key={item}
                                className="rounded-full border border-sky-200 bg-white px-4 py-2 text-xs font-semibold text-sky-700"
                            >
                                {item}
                            </span>
                        ))}

                    </div>
                </div>
            </section>

            {/* =========================================================
                INSPECTOR OBSERVATIONS
            ========================================================= */}

            <section className="bg-slate-100 py-16">

                <div className="mx-auto max-w-5xl px-6 lg:px-8">

                    <SectionHeading
                        eyebrow="INSPECTOR OBSERVATIONS"
                        title="Additional Comments & Recommendations"
                        description="The report can include inspector-level observations in addition to individual checklist results."
                    />

                    <div className="mt-8 rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">

                        <div className="border-l-4 border-blue-600 pl-6">

                            <p className="text-lg leading-8 text-slate-700">
                                Vehicle inspected across major mechanical,
                                electrical, structural, exterior, interior and
                                tyre-related areas. The inspection identified
                                certain exterior and component-level issues
                                that should be reviewed before considering the
                                vehicle condition acceptable.
                            </p>

                            <p className="mt-5 text-lg leading-8 text-slate-700">
                                Photographic evidence and measurements are
                                included where applicable to provide additional
                                context for the inspection findings.
                            </p>

                        </div>
                    </div>
                </div>
            </section>

            {/* =========================================================
                REPORT FEATURES
            ========================================================= */}

            <section className="mx-auto max-w-[1440px] px-5 pb-16 sm:px-8 lg:px-12">

                <SectionHeading
                    eyebrow="WHAT THE REPORT CONTAINS"
                    title="More Than Just a Checklist"
                    description="The inspection report converts hundreds of individual checks into a clear, evidence-backed vehicle condition report."
                />

                <div className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-3">

                    {reportFeatures.map((feature) => (
                        <div
                            key={feature.number}
                            className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
                        >

                            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-sky-50 text-sm font-black text-blue-700">
                                {feature.number}
                            </div>

                            <h3 className="mt-5 text-lg font-bold text-slate-900">
                                {feature.title}
                            </h3>

                            <p className="mt-3 text-sm leading-6 text-slate-600">
                                {feature.text}
                            </p>

                        </div>
                    ))}

                </div>
            </section>

            {/* =========================================================
                400 POINT INSPECTION
            ========================================================= */}

            <section className="bg-white py-16">

                <div className="mx-auto max-w-[1440px] px-5 sm:px-8 lg:px-12">

                    <SectionHeading
                        eyebrow="400-POINT INSPECTION"
                        title="Comprehensive Vehicle Inspection"
                        description={`The sample report is structured around ${totalPoints} inspection points across six major vehicle systems.`}
                    />

                    <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">

                        {inspectionSections.map((section) => (
                            <div
                                key={section.name}
                                className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
                            >

                                <div className="bg-[#0B1220] p-5">

                                    <div className="flex items-start justify-between gap-4">

                                        <div>
                                            <h3 className="font-bold text-white">
                                                {section.name}
                                            </h3>

                                            <p className="mt-1 text-xs text-slate-300">
                                                {section.points} inspection points
                                            </p>
                                        </div>

                                        <div className="rounded-xl bg-white/10 px-3 py-2 text-center">

                                            <div className="text-lg font-black text-white">
                                                {section.score}%
                                            </div>

                                            <div className="text-[10px] uppercase tracking-wide text-slate-300">
                                                Score
                                            </div>

                                        </div>

                                    </div>
                                </div>

                                <div className="p-5">

                                    <p className="text-sm leading-6 text-slate-600">
                                        {section.description}
                                    </p>

                                    <div className="mt-5 space-y-2">

                                        {section.checks.map((check) => (
                                            <div
                                                key={check}
                                                className="flex items-center gap-3 rounded-lg bg-slate-50 px-3 py-2.5"
                                            >

                                                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-xs font-bold text-emerald-700">
                                                    ✓
                                                </span>

                                                <span className="text-xs font-medium text-slate-700">
                                                    {check}
                                                </span>

                                            </div>
                                        ))}

                                    </div>

                                    <div className="mt-5 border-t border-slate-100 pt-4">

                                        <span className="text-xs font-bold uppercase tracking-wide text-blue-700">
                                            {scoreLabel(section.score)}
                                        </span>

                                    </div>

                                </div>
                            </div>
                        ))}

                    </div>

                    <div className="mt-10 rounded-2xl border border-sky-100 bg-sky-50 p-6 text-center">

                        <p className="text-sm font-medium text-sky-900">
                            The complete inspection contains hundreds of
                            individual checkpoints. The sample above shows the
                            structure and type of checks included in the report.
                        </p>

                    </div>

                </div>
            </section>

            {/* =========================================================
                OVERALL VEHICLE HEALTH
            ========================================================= */}


<section className="mx-auto max-w-[1440px] px-5 py-16 sm:px-8 lg:px-12">
  <SectionHeading
    eyebrow="OVERALL VEHICLE HEALTH"
    title="At-a-Glance Vehicle Condition"
    description="Category scores make it easier to understand where the vehicle is performing well and where attention may be required."
  />

  <div className="mt-10 rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm sm:p-10">
    <div className="mx-auto grid max-w-5xl grid-cols-2 items-center gap-x-4 gap-y-8 sm:gap-x-10 sm:gap-y-10 lg:grid-cols-4">

      {/* Top: two cards */}
      <div className="lg:col-start-2">
        <HealthCard title="Engine Assembly" score={99} />
      </div>

      <div className="lg:col-start-3">
        <HealthCard title="Transmission Assembly" score={100} />
      </div>

      {/* Middle: left card */}
      <div className="lg:col-start-1 lg:row-start-2">
        <HealthCard title="Exterior Body" score={96} />
      </div>

      {/* Center: overall health */}
      <div className="col-span-2 flex items-center justify-center lg:col-span-2 lg:col-start-2 lg:row-start-2">
        <div className="relative flex h-40 w-40 flex-col items-center justify-center rounded-[2.5rem] border border-sky-400/30 bg-[#0B1220] text-white shadow-xl shadow-sky-900/15 sm:h-48 sm:w-48">
          <div className="absolute inset-2 rounded-[2rem] border border-sky-400/15" />

          <span className="relative text-xs font-bold uppercase tracking-[0.18em] text-sky-400">
            Overall
          </span>

          <span className="relative mt-2 text-5xl font-black tracking-tight sm:text-6xl">
            98%
          </span>

          <span className="relative mt-1 text-xs text-slate-400">
            Vehicle Health
          </span>
        </div>
      </div>

      {/* Middle: right card */}
      <div className="lg:col-start-4 lg:row-start-2">
        <HealthCard title="Interior & Safety" score={100} />
      </div>

      {/* Bottom: two cards */}
      <div className="lg:col-start-2">
        <HealthCard title="Steering, Brakes & Suspension" score={100} />
      </div>

      <div className="lg:col-start-3">
        <HealthCard title="Wheels & Tyres" score={100} />
      </div>

    </div>
  </div>
</section>


            {/* =========================================================
                PDI ISSUES SUMMARY
            ========================================================= */}

            <section className="bg-slate-100 py-16">

                <div className="mx-auto max-w-[1440px] px-5 sm:px-8 lg:px-12">

                    <SectionHeading
                        eyebrow="INSPECTION FINDINGS"
                        title="PDI Issues Summary"
                        description="Issues discovered during inspection are clearly documented so the customer knows what needs attention."
                    />

                    <div className="mt-8 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

                        {issues.map((issue, index) => (
                            <div
                                key={issue.title}
                                className={`px-6 py-5 ${
                                    index % 2 === 0
                                        ? "bg-slate-50"
                                        : "bg-white"
                                }`}
                            >

                                <div className="flex gap-4">

                                    <div className="mt-1 h-3 w-3 shrink-0 rounded-full bg-red-600" />

                                    <div>

                                        <h3 className="font-bold text-red-800">
                                            {issue.title}
                                        </h3>

                                        <p className="mt-1 text-sm font-medium text-slate-700">
                                            {issue.check}
                                        </p>

                                        <p className="mt-1 text-sm text-slate-600">
                                            {issue.finding}
                                        </p>

                                    </div>

                                </div>

                            </div>
                        ))}

                    </div>
                </div>
            </section>

            {/* =========================================================
                AI SUMMARY & RECOMMENDATIONS
            ========================================================= */}

            <section className="mx-auto max-w-[1440px] px-5 py-16 sm:px-8 lg:px-12">

                <div className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm">

                    {/* AI HEADER */}

                    <div className="border-b border-slate-200 px-6 py-6 md:px-8">

                        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">

                            <div>

                                <span className="text-xs font-black uppercase tracking-[0.2em] text-blue-700">
                                    Intelligent Report Analysis
                                </span>

                                <h2 className="mt-2 text-3xl font-black tracking-tight text-[#0B1220] md:text-4xl">
                                    AI Summary & Recommendations
                                </h2>

                            </div>

                            {/* Gemini Badge */}

                            <div className="inline-flex w-fit items-center gap-2 rounded-full border-2 border-[#0B1220] bg-white px-4 py-2">

                                <span className="text-xs font-semibold text-slate-700">
                                    Powered by
                                </span>

                                <span className="text-sm font-bold text-slate-800">
                                    ✦ Gemini
                                </span>

                            </div>

                        </div>

                        <div className="mt-4 h-1.5 w-64 rounded-full bg-gradient-to-r from-amber-500 to-slate-200" />

                        <p className="mt-5 max-w-3xl text-sm leading-6 text-slate-600">
                            The inspection findings are analysed and converted
                            into a concise summary covering the vehicle's
                            overall condition, important observations, critical
                            issues, recommendations and final assessment.
                        </p>

                    </div>

                    {/* AI CONTENT */}

                    <div className="bg-slate-50 p-5 md:p-8">

                        <div className="rounded-3xl border-2 border-slate-200 bg-white p-6 md:p-8">

                            <div className="space-y-0">

                                {/* OVERALL CONDITION */}

                                <AISummaryRow title="OVERALL CONDITION">

                                    <>
                                        The vehicle is in excellent overall
                                        condition, scoring an overall health
                                        of <strong>98%</strong>. Major systems
                                        such as transmission, steering, brakes,
                                        suspension, wheels, tyres, and
                                        interior/safety all scored a perfect
                                        <strong> 100%</strong>, with engine
                                        assembly close behind at
                                        <strong> 99%</strong>.
                                    </>

                                </AISummaryRow>

                                {/* KEY HIGHLIGHTS */}

                                <AISummaryRow title="KEY HIGHLIGHTS">

                                    <>
                                        The inspection was conducted on
                                        <strong> 24/09/2026</strong> for
                                        customer <strong>Deepak</strong>,
                                        recording a very low odometer reading
                                        of <strong>43 km</strong>. All core
                                        mechanical, electrical, and safety
                                        systems, including transmission,
                                        brakes, suspension, and airbags, passed
                                        successfully. The tyres are in good
                                        condition, with the spare tyre and most
                                        road tyres showing solid tread depths
                                        and Michelin manufacturing dates
                                        ranging from 2019 to 2024.
                                    </>

                                </AISummaryRow>

                                {/* CRITICAL ISSUES */}

                                <AISummaryRow title="CRITICAL ISSUES">

                                    <ul className="space-y-1.5">

                                        <li>
                                            Heat Shield: Needs to be fixed
                                            properly.
                                        </li>

                                        <li>
                                            Left A-Pillar: Noted as repainted.
                                        </li>

                                        <li>
                                            Dickey Door Trim: Requires proper
                                            fixing.
                                        </li>

                                        <li>
                                            Roof Panel: Has a minor dent.
                                        </li>

                                        <li>
                                            Left Quarter Panel: Features minor
                                            dents and scratches.
                                        </li>

                                        <li>
                                            Headlights: Both headlights have
                                            minor damage.
                                        </li>

                                        <li>
                                            Front Windshield: Noted as
                                            replaced.
                                        </li>

                                    </ul>

                                </AISummaryRow>

                                {/* RECOMMENDATIONS */}

                                <AISummaryRow title="RECOMMENDATIONS">

                                    <>
                                        <p>
                                            Have the owner properly secure the
                                            heat shield and adjust/fix the
                                            dickey door trim before taking
                                            final delivery.
                                        </p>

                                        <p className="mt-2">
                                            Inspect the minor cosmetic flaws,
                                            such as the minor dent on the roof
                                            and left quarter panel, and minor
                                            damage to both headlights, and
                                            ensure they are addressed or
                                            documented by the dealer.
                                        </p>

                                        <p className="mt-2">
                                            Clarify the reason for the front
                                            windshield replacement and left
                                            A-pillar repainting with the owner
                                            to ensure no structural damage
                                            occurred prior to delivery.
                                        </p>
                                    </>

                                </AISummaryRow>

                                {/* VERDICT */}

                                <AISummaryRow
                                    title="VERDICT"
                                    last
                                >

                                    <>
                                        Mechanically and electronically, the
                                        car is pristine and near-perfect
                                        <strong> (98% score)</strong>, but
                                        cosmetic and minor fitment corrections
                                        — including heat shield, trim fixing,
                                        and minor dent/scratch resolution —
                                        should be completed by the dealer
                                        before final sign-off.
                                    </>

                                </AISummaryRow>

                            </div>
                        </div>

                        {/* AI EXPLANATION */}

                        <div className="mt-6 rounded-2xl border border-sky-100 bg-sky-50 p-5">

                            <div className="flex gap-4">

                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-lg text-white">
                                    ✦
                                </div>

                                <div>

                                    <h3 className="font-bold text-sky-950">
                                        What this section does
                                    </h3>

                                    <p className="mt-1 text-sm leading-6 text-sky-900/75">
                                        Instead of making the customer
                                        interpret hundreds of individual
                                        checklist results, the report
                                        automatically summarises the
                                        inspection into the most important
                                        observations, issues and recommended
                                        actions.
                                    </p>

                                </div>

                            </div>

                        </div>

                    </div>
                </div>
            </section>

            {/* =========================================================
                TYRE CONDITION REPORT
            ========================================================= */}

            <section className="mx-auto max-w-[1440px] px-5 py-16 sm:px-8 lg:px-12">

                <SectionHeading
                    eyebrow="TYRE CONDITION REPORT"
                    title="Detailed Tyre Assessment"
                    description="Tyre condition is interpreted from recorded tread depth, tyre age and observed condition."
                />

                <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-5">

                    {tyres.map((tyre) => (
                        <div
                            key={tyre.position}
                            className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
                        >

                            <div className="bg-[#0B1220] px-4 py-4">

                                <h3 className="text-center text-sm font-bold uppercase text-white">
                                    {tyre.position}
                                </h3>

                            </div>

                            <div className="p-5">

                                <div
                                    className={`text-xl font-black uppercase ${conditionClass(
                                        tyre.condition
                                    )}`}
                                >
                                    {tyre.condition}
                                </div>

                                <div className="mt-4 space-y-3 text-sm">

                                    <div>
                                        <span className="text-slate-500">
                                            Remark
                                        </span>

                                        <p className="font-medium text-slate-800">
                                            {tyre.remark}
                                        </p>
                                    </div>

                                    <div>
                                        <span className="text-slate-500">
                                            Tread Depth
                                        </span>

                                        <p className="font-bold text-slate-800">
                                            {tyre.depth}
                                        </p>
                                    </div>

                                    <div>
                                        <span className="text-slate-500">
                                            Score
                                        </span>

                                        <p className="font-bold text-slate-800">
                                            {tyre.score}%
                                        </p>
                                    </div>

                                    <div>
                                        <span className="text-slate-500">
                                            Action
                                        </span>

                                        <p className="font-medium text-slate-800">
                                            {tyre.action}
                                        </p>
                                    </div>

                                </div>
                            </div>
                        </div>
                    ))}

                </div>
            </section>



            {/* =========================================================
                REPORT PROCESS
            ========================================================= */}

            <section className="mx-auto max-w-[1440px] px-5 py-16 sm:px-8 lg:px-12">

                <SectionHeading
                    eyebrow="HOW IT WORKS"
                    title="From Inspection to Report"
                    description="The inspection process is designed to turn on-site observations into an easy-to-understand report."
                />

                <div className="mt-10 grid gap-5 md:grid-cols-4">

                    {[
                        [
                            "01",
                            "Vehicle Inspection",
                            "Inspector performs the structured inspection across the vehicle.",
                        ],
                        [
                            "02",
                            "Record Findings",
                            "Checklist results, measurements, observations and photographs are recorded.",
                        ],
                        [
                            "03",
                            "Analyse Condition",
                            "Results are converted into category scores, tyre assessments, issue summaries and AI recommendations.",
                        ],
                        [
                            "04",
                            "Generate Report",
                            "The customer receives a detailed inspection report containing findings, AI analysis and evidence.",
                        ],
                    ].map(([number, title, text]) => (
                        <div
                            key={number}
                            className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
                        >

                            <div className="text-3xl font-black text-blue-700">
                                {number}
                            </div>

                            <h3 className="mt-4 font-bold text-slate-900">
                                {title}
                            </h3>

                            <p className="mt-2 text-sm leading-6 text-slate-600">
                                {text}
                            </p>

                        </div>
                    ))}

                </div>
            </section>

      {/* CTA */}
      <section className="px-5 py-16 sm:px-8 sm:py-20">
        <div className="mx-auto flex max-w-7xl flex-col justify-between gap-7 rounded-3xl border border-slate-200 bg-[#0B1220] px-6 py-10 text-white sm:px-10 sm:py-12 md:flex-row md:items-center">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-sky-400">
              Need a little guidance?
            </p>
            <h2 className="mt-3 text-2xl font-black sm:text-3xl">
              Get Your Own Detailed Vehicle Inspection Report
            </h2>
            <p className="mt-3 max-w-2xl leading-7 text-slate-300">
                        Get a professional inspection with a structured
                        checklist, condition scoring, AI-powered summary,
                        issue documentation, tyre analysis and photographic
                        evidence.
            </p>
          </div>

          <Link
            href="/pricing"
            className="inline-flex min-h-12 shrink-0 items-center justify-center gap-2 self-start rounded-full bg-sky-400 px-6 py-3 text-sm font-bold text-[#0B1220] transition hover:bg-sky-300 md:self-center"
          >
            Explore inspection pricing <span aria-hidden="true">↗</span>
          </Link>
        </div>
      </section>

        </main>
    );
}

/* ================================================================
   COMPONENTS
================================================================ */

function InfoRow({
    label,
    value,
}: {
    label: string;
    value: string;
}) {
    return (
        <div className="grid grid-cols-2 border-b border-slate-200 last:border-b-0">

            <div className="bg-slate-50 px-5 py-5 text-sm font-bold text-slate-700">
                {label}
            </div>

            <div className="px-5 py-5 text-sm text-slate-600">
                {value}
            </div>

        </div>
    );
}

function SectionHeading({
    eyebrow,
    title,
    description,
}: {
    eyebrow: string;
    title: string;
    description: string;
}) {
    return (
        <div className="max-w-3xl">

            <span className="text-xs font-black uppercase tracking-[0.2em] text-blue-700">
                {eyebrow}
            </span>

            <h2 className="mt-3 text-3xl font-black tracking-tight text-slate-900 md:text-4xl">
                {title}
            </h2>

            <p className="mt-4 text-base leading-7 text-slate-600">
                {description}
            </p>

        </div>
    );
}

function HealthCard({
    title,
    score,
}: {
    title: string;
    score: number;
}) {
    return (
        <div className="flex flex-col items-center justify-center text-center">

            <div className="max-w-[180px] text-sm font-bold uppercase tracking-wide text-amber-600">
                {title}
            </div>

            <div className="mt-3 text-4xl font-black text-slate-900">
                {score}%
            </div>

            <div className="mt-3 h-2 w-36 overflow-hidden rounded-full bg-slate-100">

                <div
                    className="h-full rounded-full bg-emerald-500"
                    style={{
                        width: `${score}%`,
                    }}
                />

            </div>

        </div>
    );
}

function AISummaryRow({
    title,
    children,
    last = false,
}: {
    title: string;
    children: ReactNode;
    last?: boolean;
}) {
    return (
        <div
            className={`grid gap-4 py-6 md:grid-cols-[240px_1fr] md:gap-8 ${
                !last ? "border-b border-slate-200" : ""
            }`}
        >

            <div>
                <h3 className="text-base font-black text-[#0B1220]">
                    {title}:
                </h3>
            </div>

            <div className="text-[15px] leading-6 text-slate-700">
                {children}
            </div>

        </div>
    );
}

function ReportScreenshot({
    src,
    title,
}: {
    src: string;
    title: string;
}) {
    return (
        <div className="overflow-hidden rounded-2xl border border-white/10 bg-white shadow-2xl">

            <div className="bg-slate-100 p-2">

                <Image
                    src={src}
                    alt={title}
                    width={1600}
                    height={1000}
                    className="h-auto w-full rounded-lg"
                />

            </div>

            <div className="px-5 py-4">

                <h3 className="font-bold text-slate-900">
                    {title}
                </h3>

            </div>
        </div>
    );
}