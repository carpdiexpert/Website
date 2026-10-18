"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { CITY_OPTIONS } from "@/lib/cityOptions";

type CityContextValue = { city: string; setCity: (city: string) => void };
const DEFAULT_CITY = CITY_OPTIONS.some((item) => item.slug === "mumbai")
  ? "mumbai"
  : CITY_OPTIONS[0]?.slug ?? "";
const CityContext = createContext<CityContextValue>({
  city: DEFAULT_CITY,
  setCity: () => {},
});

function isKnownCity(value: string | null | undefined): value is string {
  return Boolean(value && CITY_OPTIONS.some((item) => item.slug === value));
}

export function CityProvider({ children }: { children: React.ReactNode }) {
  const [city, setCityState] = useState(DEFAULT_CITY);
  const pathname = usePathname();

  useEffect(() => {
    const firstSegment = pathname.split("/").filter(Boolean)[0] ?? "";
    // Any future city added to lib/cities.ts is automatically recognized here.
    const routeCity = isKnownCity(firstSegment) ? firstSegment : null;
    const savedCity = localStorage.getItem("carpdiexpert-city");
    const nextCity = routeCity ?? (isKnownCity(savedCity) ? savedCity : DEFAULT_CITY);
    setCityState(nextCity);
    localStorage.setItem("carpdiexpert-city", nextCity);
    document.cookie = `carpdiexpert-city=${nextCity}; path=/; max-age=31536000; samesite=lax`;
  }, [pathname]);

  const setCity = useCallback((value: string) => {
    const nextCity = isKnownCity(value) ? value : DEFAULT_CITY;
    setCityState(nextCity);
    localStorage.setItem("carpdiexpert-city", nextCity);
    document.cookie = `carpdiexpert-city=${nextCity}; path=/; max-age=31536000; samesite=lax`;
  }, []);

  return (
    <CityContext.Provider value={{ city, setCity }}>
      {children}
    </CityContext.Provider>
  );
}

export function useCity() {
  return useContext(CityContext);
}
