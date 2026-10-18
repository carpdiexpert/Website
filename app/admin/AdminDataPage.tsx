
"use client";

import { useCallback, useEffect, useState } from "react";
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  type User,
} from "firebase/auth";
import { auth } from "@/lib/firebase";
import AdminAppShell from "./AdminAppShell";

type AdminRecord = Record<string, unknown>;

type AdminDataPageProps = {
  title: string;
  subtitle: string;
  endpoint: string;
  mode?: "list" | "slots" | "models" | "analytics";
};

const input =
  "w-full rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm outline-none focus:border-sky-400";

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
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setReady(true);
    });

    return unsubscribe;
  }, []);

  const api = useCallback(
    async (method = "GET", body?: unknown) => {
      if (!user) {
        throw new Error("Please sign in to access admin data.");
      }

      const token = await user.getIdToken();

      const response = await fetch(endpoint, {
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
        throw new Error(
          data.error || `Request failed (${response.status}).`,
        );
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

      if (mode === "analytics") {
        setItems([data as AdminRecord]);
      } else if (Array.isArray(data.items)) {
        setItems(data.items);
      } else if (Array.isArray(data.bookings)) {
        setItems(data.bookings);
      } else if (Array.isArray(data.slots)) {
        setItems(data.slots);
      } else if (Array.isArray(data.models)) {
        setItems(data.models);
      } else if (Array.isArray(data.inspectors)) {
        setItems(data.inspectors);
      } else {
        setItems([]);
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to load data.",
      );
    } finally {
      setLoading(false);
    }
  }, [api, mode, user]);

  useEffect(() => {
    if (user) {
      void load();
    }
  }, [user, load]);

  async function handleLogin(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    try {
      await signInWithEmailAndPassword(
        auth,
        email.trim(),
        password,
      );
      setPassword("");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Sign-in failed.",
      );
    }
  }

  async function handleSave(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setMessage("");

    try {
      await api("POST", form);
      setMessage("Saved successfully.");
      setForm({});
      await load();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to save record.",
      );
    }
  }

  if (!ready) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-100">
        <p className="text-sm font-semibold text-slate-500">
          Loading admin...
        </p>
      </div>
    );
  }

  if (!user) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-100 p-5">
        <form
          onSubmit={handleLogin}
          className="w-full max-w-md rounded-3xl bg-white p-8 shadow-xl"
        >
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-sky-600">
            CarpdiExpert
          </p>

          <h1 className="mt-2 text-2xl font-black text-slate-900">
            Admin sign in
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Sign in to manage your admin dashboard.
          </p>

          <label className="mt-5 block text-sm font-semibold text-slate-700">
            Email
            <input
              className={`${input} mt-2`}
              type="email"
              autoComplete="username"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
          </label>

          <label className="mt-4 block text-sm font-semibold text-slate-700">
            Password
            <input
              className={`${input} mt-2`}
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
            />
          </label>

          {error && (
            <p
              role="alert"
              className="mt-4 rounded-xl bg-rose-50 p-3 text-sm text-rose-700"
            >
              {error}
            </p>
          )}

          <button
            type="submit"
            className="mt-5 w-full rounded-xl bg-blue-600 p-3 font-bold text-white transition hover:bg-blue-700"
          >
            Sign in
          </button>
        </form>
      </main>
    );
  }

  const fields: [string, string][] =
    mode === "slots"
      ? [
          ["city", "City"],
          ["date", "Date (YYYY-MM-DD)"],
          ["slot", "Time (HH:MM)"],
          ["inspectorId", "Inspector ID (optional)"],
          ["status", "Status (available/booked/blocked)"],
        ]
      : [
          ["brand", "Brand"],
          ["model", "Model name"],
          ["category", "Category (standard/luxury/ev/used)"],
          ["active", "Active (true/false)"],
        ];

  return (
    <AdminAppShell email={user.email}>
      <div className="mb-7">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-sky-600">
          Operations / Admin
        </p>

        <h1 className="mt-2 text-3xl font-black text-slate-900">
          {title}
        </h1>

        <p className="mt-2 text-sm text-slate-500">{subtitle}</p>
      </div>

      {error && (
        <p
          role="alert"
          className="mb-4 rounded-xl bg-rose-50 p-4 text-sm text-rose-700"
        >
          {error}
        </p>
      )}

      {message && (
        <p
          role="status"
          className="mb-4 rounded-xl bg-emerald-50 p-4 text-sm text-emerald-700"
        >
          {message}
        </p>
      )}

      {mode === "analytics" && (
        <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Object.entries(items[0] || {})
            .filter(([, value]) => typeof value === "number")
            .map(([key, value]) => (
              <article
                key={key}
                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
              >
                <p className="text-sm capitalize text-slate-500">
                  {key.replace(/([A-Z])/g, " $1")}
                </p>

                <p className="mt-3 text-3xl font-black text-slate-900">
                  {String(value)}
                </p>
              </article>
            ))}
        </div>
      )}

      {(mode === "slots" || mode === "models") && (
        <form
          onSubmit={handleSave}
          className="mb-6 grid gap-4 rounded-2xl border border-slate-200 bg-white p-5 sm:grid-cols-2"
        >
          {fields.map(([key, label]) => (
            <label
              key={key}
              className="block text-sm font-semibold text-slate-700"
            >
              {label}

              <input
                className={`${input} mt-2`}
                value={form[key] || ""}
                onChange={(event) =>
                  setForm((previous) => ({
                    ...previous,
                    [key]: event.target.value,
                  }))
                }
                required={!key.toLowerCase().includes("inspector")}
              />
            </label>
          ))}

          <button
            type="submit"
            className="rounded-xl bg-blue-600 px-4 py-3 font-bold text-white transition hover:bg-blue-700"
          >
            Add {mode === "slots" ? "slot" : "car model"}
          </button>
        </form>
      )}

      {mode !== "analytics" && (
        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center justify-between gap-3 border-b border-slate-100 p-5">
            <h2 className="font-bold text-slate-900">
              {title} records
            </h2>

            <button
              type="button"
              onClick={() => void load()}
              disabled={loading}
              className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-bold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
            >
              {loading ? "Refreshing..." : "Refresh"}
            </button>
          </div>

          {loading ? (
            <p className="p-8 text-center text-slate-500">
              Loading records...
            </p>
          ) : items.length === 0 ? (
            <p className="p-8 text-center text-sm text-slate-500">
              No records found.
              {mode === "slots" || mode === "models"
                ? " Add a record using the form above."
                : ""}
            </p>
          ) : (
            <div className="divide-y divide-slate-100">
              {items.map((item, index) => (
                <article
                  key={String(item.id || item.uid || index)}
                  className="grid gap-4 p-5 sm:grid-cols-2 lg:grid-cols-3"
                >
                  {Object.entries(item)
                    .filter(([key]) => key !== "createdAt")
                    .slice(0, 12)
                    .map(([key, value]) => (
                      <div key={key} className="min-w-0">
                        <p className="text-xs capitalize text-slate-400">
                          {key.replace(/([A-Z])/g, " $1")}
                        </p>

                        <p className="mt-1 break-words text-sm font-semibold text-slate-800">
                          {typeof value === "object" && value !== null
                            ? JSON.stringify(value)
                            : String(value ?? "—")}
                        </p>
                      </div>
                    ))}
                </article>
              ))}
            </div>
          )}
        </section>
      )}

      {mode === "analytics" && (
        <section className="rounded-2xl border border-slate-200 bg-white p-5">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="font-bold text-slate-900">
                Analytics overview
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Summary data returned by the analytics API.
              </p>
            </div>

            <button
              type="button"
              onClick={() => void load()}
              disabled={loading}
              className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-bold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
            >
              {loading ? "Refreshing..." : "Refresh"}
            </button>
          </div>

          {Object.keys(items[0] || {}).filter(
            (key) => typeof items[0][key] !== "number",
          ).length > 0 && (
            <div className="mt-5 space-y-4">
              {Object.entries(items[0] || {})
                .filter(([, value]) => typeof value !== "number")
                .map(([key, value]) => (
                  <div
                    key={key}
                    className="rounded-xl bg-slate-50 p-4"
                  >
                    <p className="mb-2 text-sm font-bold capitalize text-slate-700">
                      {key.replace(/([A-Z])/g, " $1")}
                    </p>

                    <pre className="overflow-x-auto whitespace-pre-wrap break-words text-xs text-slate-600">
                      {JSON.stringify(value, null, 2)}
                    </pre>
                  </div>
                ))}
            </div>
          )}
        </section>
      )}
    </AdminAppShell>
  );
}
