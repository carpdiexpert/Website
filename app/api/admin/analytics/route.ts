import { NextResponse } from "next/server";
import { adminDb, requireAdmin } from "@/lib/firebase-admin";
function localDate() { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`; }
export async function GET(request: Request) {
  try {
    await requireAdmin(request);
    const db = adminDb();
    const today = localDate();
    const [allBookings, todayBookings, inspectors] = await Promise.all([
      db.collection("bookings").get(),
      db.collection("bookings").where("date", "==", today).get(),
      db.collection("inspectors").get(),
    ]);
    const statuses: Record<string, number> = {};
    const byCity: Record<string, number> = {};
    allBookings.docs.forEach(doc => {
      const d = doc.data();
      const status = typeof d.status === "string" ? d.status : "unknown";
      const city = typeof d.city === "string" ? d.city : "unknown";
      statuses[status] = (statuses[status] || 0) + 1;
      byCity[city] = (byCity[city] || 0) + 1;
    });
    const activeInspectors = inspectors.docs.filter(d => d.data().status === "active").length;
    return NextResponse.json({
      totalBookings: allBookings.size,
      todayBookings: todayBookings.size,
      activeInspectors,
      statusBreakdown: statuses,
      cityBreakdown: byCity,
      generatedAt: new Date().toISOString(),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not load analytics";
    const status = message.startsWith("Forbidden") ? 403 : message.startsWith("Unauthorized") ? 401 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
