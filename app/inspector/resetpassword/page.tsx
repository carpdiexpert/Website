"use client";

import { useState } from "react";
import Link from "next/link";
import { sendPasswordResetEmail } from "firebase/auth";
import InspectorAppShell from "@/app/inspector/InspectorAppShell";
import { useInspectorSession } from "@/lib/useInspectorSession";
import { auth } from "@/lib/firebase";

export default function InspectorResetPasswordPage() {
  const { user, profile, loading } = useInspectorSession();
  const [sending, setSending] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function sendReset() {
    setMessage(""); setError("");
    const email = profile?.email || user?.email;
    if (!email) { setError("No email address is associated with this inspector account. Contact your administrator."); return; }
    setSending(true);
    try {
      await sendPasswordResetEmail(auth, email);
      setMessage(`If an account exists for ${email}, Firebase has sent a password-reset email. Check your inbox and spam folder.`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not send the password-reset email. Please try again.");
    } finally { setSending(false); }
  }

  if (loading || !user || !profile) return <main className="flex min-h-screen items-center justify-center bg-slate-100 p-6"><div className="rounded-2xl border border-slate-200 bg-white px-5 py-4 text-sm font-semibold text-slate-600 shadow-sm">Verifying inspector access…</div></main>;

  return <InspectorAppShell profile={profile}>
                <section className="mb-7 overflow-hidden rounded-3xl bg-gradient-to-br from-[#0B1220] via-slate-900 to-blue-950 p-6 text-white shadow-lg sm:p-8">
      <p className="text-xs font-bold uppercase tracking-[.2em] text-sky-300">Account security</p>
      <h1 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl">Request Password Reset</h1>
      <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300">Send a secure password reset link to the email registered with your inspector account.</p>
    </section>
    <section className="max-w-2xl rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8"><div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-sky-50 text-2xl text-sky-700">✉</div><h2 className="mt-4 text-xl font-black">Reset your password</h2><p className="mt-2 text-sm leading-6 text-slate-600">Registered email</p><p className="mt-1 break-all font-bold text-slate-900">{profile.email || user.email || "No email available"}</p><button type="button" onClick={() => void sendReset()} disabled={sending} className="mt-6 inline-flex min-h-12 items-center justify-center rounded-xl bg-blue-600 px-5 py-3 text-sm font-extrabold text-white shadow-sm hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60">{sending ? "Sending email…" : "Send password reset email"}</button>{message && <p role="status" className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm font-semibold text-emerald-800">{message}</p>}{error && <p role="alert" className="mt-4 rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm font-semibold text-rose-800">{error}</p>}</section>
  </InspectorAppShell>;
}
