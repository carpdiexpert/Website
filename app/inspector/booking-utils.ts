"use client";

export type Booking = {
  id: string;
  address: string;
  location: string;
  city: string;
  date: string;
  slot: string;
  carBrand: string;
  carModel: string;
  inspectionLabel: string;
  inspectionType: string;
  name: string;
  mobile: string;
  price: number | null;
  status: string;
  inspectorId: string;
  inspectorName: string;
};

export type Timing = { label: "Immediate" | "Upcoming" | "Scheduled" | "Late" | "Completed" | "Cancelled"; detail: string; style: string };

export function appointmentDateTime(booking: Booking): Date | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(booking.date) || !/^\d{2}:\d{2}$/.test(booking.slot)) return null;
  const [year, month, day] = booking.date.split("-").map(Number);
  const [hour, minute] = booking.slot.split(":").map(Number);
  const date = new Date(year, month - 1, day, hour, minute, 0, 0);
  return Number.isNaN(date.getTime()) ? null : date;
}

export function getTiming(booking: Booking, now: number): Timing {
  const status = booking.status.trim().toLowerCase();
  if (["completed", "complete"].includes(status)) return { label: "Completed", detail: "PDI report submitted", style: "border-emerald-200 bg-emerald-50 text-emerald-700" };
  if (["cancelled", "canceled"].includes(status)) return { label: "Cancelled", detail: "Booking cancelled", style: "border-slate-200 bg-slate-100 text-slate-600" };
  const scheduled = appointmentDateTime(booking);
  if (!scheduled) return { label: "Scheduled", detail: "Appointment time not available", style: "border-slate-200 bg-slate-50 text-slate-600" };
  const deltaMinutes = (scheduled.getTime() - now) / 60000;
  if (deltaMinutes < 0) return { label: "Late", detail: `Appointment passed ${formatDistance(Math.abs(deltaMinutes))} ago`, style: "border-rose-200 bg-rose-50 text-rose-700" };
  if (deltaMinutes < 60) return { label: "Immediate", detail: deltaMinutes < 1 ? "Starting now" : `Starts in ${formatDistance(deltaMinutes)}`, style: "border-amber-200 bg-amber-50 text-amber-800" };
  if (deltaMinutes < 360) return { label: "Upcoming", detail: `Starts in ${formatDistance(deltaMinutes)}`, style: "border-sky-200 bg-sky-50 text-sky-700" };
  return { label: "Scheduled", detail: scheduled.toDateString() === new Date(now).toDateString() ? `Today at ${booking.slot}` : `${scheduled.toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" })} at ${booking.slot}`, style: "border-indigo-200 bg-indigo-50 text-indigo-700" };
}
function formatDistance(minutes: number): string {
  const rounded = Math.max(1, Math.round(minutes)); const hours = Math.floor(rounded / 60); const mins = rounded % 60;
  if (hours && mins) return `${hours}h ${mins}m`; if (hours) return `${hours}h`; return `${mins}m`;
}
export function formatDate(date: string): string {
  const parsed = /^\d{4}-\d{2}-\d{2}$/.test(date) ? new Date(`${date}T00:00:00`) : null;
  return parsed && !Number.isNaN(parsed.getTime()) ? parsed.toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short", year: "numeric" }) : date || "Date not set";
}
