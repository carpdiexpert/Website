"use client";

import {
    useState,
    useEffect,
    useMemo,
    useRef,
} from "react";

import checklist from "@/lib/checklist";

import { useRouter } from "next/navigation";
import { useInspectorSession } from "@/lib/useInspectorSession";

// Firebase
import {
    collection,
    addDoc,
    updateDoc,
    doc,
    getFirestore,
} from "firebase/firestore";

import app from "@/lib/firebase";

// lib/firebase.ts exports the Firebase app as default, not a `db` named export.
const db = getFirestore(app);


// ============================================================
// TYPES
// ============================================================
type ChecklistItem =
    | string
    | {
        text: string;
        label?: string;
        notFor?: string[];
        type?: string;
    };


type ResultValue =
    | number
    | {
        value?: number;
        comment?: string;
    }
    | {
        week?: string;
        year?: string;
        depth?: string;
        manufacturer?: string;
        condition?: string;
        score?: number;
    };


// ============================================================
// TYRE CONDITION
// ============================================================

const getTyreCondition = (
    depthValue: string | number
): {
    condition: string;
    score: number;
} => {

    const depth =
        Number(depthValue);


    if (
        !Number.isFinite(depth) ||
        depth <= 0
    ) {
        return {
            condition: "No Tread",
            score: 0,
        };
    }


    // 6.5 mm and above
    if (depth >= 6.5) {
        return {
            condition: "Excellent",
            score: 100,
        };
    }


    // 5.5 mm to below 6.5 mm
    if (depth >= 5.5) {
        return {
            condition: "Good",
            score: 80,
        };
    }


    // 4.5 mm to below 5.5 mm
    if (depth >= 4.5) {
        return {
            condition: "Average",
            score: 60,
        };
    }


    // 3.5 mm to below 4.5 mm
    if (depth >= 3.5) {
        return {
            condition: "Fair",
            score: 40,
        };
    }


    // 2.5 mm to below 3.5 mm
    if (depth >= 2.5) {
        return {
            condition: "Poor",
            score: 20,
        };
    }


    // 1.0 mm to below 2.5 mm
    // The original requested range had a small gap
    // between 2.0 and 2.5 mm. This keeps that range
    // covered under the Critical condition.
    if (depth >= 1.0) {
        return {
            condition: "Critical",
            score: 10,
        };
    }


    // 0.1 mm to below 1.0 mm
    return {
        condition: "Unsafe",
        score: 0,
    };
};


// ============================================================
// COMPONENT
// ============================================================

