import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import checklist from "@/lib/checklist";
import newCarChecklist from "@/lib/new-car-checklist";
// ------------------ HELPERS ------------------

export const calculateRange = (
    checklistResults: any,
    start: number,
    end: number
) => {
    let ok = 0;
    let total = 0;

    for (let i = start; i <= end; i++) {
        const val = checklistResults?.[i.toString()];

        // Skip missing IDs, NA (-1), and object values (like A-E tyres)
        if (
            val === undefined ||
            Number(val) === -1 ||
            typeof val === "object"
        ) {
            continue;
        }

        total++;

        if (Number(val) === 1) {
            ok++;
        }
    }

    return total === 0 ? 0 : Math.round((ok / total) * 100);
};


export const drawWatermark = (doc: jsPDF) => {
    doc.saveGraphicsState();

    doc.setTextColor(200, 200, 200);
    doc.setFontSize(50);

    (doc as any).setGState(
        new (doc as any).GState({
            opacity: 0.08,
        })
    );

    doc.text("InspectMyCar", 105, 150, {
        align: "center",
        angle: 45,
    });

    doc.restoreGraphicsState();
};
// ============================================================
// REPORT HEADER - USED FROM DETAILED PDI CHECKLIST ONWARDS
// ============================================================

const drawReportHeader = (
    doc: jsPDF,
    reportDate: string
) => {

    const pageWidth = 210;

    doc.setFillColor(2, 27, 58);
    doc.rect(6, 5, pageWidth - 12, 9, "F");

    doc.setDrawColor(255, 255, 255);
    doc.setLineWidth(0.15);
    doc.line(65, 5, 65, 14);
    doc.line(145, 5, 145, 14);

    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9.5);
    doc.text("InspectMyCar", 9, 11.8);

    doc.setFontSize(9);
    doc.text("CERTIFIED INSPECTION REPORT", 105, 11.8, { align: "center" });

    doc.setFontSize(7.5);
    doc.text(reportDate || "-", 201, 11.8, { align: "right" });

    doc.setFillColor(219, 153, 10);
    doc.rect(6, 15.5, pageWidth - 12, 0.8, "F");
};

const COLORS = {
    primary: [2, 27, 58] as const,
    secondary: [2, 27, 58] as const,
    light: [0, 0, 0] as const,
    accent: [59, 130, 246] as const,
    text: [2, 27, 58] as const,
    danger: [220, 38, 38] as const,
    white: [255, 255, 255] as const,
};


// ------------------ MAIN BUILDER ------------------

