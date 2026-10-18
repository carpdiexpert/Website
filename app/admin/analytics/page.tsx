"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  type User,
} from "firebase/auth";
import { auth } from "@/lib/firebase";
import AdminAppShell from "../AdminAppShell";

type Booking = {
  id: string;
  name?: string;
  customerName?: string;
  city?: string;
  carBrand?: string;
  carModel?: string;
  date?: string;
  time?: string;
  slot?: string;
  status?: string;
  amount?: number | string;
  totalAmount?: number | string;
  price?: number | string;
  invoiceAmount?: number | string;
  inspectorId?: string;
  inspectorName?: string;
  [key: string]: unknown;
};

type Inspector = { id: string; name?: string; email?: string; status?: string; city?: string };
type Aggregate = { label: string; bookings: number; revenue: number };
type Rank = { label: string; bookings: number; revenue: number };

const inputClass = "w-full rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm text-slate-900 outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100";
const buttonClass = "rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:opacity-50";
const panelClass = "rounded-2xl border border-slate-200 bg-white p-5 shadow-sm";

function pad(value: number) { return String(value).padStart(2, "0"); }
function dateString(date: Date) { return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`; }
function monthStart(date: Date) { return dateString(new Date(date.getFullYear(), date.getMonth(), 1)); }
function monthEnd(date: Date) { return dateString(new Date(date.getFullYear(), date.getMonth() + 1, 0)); }
function amountOf(booking: Booking) {
  const raw = booking.invoiceAmount ?? booking.amount ?? booking.totalAmount ?? booking.price;
  const value = typeof raw === "string" ? Number(raw.replace(/[₹,\s]/g, "")) : Number(raw);
  return Number.isFinite(value) && value >= 0 ? value : 0;
}
function bookingDate(booking: Booking) { return typeof booking.date === "string" ? booking.date.slice(0, 10) : ""; }
function brand(booking: Booking) { return booking.carBrand?.trim() || "Unknown brand"; }
function model(booking: Booking) { return booking.carModel?.trim() || "Unknown model"; }
function inspector(booking: Booking) { return booking.inspectorName?.trim() || "Unassigned"; }
function money(value: number) { return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(value); }
function prettyMonth(key: string) { const [year, month] = key.split("-").map(Number); return new Date(year, month - 1, 1).toLocaleDateString("en-IN", { month: "long", year: "numeric" }); }
function monthKey(date: string) { return date ? date.slice(0, 7) : ""; }
function weekStart(dateValue: string) {
  if (!dateValue) return "";
  const date = new Date(`${dateValue}T12:00:00`);
  const day = (date.getDay() + 6) % 7;
  date.setDate(date.getDate() - day);
  return dateString(date);
}
function weekLabel(start: string) {
  if (!start) return "Unknown week";
  const end = new Date(`${start}T12:00:00`);
  end.setDate(end.getDate() + 6);
  return `${new Date(`${start}T12:00:00`).toLocaleDateString("en-IN", { day: "numeric", month: "short" })} – ${end.toLocaleDateString("en-IN", { day: "numeric", month: "short" })}`;
}
function aggregate(items: Booking[], keyFn: (booking: Booking) => string): Rank[] {
  const map = new Map<string, Rank>();
  for (const booking of items) {
    const label = keyFn(booking) || "Unknown";
    const row = map.get(label) || { label, bookings: 0, revenue: 0 };
    row.bookings += 1;
    row.revenue += amountOf(booking);
    map.set(label, row);
  }
  return [...map.values()].sort((a, b) => b.bookings - a.bookings || b.revenue - a.revenue || a.label.localeCompare(b.label));
}

export default function AnalyticsPage() {
  const [user, setUser] = useState<User | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [inspectors, setInspectors] = useState<Inspector[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [refreshedAt, setRefreshedAt] = useState("");
  const [todayKey, setTodayKey] = useState("");

  useEffect(() => {
    setTodayKey(dateString(new Date()));
    return onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setAuthReady(true);
    });
  }, []);

  const callApi = useCallback(async (currentUser: User, path: string) => {
    const token = await currentUser.getIdToken();
    const response = await fetch(path, { headers: { Authorization: `Bearer ${token}` }, cache: "no-store" });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(data.error || `Request failed (${response.status})`);
    return data;
  }, []);

  const loadAnalytics = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    setError("");
    try {
      const now = new Date();
      const from = dateString(new Date(now.getFullYear(), now.getMonth() - 2, 1));
      const to = dateString(new Date(now.getFullYear(), now.getMonth() + 1, 0));
      const params = new URLSearchParams({ start: from, end: to });
      const [bookingData, inspectorData] = await Promise.all([
        callApi(user, `/api/admin/bookings?${params.toString()}`),
        callApi(user, "/api/admin/inspectors"),
      ]);
      setBookings(Array.isArray(bookingData.bookings) ? bookingData.bookings : []);
      setInspectors(Array.isArray(inspectorData.inspectors) ? inspectorData.inspectors : []);
      setRefreshedAt(new Date().toLocaleString("en-IN"));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load analytics.");
      setBookings([]);
    } finally {
      setLoading(false);
    }
  }, [user, callApi]);

  useEffect(() => { if (user) void loadAnalytics(); }, [user, loadAnalytics]);

  async function login(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); setError("");
    try { await signInWithEmailAndPassword(auth, email.trim(), password); setPassword(""); }
    catch (err) { setError(err instanceof Error ? err.message : "Sign in failed."); }
  }

  const analytics = useMemo(() => {
    // Use a deterministic fallback during prerender; current date is set in useEffect.
    const now = todayKey ? new Date(`${todayKey}T12:00:00`) : new Date(2000, 0, 1);
    const monthKeys = [0, 1, 2].map((offset) => {
      const date = new Date(now.getFullYear(), now.getMonth() - offset, 1);
      return `${date.getFullYear()}-${pad(date.getMonth() + 1)}`;
    }).reverse();
    const lastThreeMonths = bookings.filter((booking) => monthKeys.includes(monthKey(bookingDate(booking))));
    const monthRows: Aggregate[] = monthKeys.map((key) => {
      const items = lastThreeMonths.filter((booking) => monthKey(bookingDate(booking)) === key);
      return { label: prettyMonth(key), bookings: items.length, revenue: items.reduce((sum, booking) => sum + amountOf(booking), 0) };
    });
    const currentMonthKey = monthKeys[monthKeys.length - 1];
    const currentMonthBookings = lastThreeMonths.filter((booking) => monthKey(bookingDate(booking)) === currentMonthKey);
    const currentMonthRevenue = currentMonthBookings.reduce((sum, booking) => sum + amountOf(booking), 0);
    const allRevenue = lastThreeMonths.reduce((sum, booking) => sum + amountOf(booking), 0);
    const weeks = new Map<string, Booking[]>();
    for (const booking of lastThreeMonths) {
      const key = weekStart(bookingDate(booking));
      if (!key) continue;
      weeks.set(key, [...(weeks.get(key) || []), booking]);
    }
    const weeklyRows = [...weeks.entries()].map(([key, items]) => ({
      label: weekLabel(key), bookings: items.length,
      revenue: items.reduce((sum, booking) => sum + amountOf(booking), 0),
      start: key,
      topInspector: aggregate(items, inspector)[0] || null,
    })).sort((a, b) => a.start.localeCompare(b.start));
    const currentWeekKey = weekStart(dateString(now));
    const thisWeek = lastThreeMonths.filter((booking) => weekStart(bookingDate(booking)) === currentWeekKey);
    const topWeekInspector = aggregate(thisWeek, inspector)[0] || null;
    const monthLeaders = monthKeys.map((key) => {
      const items = lastThreeMonths.filter((booking) => monthKey(bookingDate(booking)) === key);
      return { month: prettyMonth(key), leader: aggregate(items, inspector)[0] || null };
    }).reverse();
    const brandRows = aggregate(lastThreeMonths, (booking) => brand(booking));
    const modelRows = aggregate(lastThreeMonths, (booking) => `${brand(booking)} ${model(booking)}`);
    const inspectorRows = aggregate(lastThreeMonths, inspector);
    const statusRows = aggregate(lastThreeMonths, (booking) => (booking.status || "pending").toString().toLowerCase());
    const average = lastThreeMonths.length ? allRevenue / lastThreeMonths.length : 0;
    const activeInspectors = inspectors.filter((item) => (item.status || "active").toLowerCase() === "active").length;
    return { monthRows, currentMonthBookings, currentMonthRevenue, allRevenue, weeklyRows, topWeekInspector, monthLeaders, brandRows, modelRows, inspectorRows, statusRows, average, activeInspectors, total: lastThreeMonths.length };
  }, [bookings, inspectors, todayKey]);

  if (!authReady) return <div className="grid min-h-screen place-items-center bg-slate-50 text-slate-600">Loading analytics…</div>;

  if (!user) return <div className="grid min-h-screen place-items-center bg-slate-50 px-4 py-10"><form onSubmit={login} className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-8 shadow-xl"><div className="mb-2 text-sm font-semibold uppercase tracking-[0.2em] text-sky-600">CarPDIExpert</div><h1 className="text-2xl font-bold text-slate-950">Admin analytics</h1><p className="mt-2 text-sm text-slate-500">Sign in to view booking and performance reports.</p><div className="mt-6 space-y-4"><input className={inputClass} type="email" autoComplete="username" placeholder="Admin email" value={email} onChange={(e) => setEmail(e.target.value)} required/><input className={inputClass} type="password" autoComplete="current-password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required/><button className={`${buttonClass} w-full`} type="submit">Sign in</button>{error && <p className="text-sm text-red-600">{error}</p>}</div></form></div>;

  const maxMonthlyBookings = Math.max(1, ...analytics.monthRows.map((row) => row.bookings));
  const maxWeeklyBookings = Math.max(1, ...analytics.weeklyRows.map((row) => row.bookings));

  return <AdminAppShell email={user.email}>
    <div className="space-y-6 pb-10">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end"><div><p className="text-sm font-semibold uppercase tracking-[0.18em] text-sky-600">Business intelligence</p><h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-950">Analytics</h1><p className="mt-2 text-sm text-slate-500">Bookings, revenue, vehicle demand and inspector performance for the current and previous two months.</p></div><div className="flex items-center gap-3"><span className="text-xs text-slate-500">{refreshedAt ? `Updated ${refreshedAt}` : ""}</span><button className={buttonClass} onClick={() => void loadAnalytics()} disabled={loading}>{loading ? "Refreshing…" : "Refresh data"}</button></div></div>
      {error && <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Metric title="Bookings this month" value={analytics.currentMonthBookings.length.toLocaleString("en-IN")} note={analytics.monthRows[analytics.monthRows.length - 1]?.label || "Current month"} />
        <Metric title="Revenue this month" value={money(analytics.currentMonthRevenue)} note="Based on saved booking amount fields" />
        <Metric title="Bookings · last 3 months" value={analytics.total.toLocaleString("en-IN")} note="Current month and two previous months" />
        <Metric title="Active inspectors" value={analytics.activeInspectors.toLocaleString("en-IN")} note={`Average recorded amount per booking: ${money(analytics.average)}`} />
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <section className={panelClass}><SectionTitle title="Monthly revenue & bookings" subtitle="Compare the current month with the previous two months."/><div className="mt-5 space-y-5">{analytics.monthRows.map((row) => <div key={row.label}><div className="mb-2 flex items-center justify-between gap-4"><div><p className="font-semibold text-slate-800">{row.label}</p><p className="text-xs text-slate-500">{row.bookings} bookings</p></div><p className="font-bold tabular-nums text-slate-900">{money(row.revenue)}</p></div><div className="h-2.5 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full bg-sky-500" style={{ width: `${Math.max(row.revenue > 0 ? 3 : 0, analytics.monthRows.reduce((max, item) => Math.max(max, item.revenue), 0) ? row.revenue / Math.max(...analytics.monthRows.map((item) => item.revenue), 1) * 100 : 0)}%` }}/></div></div>)}{analytics.monthRows.every((row) => row.bookings === 0) && <Empty>No bookings found for this period.</Empty>}</div></section>
        <section className={panelClass}><SectionTitle title="Weekly booking trend" subtitle="Booking volume by Monday–Sunday week, across the selected three-month period."/><div className="mt-5 max-h-[340px] space-y-3 overflow-y-auto pr-1">{analytics.weeklyRows.slice(-12).map((row) => <div key={row.start} className="grid grid-cols-[100px_1fr_36px] items-center gap-3"><span className="text-xs text-slate-500">{row.label}</span><div className="h-3 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full bg-blue-600" style={{ width: `${row.bookings / maxWeeklyBookings * 100}%` }}/></div><span className="text-right text-sm font-semibold tabular-nums text-slate-800">{row.bookings}</span></div>)}{!analytics.weeklyRows.length && <Empty>No weekly data available yet.</Empty>}</div><div className="mt-5 rounded-xl bg-sky-50 p-4"><p className="text-xs font-semibold uppercase tracking-wide text-sky-700">Top performer this week</p><p className="mt-1 text-lg font-bold text-slate-950">{analytics.topWeekInspector?.label || "No assigned bookings"}</p><p className="text-sm text-slate-600">{analytics.topWeekInspector ? `${analytics.topWeekInspector.bookings} booking${analytics.topWeekInspector.bookings === 1 ? "" : "s"} this week` : "Assigned inspector data will appear here."}</p></div></section>
      </div>

      <section className={panelClass}><SectionTitle title="Top performer by month" subtitle="Inspector with the most bookings in each of the current three months."/><div className="mt-4 grid gap-3 md:grid-cols-3">{analytics.monthLeaders.map((item, index) => <div key={item.month} className="rounded-xl border border-slate-200 p-4"><p className="text-sm font-medium text-slate-500">{item.month}</p><div className="mt-3 flex items-start gap-3"><span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-sky-100 text-sm font-bold text-sky-700">{index + 1}</span><div><p className="font-bold text-slate-950">{item.leader?.label || "No performer yet"}</p><p className="mt-1 text-sm text-slate-500">{item.leader ? `${item.leader.bookings} bookings · ${money(item.leader.revenue)} recorded value` : "No assigned bookings this month"}</p></div></div></div>)}</div></section>

      <div className="grid gap-6 xl:grid-cols-2">
        <RankTable title="Bookings by brand" subtitle="Most requested car brands in the last three months." rows={analytics.brandRows.slice(0, 8)} />
        <RankTable title="Bookings by brand & model" subtitle="Most requested individual vehicles." rows={analytics.modelRows.slice(0, 8)} />
        <RankTable title="Top performing inspectors" subtitle="Ranked by assigned booking count; recorded amount shown as a secondary metric." rows={analytics.inspectorRows.filter((row) => row.label !== "Unassigned").slice(0, 8)} />
        <RankTable title="Booking status breakdown" subtitle="Current and previous two months." rows={analytics.statusRows} showRevenue={false} />
      </div>
      <p className="text-xs leading-5 text-slate-500">Revenue note: this dashboard sums saved <code>invoiceAmount</code>, <code>amount</code>, <code>totalAmount</code>, or <code>price</code> values when present. If your booking records do not store an amount, revenue appears as ₹0 until the amount is saved. Inspector rankings use the inspector name stored on each booking.</p>
    </div>
  </AdminAppShell>;
}

function Metric({ title, value, note }: { title: string; value: string; note: string }) {
  return <div className={panelClass}><p className="text-sm font-medium text-slate-500">{title}</p><p className="mt-3 text-3xl font-bold tracking-tight text-slate-950">{value}</p><p className="mt-2 text-xs leading-5 text-slate-500">{note}</p></div>;
}
function SectionTitle({ title, subtitle }: { title: string; subtitle: string }) {
  return <div><h2 className="text-lg font-bold text-slate-950">{title}</h2><p className="mt-1 text-sm text-slate-500">{subtitle}</p></div>;
}
function Empty({ children }: { children: React.ReactNode }) {
  return <p className="rounded-xl bg-slate-50 px-4 py-6 text-center text-sm text-slate-500">{children}</p>;
}
function RankTable({ title, subtitle, rows, showRevenue = true }: { title: string; subtitle: string; rows: Rank[]; showRevenue?: boolean }) {
  return <section className={panelClass}><SectionTitle title={title} subtitle={subtitle}/>{rows.length ? <div className="mt-4 overflow-x-auto"><table className="w-full text-left text-sm"><thead><tr className="border-b border-slate-100 text-xs uppercase tracking-wide text-slate-400"><th className="pb-3 pr-3 font-semibold">Name</th><th className="pb-3 pr-3 text-right font-semibold">Bookings</th>{showRevenue && <th className="pb-3 text-right font-semibold">Amount</th>}</tr></thead><tbody>{rows.map((row, index) => <tr key={row.label} className="border-b border-slate-50 last:border-0"><td className="py-3 pr-3"><span className="mr-2 inline-grid h-6 w-6 place-items-center rounded-lg bg-slate-100 text-xs font-bold text-slate-600">{index + 1}</span><span className="font-medium text-slate-800">{row.label}</span></td><td className="py-3 pr-3 text-right font-semibold tabular-nums text-slate-800">{row.bookings}</td>{showRevenue && <td className="py-3 text-right tabular-nums text-slate-600">{money(row.revenue)}</td>}</tr>)}</tbody></table></div> : <div className="mt-4"><Empty>No data available for this period.</Empty></div>}</section>;
}
