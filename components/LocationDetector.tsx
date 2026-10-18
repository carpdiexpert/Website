
"use client";

import { useEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import { CITIES } from "@/lib/cities";

export default function LocationDetector() {
  const pathname = usePathname();
  const router = useRouter();
  const checked = useRef(false);

  useEffect(() => {
    if (pathname !== "/" || checked.current) return;

    checked.current = true;
    let cancelled = false;

    async function detectCity() {
      try {
        const response = await fetch("/api/location", {
          cache: "no-store",
        });

        if (!response.ok) return;

        const data: { city?: string | null } = await response.json();
        if (cancelled || !data.city) return;

        const citySlug = Object.keys(CITIES).find((slug) => {
          const configuredName = CITIES[slug as keyof typeof CITIES].name;
          return configuredName.toLowerCase() === data.city!.trim().toLowerCase();
        });

        if (citySlug) router.replace(`/${citySlug}`);
      } catch (error) {
        console.error("City detection failed:", error);
      }
    }

    void detectCity();

    return () => {
      cancelled = true;
    };
  }, [pathname, router]);

  return null;
}