export const buildPDF = async ({
    doc,
    report,
    isCustomer = false,
    includeAISummary = false,
}: {
    doc: jsPDF;
    report: any;
    isCustomer?: boolean;
    includeAISummary?: boolean;
}) => {

    const meta = isCustomer ? report.meta : report;
    const reportId =
        report.reportId ||
        meta.reportId ||
        "";

    const shortReportId = String(reportId)
        .slice(0, 8)
        .toUpperCase();

    const inspectionNumber = reportId
        ? `INS-${shortReportId}-${String(
            new Date().getMonth() + 1
        ).padStart(2, "0")}-${new Date().getFullYear()}`
        : "-";
    // Build the report's vehicle description from the selected fuel and
    // transmission. Newer inspection forms save combined selections in
    // vehicleTypes; older reports may only have vehicleType.
    const rawVehicleTypes = meta.vehicleTypes ?? report.vehicleTypes;
    const selectedVehicleTypes: string[] = Array.isArray(rawVehicleTypes)
        ? rawVehicleTypes.map((value: unknown) => String(value).trim()).filter(Boolean)
        : typeof rawVehicleTypes === "string"
            ? rawVehicleTypes.split(/[,+]/).map((value: string) => value.trim()).filter(Boolean)
            : [];

    const legacyVehicleType = String(meta.vehicleType ?? report.vehicleType ?? "").trim();
    const allVehicleSelections = [...selectedVehicleTypes, ...legacyVehicleType.split(/[,+]/).map((value: string) => value.trim()).filter(Boolean)];
    const normalizedSelections = allVehicleSelections.map((value) => value.toLowerCase());
    const fuelType = ["petrol", "diesel", "cng"].find((fuel) => normalizedSelections.includes(fuel));
    const isAutomatic = normalizedSelections.some((value) => value === "automatic" || value.includes("automatic transmission"))
        || /\bautomatic\b/i.test(legacyVehicleType);
    const vehicleVariant = fuelType
        ? `${fuelType.charAt(0).toUpperCase()}${fuelType.slice(1)}${isAutomatic ? " (Automatic)" : ""}`
        : legacyVehicleType;
    const vehicleName = [meta.brand || "", meta.model || ""]
        .map((value: string) => String(value).trim())
        .filter(Boolean)
        .join(" ");
    const vehicleModelDisplay = `${vehicleName || "-"}${vehicleVariant ? ` - ${vehicleVariant}` : meta.variant ? ` ${meta.variant}` : ""}`;

    // Checklist results
    const results = report.checklistResults || {};

    // Overall score
    const score = calculateRange(results, 1, 399);


    // ============================================================
    // COVER
    // ============================================================

    const img = new Image();
    img.src = "/pdi-cover.jpg";

    await new Promise((res) => (img.onload = res));

    doc.addImage(
        img,
        "JPEG",
        0,
        0,
        210,
        297
    );

    drawWatermark(doc);


    // ============================================================
    // PAGE 2
    // ============================================================

    doc.addPage();

    drawWatermark(doc);


    // ============================================================
    // VEHICLE INFO
    // ============================================================

    autoTable(doc, {
        startY: 15,

        head: [
            ["Vehicle Inspection Report"],
        ],

        headStyles: {
            fillColor: [2, 27, 58],
            textColor: 255,
            fontStyle: "bold",
        },

        styles: {
            textColor: [220, 38, 38],
        },
    });


    autoTable(doc, {
        startY: 30,

        theme: "grid",

        styles: {
            fontSize: 10,
            cellPadding: 4,
        },

        columnStyles: {
            0: {
                fontStyle: "bold",
            },

            2: {
                fontStyle: "bold",
            },
        },

        body: [
            [
                "Customer Name",
                meta.name || "-",
                "Inspection Date",
                meta.date || "-",
            ],

            [
                "Contact No",
                meta.mobile || "-",
                "Inspector",
                meta.inspector ||
                meta.assignedTo ||
                "-",
            ],

            [
                "VIN",
                meta.vin || "-",
                "Odometer",
                meta.odometer || "-",
            ],

            [
                "Vehicle Model",

                vehicleModelDisplay,

                "Car Mfg",

                `${meta.month || ""} ${meta.year || ""
                    }`.trim() || "-",
            ],
        ],
    });


    // ============================================================
    // HEALTH CARDS
    // ============================================================

    const engine =
        calculateRange(results, 1, 107);

    const transmission =
        calculateRange(results, 108, 136);

    const body =
        calculateRange(results, 137, 294);

    const interior =
        calculateRange(results, 295, 349);

    const steeringBrakesSuspension =
        calculateRange(results, 350, 392);

    const wheelsTyres =
        calculateRange(results, 393, 399);


    let startY =
        (doc as any).lastAutoTable.finalY + 10;


    autoTable(doc, {
        startY: startY,

        head: [
            ["Overall Vehicle Health"],
        ],

        headStyles: {
            fillColor: [2, 27, 58],
            textColor: 255,
            fontStyle: "bold",
        },

        styles: {
            textColor: [220, 38, 38],
        },
    });


    const gridY = startY + 15;

    const containerX = 27;

    const containerY = gridY - 2;

    const containerWidth = 140;

    const containerHeight = 70;


    doc.setFillColor(...COLORS.light);

    doc.roundedRect(
        containerX,
        containerY,
        containerWidth,
        containerHeight,
        5,
        5,
        "F"
    );


    const cardWidth = 40;

    const cardHeight = 20;


    doc.setFillColor(
        255,
        255,
        255
    );

    doc.roundedRect(
        containerX,
        containerY,
        containerWidth,
        containerHeight,
        6,
        6,
        "F"
    );


    const drawCard = (
        x: number,
        y: number,
        score: number,
        label: string
    ) => {

        doc.setFillColor(
            255,
            255,
            255
        );

        doc.roundedRect(
            x,
            y,
            cardWidth,
            cardHeight,
            3,
            3,
            "F"
        );


        doc.setFontSize(9);

        doc.setTextColor(
            219,
            153,
            10
        );


        const maxWidth =
            cardWidth - 4;

        const lines =
            doc.splitTextToSize(
                label.toUpperCase(),
                maxWidth
            );


        const textY = y + 6;


        doc.text(
            lines,
            x + cardWidth / 2,
            textY,
            {
                align: "center",
                maxWidth,
            }
        );


        doc.setFontSize(11);

        doc.setTextColor(0);

        doc.text(
            `${score}%`,
            x + cardWidth / 2,
            y + cardHeight - 4,
            {
                align: "center",
            }
        );
    };


    const gapX = 45;

    const gapY = 22;

    const centerX =
        containerX +
        containerWidth / 2;

    const centerY =
        containerY +
        containerHeight / 2;


    // TOP ROW

    drawCard(
        centerX - gapX,
        gridY,
        engine,
        "Engine Assembly"
    );

    drawCard(
        centerX + gapX - cardWidth,
        gridY,
        transmission,
        "Transmission Assembly"
    );


    // MIDDLE ROW

    drawCard(
        centerX - gapX - 10,
        gridY + gapY,
        body,
        "Exterior Body"
    );

    drawCard(
        centerX + gapX - cardWidth + 10,
        gridY + gapY,
        interior,
        "Interior & Safety"
    );


    // BOTTOM ROW

    drawCard(
        centerX - gapX,
        gridY + gapY * 2,
        steeringBrakesSuspension,
        "Steering, Brakes & Suspension"
    );

    drawCard(
        centerX + gapX - cardWidth,
        gridY + gapY * 2,
        wheelsTyres,
        "Wheels & Tyres"
    );


    const badgeWidth = 28;

    const badgeHeight = 14;

    const badgeX =
        centerX -
        badgeWidth / 2;

    const badgeY =
        centerY -
        badgeHeight / 2;


    doc.setFillColor(
        ...COLORS.primary
    );

    doc.roundedRect(
        badgeX,
        badgeY,
        badgeWidth,
        badgeHeight,
        5,
        5,
        "F"
    );


    doc.setFontSize(8);

    doc.setTextColor(
        255,
        255,
        255
    );

    doc.text(
        "Overall Score",
        centerX,
        centerY - 2,
        {
            align: "center",
        }
    );


    doc.setFontSize(12);

    doc.text(
        `${score}%`,
        centerX,
        centerY + 4,
        {
            align: "center",
        }
    );


    const checklistComments =
        report?.checklistComments || {};

    const getRawChecklistValue = (id: string) => {
        return results?.[id];
    };

    const getChecklistValue = (id: string): number => {
        const raw = getRawChecklistValue(id);

        if (
            typeof raw === "object" &&
            raw !== null &&
            !Array.isArray(raw)
        ) {
            return Number(
                (raw as any).value ??
                (raw as any).status ??
                (raw as any).result ??
                1
            );
        }

        return Number(raw ?? 1);
    };

    const getChecklistRemark = (id: string, value: number) => {
        // Firebase stores the final finding/remark here.
        const savedRemark =
            checklistComments?.[id];

        if (
            savedRemark !== undefined &&
            savedRemark !== null &&
            String(savedRemark).trim()
        ) {
            return String(savedRemark).trim();
        }

        // Backward compatibility for older reports.
        const raw = getRawChecklistValue(id);

        const rawComment =
            typeof raw === "object" &&
                raw !== null
                ? (
                    (raw as any).comment ??
                    (raw as any).finding ??
                    (raw as any).remarks ??
                    (raw as any).remark ??
                    ""
                )
                : "";

        const comment =
            report?.comments?.[id] ||
            report?.meta?.comments?.[id] ||
            rawComment ||
            "";

        const cleanComment =
            String(comment ?? "").trim();

        if (value === 0) {
const normalizedComment = cleanComment
    .replace(/^ISSUE\s*-\s*/i, "")
    .trim();

return normalizedComment
    ? `ISSUE - ${normalizedComment}`
    : "ISSUE";
        }

        if (value === -1) {
            return "Not Applicable";
        }
const normalizedComment = cleanComment
    .replace(/^Condition Verified\s*-\s*Findings\s*-\s*/i, "")
    .replace(/^Condition Verified\s*-\s*/i, "")
    .trim();

return normalizedComment
    ? `Condition Verified - Findings - ${normalizedComment}`
    : "Condition Verified";
    };


    const getTyreConditionForPDF = (depthValue: string | number): string => {
        const depth = Number(depthValue);

        if (!Number.isFinite(depth) || depth <= 0) return "No Tread";
        if (depth >= 6.5) return "Excellent";
        if (depth >= 5.5) return "Good";
        if (depth >= 4.5) return "Average";
        if (depth >= 3.5) return "Fair";
        if (depth >= 2.5) return "Poor";
        if (depth >= 1.0) return "Critical";
        return "Unsafe";
    };

    // ============================================================
    // ISSUES SUMMARY
    // ============================================================

    const issues: any[] = [];


    checklist.forEach((section) => {

        section.items.forEach(
            (item: any, index: number) => {

                const id =
                    typeof item === "object" &&
                        item.label
                        ? item.label
                        : String(
                            section.startNo +
                            index
                        );


                const text =
                    typeof item === "object"
                        ? item.text
                        : item;


                // Do not include tyre data
                // in normal issues summary
                if (
                    typeof item === "object" &&
                    item.type === "TYRE"
                ) {
                    return;
                }


                const val =
                    getChecklistValue(id);


                if (val === 0) {
                    const savedRemark =
                        report?.checklistComments?.[id] ||
                        getChecklistRemark(id, val);

                    const cleanRemark =
                        String(savedRemark || "")
                            .replace(/^ISSUE\s*-\s*/i, "")
                            .trim();

                    issues.push([
                        cleanRemark
                            ? `${text} - ${cleanRemark}`
                            : text,
                    ]);
                }
            }
        );
    });

    if (issues.length > 0) {
        autoTable(doc, {
            startY: 200,

            head: [
                ["PDI Issues Summary"],
            ],

            body: issues,

            headStyles: {
                fillColor: [2, 27, 58],
                textColor: 255,
                fontStyle: "bold",
            },

            styles: {
                textColor: [127, 29, 29], // DARK RED
                fontStyle: "bold",
            },

            didDrawPage: () => {
                drawWatermark(doc);
            },
        });
    }

    // ============================================================
    // INSPECTOR OBSERVATIONS
    // ============================================================

    const inspectorComments =
        report.inspectorComments ||
        report.meta?.inspectorComments ||
        [];

    // Convert pasted checkpoint comments into a consistent, readable form.
    // Examples:
    //   "Fuel Tank: Check for leaks - 97" -> "97 Fuel Tank: Check for leaks"
    //   "Transmission Gaskets & Seals: Check for leaks - 111 Transmission Gaskets & Seals: Check for leaks"
    //      -> "111 Transmission Gaskets & Seals: Check for leaks"
    // Exact checkpoint names without a number are matched to the original checklist.
    const checkpointLookup: Array<{ id: string; text: string }> = [];
    checklist.forEach((section: any) => {
        section.items.forEach((item: any, index: number) => {
            const id = typeof item === "object" && item.label
                ? String(item.label)
                : String(section.startNo + index);
            const text = String(typeof item === "object" ? item.text : item).trim();
            if (text) checkpointLookup.push({ id, text });
        });
    });

    const normalizeInspectorComment = (value: unknown): string => {
        const raw = String(value ?? "").trim();
        if (!raw) return "";

        // Keep the serial number and checkpoint name together, even if the
        // pasted comment contains a newline immediately after the number.
        if (/^\d{1,4}(?:\s|[.)-])/.test(raw)) {
            return raw.replace(/^(\d{1,4})\s+/, "$1\u00A0");
        }

        // Match the longest checkpoint text first, so similar names don't collide.
        const matches = checkpointLookup
            .filter(({ text }) => raw.toLowerCase().startsWith(text.toLowerCase()))
            .sort((a, b) => b.text.length - a.text.length);

        if (!matches.length) return raw;

        const checkpoint = matches[0];
        const remainder = raw.slice(checkpoint.text.length).trim();
        const numberMatch = remainder.match(/^-\s*(\d{1,4})(?:\s+(.*))?$/);

        if (numberMatch) {
            const serial = numberMatch[1];
            const trailingText = (numberMatch[2] || "").trim();
            // If the pasted text repeats the checkpoint after its number, drop the duplicate.
            const duplicateCheckpoint = trailingText.toLowerCase() === checkpoint.text.toLowerCase();
            const extra = trailingText && !duplicateCheckpoint ? ` - ${trailingText}` : "";
            return `${serial}\u00A0${checkpoint.text}${extra}`;
        }

        const id = checkpoint.id;
        return `${id}\u00A0${checkpoint.text}${remainder ? ` ${remainder}` : ""}`;
    };

    if (
        inspectorComments.length > 0
    ) {

        autoTable(doc, {

            startY:
                issues.length > 0 && (doc as any).lastAutoTable
                    ? (doc as any).lastAutoTable.finalY + 10
                    : 200,

            head: [
                ["Inspector Recommendations"],
            ],

            body:
                inspectorComments
                    .map((comment: string) => normalizeInspectorComment(comment))
                    .filter(Boolean)
                    .map((comment: string) => [comment]),

            headStyles: {
                fillColor: [2, 27, 58],
                textColor: 255,
                fontStyle: "bold",
            },

            styles: {
                fontSize: 10,
                cellPadding: 4,
                valign: "middle",
            },

            didDrawPage: () => {
                drawWatermark(doc);
            },
        });
    }

    // ============================================================
    // ADMIN AI EXECUTIVE SUMMARY
    // ============================================================
    // Included only for the Admin "Preview AI Report" flow.
    // Always starts on a fresh page.
    // ============================================================

    let aiSummaryEndY: number | null = null;

    if (includeAISummary && report?.aiGeneratedSummary) {
        const ai = report.aiGeneratedSummary;

        const summarySections = [
            {
                label: "OVERALL CONDITION",
                value: String(ai.overallCondition || "-").trim() || "-",
            },
            {
                label: "KEY HIGHLIGHTS",
                value: String(ai.keyHighlights || "-").trim() || "-",
            },
            {
                label: "CRITICAL ISSUES",
                value: String(ai.criticalIssues || "-").trim() || "-",
            },
            {
                label: "RECOMMENDATIONS",
                value: String(ai.recommendations || "-").trim() || "-",
            },
            {
                label: "VERDICT",
                value: String(ai.verdict || "-").trim() || "-",
            },
        ];

        // ============================================================
        // ALWAYS START AI SUMMARY ON A NEW PAGE
        // ============================================================

        doc.addPage();

        drawReportHeader(doc, inspectionNumber);
        drawWatermark(doc);

        const pageWidth = 210;
        const marginX = 14;

        const cardX = marginX;
        const cardWidth = pageWidth - marginX * 2;

        const innerX = cardX + 8;
        const innerWidth = cardWidth - 16;

        // ============================================================
        // TITLE
        // ============================================================

        let summaryY = 25;

        doc.setFont("helvetica", "bold");
        doc.setFontSize(16);
        doc.setTextColor(...COLORS.primary);

        const title = "AI SUMMARY AND RECOMMENDATIONS";

        doc.text(
            title,
            marginX,
            summaryY
        );

        // ============================================================
        // POWERED BY + LOGO
        // ============================================================

        const titleWidth = doc.getTextWidth(title);

        const poweredText = "Powered by";

        doc.setFont("helvetica", "normal");
        doc.setFontSize(6);

        const poweredTextWidth =
            doc.getTextWidth(poweredText);

        const logo = new Image();
        logo.src = "/ai-logo.png";

        await new Promise<void>((resolve) => {
            logo.onload = () => resolve();
            logo.onerror = () => resolve();
        });

        const logoWidth = 15;
        const logoHeight = 5;

        const pillPaddingX = 3;
        const pillHeight = 7;

        const pillWidth =
            poweredTextWidth +
            logoWidth +
            3 +
            pillPaddingX * 2;

        const pillX =
            marginX +
            titleWidth +
            4;

        const pillY =
            summaryY - 6;

        // Powered-by oval
        doc.setDrawColor(...COLORS.primary);
        doc.setLineWidth(0.4);

        doc.roundedRect(
            pillX,
            pillY,
            pillWidth,
            pillHeight,
            pillHeight / 2,
            pillHeight / 2,
            "S"
        );

        // Powered by text
        doc.setTextColor(...COLORS.primary);

        doc.text(
            poweredText,
            pillX + pillPaddingX,
            pillY + 4.6
        );

        // AI logo
        if (
            logo.complete &&
            logo.naturalWidth > 0
        ) {
            doc.addImage(
                logo,
                "PNG",
                pillX +
                pillPaddingX +
                poweredTextWidth +
                3,
                pillY + 1,
                logoWidth,
                logoHeight
            );
        }

        // ============================================================
        // TITLE DIVIDER
        // ============================================================

        doc.setFillColor(219, 153, 10);

        doc.rect(
            marginX,
            summaryY + 3,
            42,
            1.2,
            "F"
        );

        doc.setDrawColor(210, 218, 230);
        doc.setLineWidth(0.5);

        doc.line(
            marginX + 46,
            summaryY + 3.6,
            pageWidth - marginX,
            summaryY + 3.6
        );

        // Move below title
        summaryY += 13;

        // ============================================================
        // COMPACT CARD SETTINGS
        // ============================================================

        const cardPaddingTop = 6;
        const cardPaddingBottom = 6;

        const sectionGap = 3.5;

        const labelWidth = 42;

        const bodyX =
            innerX +
            labelWidth +
            3;

        const bodyWidth =
            innerWidth -
            labelWidth -
            3;

        // ============================================================
        // CALCULATE COMPACT CARD HEIGHT
        // ============================================================

        let calculatedHeight =
            cardPaddingTop +
            cardPaddingBottom;

        summarySections.forEach(
            (section) => {
                doc.setFont(
                    "helvetica",
                    "normal"
                );

                doc.setFontSize(9.5);

                const bodyLines =
                    doc.splitTextToSize(
                        section.value,
                        bodyWidth
                    );

                calculatedHeight +=
                    Math.max(
                        8,
                        bodyLines.length * 4.3
                    ) +
                    sectionGap;
            }
        );

        calculatedHeight -= sectionGap;

        // ============================================================
        // SUMMARY CARD
        // ============================================================

        doc.setFillColor(
            247,
            249,
            252
        );

        doc.setDrawColor(
            220,
            226,
            235
        );

        doc.setLineWidth(0.6);

        doc.roundedRect(
            cardX,
            summaryY,
            cardWidth,
            calculatedHeight,
            4,
            4,
            "FD"
        );

        // ============================================================
        // DRAW FIVE SUMMARY SECTIONS
        // ============================================================

        let sectionY =
            summaryY +
            cardPaddingTop +
            3;

        summarySections.forEach(
            (section, index) => {

                // Label
                doc.setFont(
                    "helvetica",
                    "bold"
                );

                doc.setFontSize(9.5);

                doc.setTextColor(
                    ...COLORS.primary
                );

                const labelLines =
                    doc.splitTextToSize(
                        `${section.label}:`,
                        labelWidth
                    );

                doc.text(
                    labelLines,
                    innerX,
                    sectionY
                );

                // Body
                doc.setFont(
                    "helvetica",
                    "normal"
                );

                doc.setFontSize(9.5);

                doc.setTextColor(
                    31,
                    41,
                    55
                );

                const bodyLines =
                    doc.splitTextToSize(
                        section.value,
                        bodyWidth
                    );

                doc.text(
                    bodyLines,
                    bodyX,
                    sectionY
                );

                const lineCount =
                    Math.max(
                        labelLines.length,
                        bodyLines.length
                    );

                sectionY +=
                    Math.max(
                        8,
                        lineCount * 4.3
                    ) +
                    sectionGap;

                // Separator
                if (
                    index <
                    summarySections.length - 1
                ) {
                    doc.setDrawColor(
                        225,
                        229,
                        235
                    );

                    doc.setLineWidth(0.25);

                    doc.line(
                        innerX,
                        sectionY -
                        sectionGap / 2,
                        cardX +
                        cardWidth -
                        8,
                        sectionY -
                        sectionGap / 2
                    );
                }
            }
        );

        // ============================================================
        // SIGNATURE + SEAL
        // KEEP ON SAME PAGE
        // ============================================================

        aiSummaryEndY =
            summaryY +
            calculatedHeight;

        const signatureX = 142;
        const signatureWidth = 52;

        const signatureTitleY =
            aiSummaryEndY + 7;

        // Signature title
        doc.setFont(
            "helvetica",
            "bold"
        );

        doc.setFontSize(7.5);

        doc.setTextColor(
            ...COLORS.primary
        );

        doc.text(
            "AUTHORIZED INSPECTOR SIGNATURE",
            signatureX +
            signatureWidth / 2,
            signatureTitleY,
            {
                align: "center",
            }
        );

        // Signature line
        const signatureLineY =
            signatureTitleY + 7;

        doc.setDrawColor(
            ...COLORS.primary
        );

        doc.setLineWidth(0.5);

        doc.line(
            signatureX,
            signatureLineY,
            signatureX +
            signatureWidth,
            signatureLineY
        );

        // ============================================================
        // CERTIFIED SEAL
        // ============================================================

        const sealImage = new Image();

        sealImage.src =
            "/inspectmycar-certified-seal.png";

        await new Promise<void>(
            (resolve) => {
                sealImage.onload =
                    () => resolve();

                sealImage.onerror =
                    () => resolve();
            }
        );

        const sealSize = 30;

        const sealX =
            signatureX +
            signatureWidth / 2 -
            sealSize / 2;

        const sealY =
            signatureLineY + 4;

        if (
            sealImage.complete &&
            sealImage.naturalWidth > 0
        ) {
            doc.addImage(
                sealImage,
                "PNG",
                sealX,
                sealY,
                sealSize,
                sealSize
            );
        }

        // Final bottom position used by the next section
        aiSummaryEndY =
            Math.max(
                aiSummaryEndY,
                sealY +
                sealSize +
                6
            );

        drawWatermark(doc);
    }





    drawWatermark(doc);


    // ============================================================
    // PAGE 3 - FULL IMAGE
    // ============================================================

    doc.addPage();

    const secondPage = new Image();

    secondPage.src =
        "/car_photo_points.jpg";

    await new Promise(
        (res) =>
            (secondPage.onload = res)
    );


    doc.addImage(
        secondPage,
        "JPEG",
        0,
        0,
        210,
        297
    );

    drawWatermark(doc);


    // ============================================================
    // PAGE 4 - DETAILED CHECKLIST
    // ============================================================

    doc.addPage();

    drawReportHeader(
        doc,
        inspectionNumber
    );

    drawWatermark(doc);


    // ============================================================
    // BUILD SECTION-WISE DATA
    //
    // IMPORTANT:
    // Keep every checklist item in its ORIGINAL checklist order.
    // Do NOT collect ISSUE / PASSED / NA into separate arrays.
    //
    // Findings are read from checklistComments first because that is
    // the field saved to Firebase by the inspection form.
    // ============================================================

    type ChecklistPDFRow = {
        item: string;
        status: "ISSUE" | "PASSED" | "NA";
        remarks: string;
        isTyre?: boolean;
        tyreDetails?: string;
    };

    const allSections: {
        section: string;
        rows: ChecklistPDFRow[];
    }[] = [];

    checklist.forEach((section) => {
        const sectionRows: ChecklistPDFRow[] = [];

        section.items.forEach(
            (item: any, index: number) => {
                const id =
                    typeof item === "object" &&
                        item.label
                        ? item.label
                        : String(
                            section.startNo +
                            index
                        );

                const text =
                    typeof item === "object"
                        ? item.text
                        : item;

                // ====================================================
                // TYRE
                // ====================================================

                if (
                    typeof item === "object" &&
                    item.type === "TYRE"
                ) {
                    const tyre =
                        report?.tyreData?.[id];

                    const week =
                        tyre?.week || "-";

                    const year =
                        tyre?.year || "-";

                    const depth =
                        tyre?.depth || "-";

                    const manufacturer =
                        tyre?.manufacturer || "-";

                    const tyreCondition =
                        tyre?.condition ||
                        (depth !== "-" && depth !== ""
                            ? getTyreConditionForPDF(depth)
                            : "");

                    const tyreDetails =
                        `${week} / ${year}\n${depth} mm / ${manufacturer}`;

                    sectionRows.push({
                        item: text,
                        status: "PASSED",
                        remarks: tyreCondition ? `${tyreCondition} Condition` : "Condition Verified",
                        isTyre: true,
                        tyreDetails,
                    });

                    return;
                }

                // ====================================================
                // NORMAL CHECKLIST ITEM
                // ====================================================

                const val =
                    getChecklistValue(id);

                const remarks =
                    getChecklistRemark(id, val);

                // IMPORTANT:
                // Push directly into sectionRows so the original
                // checklist order is preserved. Do not group issues.
                if (val === 0) {
                    sectionRows.push({
                        item: text,
                        status: "ISSUE",
                        remarks,
                    });
                    return;
                }

                if (val === -1) {
                    sectionRows.push({
                        item: text,
                        status: "NA",
                        remarks: "Not Applicable",
                    });
                    return;
                }

                sectionRows.push({
                    item: text,
                    status: "PASSED",
                    remarks,
                });
            }
        );

        allSections.push({
            section: section.section,
            rows: sectionRows,
        });
    });

    // ============================================================
    // TITLE
    // ============================================================

    doc.setTextColor(0);

    doc.setFontSize(15);
    doc.setFont("helvetica", "bold");

    doc.text(
        "Detailed PDI Checklist",
        105,
        25.5,
        { align: "center" }
    );

    doc.setFontSize(8);
    doc.setTextColor(120);

    doc.text(
        "Checklist items remain in their original inspection order. NA checkpoints are not applicable for this vehicle variant.",
        14,
        31.5
    );


    // ============================================================
    // CREATE TABLE
    // ============================================================

    const tableData: any[] = [];

    allSections.forEach(
        (section) => {
            // ---------------- SECTION HEADER ----------------

            tableData.push([
                {
                    content: section.section,
                    colSpan: 3,
                    styles: {
                        fillColor: [
                            2,
                            27,
                            58,
                        ],
                        textColor: [
                            219,
                            153,
                            10,
                        ],
                        fontStyle: "bold",
                        fontSize: 9,
                        halign: "left",
                        cellPadding: 2,
                    },
                },
                "",
                "",
            ]);

            // IMPORTANT:
            // Rows are already in original checklist order.
            // Never move ISSUE rows to the top of the section.
            section.rows.forEach((row) => {
                if (row.isTyre) {
                    tableData.push([
                        row.item,
                        row.status,
                        {
                            content: row.tyreDetails
                                ? `${row.tyreDetails}\n${row.remarks}`
                                : row.remarks,
                            styles: {
                                fontStyle: "bold",
                                valign: "middle",
                            },
                        },
                    ]);
                } else {
                    tableData.push([
                        row.item,
                        row.status,
                        row.remarks,
                    ]);
                }
            });
        }
    );

    // ============================================================
    // PDF TABLE
    // ============================================================

    autoTable(doc, {

        startY: 36,

        head: [
            [
                "INSPECTION ITEM",
                "STATUS",
                "REMARKS / FINDINGS",
            ],
        ],

        body: tableData,

        margin: {
            left: 10,
            right: 10,
            top: 20,
            bottom: 10,
        },
        // --------------------------------------------------------
        // HEADER
        // --------------------------------------------------------

        headStyles: {
            fillColor: [
                2,
                27,
                58,
            ],

            textColor: 255,

            fontStyle:
                "bold",

            fontSize: 10,

            halign:
                "center",

            valign:
                "middle",

            cellPadding: 2,
        },


        // --------------------------------------------------------
        // GENERAL
        // --------------------------------------------------------

        styles: {
            fontSize: 10,

            fontStyle:
                "bold",

            cellPadding: 2,

            valign:
                "middle",

            overflow:
                "linebreak",

            lineColor: [
                210,
                210,
                210,
            ],

            lineWidth: 0.2,
        },


        // --------------------------------------------------------
        // COLUMN WIDTHS
        // --------------------------------------------------------
        columnStyles: {

            // INSPECTION ITEM
            0: {
                cellWidth: 85,

                valign:
                    "middle",
            },

            // STATUS
            1: {
                cellWidth: 22,

                halign:
                    "center",

                valign:
                    "middle",
            },

            // REMARKS / FINDINGS
            2: {
                cellWidth: 83,

                valign:
                    "middle",
            },
        },


        // --------------------------------------------------------
        // CELL STYLING
        // --------------------------------------------------------

        didParseCell: function (
            data: any
        ) {

            if (
                data.section !==
                "body"
            ) {
                return;
            }


            // ====================================================
            // SECTION HEADER
            // ====================================================

            if (
                data.row.raw &&
                Array.isArray(
                    data.row.raw
                ) &&
                data.row.raw[0] &&
                typeof data.row.raw[0] ===
                "object" &&
                data.row.raw[0]
                    .colSpan === 3
            ) {

                data.cell.styles.fillColor =
                    [
                        2,
                        27,
                        58,
                    ];

                data.cell.styles.textColor =
                    [
                        219,
                        153,
                        10,
                    ];

                data.cell.styles.fontStyle =
                    "bold";

                return;
            }


            // ====================================================
            // STATUS COLUMN
            // ====================================================

            if (
                data.column.index ===
                1
            ) {

                const value =
                    String(
                        data.cell.raw ||
                        ""
                    ).trim();


                if (
                    value ===
                    "ISSUE"
                ) {

                    data.cell.styles.textColor =
                        [
                            220,
                            38,
                            38,
                        ];

                    data.cell.styles.fontStyle =
                        "bold";
                }


                else if (
                    value ===
                    "PASSED"
                ) {

                    data.cell.styles.textColor =
                        [
                            45,
                            157,
                            16,
                        ];

                    data.cell.styles.fontStyle =
                        "bold";
                }


                else if (
                    value ===
                    "NA"
                ) {

                    data.cell.styles.textColor =
                        [
                            120,
                            120,
                            120,
                        ];

                    data.cell.styles.fontStyle =
                        "italic";
                }
            }


            // ====================================================
            // REMARKS / FINDINGS
            // ====================================================

            if (
                data.column.index ===
                2
            ) {

                const value =
                    String(
                        typeof data.cell
                            .raw ===
                            "object"
                            ? data.cell
                                .raw
                                ?.content ||
                            ""
                            : data.cell.raw ||
                            ""
                    );


                if (
                    value.startsWith(
                        "ISSUE"
                    )
                ) {

                    data.cell.styles.textColor =
                        [
                            220,
                            38,
                            38,
                        ];

                    data.cell.styles.fontStyle =
                        "bold";
                }


                else if (
                    value.includes(
                        "Condition Verified"
                    )
                ) {

                    data.cell.styles.textColor =
                        [
            21,
            3,
            69,
                        ];

                    data.cell.styles.fontStyle =
                        "bold";
                }
            }
        },


        // --------------------------------------------------------
        // PAGE DRAW
        // --------------------------------------------------------

        willDrawPage: () => {

            drawReportHeader(
                doc,
                inspectionNumber
            );

            drawWatermark(doc);
        },

    });
    // ============================================================
    // PAGE - TYRE CONDITION MAP
    // ============================================================
    // Dynamic tyre condition page.
    // A = LHS FRONT
    // B = RHS FRONT
    // C = LHS REAR
    // D = RHS REAR
    // E = SPARE
    // ============================================================

    doc.addPage();

    drawReportHeader(
        doc,
        inspectionNumber
    );
    drawWatermark(doc);

    const tyreMap =
        report?.tyreData || {};


    // ============================================================
    // TYRE CONDITION
    // ============================================================

    const tyreConditionForMap = (
        depthValue: string | number
    ) => {

        const depth =
            Number(depthValue);

        if (
            !Number.isFinite(depth) ||
            depth <= 0
        ) {
            return "No Tread";
        }

        if (depth >= 6.5) {
            return "Excellent";
        }

        if (depth >= 5.5) {
            return "Good";
        }

        if (depth >= 4.5) {
            return "Average";
        }

        if (depth >= 3.5) {
            return "Fair";
        }

        if (depth >= 2.5) {
            return "Poor";
        }

        if (depth >= 1.0) {
            return "Critical";
        }

        return "Unsafe";
    };


    // ============================================================
    // CONDITION COLORS
    // ============================================================

    const tyreConditionColor = (
        condition: string
    ): [number, number, number] => {

        switch (condition) {

            case "Excellent":
                return [16, 185, 129];

            case "Good":
                return [34, 197, 94];

            case "Average":
                return [234, 179, 8];

            case "Fair":
                return [249, 115, 22];

            case "Poor":
                return [239, 68, 68];

            case "Critical":
                return [220, 38, 38];

            case "Unsafe":
            case "No Tread":
                return [127, 29, 29];

            default:
                return [100, 116, 139];
        }
    };


    // ============================================================
    // TYRE POSITIONS
    // ============================================================

    const tyreMapItems = [

        {
            id: "A",
            title: "LHS FRONT TYRE",
            x: 8,
            y: 38,
            targetX: 58,
            targetY: 72,
        },

        {
            id: "B",
            title: "RHS FRONT TYRE",
            x: 148,
            y: 38,
            targetX: 152,
            targetY: 72,
        },

        {
            id: "C",
            title: "LHS REAR TYRE",
            x: 8,
            y: 112,
            targetX: 58,
            targetY: 125,
        },

        {
            id: "D",
            title: "RHS REAR TYRE",
            x: 148,
            y: 112,
            targetX: 152,
            targetY: 125,
        },

        {
            id: "E",
            title: "SPARE TYRE",
            x: 78,
            y: 163,
            targetX: 105,
            targetY: 145,
            noConnector: true,
        },

    ];


    // ============================================================
    // TITLE
    // ============================================================

    doc.setFillColor(2, 27, 58);
    const stripWidth = 190;
    const stripX = (210 - stripWidth) / 2;

    doc.rect(stripX, 19, stripWidth, 9, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(15);

    doc.text(
        "TYRE CONDITION REPORT",
        105,
        25.5,
        { align: "center" }
    );

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);

    doc.text(
        "Tyre condition is interpreted automatically from the recorded tread depth.",
        105,
        31.5,
        { align: "center" }
    );


    // ============================================================
    // STATIC CENTRE VEHICLE IMAGE
    // ============================================================

    const tyreMapImage =
        new Image();

    tyreMapImage.src =
        "/car_tyres.jpg";

    await new Promise<void>(
        resolve => {

            tyreMapImage.onload =
                () => resolve();

            tyreMapImage.onerror =
                () => resolve();

        }
    );


    // Centre vehicle diagram

    doc.addImage(
        tyreMapImage,
        "JPEG",
        53,
        48,
        104,
        125
    );


    // ============================================================
    // DRAW TYRE CARD
    // ============================================================

    const drawTyreCard = (
        item: typeof tyreMapItems[number]
    ) => {

        const tyre =
            tyreMap?.[item.id] || {};

        const depth =
            tyre?.depth || "";

        const condition =
            tyre?.condition ||
            (
                depth
                    ? tyreConditionForMap(
                        depth
                    )
                    : "No Tread"
            );

        const conditionColor =
            tyreConditionColor(
                condition
            );

        const week =
            tyre?.week || "-";

        const year =
            tyre?.year || "-";

        const manufacturer =
            tyre?.manufacturer || "-";

        const depthText =
            depth
                ? `${depth} mm`
                : "-";


        const cardW = 54;
        const cardH = 42;
        const headerH = 7;


        // ========================================================
        // CONNECTOR LINE
        // ========================================================

        if (!item.noConnector) {

            doc.setDrawColor(
                180,
                180,
                180
            );

            doc.setLineDashPattern(
                [1.5, 1.5],
                0
            );

            const lineStartX =
                item.x < 100
                    ? item.x + cardW
                    : item.x;

            const lineStartY =
                item.y +
                cardH / 2;

            doc.line(
                lineStartX,
                lineStartY,
                item.targetX,
                item.targetY
            );

            doc.setLineDashPattern(
                [],
                0
            );
        }

        // ========================================================
        // CARD
        // ========================================================

        doc.setFillColor(
            255,
            255,
            255
        );

        doc.setDrawColor(
            210,
            218,
            230
        );

        doc.roundedRect(
            item.x,
            item.y,
            cardW,
            cardH,
            2,
            2,
            "FD"
        );


        // ========================================================
        // CARD HEADER
        // ========================================================

        doc.setFillColor(
            ...COLORS.primary
        );

        doc.roundedRect(
            item.x,
            item.y,
            cardW,
            headerH,
            2,
            2,
            "F"
        );

        doc.rect(
            item.x,
            item.y + headerH - 2,
            cardW,
            2,
            "F"
        );


        doc.setTextColor(
            255,
            255,
            255
        );

        doc.setFont(
            "helvetica",
            "bold"
        );

        doc.setFontSize(6.5);

        doc.text(
            item.title,
            item.x + cardW / 2,
            item.y + 4.8,
            {
                align: "center",
            }
        );


        // ========================================================
        // CONDITION
        // ========================================================

        doc.setTextColor(
            ...conditionColor
        );

        doc.setFont(
            "helvetica",
            "bold"
        );

        doc.setFontSize(10);

        doc.text(
            condition.toUpperCase(),
            item.x + 2.5,
            item.y + 13
        );


        // ========================================================
        // DETAILS
        // ========================================================

        doc.setTextColor(
            71,
            85,
            105
        );

        doc.setFont(
            "helvetica",
            "normal"
        );

        doc.setFontSize(6.3);


        doc.text(
            `Remark: ${week}/${year} ${manufacturer}`,
            item.x + 2.5,
            item.y + 19
        );


        doc.text(
            `Depth: ${depthText}  |  Score: ${tyre?.score ?? 0}%`,
            item.x + 2.5,
            item.y + 25
        );


        doc.text(
            "Range: See tread condition legend below",
            item.x + 2.5,
            item.y + 31
        );


        doc.text(
            condition === "No Tread" ||
                condition === "Unsafe"
                ? "Action: Replacement recommended."
                : "Action: Drive normally.",
            item.x + 2.5,
            item.y + 37
        );
    };


    // ============================================================
    // DRAW ALL 5 TYRES
    // ============================================================

    tyreMapItems.forEach(
        drawTyreCard
    );


    // ============================================================
    // TREAD RANGE / CONDITION / KM LEGEND
    // ============================================================

    const legendStartY = 215;

    doc.setTextColor(
        ...COLORS.primary
    );

    doc.setFont(
        "helvetica",
        "bold"
    );

    doc.setFontSize(10);

    doc.text(
        "TREAD RANGE, CONDITION & ESTIMATED KM",
        105,
        legendStartY,
        {
            align: "center",
        }
    );

    autoTable(
        doc,
        {
            startY: legendStartY + 3.5,

            margin: {
                left: 30,
                right: 30,
                bottom: 8,
            },

            head: [
                [
                    "TREAD DEPTH",
                    "CONDITION",
                    "KM RANGE",
                    "SCORE",
                ],
            ],

            body: [
                [
                    "6.5 mm and above",
                    "Excellent",
                    "40,000 - 50,000 km",
                    "100%",
                ],
                [
                    "5.5 - 6.49 mm",
                    "Good",
                    "30,000 - 40,000 km",
                    "80%",
                ],
                [
                    "4.5 - 5.49 mm",
                    "Average",
                    "20,000 - 30,000 km",
                    "60%",
                ],
                [
                    "3.5 - 4.49 mm",
                    "Fair",
                    "10,000 - 20,000 km",
                    "40%",
                ],
                [
                    "2.5 - 3.49 mm",
                    "Poor",
                    "5,000 - 10,000 km",
                    "20%",
                ],
                [
                    "1.0 - 2.49 mm",
                    "Critical",
                    "0 - 5,000 km",
                    "10%",
                ],
                [
                    "Below 1.0 mm",
                    "Unsafe",
                    "0 km",
                    "0%",
                ],
                [
                    "0 / invalid",
                    "No Tread",
                    "0 km",
                    "0%",
                ],
            ],

            theme: "grid",

            styles: {
                fontSize: 6.5,
                cellPadding: 1.2,
                minCellHeight: 5.2,
                valign: "middle",
                halign: "center",
                overflow: "linebreak",
            },

            headStyles: {
                fillColor: [
                    2,
                    27,
                    58,
                ],

                textColor: 255,

                fontStyle: "bold",

                fontSize: 6.5,

                cellPadding: 1.4,
            },

            columnStyles: {
                0: {
                    cellWidth: 43,
                },

                1: {
                    cellWidth: 32,
                },

                2: {
                    cellWidth: 50,
                },

                3: {
                    cellWidth: 20,
                },
            },

            didParseCell:
                (data: any) => {

                    if (
                        data.section !== "body" ||
                        data.column.index !== 1
                    ) {
                        return;
                    }

                    const condition =
                        String(
                            data.cell.raw || ""
                        );

                    data.cell.styles.textColor =
                        tyreConditionColor(
                            condition
                        );

                    data.cell.styles.fontStyle =
                        "bold";
                },

            didDrawPage:
                () => {
                    drawWatermark(doc);
                },
        }
    );

    
