"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  onAuthStateChanged,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut,
  type User,
} from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useRouter } from "next/navigation";

type LoginMode = "admin" | "inspector";

const VERIFY_TIMEOUT_MS = 8_000;
const SESSION_TIMEOUT_MS = 10_000;

async function fetchWithTimeout(
  url: string,
  token: string,
): Promise<Response> {
  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), VERIFY_TIMEOUT_MS);

  try {
    return await fetch(url, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
      signal: controller.signal,
    });
  } finally {
    window.clearTimeout(timeout);
  }
}

async function verifyAdmin(token: string) {
  const response = await fetchWithTimeout("/api/admin/analytics", token);
  return response.ok;
}

async function verifyInspector(token: string) {
  const response = await fetchWithTimeout("/api/auth/inspector", token);
  return response.ok;
}

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<LoginMode>("admin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [checking, setChecking] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [resetting, setResetting] = useState(false);
  const routingRef = useRef(false);
  const mountedRef = useRef(false);

  const routeUser = useCallback(
    async (user: User) => {
      if (routingRef.current) return;
      routingRef.current = true;
      setError("");
      setNotice("");

      try {
        const token = await user.getIdToken();

        try {
          if (await verifyAdmin(token)) {
            router.replace("/admin/dashboard");
            return;
          }
        } catch (verificationError) {
          if (verificationError instanceof DOMException && verificationError.name === "AbortError") {
            throw new Error("Admin verification timed out. Check that your computer's dev server and Firebase configuration are working, then try signing in again.");
          }
          throw verificationError;
        }

        try {
          if (await verifyInspector(token)) {
            router.replace("/inspector/dashboard");
            return;
          }
        } catch (verificationError) {
          if (verificationError instanceof DOMException && verificationError.name === "AbortError") {
            throw new Error("Inspector verification timed out. Check that your computer's dev server and Firebase configuration are working, then try signing in again.");
          }
          throw verificationError;
        }

        await signOut(auth);
        setError(
          "This account is not authorized for the Admin or Inspector portal, or the inspector account is inactive.",
        );
      } catch (routeError) {
        await signOut(auth).catch(() => undefined);
        setError(
          routeError instanceof Error
            ? routeError.message
            : "Unable to verify your account. Please sign in again.",
        );
      } finally {
        routingRef.current = false;
        if (mountedRef.current) setChecking(false);
      }
    },
    [router],
  );

  useEffect(() => {
    mountedRef.current = true;
    let resolved = false;

    // Never leave the login screen stuck forever if mobile Safari/Chrome
    // cannot complete Firebase's initial auth-state check.
    const fallback = window.setTimeout(() => {
      if (!resolved && mountedRef.current) {
        setChecking(false);
        setNotice(
          "Session check took too long. You can try signing in below; if it keeps happening, check Firebase Auth and the development server connection.",
        );
      }
    }, SESSION_TIMEOUT_MS);

    const unsubscribe = onAuthStateChanged(
      auth,
      (user) => {
        resolved = true;
        window.clearTimeout(fallback);

        if (user) {
          void routeUser(user);
        } else {
          setChecking(false);
        }
      },
      (authError) => {
        resolved = true;
        window.clearTimeout(fallback);
        setChecking(false);
        setError(
          authError.message ||
            "Could not check the Firebase session. Please try signing in again.",
        );
      },
    );

    return () => {
      mountedRef.current = false;
      window.clearTimeout(fallback);
      unsubscribe();
    };
  }, [routeUser]);

  async function login(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setNotice("");
    setSubmitting(true);

    try {
      const credential = await signInWithEmailAndPassword(
        auth,
        email.trim(),
        password,
      );
      const token = await credential.user.getIdToken(true);

      if (mode === "admin") {
        let allowed = false;
        try {
          allowed = await verifyAdmin(token);
        } catch (verificationError) {
          if (verificationError instanceof DOMException && verificationError.name === "AbortError") {
            throw new Error("Admin verification timed out. Make sure the dev server is reachable from your phone and try again.");
          }
          throw verificationError;
        }

        if (!allowed) {
          await signOut(auth);
          setError(
            "This account does not have administrator access. Choose Inspector Login if this is an inspector account.",
          );
          return;
        }

        router.replace("/admin/dashboard");
      } else {
        let allowed = false;
        try {
          allowed = await verifyInspector(token);
        } catch (verificationError) {
          if (verificationError instanceof DOMException && verificationError.name === "AbortError") {
            throw new Error("Inspector verification timed out. Make sure the dev server is reachable from your phone and try again.");
          }
          throw verificationError;
        }

        if (!allowed) {
          await signOut(auth);
          setError(
            "Inspector access was not approved. Confirm that the inspector record uses this authentication UID, role is 'inspector', and status is 'active'.",
          );
          return;
        }

        router.replace("/inspector/dashboard");
      }

      setPassword("");
    } catch (loginError) {
      setError(
        loginError instanceof Error
          ? loginError.message
          : "Sign in failed. Please try again.",
      );
    } finally {
      setSubmitting(false);
      setChecking(false);
    }
  }

  async function resetPassword() {
    setError("");
    setNotice("");
    const address = email.trim();

    if (!address) {
      setError("Enter your email address first, then choose Reset password.");
      return;
    }

    setResetting(true);
    try {
      await sendPasswordResetEmail(auth, address);
      setNotice(
        "If an account exists for this email, Firebase has sent a password-reset message.",
      );
    } catch (resetError) {
      setError(
        resetError instanceof Error
          ? resetError.message
          : "Could not send the password-reset email.",
      );
    } finally {
      setResetting(false);
    }
  }

  if (checking) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-100 p-6 text-sm font-semibold text-slate-600">
        Checking account session…
      </main>
    );
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-100 p-5">
      <form
        onSubmit={login}
        className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-6 shadow-xl sm:p-8"
      >
        <p className="text-sm font-bold text-sky-600">CarPDIExpert CRM</p>
        <h1 className="mt-2 text-3xl font-black tracking-tight">Welcome back</h1>
        <p className="mt-2 text-sm text-slate-500">
          Choose your portal and sign in with your authorized account.
        </p>

        <div
          className="mt-6 grid grid-cols-2 rounded-xl bg-slate-100 p-1"
          role="tablist"
          aria-label="Login type"
        >
          <button
            type="button"
            role="tab"
            aria-selected={mode === "admin"}
            onClick={() => {
              setMode("admin");
              setError("");
              setNotice("");
            }}
            className={`rounded-lg px-3 py-3 text-sm font-bold transition ${
              mode === "admin"
                ? "bg-white text-sky-700 shadow-sm"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            Admin Login
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={mode === "inspector"}
            onClick={() => {
              setMode("inspector");
              setError("");
              setNotice("");
            }}
            className={`rounded-lg px-3 py-3 text-sm font-bold transition ${
              mode === "inspector"
                ? "bg-white text-sky-700 shadow-sm"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            Inspector Login
          </button>
        </div>

        <div className="mt-5 rounded-xl border border-sky-100 bg-sky-50 p-3">
          <p className="text-sm font-bold text-slate-800">
            {mode === "admin" ? "Administrator portal" : "Inspector portal"}
          </p>
          <p className="mt-1 text-xs leading-5 text-slate-600">
            {mode === "admin"
              ? "Access bookings, schedules, inspectors, slots and reports."
              : "Use the email and password created for you. Your inspector account must be active."}
          </p>
        </div>

        <label className="mt-5 block text-sm font-semibold text-slate-700">
          Email
          <input
            type="email"
            autoComplete="username"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-3 outline-none transition focus:border-sky-400 focus:ring-4 focus:ring-sky-100"
            placeholder="you@example.com"
          />
        </label>

        <label className="mt-4 block text-sm font-semibold text-slate-700">
          Password
          <input
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-3 outline-none transition focus:border-sky-400 focus:ring-4 focus:ring-sky-100"
            placeholder="Enter your password"
          />
        </label>

        {error && (
          <p
            role="alert"
            className="mt-4 rounded-xl border border-rose-100 bg-rose-50 p-3 text-sm leading-5 text-rose-700"
          >
            {error}
          </p>
        )}
        {notice && (
          <p
            role="status"
            className="mt-4 rounded-xl border border-emerald-100 bg-emerald-50 p-3 text-sm leading-5 text-emerald-700"
          >
            {notice}
          </p>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="mt-5 w-full rounded-xl bg-blue-600 px-4 py-3 font-bold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {submitting
            ? "Verifying…"
            : mode === "admin"
              ? "Sign in as Admin"
              : "Sign in as Inspector"}
        </button>

        <button
          type="button"
          onClick={resetPassword}
          disabled={resetting}
          className="mt-3 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm font-bold text-slate-700 transition hover:border-sky-300 hover:text-sky-700 disabled:opacity-60"
        >
          {resetting ? "Sending reset email…" : "Reset password"}
        </button>

        <p className="mt-5 text-center text-xs leading-5 text-slate-400">
          Access is verified against the portal&apos;s authorized account
          records. Only eligible accounts can continue.
        </p>
      </form>
    </main>
  );
}
