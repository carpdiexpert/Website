
"use client";

import { useCallback, useEffect, useState } from "react";
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  type User,
} from "firebase/auth";
import AdminAppShell from "../AdminAppShell";
import {
  firebaseAuth,
  firebaseConfigured,
} from "@/lib/firebase-client";
import { CITY_OPTIONS } from "@/lib/cityOptions";

type CityName = (typeof CITY_OPTIONS)[number]["name"];

type Inspector = {
  id: string;
  name?: string;
  mobile?: string;
  email?: string;
  city?: string;
  status?: string;
};

type InspectorForm = {
  name: string;
  mobile: string;
  email: string;
  city: CityName;
  password: string;
};

const inputClass =
  "mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm text-slate-900 outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-100";

const initialCity = (
  CITY_OPTIONS.find((city) => city.slug === "pune")?.name ??
  CITY_OPTIONS[0]?.name ??
  "Pune"
) as CityName;

const emptyForm: InspectorForm = {
  name: "",
  mobile: "",
  email: "",
  city: initialCity,
  password: "",
};

function normalizeMobile(value: string) {
  return value.replace(/\D/g, "").slice(0, 10);
}

export default function ManageInspectorsPage() {
  const [user, setUser] = useState<User | null>(null);
  const [authReady, setAuthReady] = useState(false);

  const [email, setEmail] = useState("admin@carpdiexpert.com");
  const [loginPassword, setLoginPassword] = useState("");

  const [inspectors, setInspectors] = useState<Inspector[]>([]);
  const [form, setForm] = useState<InspectorForm>(emptyForm);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!firebaseAuth) {
      setAuthReady(true);
      return;
    }

    return onAuthStateChanged(firebaseAuth, (nextUser) => {
      setUser(nextUser);
      setAuthReady(true);
    });
  }, []);

  const callApi = useCallback(
    async (
      currentUser: User,
      path: string,
      method = "GET",
      body?: unknown,
    ) => {
      const token = await currentUser.getIdToken();

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
        throw new Error(
          data.error || `Request failed (${response.status})`,
        );
      }

      return data;
    },
    [],
  );

  const loadInspectors = useCallback(
    async (currentUser: User) => {
      setLoading(true);
      setError("");

      try {
        const data = await callApi(
          currentUser,
          "/api/admin/inspectors",
        );

        setInspectors(
          Array.isArray(data.inspectors) ? data.inspectors : [],
        );
      } catch (err) {
        setInspectors([]);
        setError(
          err instanceof Error
            ? err.message
            : "Could not load inspectors",
        );
      } finally {
        setLoading(false);
      }
    },
    [callApi],
  );

  useEffect(() => {
    if (user) {
      void loadInspectors(user);
    } else {
      setInspectors([]);
    }
  }, [user, loadInspectors]);

  async function login(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setMessage("");

    if (!firebaseAuth) {
      setError(
        "Firebase client settings are missing. Configure NEXT_PUBLIC_FIREBASE_* in .env.local and restart Next.js.",
      );
      return;
    }

    try {
      await signInWithEmailAndPassword(
        firebaseAuth,
        email.trim().toLowerCase(),
        loginPassword,
      );
      setLoginPassword("");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Sign in failed",
      );
    }
  }

  async function createInspector(
    event: React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    if (!user || busy) return;

    setError("");
    setMessage("");

    const name = form.name.trim().replace(/\s+/g, " ");
    const mobileDigits = normalizeMobile(form.mobile);
    const inspectorEmail = form.email.trim().toLowerCase();
    const password = form.password.trim();

    if (name.length < 2) {
      setError("Enter a name with at least 2 characters.");
      return;
    }

    if (!/^[6-9]\d{9}$/.test(mobileDigits)) {
      setError(
        "Enter a valid Indian mobile number with exactly 10 digits.",
      );
      return;
    }

    // Allow any email domain. Check basic email format only.
    if (
      inspectorEmail.length > 254 ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(inspectorEmail)
    ) {
      setError("Enter a valid email address.");
      return;
    }

    if (password.length < 8 || password.length > 128) {
      setError("Password must be between 8 and 128 characters.");
      return;
    }

    if (CITY_OPTIONS.length === 0) {
      setError(
        "No cities are configured. Please configure the city list.",
      );
      return;
    }

    setBusy(true);

    try {
      await callApi(user, "/api/admin/inspectors", "POST", {
        name,
        mobile: mobileDigits,
        email: inspectorEmail,
        city: form.city.trim(),
        password,
      });

      setMessage(
        `Inspector ${name} created successfully. Their initial password was set by the admin.`,
      );

      setForm({ ...emptyForm });
      await loadInspectors(user);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Inspector could not be created",
      );
    } finally {
      setBusy(false);
    }
  }

  async function toggleInspector(inspector: Inspector) {
    if (!user) return;

    setError("");
    setMessage("");

    try {
      const nextStatus =
        inspector.status === "active" ? "inactive" : "active";

      await callApi(user, "/api/admin/inspectors", "PATCH", {
        id: inspector.id,
        status: nextStatus,
      });

      setMessage(
        `${inspector.name || "Inspector"} is now ${nextStatus}.`,
      );

      await loadInspectors(user);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Could not update inspector",
      );
    }
  }

  return (
    <AdminAppShell email={user?.email}>
      <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-sky-600">
            Admin / Team management
          </p>
          <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-900">
            Manage Inspectors
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            Create inspector accounts, assign cities, and manage account status.
          </p>
        </div>

        {user && (
          <button
            type="button"
            onClick={() => void loadInspectors(user)}
            disabled={loading}
            className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
          >
            {loading ? "Refreshing..." : "Refresh inspectors"}
          </button>
        )}
      </div>

      {error && (
        <div
          role="alert"
          className="mb-5 rounded-xl border border-rose-100 bg-rose-50 p-4 text-sm text-rose-700"
        >
          {error}
        </div>
      )}

      {message && (
        <div
          role="status"
          className="mb-5 break-words rounded-xl border border-sky-100 bg-sky-50 p-4 text-sm text-slate-800"
        >
          {message}
        </div>
      )}

      {!authReady ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-8 text-sm text-slate-500">
          Checking sign-in...
        </div>
      ) : !user ? (
        <section className="max-w-xl rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <h2 className="text-xl font-bold text-slate-900">
            Admin sign in
          </h2>
          <p className="mt-2 text-sm text-slate-500">
            Sign in with your authorized administrator account.
          </p>

          <form onSubmit={login} className="mt-6 space-y-4">
            <label className="block text-sm font-semibold text-slate-700">
              Email address
              <input
                className={inputClass}
                type="email"
                autoComplete="username"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
              />
            </label>

            <label className="block text-sm font-semibold text-slate-700">
              Admin password
              <input
                className={inputClass}
                type="password"
                autoComplete="current-password"
                value={loginPassword}
                onChange={(event) =>
                  setLoginPassword(event.target.value)
                }
                required
              />
            </label>

            {!firebaseConfigured && (
              <p className="text-sm text-amber-700">
                Firebase client environment variables are not configured.
              </p>
            )}

            <button
              type="submit"
              className="w-full rounded-xl bg-blue-600 px-5 py-3 font-bold text-white transition hover:bg-blue-700"
            >
              Sign in
            </button>
          </form>
        </section>
      ) : (
        <>
          <section className="mb-6 grid gap-4 sm:grid-cols-3">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-sm text-slate-500">Total inspectors</p>
              <p className="mt-2 text-3xl font-black text-slate-900">
                {inspectors.length}
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-sm text-slate-500">Active inspectors</p>
              <p className="mt-2 text-3xl font-black text-emerald-600">
                {
                  inspectors.filter(
                    (item) => item.status === "active",
                  ).length
                }
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-sm text-slate-500">Inactive inspectors</p>
              <p className="mt-2 text-3xl font-black text-slate-700">
                {
                  inspectors.filter(
                    (item) => item.status !== "active",
                  ).length
                }
              </p>
            </div>
          </section>

          <div className="grid grid-cols-1 items-start gap-6 xl:grid-cols-2">
            {/* LEFT COLUMN: CREATE INSPECTOR */}
            <section className="min-w-0 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
              <div className="mb-5">
                <h2 className="text-xl font-bold text-slate-900">
                  Add Inspector
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Complete the details and set the initial password.
                </p>
              </div>

              <form onSubmit={createInspector} className="space-y-4">
                <label className="block text-sm font-semibold text-slate-700">
                  Full name
                  <input
                    className={inputClass}
                    value={form.name}
                    onChange={(event) =>
                      setForm({ ...form, name: event.target.value })
                    }
                    onBlur={() =>
                      setForm({
                        ...form,
                        name: form.name.trim().replace(/\s+/g, " "),
                      })
                    }
                    minLength={2}
                    maxLength={120}
                    autoComplete="name"
                    required
                  />
                </label>

                <label className="block text-sm font-semibold text-slate-700">
                  Mobile number
                  <div className="mt-2 flex overflow-hidden rounded-xl border border-slate-200 focus-within:border-sky-400 focus-within:ring-2 focus-within:ring-sky-100">
                    <span className="flex items-center border-r border-slate-200 bg-slate-50 px-3 text-sm text-slate-600">
                      +91
                    </span>
                    <input
                      className="min-w-0 flex-1 bg-white px-3 py-3 text-sm text-slate-900 outline-none"
                      type="tel"
                      inputMode="numeric"
                      autoComplete="tel-national"
                      value={form.mobile}
                      onChange={(event) =>
                        setForm({
                          ...form,
                          mobile: normalizeMobile(event.target.value),
                        })
                      }
                      placeholder="9876543210"
                      pattern="[6-9][0-9]{9}"
                      title="Enter exactly 10 digits, starting with 6, 7, 8, or 9"
                      maxLength={10}
                      minLength={10}
                      required
                    />
                  </div>
                  <span className="mt-1 block text-xs font-normal text-slate-500">
                    Enter exactly 10 digits, without +91.
                  </span>
                </label>

                <label className="block text-sm font-semibold text-slate-700">
                  Email address
                  <input
                    className={inputClass}
                    type="email"
                    autoComplete="email"
                    value={form.email}
                    onChange={(event) =>
                      setForm({ ...form, email: event.target.value })
                    }
                    onBlur={() =>
                      setForm({
                        ...form,
                        email: form.email.trim().toLowerCase(),
                      })
                    }
                    maxLength={254}
                    placeholder="inspector@example.com"
                    required
                  />
                </label>

                <label className="block text-sm font-semibold text-slate-700">
                  Assigned city
                  <select
                    className={inputClass}
                    value={form.city}
                    onChange={(event) =>
                      setForm({
                        ...form,
                        city: event.target.value as CityName,
                      })
                    }
                    required
                  >
                    {CITY_OPTIONS.map((city) => (
                      <option key={city.slug} value={city.name}>
                        {city.name}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="block text-sm font-semibold text-slate-700">
                  Initial password
                  <input
                    className={inputClass}
                    type="password"
                    autoComplete="new-password"
                    value={form.password}
                    onChange={(event) =>
                      setForm({ ...form, password: event.target.value })
                    }
                    onBlur={() =>
                      setForm({
                        ...form,
                        password: form.password.trim(),
                      })
                    }
                    minLength={8}
                    maxLength={128}
                    placeholder="At least 8 characters"
                    required
                  />
                  <span className="mt-1 block text-xs font-normal text-slate-500">
                    Leading and trailing spaces are removed before submission.
                  </span>
                </label>

                <button
                  type="submit"
                  disabled={busy || CITY_OPTIONS.length === 0}
                  className="w-full rounded-xl bg-blue-600 px-6 py-3 font-bold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {busy ? "Creating inspector..." : "Create Inspector"}
                </button>
              </form>
            </section>

            {/* RIGHT COLUMN: INSPECTOR LIST */}
            <section className="min-w-0 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
              <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h2 className="text-xl font-bold text-slate-900">
                    Inspector List
                  </h2>
                  <p className="mt-1 text-sm text-slate-500">
                    Review inspectors and manage their status.
                  </p>
                </div>

                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600">
                  {inspectors.length} total
                </span>
              </div>

              {loading && inspectors.length === 0 ? (
                <div className="rounded-xl bg-slate-50 p-8 text-center text-sm text-slate-500">
                  Loading inspectors...
                </div>
              ) : inspectors.length > 0 ? (
                <div className="space-y-3">
                  {inspectors.map((inspector) => (
                    <article
                      key={inspector.id}
                      className="rounded-xl border border-slate-200 p-4 transition hover:border-sky-200"
                    >
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <div className="min-w-0">
                          <h3 className="break-words font-bold text-slate-900">
                            {inspector.name || "Unnamed inspector"}
                          </h3>

                          <p className="mt-1 break-all text-sm text-slate-500">
                            {inspector.email || "No email"}
                          </p>

                          <p className="mt-1 text-sm text-slate-500">
                            {inspector.city || "No city"}
                          </p>

                          <p className="mt-1 text-sm text-slate-500">
                            {inspector.mobile || "No mobile"}
                          </p>

                          <span
                            className={`mt-3 inline-flex rounded-full px-3 py-1 text-xs font-bold ${
                              inspector.status === "active"
                                ? "bg-emerald-50 text-emerald-700"
                                : "bg-slate-100 text-slate-600"
                            }`}
                          >
                            {inspector.status || "unknown"}
                          </span>
                        </div>

                        <button
                          type="button"
                          onClick={() => void toggleInspector(inspector)}
                          className="shrink-0 rounded-lg border border-slate-200 px-3 py-2 text-xs font-bold text-slate-700 transition hover:bg-slate-50"
                        >
                          Set{" "}
                          {inspector.status === "active"
                            ? "inactive"
                            : "active"}
                        </button>
                      </div>
                    </article>
                  ))}
                </div>
              ) : (
                <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center">
                  <h3 className="font-bold text-slate-800">
                    No inspectors found
                  </h3>
                  <p className="mt-2 text-sm text-slate-500">
                    Create the first inspector using the form on the left.
                  </p>
                </div>
              )}
            </section>
          </div>
        </>
      )}
    </AdminAppShell>
  );
}