// ============================================================
// LAST PAGE - NEW CAR DELIVERY / PDI CHECKLIST
// COMPACT SINGLE A4 PAGE - TWO COLUMNS
// ============================================================

doc.addPage();

drawReportHeader(
    doc,
    inspectionNumber
);

drawWatermark(doc);

const pageWidth = 210;
const pageHeight = 297;

const marginX = 15;
const columnGap = 4;

const columnWidth =
    (pageWidth - marginX * 2 - columnGap) / 2;

const leftX = marginX;

const rightX =
    marginX + columnWidth + columnGap;

// ============================================================
// PAGE LAYOUT
// ============================================================

const topY = 36;
const bottomY = 290;

// ============================================================
// COLORS
// ============================================================

const NAVY = [2, 27, 58] as const;
const LIGHT_BLUE = [226, 236, 248] as const;
const BORDER = [215, 225, 238] as const;
const YELLOW = [255, 193, 7] as const;
const TEXT = [55, 55, 55] as const;
const HEADING = [28, 51, 105] as const;

// ============================================================
// PAGE TITLE
// ============================================================

doc.setTextColor(...NAVY);

doc.setFont(
    "helvetica",
    "bold"
);

doc.setFontSize(15);

doc.text(
    "Pre-Delivery Checkup Guidelines for Customer",
    pageWidth / 2,
    26,
    {
        align: "center",
    }
);

