import { CITIES } from "@/lib/cities";

/**
 * Canonical dropdown options. Add a city only in lib/cities.ts; every selector
 * derives its options from this list. Slugs are object keys, so each is unique.
 */
const entries = Object.entries(CITIES).map(([slug, city]) => ({
  slug,
  name: city.name,
}));

export const CITY_OPTIONS = Array.from(
  new Map(entries.map((city) => [city.slug, city])).values(),
);
