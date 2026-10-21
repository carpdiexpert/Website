"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  type User,
} from "firebase/auth";
import { auth } from "@/lib/firebase";
import AdminAppShell from "./AdminAppShell";

type AdminRecord = Record<string, unknown>;
type Category = "standard" | "luxury" | "ev";
type ModelForm = {
  brand: string;
  model: string;
  category: Category;
  active: "true" | "false";
};

type AdminDataPageProps = {
  title: string;
  subtitle: string;
  endpoint: string;
  mode?: "list" | "slots" | "models" | "analytics";
};

const input =
  "w-full rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-100";
const buttonPrimary =
  "inline-flex items-center justify-center rounded-xl bg-sky-600 px-4 py-3 text-sm font-bold text-white transition hover:bg-sky-700 disabled:cursor-not-allowed disabled:opacity-50";
const buttonSecondary =
  "inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50";
const emptyModelForm: ModelForm = {
  brand: "",
  model: "",
  category: "standard",
  active: "true",
};

function displayValue(value: unknown) {
  if (value === null || value === undefined || value === "") return "—";
  if (typeof value === "object") return JSON.stringify(value);
  return String(value);
}

function readableCategory(value: unknown) {
  const category = String(value ?? "standard").toLowerCase();
  if (category === "luxury") return "Luxury";
  if (category === "ev") return "EV";
  return "Standard";
}

