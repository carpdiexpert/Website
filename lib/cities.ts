
export const CITIES = {
  pune: {
    name: "Pune",
    state: "Maharashtra",

    newCars: {
      standardCars: 2499,
      luxuryCars: 3499, // Placeholder
      evCars: 2899, // Placeholder
    },

    usedCar: 3199,
  },

  mumbai: {
    name: "Mumbai",
    state: "Maharashtra",

    newCars: {
      standardCars: 2699,
      luxuryCars: 3699, // Placeholder
      evCars: 2999, // Placeholder
    },

    usedCar: 3299,
  },
  nagpur: {
    name: "Nagpur",
    state: "Maharashtra",

    newCars: {
      standardCars: 2699,
      luxuryCars: 3699, // Placeholder
      evCars: 2999, // Placeholder
    },

    usedCar: 3299,
  },
  nashik: {
    name: "Nashik",
    state: "Maharashtra",

    newCars: {
      standardCars: 2699,
      luxuryCars: 3699, // Placeholder
      evCars: 2999, // Placeholder
    },

    usedCar: 3299,
  },

  vadodara: {
    name: "Vadodara",
    state: "Gujarat",

    newCars: {
      standardCars: 2799,
      luxuryCars: 3799, // Placeholder
      evCars: 3099, // Placeholder
    },

    usedCar: 3399,
  },

  ahmedabad: {
    name: "Ahmedabad",
    state: "Gujarat",

    newCars: {
      standardCars: 2799,
      luxuryCars: 3799, // Placeholder
      evCars: 3099, // Placeholder
    },

    usedCar: 3399,
  },

} as const;

export type CitySlug = keyof typeof CITIES;

export type CityConfig = (typeof CITIES)[CitySlug];

export function getCity(slug: string) {
  return CITIES[slug.toLowerCase() as CitySlug] ?? null;
}