// Small gold underline below title
doc.setDrawColor(...YELLOW);

doc.setLineWidth(0.7);

doc.line(
    55,
    29,
    155,
    29
);

// ============================================================
// COMPACT JUSTIFIED TEXT
// ============================================================

const drawCompactText = (
    text: string,
    x: number,
    y: number,
    width: number
): number => {

    const fontSize = 6.1;
    const lineHeight = 3.05;

    doc.setFont(
        "helvetica",
        "normal"
    );

    doc.setFontSize(fontSize);

    doc.setTextColor(...TEXT);

    const words = text.split(/\s+/);

    const lines: string[] = [];

    let currentLine = "";

    words.forEach((word) => {

        const testLine = currentLine
            ? `${currentLine} ${word}`
            : word;

        if (
            !currentLine ||
            doc.getTextWidth(testLine) <= width
        ) {

            currentLine = testLine;

        } else {

            lines.push(currentLine);

            currentLine = word;
        }
    });

    if (currentLine) {
        lines.push(currentLine);
    }

    lines.forEach(
        (line, index) => {

            const isLastLine =
                index ===
                lines.length - 1;

            if (
                isLastLine ||
                !line.includes(" ")
            ) {

                doc.text(
                    line,
                    x,
                    y + index * lineHeight
                );

                return;
            }

            const wordsInLine =
                line.split(" ");

            const wordsWidth =
                wordsInLine.reduce(
                    (total, word) =>
                        total +
                        doc.getTextWidth(
                            word
                        ),
                    0
                );

            const spacing =
                (width - wordsWidth) /
                (wordsInLine.length - 1);

            let cursorX = x;

            wordsInLine.forEach(
                (word) => {

                    doc.text(
                        word,
                        cursorX,
                        y +
                        index *
                        lineHeight
                    );

                    cursorX +=
                        doc.getTextWidth(
                            word
                        ) +
                        spacing;
                }
            );
        }
    );

    return (
        y +
        lines.length * lineHeight
    );
};