export default function AdminDataPage({
  title,
  subtitle,
  endpoint,
  mode = "list",
}: AdminDataPageProps) {
  const [user, setUser] = useState<User | null>(null);
  const [ready, setReady] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [items, setItems] = useState<AdminRecord[]>([]);
  const [form, setForm] = useState<Record<string, string>>({});
  const [modelForm, setModelForm] = useState<ModelForm>(emptyModelForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [selectedJson, setSelectedJson] = useState<File | null>(null);
  const [modelSearch, setModelSearch] = useState("");
  const [selectedBrand, setSelectedBrand] = useState<string | null>(null);
  const [importing, setImporting] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setReady(true);
    });
    return unsubscribe;
  }, []);

  const api = useCallback(
    async (method = "GET", body?: unknown) => {
      if (!user) throw new Error("Please sign in to access admin data.");
      const token = await user.getIdToken();
      const response = await fetch(endpoint, {
        method,
        headers: {
          Authorization: `Bearer ${token}`,
          ...(body !== undefined ? { "Content-Type": "application/json" } : {}),
        },
        body: body !== undefined ? JSON.stringify(body) : undefined,
        cache: "no-store",
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(data.error || `Request failed (${response.status}).`);
      }
      return data;
    },
    [endpoint, user],
  );

  const load = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    setError("");
    try {
      const data = await api();
      if (mode === "analytics") setItems([data as AdminRecord]);
      else if (Array.isArray(data.items)) setItems(data.items);
      else if (Array.isArray(data.bookings)) setItems(data.bookings);
      else if (Array.isArray(data.slots)) setItems(data.slots);
      else if (Array.isArray(data.models)) setItems(data.models);
      else if (Array.isArray(data.inspectors)) setItems(data.inspectors);
      else setItems([]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to load data.");
    } finally {
      setLoading(false);
    }
  }, [api, mode, user]);

  useEffect(() => {
    if (user) void load();
  }, [user, load]);

  async function handleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    try {
      await signInWithEmailAndPassword(auth, email.trim(), password);
      setPassword("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sign-in failed.");
    }
  }

  async function handleSaveGeneric(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setMessage("");
    try {
      await api("POST", form);
      setMessage("Saved successfully.");
      setForm({});
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to save record.");
    }
  }

  async function handleSaveModel(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setMessage("");
    const payload = {
      brand: modelForm.brand.trim(),
      model: modelForm.model.trim(),
      category: modelForm.category,
      active: modelForm.active === "true",
      ...(editingId ? { id: editingId } : {}),
    };

    try {
      if (editingId) {
        await api("PATCH", payload);
        setMessage("Car model updated successfully.");
      } else {
        await api("POST", payload);
        setMessage("Car model added successfully.");
      }
      setModelForm(emptyModelForm);
      setEditingId(null);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to save car model.");
    }
  }

  function startEditing(item: AdminRecord) {
    setError("");
    setMessage("");
    setEditingId(String(item.id));
    setModelForm({
      brand: String(item.brand ?? ""),
      model: String(item.model ?? ""),
      category: String(item.category ?? "standard").toLowerCase() as Category,
      active: item.active === false ? "false" : "true",
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function cancelEditing() {
    setEditingId(null);
    setModelForm(emptyModelForm);
    setError("");
    setMessage("");
  }

  async function deleteModel(item: AdminRecord) {
    const name = `${String(item.brand ?? "")} ${String(item.model ?? "")}`.trim();
    if (!window.confirm(`Delete ${name}? This action cannot be undone.`)) return;
    setError("");
    setMessage("");
    try {
      await api("DELETE", { id: String(item.id) });
      if (editingId === String(item.id)) cancelEditing();
      setMessage(`${name} deleted successfully.`);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to delete car model.");
    }
  }

  async function changeModelStatus(item: AdminRecord, value: string) {
    setError("");
    setMessage("");
    try {
      await api("PATCH", { id: String(item.id), active: value === "true" });
      setMessage(`${String(item.brand)} ${String(item.model)} status updated.`);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to update status.");
    }
  }

  function handleJsonSelection(event: ChangeEvent<HTMLInputElement>) {
    setSelectedJson(event.target.files?.[0] ?? null);
    setError("");
    setMessage("");
  }

  async function handleBulkImport() {
    if (!selectedJson) {
      setError("Choose the car catalogue JSON file first.");
      return;
    }
    setError("");
    setMessage("");
    setImporting(true);
    try {
      const parsed: unknown = JSON.parse(await selectedJson.text());
      if (
        !parsed ||
        typeof parsed !== "object" ||
        !Array.isArray((parsed as { brands?: unknown }).brands)
      ) {
        throw new Error('Invalid JSON format. Expected an object containing a "brands" array.');
      }
      const result = await api("POST", parsed);
      const added = Number(result.added ?? 0);
      const skipped = Number(result.skipped ?? 0);
      const total = Number(result.total ?? added + skipped);
      setMessage(
        `Import finished: ${added} added, ${skipped} duplicates skipped (${total} models processed).`,
      );
      setSelectedJson(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to import JSON catalogue.");
    } finally {
      setImporting(false);
    }
  }

  if (!ready) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-100">
        <p className="text-sm font-semibold text-slate-500">Loading admin...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-100 p-5">
        <form onSubmit={handleLogin} className="w-full max-w-md rounded-3xl bg-white p-8 shadow-xl">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-sky-600">CarPDIExpert</p>
          <h1 className="mt-2 text-2xl font-black text-slate-900">Admin sign in</h1>
          <p className="mt-2 text-sm text-slate-500">Sign in to manage your admin dashboard.</p>
          <label className="mt-5 block text-sm font-semibold text-slate-700">
            Email
            <input className={`${input} mt-2`} type="email" autoComplete="username" value={email} onChange={(event) => setEmail(event.target.value)} required />
          </label>
          <label className="mt-4 block text-sm font-semibold text-slate-700">
            Password
            <input className={`${input} mt-2`} type="password" autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} required />
          </label>
          {error && <p role="alert" className="mt-4 rounded-xl bg-rose-50 p-3 text-sm text-rose-700">{error}</p>}
          <button type="submit" className={`${buttonPrimary} mt-5 w-full`}>Sign in</button>
        </form>
      </main>
    );
  }

  const fields: [string, string][] = mode === "slots"
    ? [["city", "City"], ["date", "Date (YYYY-MM-DD)"], ["slot", "Time (HH:MM)"], ["inspectorId", "Inspector ID (optional)"], ["status", "Status (available/booked/blocked)"]]
    : [["brand", "Brand"], ["model", "Model name"], ["category", "Category"], ["active", "Active (true/false)"]];

  return (
    <AdminAppShell email={user.email}>
      <div className="mb-7">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-sky-600">Operations / Admin</p>
        <h1 className="mt-2 text-3xl font-black text-slate-900">{title}</h1>
        <p className="mt-2 text-sm text-slate-500">{subtitle}</p>
      </div>

      {error && <p role="alert" className="mb-4 whitespace-pre-wrap rounded-xl bg-rose-50 p-4 text-sm text-rose-700">{error}</p>}
      {message && <p role="status" className="mb-4 whitespace-pre-wrap rounded-xl bg-emerald-50 p-4 text-sm text-emerald-700">{message}</p>}

      {mode === "analytics" && (
        <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Object.entries(items[0] || {}).filter(([, value]) => typeof value === "number").map(([key, value]) => (
            <article key={key} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-sm capitalize text-slate-500">{key.replace(/([A-Z])/g, " $1")}</p>
              <p className="mt-3 text-3xl font-black text-slate-900">{String(value)}</p>
            </article>
          ))}
        </div>
      )}

      {mode === "models" && (
        <div className="mb-6 space-y-5">
          <form onSubmit={handleSaveModel} className="grid gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:grid-cols-2 lg:grid-cols-4">
            <div className="sm:col-span-2 lg:col-span-4">
              <h2 className="text-lg font-bold text-slate-900">{editingId ? "Edit car model" : "Add car model"}</h2>
              <p className="mt-1 text-sm text-slate-500">Brand and model combinations must be unique.</p>
            </div>
            <label className="block text-sm font-semibold text-slate-700">
              Brand
              <input className={`${input} mt-2`} value={modelForm.brand} onChange={(event) => setModelForm((prev) => ({ ...prev, brand: event.target.value }))} placeholder="e.g. Tata" maxLength={100} required />
            </label>
            <label className="block text-sm font-semibold text-slate-700">
              Model
              <input className={`${input} mt-2`} value={modelForm.model} onChange={(event) => setModelForm((prev) => ({ ...prev, model: event.target.value }))} placeholder="e.g. Nexon" maxLength={120} required />
            </label>
            <label className="block text-sm font-semibold text-slate-700">
              Category
              <select className={`${input} mt-2`} value={modelForm.category} onChange={(event) => setModelForm((prev) => ({ ...prev, category: event.target.value as Category }))}>
                <option value="standard">Standard</option>
                <option value="luxury">Luxury</option>
                <option value="ev">EV</option>
              </select>
            </label>
            <label className="block text-sm font-semibold text-slate-700">
              Status
              <select className={`${input} mt-2`} value={modelForm.active} onChange={(event) => setModelForm((prev) => ({ ...prev, active: event.target.value as "true" | "false" }))}>
                <option value="true">Active</option>
                <option value="false">Inactive</option>
              </select>
            </label>
            <div className="flex flex-wrap gap-3 sm:col-span-2 lg:col-span-4">
              <button type="submit" className={buttonPrimary}>{editingId ? "Save changes" : "Add model"}</button>
              {editingId && <button type="button" className={buttonSecondary} onClick={cancelEditing}>Cancel edit</button>}
            </div>
          </form>

          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <h2 className="text-lg font-bold text-slate-900">Bulk import from JSON</h2>
                <p className="mt-1 max-w-2xl text-sm leading-6 text-slate-500">Select your existing catalogue JSON containing a <code className="rounded bg-slate-100 px-1">brands</code> array. The importer reads each brand and its models, maps each model&apos;s <code className="rounded bg-slate-100 px-1">type</code> to category, and marks new entries Active. Existing brand/model combinations are skipped.</p>
              </div>
              <span className="shrink-0 rounded-full bg-sky-50 px-3 py-1 text-xs font-bold text-sky-700">JSON import</span>
            </div>
            <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center">
              <input ref={fileInputRef} type="file" accept=".json,application/json" onChange={handleJsonSelection} className={`${input} sm:max-w-md`} />
              <button type="button" onClick={() => void handleBulkImport()} disabled={!selectedJson || importing} className={buttonPrimary}>
                {importing ? "Importing catalogue..." : "Import all models"}
              </button>
            </div>
            {selectedJson && <p className="mt-2 text-xs text-slate-500">Selected: {selectedJson.name} ({Math.max(1, Math.round(selectedJson.size / 1024))} KB)</p>}
          </section>
        </div>
      )}

      {mode === "slots" && (
        <form onSubmit={handleSaveGeneric} className="mb-6 grid gap-4 rounded-2xl border border-slate-200 bg-white p-5 sm:grid-cols-2">
          {fields.map(([key, label]) => (
            <label key={key} className="block text-sm font-semibold text-slate-700">
              {label}
              <input className={`${input} mt-2`} value={form[key] || ""} onChange={(event) => setForm((previous) => ({ ...previous, [key]: event.target.value }))} required={!key.toLowerCase().includes("inspector")} />
            </label>
          ))}
          <button type="submit" className={buttonPrimary}>Add slot</button>
        </form>
      )}

      {mode !== "analytics" && (
        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center justify-between gap-3 border-b border-slate-100 p-5">
            <div>
              <h2 className="font-bold text-slate-900">{title} records</h2>
              <p className="mt-1 text-xs text-slate-500">{items.length} record{items.length === 1 ? "" : "s"}</p>
            </div>
            <button type="button" onClick={() => void load()} disabled={loading} className={buttonSecondary}>{loading ? "Refreshing..." : "Refresh"}</button>
          </div>

          {loading ? (
            <p className="p-8 text-center text-slate-500">Loading records...</p>
          ) : items.length === 0 ? (
            <p className="p-8 text-center text-sm text-slate-500">No records found.{mode === "slots" || mode === "models" ? " Add a record using the form above or import a JSON catalogue." : ""}</p>
          ) : mode === "models" ? (
            <div className="p-4 sm:p-5">
              <label className="mb-5 block">
                <span className="mb-2 block text-sm font-semibold text-slate-700">Search brands and models</span>
                <div className="relative">
                  <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400"><circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/></svg>
                  <input className={`${input} pl-10`} type="search" value={modelSearch} onChange={(event) => setModelSearch(event.target.value)} placeholder="Search by brand, model, or category..." />
                  {modelSearch && <button type="button" onClick={() => setModelSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-500 hover:text-slate-900">Clear</button>}
                </div>
              </label>

              {(() => {
                const query = modelSearch.trim().toLowerCase();
                const brands = Array.from(new Set(items.map((item) => String(item.brand ?? "Unknown brand"))))
                  .sort((a, b) => a.localeCompare(b));
                const brandMatches = brands.filter((brand) => {
                  const brandItems = items.filter((item) => String(item.brand ?? "Unknown brand") === brand);
                  return !query || brand.toLowerCase().includes(query) || brandItems.some((item) => String(item.model ?? "").toLowerCase().includes(query) || readableCategory(item.category).toLowerCase().includes(query) || (item.active === false ? "inactive" : "active").includes(query));
                });
                const currentBrand = selectedBrand && brands.includes(selectedBrand) ? selectedBrand : null;
                const brandModels = currentBrand ? items.filter((item) => String(item.brand ?? "Unknown brand") === currentBrand && (!query || currentBrand.toLowerCase().includes(query) || String(item.model ?? "").toLowerCase().includes(query) || readableCategory(item.category).toLowerCase().includes(query) || (item.active === false ? "inactive" : "active").includes(query))) : [];

                if (currentBrand) {
                  return (
                    <div>
                      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                          <button type="button" onClick={() => setSelectedBrand(null)} className="mb-2 inline-flex items-center gap-2 text-sm font-bold text-sky-700 hover:text-sky-900"><span aria-hidden="true">←</span> All brands</button>
                          <h3 className="text-xl font-black text-slate-900">{currentBrand}</h3>
                          <p className="mt-1 text-sm text-slate-500">{items.filter((item) => String(item.brand ?? "Unknown brand") === currentBrand).length} models in this brand</p>
                        </div>
                      </div>
                      {brandModels.length === 0 ? <p className="rounded-xl bg-slate-50 p-6 text-center text-sm text-slate-500">No models match your search.</p> : (
                        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                          {brandModels.map((item, index) => (
                            <article key={String(item.id || `${currentBrand}-${index}`)} className="rounded-2xl border border-slate-200 bg-white p-4 transition hover:border-sky-200 hover:shadow-sm">
                              <div className="flex items-start justify-between gap-3">
                                <div className="min-w-0"><h4 className="break-words font-bold text-slate-900">{displayValue(item.model)}</h4><p className="mt-1 text-xs text-slate-500">{currentBrand}</p></div>
                                <span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ${item.active === false ? "bg-slate-100 text-slate-600" : "bg-emerald-50 text-emerald-700"}`}>{item.active === false ? "Inactive" : "Active"}</span>
                              </div>
                              <div className="mt-3"><span className="rounded-full bg-sky-50 px-2.5 py-1 text-xs font-semibold text-sky-700">{readableCategory(item.category)}</span></div>
                              <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 pt-3">
                                <label className="flex items-center gap-2 text-xs font-semibold text-slate-500">Status<select aria-label={`Status for ${String(item.brand)} ${String(item.model)}`} className="rounded-lg border border-slate-200 bg-white px-2 py-2 text-xs font-semibold text-slate-800" value={item.active === false ? "false" : "true"} onChange={(event) => void changeModelStatus(item, event.target.value)}><option value="true">Active</option><option value="false">Inactive</option></select></label>
                                <div className="flex gap-2"><button type="button" className={buttonSecondary} onClick={() => startEditing(item)}>Edit</button><button type="button" className="rounded-xl border border-rose-200 px-3 py-2 text-sm font-semibold text-rose-700 transition hover:bg-rose-50" onClick={() => void deleteModel(item)}>Delete</button></div>
                              </div>
                            </article>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                }

                return brandMatches.length === 0 ? <p className="rounded-xl bg-slate-50 p-8 text-center text-sm text-slate-500">No brands or models match your search.</p> : (
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {brandMatches.map((brand) => {
                      const brandItems = items.filter((item) => String(item.brand ?? "Unknown brand") === brand);
                      const activeCount = brandItems.filter((item) => item.active !== false).length;
                      return (
                        <button key={brand} type="button" onClick={() => setSelectedBrand(brand)} className="group rounded-2xl border border-slate-200 bg-white p-5 text-left transition hover:-translate-y-0.5 hover:border-sky-300 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-sky-200">
                          <div className="flex items-start justify-between gap-3"><div className="flex h-11 w-11 items-center justify-center rounded-xl bg-sky-50 text-lg font-black text-sky-700">{brand.charAt(0).toUpperCase()}</div><span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">{brandItems.length} {brandItems.length === 1 ? "model" : "models"}</span></div>
                          <h3 className="mt-4 text-lg font-extrabold text-slate-900 group-hover:text-sky-700">{brand}</h3>
                          <div className="mt-3 flex items-center justify-between gap-2 text-xs text-slate-500"><span>{activeCount} active</span><span className="inline-flex items-center gap-1 font-bold text-sky-700">View models <span aria-hidden="true">→</span></span></div>
                        </button>
                      );
                    })}
                  </div>
                );
              })()}
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {items.map((item, index) => (
                <article key={String(item.id || item.uid || index)} className="grid gap-4 p-5 sm:grid-cols-2 lg:grid-cols-3">
                  {Object.entries(item).filter(([key]) => key !== "createdAt").slice(0, 12).map(([key, value]) => (
                    <div key={key} className="min-w-0"><p className="text-xs capitalize text-slate-400">{key.replace(/([A-Z])/g, " $1")}</p><p className="mt-1 break-words text-sm font-semibold text-slate-800">{displayValue(value)}</p></div>
                  ))}
                </article>
              ))}
            </div>
          )}
        </section>
      )}

      {mode === "analytics" && (
        <section className="rounded-2xl border border-slate-200 bg-white p-5">
          <div className="flex items-center justify-between gap-3"><div><h2 className="font-bold text-slate-900">Analytics overview</h2><p className="mt-1 text-sm text-slate-500">Summary data returned by the analytics API.</p></div><button type="button" onClick={() => void load()} disabled={loading} className={buttonSecondary}>{loading ? "Refreshing..." : "Refresh"}</button></div>
          {Object.keys(items[0] || {}).filter((key) => typeof items[0][key] !== "number").length > 0 && <div className="mt-5 space-y-4">{Object.entries(items[0] || {}).filter(([, value]) => typeof value !== "number").map(([key, value]) => <div key={key} className="rounded-xl bg-slate-50 p-4"><p className="mb-2 text-sm font-bold capitalize text-slate-700">{key.replace(/([A-Z])/g, " $1")}</p><pre className="overflow-x-auto whitespace-pre-wrap break-words text-xs text-slate-600">{JSON.stringify(value, null, 2)}</pre></div>)}</div>}
        </section>
      )}
    </AdminAppShell>
  );
}