export default function InspectionForm() {

    const router = useRouter();
    const { user, profile, loading: sessionLoading } = useInspectorSession();
    const [accessVerified, setAccessVerified] = useState(false);
    const [accessMessage, setAccessMessage] = useState("Verifying inspector access…");

    // Only active inspector accounts may use the inspection workspace.
    useEffect(() => {
        if (sessionLoading) return;

        if (!user) {
            setAccessMessage("Please sign in with an inspector account.");
            router.replace("/login");
            return;
        }

        const authenticatedUser = user;
        let cancelled = false;

        async function verifyInspectorAccess() {
            try {
                const token = await authenticatedUser.getIdToken();
                const response = await fetch("/api/inspect/authorize", {
                    method: "GET",
                    headers: { Authorization: `Bearer ${token}` },
                    cache: "no-store",
                });
                const result = await response.json().catch(() => null);

                if (cancelled) return;
                if (!response.ok || !result?.ok) {
                    setAccessMessage("Access denied. An active inspector account is required.");
                    router.replace("/inspector/dashboard");
                    return;
                }

                setAccessVerified(true);
                setAccessMessage("Inspector access verified.");
                if (typeof result.inspector?.name === "string" && result.inspector.name.trim()) {
                    setMeta(current => ({ ...current, inspector: current.inspector || result.inspector.name }));
                }
            } catch {
                if (cancelled) return;
                setAccessMessage("Unable to verify access. Please return to the inspector portal and try again.");
            }
        }

        void verifyInspectorAccess();
        return () => { cancelled = true; };
    }, [sessionLoading, user, router]);


    // ========================================================
    // BASIC STATE
    // ========================================================

    const [loading, setLoading] =
        useState(false);

    const [searchQuery, setSearchQuery] =
        useState("");

    // Checklist sections start collapsed so the inspector sees only main points.
    const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});

    const searchInputRef =
        useRef<HTMLInputElement>(null);

    const [toast, setToast] =
        useState<string | null>(null);


    // ========================================================
    // INSPECTOR COMMENTS
    // ========================================================

    const [
        inspectorComments,
        setInspectorComments,
    ] = useState<string[]>([""]);


    // ========================================================
    // META
    // ========================================================

    const [meta, setMeta] = useState({
        bookingId: "",
        mobile: "",
        name: "",
        // Set on the client after mount to keep Next.js prerendering stable.
        date: "",
        inspector: "",
        vin: "",
        odometer: "",
        brand: "",
        model: "",
        year: "",
        month: "",
        vehicleType: "",
    });

    // `new Date()` is intentionally evaluated after mount, not during
    // the initial Client Component render, to avoid blocking prerender.
    useEffect(() => {
        setMeta(current => ({
            ...current,
            date: current.date || new Date().toLocaleDateString("en-GB"),
        }));
    }, []);


    // ========================================================
    // CHECKLIST RESULTS
    // ========================================================

    const [results, setResults] =
        useState<
            Record<
                string,
                ResultValue
            >
        >({});

    // Fuel and transmission are independent selections.
    // Petrol/Diesel/CNG alone means manual; adding Automatic
    // marks that fuel variant as automatic too.
    const [selectedVehicleTypes, setSelectedVehicleTypes] =
        useState<string[]>([]);

    const handleVehicleTypeToggle = (type: string) => {
        if (["Petrol", "Diesel", "CNG", "EV"].includes(type)) {
            setMeta(prev => ({ ...prev, vehicleType: type }));
            setSelectedVehicleTypes(prev =>
                prev.includes("Automatic") ? [type, "Automatic"] : [type]
            );
            return;
        }

        if (type === "Automatic") {
            setSelectedVehicleTypes(prev => {
                const next = prev.includes("Automatic")
                    ? prev.filter(value => value !== "Automatic")
                    : [...prev, "Automatic"];
                setMeta(current => ({
                    ...current,
                    vehicleType: next.find(value => ["Petrol", "Diesel", "CNG", "EV"].includes(value)) || (next.includes("Automatic") ? "Automatic" : ""),
                }));
                return next;
            });
        }
    };


    // ========================================================
    // LOAD ACTIVE JOB
    // ========================================================

    useEffect(() => {

        const loadData = () => {

            const jobStr =
                localStorage.getItem(
                    "active_pdi"
                );


            if (!jobStr) {

                setTimeout(
                    loadData,
                    300
                );

                return;
            }


            try {

                const job =
                    JSON.parse(jobStr);


                setMeta(prev => ({
                    ...prev,

                    bookingId:
                        job.id || "",

                    name:
                        job.name || "",

                    mobile:
                        job.mobile || "",

                    brand:
                        job.brand || "",

                    model:
                        job.model || "",

                    inspector:
                        job.inspector ||
                        job.assignedTo ||
                        profile?.name ||
                        "",
                }));

            } catch (error) {

                console.error(
                    "Failed to load active PDI:",
                    error
                );

            }
        };


        loadData();

    }, []);


    // ========================================================
    // TOUCH HANDLING
    // ========================================================

    const handleTouchStart = (
        e: React.TouchEvent
    ) => {

        if (
            searchInputRef.current &&
            !searchInputRef.current.contains(
                e.target as Node
            )
        ) {

            searchInputRef.current.blur();
        }
    };


    // VIN, year and month are entered manually; no VIN decoder is used.


    // ========================================================
    // FILTER CHECKLIST
    // ========================================================

    const filteredChecklist =
        useMemo(() => {
            const normalizeSearchText = (value: string) =>
                value
                    .toLocaleLowerCase()
                    .normalize("NFD")
                    .replace(/[\u0300-\u036f]/g, "")
                    .replace(/[^a-z0-9]+/g, " ")
                    .trim();

            const searchTerms = normalizeSearchText(searchQuery)
                .split(/\s+/)
                .filter(Boolean);

            if (searchTerms.length === 0) {
                return checklist;
            }

            return checklist
                .map(section => ({
                    ...section,
                    items: section.items.filter(item => {
                        const checkpointText =
                            typeof item === "object" ? item.text : item;
                        const searchableText = normalizeSearchText(
                            `${String(section.section)} ${checkpointText}`
                        );

                        // Match every typed word independently, in any order.
                        // Example: "Dickey crack" matches
                        // "Dickey Sidewalls: Check for cracks & bends".
                        return searchTerms.every(term =>
                            searchableText.includes(term)
                        );
                    }),
                }))
                .filter(section => section.items.length > 0);
        }, [searchQuery]);


    useEffect(() => {
        if (!searchQuery.trim()) return;
        setExpandedSections(previous => {
            const next = { ...previous };
            for (const section of filteredChecklist) {
                next[String(section.section)] = true;
            }
            return next;
        });
    }, [searchQuery, filteredChecklist]);


    // ========================================================
    // STATUS CHANGE
    // ========================================================

    const handleStatusChange = (
        id: string,
        value: number
    ) => {

        setResults(prev => {

            const existing =
                prev[id];


            // Never modify tyre objects
            if (
                typeof existing ===
                "object" &&
                existing &&
                "week" in existing
            ) {

                return prev;
            }


            return {

                ...prev,

                [id]: {

                    // IMPORTANT:
                    // Preserve an existing finding/comment
                    // when changing PASSED <-> ISSUE.
                    ...(typeof existing ===
                        "object" &&
                        existing &&
                        "value" in existing
                        ? existing
                        : {}),

                    value,
                },
            };
        });

        // Clear the search once a checkpoint has been marked,
        // so the inspector can continue with the full checklist.
        setSearchQuery("");
    };


    // ========================================================
    // COMMENT / FINDING CHANGE
    // ========================================================

    const handleCommentChange = (
        id: string,
        comment: string
    ) => {

        setResults(prev => {

            const existing =
                prev[id];


            let value =
                1;


            if (
                typeof existing ===
                "number"
            ) {

                value =
                    existing;

            } else if (
                typeof existing ===
                "object" &&
                existing &&
                "value" in existing
            ) {

                value =
                    existing.value ??
                    1;
            }


            return {

                ...prev,

                [id]: {

                    // IMPORTANT:
                    // Always retain the selected
                    // PASSED / ISSUE status.
                    ...(typeof existing ===
                        "object" &&
                        existing &&
                        "value" in existing
                        ? existing
                        : {}),

                    value,

                    // IMPORTANT:
                    // Finding is saved even for PASSED.
                    comment: String(comment ?? ""),
                },
            };
        });
    };


    // ========================================================
    // HEALTH SCORE
    // ========================================================

    const calculateScore = (
        arr: number[]
    ) => {

        if (
            arr.length === 0
        ) {

            return 0;
        }


        const passed =
            arr.filter(
                v => v === 1
            ).length;


        return Math.round(
            (
                passed /
                arr.length
            ) *
            100
        );
    };


    // ========================================================
    // WEEKS
    // ========================================================

    const weeks =
        Array.from(
            {
                length: 52,
            },
            (_, i) =>
                String(i + 1)
                    .padStart(
                        2,
                        "0"
                    )
        );


    // ========================================================
    // UPDATE TYRE FIELD
    // ========================================================

    const updateTyreField = (
        id: string,
        field:
            | "week"
            | "year"
            | "depth"
            | "manufacturer",
        value: string
    ) => {

        setResults(prev => {

            const existing =
                prev[id];


            const current =
                typeof existing ===
                    "object" &&
                    existing &&
                    "week" in existing
                    ? existing
                    : {};


            return {

                ...prev,

                [id]: {

                    ...current,

                    [field]:
                        value,
                },
            };
        });
    };


    // ========================================================
    // GET TYRE DATA FROM RESULT
    // ========================================================

    const getTyreData = (
        id: string
    ) => {

        const value =
            results[id];


        if (
            typeof value ===
            "object" &&
            value &&
            "week" in value
        ) {

            return value as {
                week?: string;
                year?: string;
                depth?: string;
                manufacturer?: string;
            };
        }


        return {
            week: "",
            year: "",
            depth: "",
            manufacturer: "",
        };
    };


    // ========================================================
    // FIREBASE SUBMIT
    // ========================================================

    const handleSubmit =
        async (
            e: React.FormEvent
        ) => {

            e.preventDefault();


            setLoading(true);


            if (
                selectedVehicleTypes.length === 0
            ) {

                alert(
                    "Please select vehicle type"
                );

                setLoading(false);

                return;
            }


            // ====================================================
            // IDS
            // ====================================================

            const idSequence = [

                ...Array.from(
                    {
                        length: 400,
                    },
                    (_, i) =>
                        (
                            i + 1
                        ).toString()
                ),

                "A",
                "B",
                "C",
                "D",
                "E",
            ];


            // ====================================================
            // OUTPUT DATA
            // ====================================================

            const checklistResults: Record<
                string,
                number
            > = {};


            const checklistComments: Record<
                string,
                string
            > = {};


            const tyreData: Record<
                string,
                {
                    week: string;
                    year: string;
                    depth: string;
                    manufacturer: string;
                    condition: string;
                    score: number;
                }
            > = {};


            // ====================================================
            // PROCESS
            // ====================================================

            idSequence.forEach(
                id => {

                    const item =
                        results[id];


                    // ============================================
                    // TYRE DATA
                    // ============================================

                    if (
                        typeof item ===
                        "object" &&
                        item &&
                        "week" in item
                    ) {

                        const depth =
                            item.depth ||
                            "";


                        const tyreCondition =
                            getTyreCondition(
                                depth
                            );


                        tyreData[id] = {

                            week:
                                item.week ||
                                "",

                            year:
                                item.year ||
                                "",

                            depth,

                            manufacturer:
                                item.manufacturer ||
                                "",

                            condition:
                                depth
                                    ? tyreCondition.condition
                                    : "",

                            score:
                                depth
                                    ? tyreCondition.score
                                    : 0,
                        };


                        return;
                    }


                    // ============================================
                    // FIND CHECKLIST ITEM
                    // ============================================

                    let checklistItem:
                        ChecklistItem | undefined;


                    for (
                        const section
                        of checklist
                    ) {

                        const found =
                            section.items.find(
                                (
                                    it:
                                        ChecklistItem,
                                    idx:
                                        number
                                ) => {

                                    const lbl =
                                        typeof it ===
                                            "object" &&
                                            it.label
                                            ? it.label
                                            : String(
                                                section.startNo +
                                                idx
                                            );


                                    return (
                                        lbl ===
                                        id
                                    );
                                }
                            );


                        if (found) {

                            checklistItem =
                                found;

                            break;
                        }
                    }


                    // ============================================
                    // AUTOMATIC NA LOGIC
                    // ============================================

                    const isNA =
                        typeof checklistItem ===
                        "object" &&
                        Array.isArray(
                            checklistItem.notFor
                        ) &&
                        selectedVehicleTypes.some(type =>
                            checklistItem.notFor!.includes(type)
                        );


                    if (isNA) {

                        checklistResults[
                            id
                        ] = -1;


                        checklistComments[
                            id
                        ] =
                            "Not Applicable";


                        return;
                    }


                    // ============================================
                    // NUMBER RESULT
                    // ============================================

                    if (
                        typeof item ===
                        "number"
                    ) {

                        checklistResults[
                            id
                        ] = item;


                        checklistComments[
                            id
                        ] =
                            item === 0
                                ? "ISSUE"
                                : "Condition Verified";


                        return;
                    }


                    // ============================================
                    // OBJECT RESULT
                    // ============================================

                    if (
                        typeof item ===
                        "object" &&
                        item &&
                        "value" in item
                    ) {

                        const value =
                            item.value ??
                            1;


                        checklistResults[
                            id
                        ] = value;


                        const comment =
                            item.comment
                                ?.trim() ||
                            "";


                        // ----------------------------------------
                        // ISSUE
                        // ----------------------------------------

                        if (
                            value === 0
                        ) {

                            checklistComments[
                                id
                            ] =
                                comment
                                    ? `ISSUE - ${comment}`
                                    : "ISSUE";


                            return;
                        }


                        // ----------------------------------------
                        // PASSED + FINDING
                        // ----------------------------------------

                        checklistComments[
                            id
                        ] =
                            comment
                                ? `Condition Verified - Findings - ${comment}`
                                : "Condition Verified";


                        return;
                    }


                    // ============================================
                    // DEFAULT PASSED
                    // ============================================

                    checklistResults[
                        id
                    ] = 1;


                    checklistComments[
                        id
                    ] =
                        "Condition Verified";
                }
            );


            // ====================================================
            // HEALTH SCORE
            // ====================================================

            const numericValues =
                Object.values(
                    checklistResults
                ).filter(
                    (
                        v
                    ): v is number =>
                        typeof v ===
                        "number" &&
                        v !== -1
                );


            const healthScore =
                calculateScore(
                    numericValues
                );


            // ====================================================
            // INSPECTOR COMMENTS
            // ====================================================

            const finalComments =
                inspectorComments
                    .map(
                        comment =>
                            comment.trim()
                    )
                    .filter(
                        Boolean
                    );


            // ====================================================
            // SAVE
            // ====================================================

            try {

                const reportRef = await addDoc(
                    collection(
                        db,
                        "reports"
                    ),
                    {

                        ...meta,
                        vehicleTypes: selectedVehicleTypes,

                        bookingId:
                            meta.bookingId,

                        // Numeric checklist
                        checklistResults,

                        // Findings / remarks
                        checklistComments,

                        // Tyres
                        tyreData,

                        // Overall checklist score
                        healthScore,

                        // Inspector comments
                        inspectorComments:
                            finalComments,

                        createdAt:
                            new Date(),

                        status:
                            "completed",

                        approved:
                            false,
                    }
                );
                const reportId = reportRef.id;
                await updateDoc(reportRef, {
                    reportId,
                });
                // ====================================================
                // UPDATE BOOKING
                // ====================================================

                await updateDoc(

                    doc(
                        db,
                        "bookings",
                        meta.bookingId
                    ),

                    {
                        status:
                            "completed",
                    }
                );


                // ====================================================
                // SUCCESS RESULT
                // ====================================================

                // This payload is useful for the Android/app side.
                // It is only sent AFTER both Firebase writes succeed.
                const submissionResult = {
                    success: true,
                    status: "success",
                    message: "Inspection submitted successfully",
                    bookingId: meta.bookingId,
                    reportId,
                    healthScore,
                };

                const android = (
                    window as any
                ).Android;

                // Preferred native callback: receives a JSON result.
                if (
                    android?.onSubmitSuccess
                ) {
                    android.onSubmitSuccess(
                        JSON.stringify(
                            submissionResult
                        )
                    );
                }
                // Backward compatibility with the existing Android bridge.
                else if (
                    android?.onSubmitClicked
                ) {
                    android.onSubmitClicked();
                }

                // Keep a browser/app-readable success result as well.
                localStorage.setItem(
                    "pdi_submission_result",
                    JSON.stringify(
                        submissionResult
                    )
                );

                localStorage.removeItem(
                    "active_pdi"
                );

                // Redirect only after Firebase has confirmed the submission.
                router.push(
                    `/inspector?submission=success&bookingId=${encodeURIComponent(
                        String(meta.bookingId || "")
                    )}`
                );


            } catch (err) {

                console.error(
                    err
                );

                alert(
                    "Submission failed."
                );

            } finally {

                setLoading(
                    false
                );
            }
        };


    // ============================================================
    // UI
    // ============================================================

    if (sessionLoading || !accessVerified) {
        return (
            <main className="flex min-h-screen items-center justify-center bg-slate-100 p-6">
                <div className="max-w-md rounded-2xl border border-slate-200 bg-white px-6 py-5 text-center text-sm font-semibold text-slate-600 shadow-sm">
                    {accessMessage}
                </div>
            </main>
        );
    }

    if (!user || !profile) {
        return (
            <main className="flex min-h-screen items-center justify-center bg-slate-100 p-6">
                <div className="max-w-md rounded-2xl border border-rose-200 bg-white p-6 text-center shadow-sm">
                    <h1 className="text-xl font-black text-slate-900">Inspector access required</h1>
                    <p className="mt-2 text-sm leading-6 text-slate-600">{accessMessage}</p>
                </div>
            </main>
        );
    }

    return (

        <div
            className="
                min-h-screen
                bg-indigo-50/60
                pb-28
                font-sans
            "
            onTouchStart={
                handleTouchStart
            }
        >

            {/* ==================================================
                HEADER
            ================================================== */}

            <div
                className="
                    bg-gradient-to-r from-indigo-950 via-indigo-900 to-violet-800
                    px-4 py-3
                    text-white
                    rounded-b-2xl
                    shadow-md
                    sticky
                    top-0
                    z-50
                "
            >

                <div
                    className="
                        flex
                        justify-between
                        items-center
                        mb-3
                    "
                >

                    <button
                        type="button"
                        onClick={() =>
                            router.push(
                                "/inspector/dashboard"
                            )
                        }
                        className="
                            text-[10px]
                            font-black
                            text-indigo-400
                            uppercase
                            tracking-widest
                        "
                    >
                        ← Back
                    </button>


                    <h1
                        className="
                            text-xl
                            font-black
                            italic
                        "
                    >
                        PDI INSPECTION
                    </h1>


                    <span
                        className="
                            text-[10px]
                            font-black
                            text-indigo-400
                        "
                    >
                        {meta.date}
                    </span>

                </div>


                <input
                    ref={
                        searchInputRef
                    }
                    type="text"
                    placeholder="Search Engine, AC, Tyre..."
                    value={
                        searchQuery
                    }
                    onChange={e =>
                        setSearchQuery(
                            e.target.value
                        )
                    }
                    className="
                        w-full
                        p-4
                        bg-white/10
                        border
                        border-white/25
                        rounded-xl
                        text-sm
                    "
                />

            </div>


            {/* ==================================================
                FORM
            ================================================== */}

            <form
                onSubmit={
                    handleSubmit
                }
                className="
                    max-w-lg
                    mx-auto
                    p-6
                    space-y-6
                "
            >

                {/* ==================================================
                    CUSTOMER + VEHICLE
                ================================================== */}

                {!searchQuery && (

                    <div
                        className="
                            space-y-4
                        "
                    >

                        {/* CUSTOMER */}

                        <div
                            className="
                                bg-white
                                p-6
                                rounded-2xl
                                shadow-sm
                                border border-indigo-100
                                space-y-4
                            "
                        >

                            <input
                                    readOnly
                                required
                                placeholder="Inspector Name"
                                className="
                                    w-full
                                    p-4
                                    bg-slate-50
                                    rounded-2xl
                                "
                                value={
                                    meta.inspector
                                }
                                onChange={e =>
                                    setMeta({
                                        ...meta,
                                        inspector:
                                            e.target
                                                .value,
                                    })
                                }
                            />


                            <div
                                className="
                                    grid
                                    grid-cols-2
                                    gap-3
                                "
                            >

                                <input
                                    readOnly
                                    required
                                    placeholder="Customer Name"
                                    className="
                                        p-4
                                        bg-slate-50
                                        rounded-2xl
                                    "
                                    value={
                                        meta.name
                                    }
                                    onChange={e =>
                                        setMeta({
                                            ...meta,
                                            name:
                                                e.target
                                                    .value,
                                        })
                                    }
                                />


                                <input
                                    readOnly
                                    required
                                    placeholder="Mobile"
                                    className="
                                        p-4
                                        bg-slate-50
                                        rounded-2xl
                                    "
                                    value={
                                        meta.mobile
                                    }
                                    onChange={e =>
                                        setMeta({
                                            ...meta,
                                            mobile:
                                                e.target
                                                    .value,
                                        })
                                    }
                                />

                            </div>

                        </div>


                        {/* VEHICLE */}

                        <div
                            className="
                                bg-white
                                p-6
                                rounded-[2.5rem]
                                shadow-sm
                                border
                                space-y-4
                            "
                        >

                            <div
                                className="
                                    grid
                                    grid-cols-2
                                    gap-3
                                "
                            >

                                <input
                                    readOnly
                                    required
                                    placeholder="Brand"
                                    className="
                                        p-4
                                        bg-slate-50
                                        rounded-2xl
                                    "
                                    value={
                                        meta.brand
                                    }
                                    onChange={e =>
                                        setMeta({
                                            ...meta,
                                            brand:
                                                e.target
                                                    .value,
                                        })
                                    }
                                />


                                <input
                                    readOnly
                                    required
                                    placeholder="Model"
                                    className="
                                        p-4
                                        bg-slate-50
                                        rounded-2xl
                                    "
                                    value={
                                        meta.model
                                    }
                                    onChange={e =>
                                        setMeta({
                                            ...meta,
                                            model:
                                                e.target
                                                    .value,
                                        })
                                    }
                                />

                            </div>


                            <input
                                required
                                placeholder="VIN"
                                className="
                                    w-full
                                    p-4
                                    bg-slate-100
                                    rounded-2xl
                                "
                                value={
                                    meta.vin
                                }
                                onChange={e =>
                                    setMeta({
                                        ...meta,
                                        vin:
                                            e.target
                                                .value
                                                .toUpperCase(),
                                    })
                                }
                            />


                            <div
                                className="
                                    grid
                                    grid-cols-3
                                    gap-3
                                "
                            >

                                <input
                                    type="number"
                                    inputMode="numeric"
                                    min="0"
                                    required
                                    placeholder="Odo"
                                    aria-label="Odometer reading"
                                    className="
                                        min-w-0
                                        w-full
                                        p-4
                                        bg-slate-100
                                        text-slate-700
                                        rounded-2xl
                                    "
                                    value={meta.odometer ?? ""}
                                    onChange={e =>
                                        setMeta({
                                            ...meta,
                                            odometer: e.target.value,
                                        })
                                    }
                                />


                                <p
                                    className="
                                        text-[10px]
                                        text-slate-400
                                        font-black
                                        ml-2
                                    "
                                >
                                    Auto-filled
                                </p>


                                <input
                                    type="number"
                                    inputMode="numeric"
                                    min="1900"
                                    max="2100"
                                    placeholder="Year"
                                    aria-label="Vehicle year"
                                    className="
                                        min-w-0
                                        w-full
                                        p-4
                                        bg-slate-100
                                        text-slate-700
                                        rounded-2xl
                                        text-center
                                        font-bold
                                    "
                                    value={meta.year ?? ""}
                                    onChange={e =>
                                        setMeta({
                                            ...meta,
                                            year: e.target.value,
                                        })
                                    }
                                />


                                <select
                                    className="
                                        p-4
                                        bg-indigo-50
                                        rounded-2xl
                                        text-center
                                        font-bold
                                    "
                                    value={
                                        meta.month
                                    }
                                    onChange={e =>
                                        setMeta({
                                            ...meta,
                                            month:
                                                e.target
                                                    .value,
                                        })
                                    }
                                >

                                    <option value="">
                                        Month
                                    </option>

                                    <option>
                                        January
                                    </option>

                                    <option>
                                        February
                                    </option>

                                    <option>
                                        March
                                    </option>

                                    <option>
                                        April
                                    </option>

                                    <option>
                                        May
                                    </option>

                                    <option>
                                        June
                                    </option>

                                    <option>
                                        July
                                    </option>

                                    <option>
                                        August
                                    </option>

                                    <option>
                                        September
                                    </option>

                                    <option>
                                        October
                                    </option>

                                    <option>
                                        November
                                    </option>

                                    <option>
                                        December
                                    </option>

                                </select>

                            </div>

                        </div>


                        {/* VEHICLE TYPE */}

                        <div
                            className="
                                bg-white
                                p-6
                                rounded-[2.5rem]
                                shadow-sm
                                border
                                space-y-4
                            "
                        >

                            <p
                                className="
                                    text-[10px]
                                    font-black
                                    uppercase
                                    tracking-widest
                                    text-slate-400
                                "
                            >
                                Vehicle Type / Transmission
                            </p>
                            <p className="text-xs text-slate-500">Choose Petrol, Diesel, CNG or EV for manual transmission. Then select Automatic as well for an automatic variant.</p>


                            <div
                                className="
                                    flex
                                    gap-2
                                    flex-wrap
                                "
                            >

                                {[
                                    "Petrol",
                                    "Diesel",
                                    "CNG",
                                    "EV",
                                    "Automatic",
                                ].map(
                                    type => (

                                        <button
                                            key={
                                                type
                                            }
                                            type="button"
                                            onClick={() => handleVehicleTypeToggle(type)}
                                            className={`
                                                flex-1
                                                min-w-[80px]
                                                px-4
                                                py-3
                                                rounded-2xl
                                                text-xs
                                                font-black
                                                border
                                                transition-all
                                                ${selectedVehicleTypes.includes(type)
                                                    ? "bg-indigo-600 text-white border-indigo-600 shadow-md"
                                                    : "bg-slate-50 text-slate-500 border-slate-200"
                                                }
                                            `}
                                        >
                                            {
                                                type
                                            }
                                        </button>

                                    )
                                )}

                            </div>

                        </div>

                    </div>
                )}


                {/* ==================================================
                    INSPECTOR COMMENTS
                ================================================== */}

                <div
                    className="
                        bg-white
                        p-6
                        rounded-[2.5rem]
                        shadow-sm
                        border
                        space-y-4
                    "
                >

                    <div
                        className="
                            flex
                            items-center
                            justify-between
                        "
                    >

                        <p
                            className="
                                text-[10px]
                                font-black
                                uppercase
                                tracking-widest
                                text-slate-400
                            "
                        >
                            Inspector Comments
                        </p>


                        <button
                            type="button"
                            onClick={() =>
                                setInspectorComments(
                                    prev => [
                                        ...prev,
                                        "",
                                    ]
                                )
                            }
                            className="
                                px-4
                                py-2
                                rounded-xl
                                bg-indigo-600
                                text-white
                                text-[10px]
                                font-black
                                uppercase
                            "
                        >
                            + Add Comment
                        </button>

                    </div>


                    {inspectorComments.map(
                        (
                            comment,
                            index
                        ) => (

                            <textarea
                                key={
                                    index
                                }
                                rows={2}
                                placeholder={`Comment ${index + 1
                                    }`}
                                value={
                                    comment
                                }
                                onChange={e => {

                                    const updated =
                                        [
                                            ...inspectorComments,
                                        ];


                                    updated[
                                        index
                                    ] =
                                        e.target.value;


                                    setInspectorComments(
                                        updated
                                    );
                                }}
                                className="
                                    w-full
                                    rounded-2xl
                                    border
                                    border-slate-200
                                    bg-slate-50
                                    p-4
                                    text-sm
                                    resize-none
                                "
                            />

                        )
                    )}

                </div>


                {/* ==================================================
                    CHECKLIST
                ================================================== */}

                {filteredChecklist.map(
                    (
                        section,
                        sIdx
                    ) => (

                        <div
                            key={
                                sIdx
                            }
                            className="
                                space-y-3
                            "
                        >

                            {/* COLLAPSIBLE MAIN POINT */}
                            <button
                                type="button"
                                aria-expanded={Boolean(expandedSections[String(section.section)])}
                                onClick={() => setExpandedSections(previous => ({
                                    ...previous,
                                    [String(section.section)]: !previous[String(section.section)],
                                }))}
                                className="flex w-full items-center justify-between gap-3 rounded-2xl border border-indigo-100 bg-white px-4 py-4 text-left shadow-sm transition hover:border-indigo-300 hover:bg-indigo-50/50"
                            >
                                <span className="min-w-0">
                                    <span className="block text-sm font-extrabold text-indigo-950">
                                        {section.section}
                                    </span>
                                    <span className="mt-1 block text-xs font-medium text-slate-500">
                                        {section.items.length} checkpoints
                                    </span>
                                </span>
                                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-lg font-bold text-indigo-800">
                                    {expandedSections[String(section.section)] ? "−" : "+"}
                                </span>
                            </button>

                            {/* CHECKPOINTS: HIDDEN UNTIL THE MAIN POINT IS OPENED */}
                            {expandedSections[String(section.section)] && <div
                                className="
                                    bg-white
                                    rounded-2xl
                                    shadow-sm
                                    border
                                    border-indigo-100
                                    divide-y
                                    divide-indigo-50
                                    overflow-hidden
                                "
                            >

                                {(
                                    section.items as ChecklistItem[]
                                ).map(
                                    (
                                        item,
                                        iIdx
                                    ) => {

                                        // ========================================
                                        // ID
                                        // ========================================

                                        const label =
                                            typeof item ===
                                                "object" &&
                                                "label" in
                                                item &&
                                                item.label
                                                ? item.label
                                                : String(
                                                    section.startNo +
                                                    iIdx
                                                );


                                        // ========================================
                                        // TEXT
                                        // ========================================

                                        const text =
                                            typeof item ===
                                                "object" &&
                                                "text" in
                                                item
                                                ? item.text
                                                : String(
                                                    item
                                                );


                                        // ========================================
                                        // TYRE
                                        // ========================================

                                        const isTyre =
                                            typeof item ===
                                            "object" &&
                                            "type" in
                                            item &&
                                            item.type ===
                                            "TYRE";


                                        // ========================================
                                        // AUTOMATIC NA
                                        // ========================================

                                        const notApplicable =
                                            typeof item ===
                                            "object" &&
                                            "notFor" in
                                            item &&
                                            Array.isArray(
                                                item.notFor
                                            ) &&
                                            selectedVehicleTypes.some(type =>
                                                item.notFor!.includes(type)
                                            );


                                        // ========================================
                                        // CURRENT STATUS
                                        // ========================================

                                        let currentVal =
                                            1;


                                        if (
                                            typeof results[
                                            label
                                            ] ===
                                            "number"
                                        ) {

                                            currentVal =
                                                results[
                                                label
                                                ] as number;

                                        } else if (
                                            typeof results[
                                            label
                                            ] ===
                                            "object" &&
                                            results[
                                            label
                                            ] &&
                                            "value" in
                                            results[
                                            label
                                            ]
                                        ) {

                                            currentVal =
                                                (
                                                    results[
                                                    label
                                                    ] as {
                                                        value?: number;
                                                    }
                                                )
                                                    .value ??
                                                1;
                                        }


                                        // ========================================
                                        // AUTOMATIC NA
                                        // ========================================

                                        if (
                                            notApplicable
                                        ) {

                                            currentVal =
                                                -1;
                                        }


                                        // ========================================
                                        // TYRE DATA
                                        // ========================================

                                        const tyre =
                                            getTyreData(
                                                label
                                            );


                                        const tyreCondition =
                                            tyre.depth
                                                ? getTyreCondition(
                                                    tyre.depth
                                                )
                                                : null;


                                        return (

                                            <div
                                                key={
                                                    label
                                                }
                                                className="
                                                    flex
                                                    flex-col
                                                    items-stretch
                                                    gap-3
                                                    p-4
                                                    sm:flex-row
                                                    sm:items-start
                                                    sm:justify-between
                                                    sm:gap-4
                                                    sm:p-5
                                                    min-w-0
                                                "
                                            >

                                                {/* =====================================
                                                    ITEM TEXT
                                                ====================================== */}

                                                <div
                                                    className="
                                                        w-full
                                                        min-w-0
                                                        sm:flex-1
                                                    "
                                                >

                                                    <p
                                                        className="
                                                            text-[9px]
                                                            text-slate-300
                                                            font-black
                                                        "
                                                    >
                                                        #{label}
                                                    </p>


                                                    <p
                                                        className="
                                                            text-sm
                                                            leading-relaxed
                                                            font-semibold
                                                            text-slate-800
                                                            whitespace-normal
                                                            break-words
                                                            [overflow-wrap:anywhere]
                                                        "
                                                    >
                                                        {
                                                            text
                                                        }
                                                    </p>

                                                </div>


                                                {/* =====================================
                                                    TYRE
                                                ====================================== */}

                                                {isTyre ? (

                                                    <div
                                                        className="
                                                            flex
                                                            flex-col
                                                            w-full
                                                            gap-2
                                                            sm:w-[220px]
                                                        "
                                                    >

                                                        {/* ROW 1 */}

                                                        <div
                                                            className="
                                                                flex
                                                                gap-2
                                                            "
                                                        >

                                                            <select
                                                                className="
                                                                    w-1/2
                                                                    p-2
                                                                    bg-slate-100
                                                                    rounded-xl
                                                                    text-xs
                                                                    text-center
                                                                    font-bold
                                                                "
                                                                value={
                                                                    tyre.week ||
                                                                    ""
                                                                }
                                                                onChange={e =>
                                                                    updateTyreField(
                                                                        label,
                                                                        "week",
                                                                        e
                                                                            .target
                                                                            .value
                                                                    )
                                                                }
                                                            >

                                                                <option value="">
                                                                    Week
                                                                </option>


                                                                {weeks.map(
                                                                    week => (

                                                                        <option
                                                                            key={
                                                                                week
                                                                            }
                                                                            value={
                                                                                week
                                                                            }
                                                                        >
                                                                            {
                                                                                week
                                                                            }
                                                                        </option>

                                                                    )
                                                                )}

                                                            </select>


                                                            <input
                                                                type="text"
                                                                inputMode="numeric"
                                                                maxLength={4}
                                                                placeholder="Year"
                                                                className="
                                                                    w-1/2
                                                                    p-2
                                                                    bg-slate-100
                                                                    rounded-xl
                                                                    text-xs
                                                                    text-center
                                                                    font-bold
                                                                "
                                                                value={
                                                                    tyre.year ||
                                                                    ""
                                                                }
                                                                onChange={e => {

                                                                    const value =
                                                                        e.target.value.replace(
                                                                            /\D/g,
                                                                            ""
                                                                        );


                                                                    if (
                                                                        value.length <=
                                                                        4
                                                                    ) {

                                                                        updateTyreField(
                                                                            label,
                                                                            "year",
                                                                            value
                                                                        );
                                                                    }
                                                                }}
                                                            />

                                                        </div>


                                                        {/* ROW 2 */}

                                                        <div
                                                            className="
                                                                flex
                                                                gap-2
                                                            "
                                                        >

                                                            <input
                                                                type="number"
                                                                inputMode="decimal"
                                                                step="0.1"
                                                                min="0"
                                                                placeholder="Depth mm"
                                                                className="
                                                                    w-1/2
                                                                    p-2
                                                                    bg-slate-100
                                                                    rounded-xl
                                                                    text-xs
                                                                    text-center
                                                                    font-bold
                                                                "
                                                                value={
                                                                    tyre.depth ||
                                                                    ""
                                                                }
                                                                onChange={e =>
                                                                    updateTyreField(
                                                                        label,
                                                                        "depth",
                                                                        e
                                                                            .target
                                                                            .value
                                                                    )
                                                                }
                                                            />


                                                            <input
                                                                type="text"
                                                                placeholder="Manufacturer"
                                                                className="
                                                                    w-1/2
                                                                    p-2
                                                                    bg-slate-100
                                                                    rounded-xl
                                                                    text-xs
                                                                    font-bold
                                                                "
                                                                value={
                                                                    tyre.manufacturer ||
                                                                    ""
                                                                }
                                                                onChange={e =>
                                                                    updateTyreField(
                                                                        label,
                                                                        "manufacturer",
                                                                        e
                                                                            .target
                                                                            .value
                                                                    )
                                                                }
                                                            />

                                                        </div>


                                                        {/* TYRE CONDITION */}

                                                        {tyreCondition && (

                                                            <div
                                                                className="
                                                                    flex
                                                                    items-center
                                                                    justify-between
                                                                    px-3
                                                                    py-2
                                                                    rounded-xl
                                                                    bg-slate-100
                                                                "
                                                            >

                                                                <span
                                                                    className="
                                                                        text-[10px]
                                                                        font-black
                                                                        text-slate-500
                                                                    "
                                                                >
                                                                    {
                                                                        tyreCondition.condition
                                                                    }
                                                                </span>


                                                                <span
                                                                    className="
                                                                        text-[10px]
                                                                        font-black
                                                                        text-slate-700
                                                                    "
                                                                >
                                                                    {
                                                                        tyreCondition.score
                                                                    }%
                                                                </span>

                                                            </div>

                                                        )}

                                                    </div>

                                                ) : (

                                                    /* =====================================
                                                       NORMAL CHECKLIST
                                                    ====================================== */

                                                    <div
                                                        className="
                                                            flex
                                                            w-full
                                                            flex-col
                                                            items-stretch
                                                            gap-3
                                                            sm:w-[220px]
                                                            sm:shrink-0
                                                            sm:items-end
                                                        "
                                                    >

                                                        {/* STATUS */}

                                                        <div
                                                            className={`
                                                                flex
                                                                w-full
                                                                justify-center
                                                                p-1
                                                                rounded-2xl
                                                                sm:w-auto
                                                                ${notApplicable
                                                                    ? "bg-slate-200 opacity-60"
                                                                    : "bg-slate-100"
                                                                }
                                                            `}
                                                        >

                                                            {/* PASSED */}

                                                            <button
                                                                type="button"
                                                                disabled={
                                                                    notApplicable
                                                                }
                                                                onClick={() =>
                                                                    !notApplicable &&
                                                                    handleStatusChange(
                                                                        label,
                                                                        1
                                                                    )
                                                                }
                                                                className={`
                                                                    flex-1
                                                                    px-4
                                                                    py-2.5
                                                                    text-xs
                                                                    sm:flex-none
                                                                    sm:py-1
                                                                    sm:text-[10px]
                                                                    font-black
                                                                    rounded-xl
                                                                    ${currentVal ===
                                                                        1
                                                                        ? "bg-green-500 text-white"
                                                                        : "text-slate-500"
                                                                    }
                                                                `}
                                                            >
                                                                PASSED
                                                            </button>


                                                            {/* ISSUE */}

                                                            <button
                                                                type="button"
                                                                disabled={
                                                                    notApplicable
                                                                }
                                                                onClick={() =>
                                                                    !notApplicable &&
                                                                    handleStatusChange(
                                                                        label,
                                                                        0
                                                                    )
                                                                }
                                                                className={`
                                                                    flex-1
                                                                    px-4
                                                                    py-2.5
                                                                    text-xs
                                                                    sm:flex-none
                                                                    sm:py-1
                                                                    sm:text-[10px]
                                                                    font-black
                                                                    rounded-xl
                                                                    ${currentVal ===
                                                                        0
                                                                        ? "bg-red-500 text-white"
                                                                        : "text-slate-500"
                                                                    }
                                                                `}
                                                            >
                                                                ISSUE
                                                            </button>

                                                        </div>


                                                        {/* AUTOMATIC NA */}

                                                        {notApplicable && (

                                                            <span
                                                                className="
                                                                    text-[10px]
                                                                    font-black
                                                                    text-slate-400
                                                                "
                                                            >
                                                                NOT APPLICABLE
                                                            </span>

                                                        )}


                                                        {/* =================================
                                                            FINDINGS
                                                        ================================== */}

                                                        {!notApplicable && (

                                                            <textarea
                                                                rows={2}
                                                                placeholder={
                                                                    currentVal ===
                                                                        0
                                                                        ? "ISSUE / Findings"
                                                                        : "Condition Verified / Findings"
                                                                }
                                                                value={
                                                                    typeof results[
                                                                        label
                                                                    ] ===
                                                                        "object" &&
                                                                        results[
                                                                        label
                                                                        ] &&
                                                                        "comment" in
                                                                        results[
                                                                        label
                                                                        ]
                                                                        ? (
                                                                            results[
                                                                            label
                                                                            ] as {
                                                                                comment?: string;
                                                                            }
                                                                        )
                                                                            .comment ||
                                                                        ""
                                                                        : ""
                                                                }
                                                                onChange={e =>
                                                                    handleCommentChange(
                                                                        label,
                                                                        e
                                                                            .target
                                                                            .value
                                                                    )
                                                                }
                                                                className={`
                                                                    w-full
                                                                    min-h-20
                                                                    p-3
                                                                    rounded-xl
                                                                    text-sm
                                                                    leading-relaxed
                                                                    sm:w-[220px]
                                                                    sm:text-[10px]
                                                                    resize-none
                                                                    ${currentVal ===
                                                                        0
                                                                        ? "bg-red-50 border border-red-200"
                                                                        : "bg-slate-50 border border-slate-200"
                                                                    }
                                                                `}
                                                            />

                                                        )}

                                                    </div>

                                                )}

                                            </div>

                                        );
                                    }
                                )}

                            </div>}

                        </div>

                    )
                )}


                {/* ==================================================
                    SUBMIT
                ================================================== */}

                <button
                    type="submit"
                    disabled={
                        loading
                    }
                    className={`
                        w-full
                        bg-slate-900
                        text-white
                        py-6
                        rounded-[2rem]
                        font-black
                        uppercase
                        tracking-widest
                        shadow-2xl
                        sticky
                        bottom-6
                        transition-all
                        ${loading
                            ? "opacity-50 cursor-not-allowed"
                            : "active:scale-95"
                        }
                    `}
                >
                    {
                        loading
                            ? "Submitting..."
                            : "Complete Report"
                    }
                </button>

            </form>


            {/* ==================================================
                TOAST
            ================================================== */}

            {toast && (

                <div
                    className="
                        fixed
                        bottom-8
                        left-1/2
                        -translate-x-1/2
                        z-[999]
                    "
                >

                    <div
                        className="
                            bg-slate-900
                            text-white
                            px-6
                            py-4
                            rounded-2xl
                            shadow-2xl
                            text-xs
                            font-black
                            uppercase
                            tracking-widest
                            animate-[fadeIn_0.3s_ease]
                        "
                    >
                        {
                            toast
                        }
                    </div>

                </div>

            )}

        </div>
    );
}