// ============================================================
// DRAW MAIN SECTION HEADING
// ============================================================

const drawSectionHeader = (
    section: (typeof newCarChecklist)[number],
    x: number,
    y: number
): number => {

    const headerHeight = 7;

    // Header background
    doc.setFillColor(
        ...NAVY
    );

    doc.roundedRect(
        x,
        y,
        columnWidth,
        headerHeight,
        1.5,
        1.5,
        "F"
    );

    // Section title
    doc.setFont(
        "helvetica",
        "bold"
    );

    doc.setFontSize(7.2);

    doc.setTextColor(
        255,
        255,
        255
    );

    doc.text(
        section.title.trim(),
        x + 3,
        y + 4.8
    );

    return y + headerHeight;
};

// ============================================================
// DRAW ONE COMPACT SECTION
// ============================================================

const drawCompactSection = (
    section: (typeof newCarChecklist)[number],
    x: number,
    y: number
): number => {

    const headerBottom =
        drawSectionHeader(
            section,
            x,
            y
        );

    let currentY =
        headerBottom + 3;

    const textX = x + 3;

    const textWidth =
        columnWidth - 6;

    // --------------------------------------------------------
    // SUBTITLE
    // --------------------------------------------------------

    if (section.subtitle) {

        doc.setFont(
            "helvetica",
            "bold"
        );

        doc.setFontSize(6.2);

        doc.setTextColor(
            100,
            116,
            139
        );

        doc.text(
            section.subtitle,
            textX,
            currentY
        );

        currentY += 3.5;
    }

    // --------------------------------------------------------
    // CHECKLIST POINTS
    // --------------------------------------------------------

    section.items.forEach(
        (item, index) => {

            // ------------------------------------------------
            // POINT TITLE
            // ------------------------------------------------

            doc.setFont(
                "helvetica",
                "bold"
            );

            doc.setFontSize(6.1);

            doc.setTextColor(
                ...HEADING
            );

            doc.text(
                item.title.trim(),
                textX,
                currentY
            );

            currentY += 2.8;

            // ------------------------------------------------
            // FULLY JUSTIFIED DESCRIPTION
            // ------------------------------------------------

            currentY =
                drawCompactText(
                    item.description.trim(),
                    textX,
                    currentY,
                    textWidth
                );

            // Small gap after paragraph
            currentY += 1.2;

            // ------------------------------------------------
            // DIVIDER
            // ------------------------------------------------

            if (
                index <
                section.items.length - 1
            ) {

                doc.setDrawColor(
                    ...BORDER
                );

                doc.setLineWidth(
                    0.12
                );

                doc.line(
                    textX,
                    currentY,
                    x +
                    columnWidth -
                    3,
                    currentY
                );

                currentY += 1.2;
            }
        }
    );

    return currentY;
};

// ============================================================
// TWO COLUMN BALANCED LAYOUT
// ============================================================
//
// Keep sections together instead of splitting a section
// between columns.
//

const leftSections = [
    newCarChecklist[0],
    newCarChecklist[1],
    newCarChecklist[5],
].filter(Boolean);

const rightSections = [
    newCarChecklist[2],
    newCarChecklist[3],
    newCarChecklist[4],
].filter(Boolean);

// ============================================================
// LEFT COLUMN
// ============================================================

let leftY = topY;

leftSections.forEach(
    (section) => {

        leftY =
            drawCompactSection(
                section,
                leftX,
                leftY
            );

        leftY += 3;
    }
);

// ============================================================
// RIGHT COLUMN
// ============================================================

let rightY = topY;

rightSections.forEach(
    (section) => {

        rightY =
            drawCompactSection(
                section,
                rightX,
                rightY
            );

        rightY += 3;
    }
);

// ============================================================
// FINAL WATERMARK
// ============================================================

drawWatermark(doc);


};
