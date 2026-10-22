"use client";

import { useCallback, useState } from "react";
import Link from "next/link";
import type { User } from "firebase/auth";
import InspectorAppShell from "@/app/inspector/InspectorAppShell";
import { useInspectorSession } from "@/lib/useInspectorSession";

export default function InspectorProfilePage() {
  const { user, profile, loading, refreshProfile } = useInspectorSession();
  const [savingLocation, setSavingLocation] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const updateLocation = useCallback(async (currentUser: User) => {
    setMessage(""); setError("");
    if (!navigator.geolocation) { setError("This browser does not support location access. Use a modern browser on HTTPS or localhost."); return; }
    setSavingLocation(true);
    navigator.geolocation.getCurrentPosition(async (position) => {
      try {
        const lat = position.coords.latitude, lng = position.coords.longitude;
        if (!Number.isFinite(lat) || lat < -90 || lat > 90 || !Number.isFinite(lng) || lng < -180 || lng > 180) throw new Error("The device returned invalid coordinates. Please retry.");
        const token = await currentUser.getIdToken();
        const response = await fetch("/api/inspector/location", { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }, body: JSON.stringify({ lat, lng }), cache: "no-store" });
        const result = await response.json().catch(() => null);
        if (!response.ok || !result?.ok) throw new Error(result?.error || "Could not save your location.");
        setMessage("Location saved successfully to your inspector record.");
        await refreshProfile();
      } catch (e) { setError(e instanceof Error ? e.message : "Could not save location. Please try again."); }
      finally { setSavingLocation(false); }
    }, (e) => {
      setError(e.code === e.PERMISSION_DENIED ? "Location permission was denied. Enable it in your browser/site settings, then try again." : e.code === e.POSITION_UNAVAILABLE ? "Your device could not determine its location. Check location services and try again." : e.code === e.TIMEOUT ? "Location lookup timed out. Move to an area with better GPS/network reception and retry." : "Could not access your location. Check browser permissions and try again.");
      setSavingLocation(false);
    }, { enableHighAccuracy: true, timeout: 15000, maximumAge: 60000 });
  }, [refreshProfile]);

  if (loading || !user || !profile) return <main className="flex min-h-screen items-center justify-center bg-slate-100 p-6"><div className="rounded-2xl border border-slate-200 bg-white px-5 py-4 text-sm font-semibold text-slate-600 shadow-sm">Verifying inspector access…</div></main>;

  return <InspectorAppShell profile={profile}>
            <section className="mb-7 overflow-hidden rounded-3xl bg-gradient-to-br from-[#0B1220] via-slate-900 to-blue-950 p-6 text-white shadow-lg sm:p-8">
      <p className="text-xs font-bold uppercase tracking-[.2em] text-sky-300">Account</p>
      <h1 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl">My Profile</h1>
      <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300">Your account details and registered device location.</p>
    </section>
    <div className="grid gap-4 sm:grid-cols-2">
      <ProfileField label="Inspector name" value={profile.name || "Not provided"} />
      <ProfileField label="Email address" value={profile.email || "Not provided"} />
      <ProfileField label="Mobile number" value={profile.mobile || "Not provided"} />
      <ProfileField label="Assigned city" value={profile.city || "Not assigned"} />
      <ProfileField label="Account status" value="Active inspector" />
      <ProfileField label="Inspector UID" value={profile.uid} />
    </div>
    <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between"><div><h2 className="text-lg font-black">Current device location</h2><p className="mt-1 max-w-2xl text-sm leading-6 text-slate-500">Allow browser location access to save the inspector's current latitude and longitude in the same document in the Firestore <code>inspectors</code> collection. This does not change your assigned city.</p><p className="mt-4 break-all font-mono text-sm text-slate-700">{typeof profile.lat === "number" && typeof profile.lng === "number" ? `Latitude: ${profile.lat.toFixed(6)} · Longitude: ${profile.lng.toFixed(6)}` : "Latitude and longitude have not been saved."}</p></div><button type="button" onClick={() => user && void updateLocation(user)} disabled={savingLocation} className="inline-flex min-h-11 shrink-0 items-center justify-center rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-extrabold text-white shadow-sm hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60">{savingLocation ? "Getting location…" : "Update my location"}</button></div>
      {message && <p role="status" className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm font-semibold text-emerald-800">{message}</p>}
      {error && <p role="alert" className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm font-semibold text-amber-900">{error} You can still use the rest of the inspector workspace.</p>}
    </section>
    <div className="mt-6 flex flex-wrap gap-3">
      <Link
  href="/inspector/resetpassword"
  className="inline-flex min-h-12 items-center justify-center rounded-xl !bg-blue-600 px-4 py-3 text-sm font-bold !text-white shadow-sm transition-colors hover:!bg-blue-700"
>
  Request Password Reset
</Link>
      <Link href="/inspector/mypdis?filter=all" className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-700 hover:bg-slate-50">View My Assigned PDIs</Link></div>
  </InspectorAppShell>;
}
function ProfileField({ label, value }: { label: string; value: string }) { return <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-sm font-semibold text-slate-500">{label}</p><p className="mt-2 break-all text-base font-extrabold text-slate-900">{value}</p></div>; }
