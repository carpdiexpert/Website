"use client";

import { useCallback, useEffect, useState } from "react";
import { onAuthStateChanged, signOut, type User } from "firebase/auth";
import { useRouter } from "next/navigation";
import { auth } from "@/lib/firebase";

export type InspectorProfile = {
  uid: string;
  name: string;
  email: string;
  mobile?: string;
  city: string;
  lat?: number | null;
  lng?: number | null;
};

export function useInspectorSession() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<InspectorProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const verify = useCallback(async (currentUser: User) => {
    try {
      const token = await currentUser.getIdToken();
      const response = await fetch("/api/auth/inspector", {
        headers: { Authorization: `Bearer ${token}` },
        cache: "no-store",
      });
      const result = await response.json().catch(() => null);
      if (!response.ok || !result?.ok || !result?.inspector) {
        throw new Error("Inspector access is not active or authorized.");
      }
      const item = result.inspector;
      setUser(currentUser);
      setProfile({
        uid: String(item.uid ?? currentUser.uid),
        name: String(item.name ?? ""),
        email: String(item.email ?? currentUser.email ?? ""),
        mobile: typeof item.mobile === "string" ? item.mobile : "",
        city: String(item.city ?? ""),
        lat: typeof item.lat === "number" ? item.lat : null,
        lng: typeof item.lng === "number" ? item.lng : null,
      });
    } catch {
      setUser(null);
      setProfile(null);
      await signOut(auth).catch(() => undefined);
      router.replace("/login");
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (!currentUser) {
        setUser(null);
        setProfile(null);
        setLoading(false);
        router.replace("/login");
        return;
      }
      setLoading(true);
      void verify(currentUser);
    });
    return unsubscribe;
  }, [router, verify]);

  const refreshProfile = useCallback(async () => {
    if (user) await verify(user);
  }, [user, verify]);

  return { user, profile, loading, refreshProfile };
}
