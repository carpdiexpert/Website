
"use client";

import { useCallback, useEffect, useState } from "react";
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  type User,
} from "firebase/auth";
import AdminAppShell from "../AdminAppShell";
import { auth } from "@/lib/firebase";
import { CITY_OPTIONS } from "@/lib/cityOptions";
import { BOOKING_SLOTS } from "@/lib/slots";

type BlockType = "day" | "slot";

type Block = {
  id: string;
  citySlug: string;
  city: string;
  date: string;
  type: BlockType;
  slot?: string | null;
  reason?: string;
  createdAt?: unknown;
};

const inputClass =
  "w-full rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm text-slate-900 outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100";

function localDateString(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function displayDate(date: string) {
  const parsed = new Date(`${date}T12:00:00`);
  return parsed.toLocaleDateString("en-IN", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default function ManageSlotsPage() {
  const [user, setUser] = useState<User | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [citySlug, setCitySlug] = useState(CITY_OPTIONS[0]?.slug ?? "");
  const [date, setDate] = useState("");
  const [type, setType] = useState<BlockType>("slot");
  const [slot, setSlot] = useState<string>(BOOKING_SLOTS[0] ?? "");
  const [reason, setReason] = useState("Inspector unavailable");
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [filterCity, setFilterCity] = useState(CITY_OPTIONS[0]?.slug ?? "");
  const [filterDate, setFilterDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  useEffect(() => {
    return onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setAuthReady(true);
    });
  }, []);

  const callApi = useCallback(
    async (path: string, method = "GET", body?: unknown) => {
      if (!user) throw new Error("Please sign in as an administrator.");

      const token = await user.getIdToken();
      const response = await fetch(path, {
        method,
        headers: {
          Authorization: `Bearer ${token}`,
          ...(body ? { "Content-Type": "application/json" } : {}),
        },
        body: body ? JSON.stringify(body) : undefined,
        cache: "no-store",
      });

      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(data.error || `Request failed (${response.status}).`);
      }
      return data;
    },
    [user],
  );

  const loadBlocks = useCallback(async () => {
    if (!user) return;

    setLoading(true);
    setError("");

    try {
      const params = new URLSearchParams();
      if (filterCity) params.set("city", filterCity);
      if (filterDate) params.set("date", filterDate);

      const data = await callApi(`/api/admin/slots?${params.toString()}`);
      setBlocks(Array.isArray(data.blocks) ? data.blocks : []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load blocks.");
      setBlocks([]);
    } finally {
      setLoading(false);
    }
  }, [user, filterCity, filterDate, callApi]);

  useEffect(() => {
    if (user) void loadBlocks();
  }, [user, loadBlocks]);

  async function login(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    try {
      await signInWithEmailAndPassword(auth, email.trim(), password);
      setPassword("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sign in failed.");
    }
  }

  async function createBlock(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!citySlug || !date) {
      setError("Select a city and date.");
      return;
    }

    setBusy(true);
    setError("");
    setNotice("");

    try {
      await callApi("/api/admin/slots", "POST", {
        citySlug,
        date,
        type,
        slot: type === "slot" ? slot : "",
        reason,
      });

      setNotice(
        type === "day"
          ? `All booking slots blocked for ${citySlug} on ${displayDate(date)}.`
          : `${slot} blocked for ${citySlug} on ${displayDate(date)}.`,
      );
      await loadBlocks();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not create block.");
    } finally {
      setBusy(false);
    }
  }

  async function removeBlock(block: Block) {
    const description =
      block.type === "day"
        ? `all slots in ${block.city}`
        : `${block.slot} in ${block.city}`;

    if (!window.confirm(`Remove the block for ${description} on ${block.date}?`)) {
      return;
    }

    setBusy(true);
    setError("");
    setNotice("");

    try {
      await callApi("/api/admin/slots", "DELETE", { id: block.id });
      setNotice("Block removed. Availability can be recalculated.");
      await loadBlocks();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not remove block.");
    } finally {
      setBusy(false);
    }
  }

  if (!authReady) {
    return <div className="p-8 text-sm text-slate-500">Checking admin session…</div>;
  }

  if (!user) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-100 p-4">
        <form onSubmit={login} className="w-full max-w-md rounded-3xl bg-white p-8 shadow-xl">
          <h1 className="text-2xl font-black text-slate-900">Admin sign in</h1>
          <p className="mt-2 text-sm text-slate-500">Sign in to manage blocked booking slots.</p>
          {error && <p className="mt-4 rounded-xl bg-rose-50 p-3 text-sm text-rose-700">{error}</p>}
          <label className="mt-5 block text-sm font-semibold">Email</label>
          <input className={`${inputClass} mt-2`} type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          <label className="mt-4 block text-sm font-semibold">Password</label>
          <input className={`${inputClass} mt-2`} type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          <button className="mt-6 w-full rounded-xl bg-blue-600 px-4 py-3 font-bold text-white hover:bg-blue-700">Sign in</button>
        </form>
      </main>
    );
  }

  return (
    <AdminAppShell email={user.email}>
      <div className="space-y-6">
        <div>
          <p className="text-xs font-bold uppercase tracking-[.18em] text-sky-600">Operations</p>
          <h1 className="mt-2 text-3xl font-black text-slate-900">Manage blocked slots</h1>
          <p className="mt-2 text-sm text-slate-600">
            Block a city for an entire day or close a specific time because of inspector unavailability or an emergency.
          </p>
        </div>

        {error && <div role="alert" className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">{error}</div>}
        {notice && <div role="status" className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">{notice}</div>}

        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
          <h2 className="text-lg font-bold text-slate-900">Create a block</h2>
          <form onSubmit={createBlock} className="mt-5 grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-semibold">City</label>
              <select className={inputClass} value={citySlug} onChange={(e) => setCitySlug(e.target.value)} required>
                {CITY_OPTIONS.map((city) => <option key={city.slug} value={city.slug}>{city.name}</option>)}
              </select>
            </div>
            <div>
              <label className="mb-2 block text-sm font-semibold">Date</label>
              <input className={inputClass} type="date" min={localDateString(new Date())} value={date} onChange={(e) => setDate(e.target.value)} required />
            </div>
            <div>
              <label className="mb-2 block text-sm font-semibold">Block type</label>
              <select className={inputClass} value={type} onChange={(e) => setType(e.target.value as BlockType)}>
                <option value="slot">Specific time slot</option>
                <option value="day">Entire day</option>
              </select>
            </div>
            {type === "slot" && (
              <div>
                <label className="mb-2 block text-sm font-semibold">Time slot</label>
                <select className={inputClass} value={slot} onChange={(e) => setSlot(e.target.value)} required>
                  {BOOKING_SLOTS.map((item) => <option key={item} value={item}>{item}</option>)}
                </select>
              </div>
            )}
            <div className={type === "day" ? "sm:col-span-2" : ""}>
              <label className="mb-2 block text-sm font-semibold">Reason</label>
              <select className={inputClass} value={reason} onChange={(e) => setReason(e.target.value)}>
                <option>Inspector unavailable</option>
                <option>Emergency</option>
                <option>Office closed</option>
                <option>Operational reasons</option>
                <option>Other</option>
              </select>
            </div>
            <div className="flex items-end sm:col-span-2">
              <button disabled={busy} className="w-full rounded-xl bg-[#0B1220] px-5 py-3 font-bold text-white transition hover:bg-slate-800 disabled:opacity-50 sm:w-auto">
                {busy ? "Saving…" : type === "day" ? "Block entire day" : "Block selected slot"}
              </button>
            </div>
          </form>
          <p className="mt-4 text-xs text-slate-500">Blocks apply only to the selected city. A whole-day block overrides every time slot on that date.</p>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Current blocks</h2>
              <p className="mt-1 text-sm text-slate-500">Remove a block to reopen the affected availability.</p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <select className={inputClass} value={filterCity} onChange={(e) => setFilterCity(e.target.value)}>
                <option value="">All cities</option>
                {CITY_OPTIONS.map((city) => <option key={city.slug} value={city.slug}>{city.name}</option>)}
              </select>
              <input className={inputClass} type="date" value={filterDate} onChange={(e) => setFilterDate(e.target.value)} aria-label="Filter blocks by date" />
            </div>
          </div>

          <div className="mt-5 flex justify-end">
            <button onClick={() => void loadBlocks()} disabled={loading} className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-50">
              {loading ? "Refreshing…" : "Refresh blocks"}
            </button>
          </div>

          {loading ? (
            <p className="py-10 text-center text-sm text-slate-500">Loading blocks…</p>
          ) : blocks.length === 0 ? (
            <div className="mt-5 rounded-xl border border-dashed border-slate-300 p-8 text-center text-sm text-slate-500">No blocks found for these filters.</div>
          ) : (
            <div className="mt-5 space-y-3">
              {blocks.map((block) => (
                <article key={block.id} className="flex flex-col gap-4 rounded-xl border border-slate-200 p-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${block.type === "day" ? "bg-rose-100 text-rose-700" : "bg-amber-100 text-amber-800"}`}>
                        {block.type === "day" ? "Whole day blocked" : `Slot blocked · ${block.slot}`}
                      </span>
                      <span className="text-sm font-bold text-slate-900">{block.city || block.citySlug}</span>
                    </div>
                    <p className="mt-2 text-sm text-slate-700">{displayDate(block.date)}</p>
                    <p className="mt-1 text-xs text-slate-500">Reason: {block.reason || "Unavailable"}</p>
                  </div>
                  <button onClick={() => void removeBlock(block)} disabled={busy} className="rounded-xl border border-rose-200 px-4 py-2.5 text-sm font-bold text-rose-700 hover:bg-rose-50 disabled:opacity-50">
                    Unblock
                  </button>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </AdminAppShell>
  );
}
