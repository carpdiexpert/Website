
"use client";

import Link from "next/link";
import { useCity } from "@/components/CityProvider";
import { CITIES } from "@/lib/cities";
import { CITY_OPTIONS } from "@/lib/cityOptions";

const cityOptions = CITY_OPTIONS;

const inspectionTypes = [
  {
    id: "standard",
    number: "01",
    tag: "NEW VEHICLES",
    title: "Standard new-car PDI",
    description:
      "Check the visible condition of your new car before accepting delivery.",
    features: [
      "Exterior and body condition",
      "Interior and available features",
      "Tyres and visible components",
      "Delivery observations",
    ],
  },
  {
    id: "luxury",
    number: "02",
    tag: "PREMIUM VEHICLES",
    title: "Luxury-car PDI",
    description:
      "A dedicated inspection option for customers purchasing premium vehicles.",
    features: [
      "Exterior and paint observations",
      "Interior and feature checks",
      "Visible mechanical components",
      "Available diagnostic checks",
    ],
  },
  {
    id: "ev",
    number: "03",
    tag: "ELECTRIC VEHICLES",
    title: "EV inspection",
    description:
      "Review EV condition and supported electric-vehicle checks where access permits.",
    features: [
      "Exterior and interior condition",
      "Charging equipment observations",
      "Available EV diagnostic information",
      "Visible warning indicators",
    ],
  },
  {
    id: "used",
    number: "04",
    tag: "PRE-OWNED VEHICLES",
    title: "Used-car PPI",
    description:
      "Understand the observed condition of a used car before making a purchase decision.",
    features: [
      "Body and paint observations",
      "Interior and feature operation",
      "Tyres and visible components",
      "Available mechanical checks",
    ],
  },
];

