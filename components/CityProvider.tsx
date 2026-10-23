"use client";

import {
  createContext,
  Suspense,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { usePathname } from "next/navigation";
import { CITY_OPTIONS } from "@/lib/cityOptions";

type CityContextValue = {
  city: string;
  setCity: (city: string) => void;
};

const DEFAULT_CITY = CITY_OPTIONS.some((item) => item.slug === "mumbai")
  ? "mumbai"
  : CITY_OPTIONS[0]?.slug ?? "";

const CityContext = createContext<CityContextValue>({
  city: DEFAULT_CITY,
  setCity: () => {},
});

function isKnownCity(
  value: string | null | undefined,
): value is string {
  return Boolean(
    value && CITY_OPTIONS.some((item) => item.slug === value),
  );
}

/**
 * Synchronizes the selected city with the current URL.
 *
 * This component uses usePathname(), so it must remain inside Suspense.
 */
function CityPathSync() {
  const pathname = usePathname() ?? "";
  const { setCity } = useCity();

  useEffect(() => {
    const firstSegment =
      pathname.split("/").filter(Boolean)[0] ?? "";

    // Automatically recognize every city configured in CITY_OPTIONS.
    const routeCity = isKnownCity(firstSegment)
      ? firstSegment
      : null;

    const savedCity = localStorage.getItem("carpdiexpert-city");

    const nextCity =
      routeCity ??
      (isKnownCity(savedCity) ? savedCity : DEFAULT_CITY);

    setCity(nextCity);
  }, [pathname, setCity]);

  return null;
}

export function CityProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [city, setCityState] = useState(DEFAULT_CITY);

  const setCity = useCallback((value: string) => {
    const nextCity = isKnownCity(value)
      ? value
      : DEFAULT_CITY;

    setCityState(nextCity);

    localStorage.setItem("carpdiexpert-city", nextCity);

    document.cookie =
      `carpdiexpert-city=${nextCity}; path=/; max-age=31536000; samesite=lax`;
  }, []);

  return (
    <CityContext.Provider value={{ city, setCity }}>
      <Suspense fallback={null}>
        <CityPathSync />
      </Suspense>

      {children}
    </CityContext.Provider>
  );
}

export function useCity() {
  return useContext(CityContext);
}