export default function PricingPage() {
  const { city: selectedCity, setCity: setSelectedCity } = useCity();

  const city = CITIES[selectedCity as keyof typeof CITIES];
  const cityName =
    cityOptions.find((item) => item.slug === selectedCity)?.name ??
    (cityOptions[0]?.name ?? "Select a city");

  const cityHref = `/${selectedCity}`;

  const prices = city
    ? [
        city.newCars.standardCars,
        city.newCars.luxuryCars,
        city.newCars.evCars,
        city.usedCar,
      ]
    : null;

  return (
    <main className="overflow-hidden bg-white text-slate-900">
      {/* Hero */}
      <section className="relative overflow-hidden bg-[#0B1220] text-white">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-20 -top-24 h-80 w-80 rounded-full bg-blue-600/20 blur-3xl"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-32 left-1/4 h-80 w-80 rounded-full bg-sky-400/10 blur-3xl"
        />

        <div className="relative mx-auto max-w-[1440px] px-5 py-16 sm:px-8 sm:py-24 lg:px-12">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-sky-400">
            CarpdiExpert / Pricing
          </p>

          <div className="mt-5 grid items-end gap-8 lg:grid-cols-[1fr_auto]">
            <div>
              <h1 className="max-w-4xl text-4xl font-black leading-tight tracking-[-0.055em] sm:text-5xl lg:text-6xl">
                Clear pricing.
                <span className="mt-2 block text-sky-400">
                  More confident car buying.
                </span>
              </h1>

              <p className="mt-6 max-w-2xl text-base leading-8 text-slate-300 sm:text-lg">
                Explore inspection options for new cars, luxury vehicles,
                EVs and used cars. Select your city to see the available
                prices.
              </p>
            </div>

            {/* City selector */}
            <div className="w-full rounded-2xl border border-white/10 bg-white/[0.05] p-5 lg:min-w-64">
              <label
                htmlFor="pricing-city"
                className="block text-xs font-bold uppercase tracking-[0.16em] text-slate-300"
              >
                Select your city
              </label>

              <select
                id="pricing-city"
                value={selectedCity}
                onChange={(event) =>
                  setSelectedCity(event.target.value)
                }
                className="mt-3 min-h-12 w-full rounded-xl border border-white/15 bg-[#111c2e] px-4 text-sm font-semibold text-white outline-none transition focus:border-sky-400"
              >
                {cityOptions.map((option) => (
                  <option
                    key={option.slug}
                    value={option.slug}
                    className="bg-[#0B1220] text-white"
                  >
                    {option.name}
                  </option>
                ))}
              </select>

              <p className="mt-3 text-xs text-slate-400">
                Prices shown in Indian rupees (INR).
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing cards */}
      <section className="bg-slate-50 py-16 sm:py-24">
        <div className="mx-auto max-w-[1440px] px-5 sm:px-8 lg:px-12">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-blue-700">
                Inspection packages
              </p>
              <h2 className="mt-4 text-3xl font-black tracking-[-0.045em] sm:text-4xl">
                Pricing in {cityName}
              </h2>
              <p className="mt-3 max-w-2xl leading-7 text-slate-600">
                Choose the inspection that matches your next car purchase.
              </p>
            </div>

            <span className="inline-flex w-fit items-center gap-2 rounded-full border border-sky-100 bg-white px-4 py-2 text-xs font-bold text-blue-700">
              <span className="h-2 w-2 rounded-full bg-sky-400" />
              {cityName} pricing
            </span>
          </div>

          <div className="mt-10 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
            {inspectionTypes.map((item, index) => {
              const price = prices?.[index];

              return (
                <article
                  key={item.id}
                  className="group relative flex flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_4px_20px_rgba(15,23,42,0.04)] transition-all duration-300 hover:-translate-y-1 hover:border-sky-300 hover:shadow-[0_14px_35px_rgba(15,23,42,0.09)] sm:p-7"
                >
                  <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-blue-600 via-sky-400 to-transparent opacity-70 transition-opacity group-hover:opacity-100" />

                  <div className="flex items-start justify-between gap-3">
                    <span className="rounded-full border border-sky-100 bg-sky-50 px-3 py-1.5 text-[10px] font-bold tracking-wide text-blue-700">
                      {item.tag}
                    </span>
                    <span className="text-sm font-black text-slate-300">
                      {item.number}
                    </span>
                  </div>

                  <h3 className="mt-6 min-h-14 text-xl font-black leading-7 tracking-tight text-slate-900">
                    {item.title}
                  </h3>

                  <p className="mt-3 min-h-20 text-sm leading-6 text-slate-600">
                    {item.description}
                  </p>

                  <div className="mt-5 rounded-2xl border border-sky-100 bg-gradient-to-br from-sky-50 to-slate-50 p-5">
                    <p className="text-xs font-semibold text-slate-500">
                      Inspection price
                    </p>

                    {price !== undefined && price !== null ? (
                      <p className="mt-2 text-3xl font-black tracking-tight text-slate-950">
                        ₹{price.toLocaleString("en-IN")}
                      </p>
                    ) : (
                      <p className="mt-2 text-xl font-black text-slate-900">
                        On request
                      </p>
                    )}

                    <p className="mt-1 text-xs text-slate-500">
                      {price !== undefined && price !== null
                        ? "INR · Per inspection"
                        : "Contact us for a quote"}
                    </p>
                  </div>

                  <div className="mt-6 flex-1">
                    <p className="text-sm font-bold text-slate-900">
                      Inspection areas
                    </p>

                    <ul className="mt-4 space-y-3">
                      {item.features.map((feature) => (
                        <li
                          key={feature}
                          className="flex items-start gap-2.5 text-sm leading-6 text-slate-600"
                        >
                          <span className="mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-sky-50 text-xs font-bold text-blue-700">
                            ✓
                          </span>
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <Link
                    href={cityHref}
                    className="mt-7 inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-sky-400 px-5 text-sm font-bold text-[#0B1220] transition hover:bg-sky-300"
                  >
                    Enquire about inspection
                    <span aria-hidden="true">↗</span>
                  </Link>
                </article>
              );
            })}
          </div>

          <p className="mt-6 text-xs leading-6 text-slate-500">
            Inspection scope depends on vehicle condition, access and
            package. Confirm the included checks, availability and final
            price when booking.
          </p>
        </div>
      </section>

      {/* What's included */}
      <section className="py-16 sm:py-20">
        <div className="mx-auto grid max-w-[1440px] gap-10 px-5 sm:px-8 lg:grid-cols-2 lg:items-center lg:gap-16 lg:px-12">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-blue-700">
              Before you book
            </p>
            <h2 className="mt-4 text-3xl font-black tracking-[-0.045em] sm:text-4xl">
              Know what your inspection covers.
            </h2>
            <p className="mt-4 leading-7 text-slate-600">
              The checks available can vary by vehicle, package and
              inspection access. Confirm the scope with us before
              your appointment.
            </p>

            <Link
              href="/services"
              className="mt-6 inline-flex items-center gap-2 font-bold text-blue-700 transition hover:text-blue-900"
            >
              Compare inspection services <span aria-hidden="true">→</span>
            </Link>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
            {[
              [
                "Choose your vehicle type",
                "Select the service that best matches the car you are buying.",
              ],
              [
                "Confirm the location",
                "Choose your city and share the inspection address.",
              ],
              [
                "Agree on the inspection scope",
                "Confirm the checks, appointment and report arrangements.",
              ],
            ].map(([title, description], index) => (
              <div
                key={title}
                className={`flex gap-4 py-4 ${
                  index > 0 ? "border-t border-slate-100" : ""
                }`}
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-sky-50 text-sm font-black text-blue-700">
                  0{index + 1}
                </span>

                <div>
                  <h3 className="font-bold text-slate-900">{title}</h3>
                  <p className="mt-1 text-sm leading-6 text-slate-600">
                    {description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-5 pb-16 sm:px-8 sm:pb-20 lg:px-12">
        <div className="mx-auto flex max-w-[1440px] flex-col justify-between gap-6 rounded-3xl border border-slate-200 bg-[#0B1220] p-7 text-white shadow-lg sm:p-10 md:flex-row md:items-center">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-sky-400">
              Ready when you are
            </p>
            <h2 className="mt-3 text-2xl font-black tracking-tight sm:text-3xl">
              Make your next car decision with more confidence.
            </h2>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-300">
              Have questions about the right inspection for your car?
              Contact us to discuss your requirements.
            </p>
          </div>

          <Link
            href="/contact"
            className="inline-flex min-h-12 shrink-0 items-center justify-center gap-3 self-start rounded-full bg-sky-400 px-6 text-sm font-bold text-[#0B1220] transition hover:bg-sky-300 md:self-center"
          >
            Contact us <span aria-hidden="true">↗</span>
          </Link>
        </div>
      </section>
    </main>
  );
}
