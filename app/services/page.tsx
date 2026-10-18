import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";

import Link from "next/link";
import Image from "next/image";
import { CITIES } from "@/lib/cities";


export const metadata: Metadata = pageMetadata({
  title: "Car Inspection Services | PDI, Used Car PPI & EV Checks",
  description: "Explore CarpdiExpert car inspection services, including new-car pre-delivery inspection, luxury-car inspection, EV checks and used-car pre-purchase inspection.",
  path: "/services",
});

const services = [
  {
    id: "standard",
    number: "01",
    title: "Standard New-Car PDI",
    tag: "NEW VEHICLES",
    description:
      "Review the visible condition and relevant features of your new vehicle before accepting delivery.",
    checks: [
      "Exterior, paint and body condition",
      "Interior, features and controls",
      "Tyres and visible components",
      "Documentation and delivery observations",
    ],
  },
  {
    id: "luxury",
    number: "02",
    title: "Luxury-Car Inspection",
    tag: "PREMIUM VEHICLES",
    description:
      "A detailed inspection option for customers purchasing higher-value vehicles.",
    checks: [
      "Exterior, paint and finish observations",
      "Interior condition and feature checks",
      "Visible mechanical components",
      "Available diagnostic checks",
    ],
  },
  {
    id: "ev",
    number: "03",
    title: "Electric Vehicle Inspection",
    tag: "ELECTRIC VEHICLES",
    description:
      "Vehicle condition checks with additional attention to EV-specific components where inspection access permits.",
    checks: [
      "Exterior and interior condition",
      "Charging equipment observations",
      "Available EV diagnostic information",
      "Visible warning indicators",
    ],
  },
  {
    id: "used",
    number: "04",
    title: "Used-Car PPI",
    tag: "PRE-OWNED VEHICLES",
    description:
      "Understand the observed condition of a used car before you commit to buying it, with attention to signs of wear, repairs and potential concerns.",
    checks: [
      "Rust, corrosion and visible underbody concerns",
      "Accident damage and body-panel alignment",
      "Repaint, dents, scratches and paint differences",
      "Odometer inconsistencies and available records",
      "Interior wear, tyres and visible components",
      "Available mechanical and diagnostic checks",
    ],
  },
];

const heroFeatures = [
  {
    number: "5,000+",
    title: "Inspections completed",
    description: "New and used vehicles inspected.",
  },
  {
    number: "UNBIASED",
    title: "Independent reports",
    description: "No dealership affiliation influencing findings.",
  },
  {
    number: "400-POINT",
    title: "Comprehensive checks",
    description: "Structured checks across relevant vehicle areas.",
  },
  {
    number: "AI-ASSISTED",
    title: "Report analysis",
    description: "AI-assisted insights included in the report.",
  },
];

const inspectionHighlights = [
  {
    number: "01",
    title: "Accident and structural clues",
    description:
      "Look for visible repair evidence, inconsistent panel gaps, paint differences and signs of previous damage.",
  },
  {
    number: "02",
    title: "Rust and corrosion",
    description:
      "Check accessible areas for visible rust, corrosion and other signs of deterioration.",
  },
  {
    number: "03",
    title: "Repaint, dents and scratches",
    description:
      "Review visible paintwork for colour variations, scratches, dents and signs of refinishing.",
  },
  {
    number: "04",
    title: "Odometer and wear consistency",
    description:
      "Compare visible wear and available records with the displayed mileage, while recognising that tampering may not always be detectable.",
  },
  {
    number: "05",
    title: "Mechanical and diagnostic checks",
    description:
      "Review accessible mechanical components, warning indicators and available diagnostic information.",
  },
  {
    number: "06",
    title: "Report with AI-assisted analysis",
    description:
      "Present documented observations and, where provided by your service, AI-assisted analysis to help buyers understand potential concerns.",
  },
];

export default function ServicesPage() {
  const cities = Object.entries(CITIES);

  return (
    <main className="bg-white text-slate-900">
      {/* Hero */}
      <section className="relative overflow-hidden bg-[#0B1220] text-white">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-20 -top-24 h-80 w-80 rounded-full bg-blue-600/20 blur-3xl"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-28 left-1/4 h-80 w-80 rounded-full bg-sky-400/10 blur-3xl"
        />

        <div className="relative mx-auto max-w-7xl px-5 py-16 sm:px-8 sm:py-24">
          <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-14">
            {/* Left: hero copy */}
            <div className="relative z-10">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-sky-400">
                CarPDIExpert / Services
              </p>

              <h1 className="mt-5 max-w-3xl text-4xl font-black leading-tight tracking-[-0.055em] sm:text-5xl lg:text-6xl">
                Inspect with confidence.
                <span className="mt-2 block text-sky-400">
                  Decide with clarity.
                </span>
              </h1>

              <p className="mt-6 max-w-2xl text-base leading-8 text-slate-300 sm:text-lg">
                Independent vehicle inspections for new cars, used cars, luxury
                vehicles and EVs. Get documented observations about the vehicle&apos;s
                condition before making your buying decision.
              </p>

              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  href="#inspection-options"
                  className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-sky-400 px-7 py-3 text-sm font-bold text-[#0B1220] transition hover:bg-sky-300"
                >
                  Compare our services <span aria-hidden="true">↓</span>
                </Link>

                <Link
                  href="#city-pricing"
                  className="inline-flex min-h-12 items-center justify-center rounded-full border border-white/20 bg-white/[0.04] px-7 py-3 text-sm font-bold text-white transition hover:border-sky-400/60 hover:bg-sky-400/10"
                >
                  View city pricing
                </Link>
              </div>
            </div>

            {/* Right: single hero image */}
            <div className="relative mx-auto w-full max-w-xl">
              <div aria-hidden="true" className="pointer-events-none absolute -inset-5 rounded-[2.5rem] bg-sky-400/10 blur-2xl" />
              <div className="relative h-[280px] overflow-hidden rounded-[2rem] border border-white/10 bg-slate-800/70 shadow-[0_24px_70px_rgba(0,0,0,0.35)] sm:h-[360px] lg:h-[420px]">
                <Image
                  src="/car-services.png"
                  alt="Car inspection services"
                  fill
                  priority
                  sizes="(max-width: 1024px) 90vw, 560px"
                  className="object-cover"
                />
                <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-[#0B1220]/40 via-transparent to-transparent" />
              </div>
            </div>
          </div>

          {/* Keep the four compact horizontal feature cards with a gentle staggered bounce */}
          <div className="mt-10 grid max-w-6xl gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {heroFeatures.map((feature, index) => (
              <article
                key={feature.title}
                className="rounded-2xl border border-white/10 bg-white/[0.045] p-4 backdrop-blur-sm transition hover:border-sky-400/30 hover:bg-white/[0.07] motion-safe:animate-[bounce_5s_ease-in-out_infinite]"
                style={{ animationDelay: `${index * 180}ms`, animationDuration: `${5 + index * 0.25}s` }}
              >
                <p className="text-lg font-black tracking-tight text-sky-300 sm:text-xl">
                  {feature.number}
                </p>
                <h2 className="mt-2 text-sm font-bold text-white">
                  {feature.title}
                </h2>
                <p className="mt-2 text-sm leading-6 text-slate-400">
                  {feature.description}
                </p>
              </article>
            ))}
          </div>

          <div className="mt-6 flex items-start gap-3 rounded-2xl border border-sky-400/15 bg-sky-400/[0.05] p-4 sm:p-5">
            <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-sky-400/10 text-sky-300">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                className="h-5 w-5"
                aria-hidden="true"
              >
                <path
                  d="M12 3 19 6v5c0 4.5-2.9 7.7-7 10-4.1-2.3-7-5.5-7-10V6z"
                  strokeLinejoin="round"
                />
                <path
                  d="m9 12 2 2 4-4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
            <div>
              <p className="text-sm font-bold text-white">
                Independent findings. Your buying decision.
              </p>
              <p className="mt-1 text-sm leading-6 text-slate-300">
                Our inspection findings are intended to help buyers make
                informed decisions, not to promote a dealership&apos;s sale.
                Inspections are limited to the agreed scope and what can be
                accessed or observed.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Service cards */}
      <section
        id="inspection-options"
        className="scroll-mt-24 bg-slate-50/80 py-16 sm:py-24"
      >
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <div className="max-w-2xl">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-blue-700">
              Inspection options
            </p>
            <h2 className="mt-4 text-3xl font-black tracking-tight sm:text-4xl">
              Choose your vehicle type.
            </h2>
            <p className="mt-4 leading-7 text-slate-600">
              Compare the inspection options and understand the intended scope
              before checking pricing for your city.
            </p>
          </div>

          <div className="mt-10 grid gap-6 md:grid-cols-2">
            {services.map((service) => (
              <article
                key={service.id}
                className="group relative overflow-hidden rounded-3xl border border-slate-200/90 bg-white p-6 shadow-[0_4px_20px_rgba(15,23,42,0.04)] transition-all duration-300 hover:-translate-y-1 hover:border-sky-300 hover:shadow-[0_14px_35px_rgba(15,23,42,0.09)] sm:p-8"
              >
                <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-blue-600 via-sky-400 to-transparent opacity-70 transition-opacity group-hover:opacity-100" />

                <div className="flex items-start justify-between gap-4">
                  <div>
                    <span className="inline-flex rounded-full border border-sky-100 bg-sky-50 px-3 py-1.5 text-xs font-bold tracking-wide text-blue-700">
                      {service.tag}
                    </span>

                    <h3 className="mt-4 text-2xl font-black tracking-tight text-slate-900">
                      {service.title}
                    </h3>
                  </div>

                  <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-slate-100 bg-slate-50 text-lg font-black text-slate-400 transition group-hover:border-sky-100 group-hover:bg-sky-50 group-hover:text-blue-700">
                    {service.number}
                  </span>
                </div>

                <p className="mt-4 leading-7 text-slate-600">
                  {service.description}
                </p>

                <div className="mt-6 rounded-2xl border border-sky-100/80 bg-gradient-to-br from-sky-50/80 to-slate-50 p-5 sm:p-6">
                  <p className="flex items-center gap-2 text-sm font-bold text-slate-900">
                    <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-white text-blue-700 shadow-sm">
                      ✓
                    </span>
                    Inspection areas
                  </p>

                  <ul className="mt-4 space-y-3">
                    {service.checks.map((check) => (
                      <li
                        key={check}
                        className="flex items-start gap-3 text-sm leading-6 text-slate-600"
                      >
                        <span className="mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-white text-xs font-bold text-blue-700 shadow-sm ring-1 ring-sky-100">
                          ✓
                        </span>
                        <span>{check}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <Link
                  href="#city-pricing"
                  className="mt-6 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-800 transition hover:border-sky-300 hover:bg-sky-50 hover:text-blue-700"
                >
                  View city pricing
                  <span className="transition-transform group-hover:translate-x-1">
                    →
                  </span>
                </Link>
              </article>
            ))}
          </div>

          <p className="mt-6 text-sm leading-6 text-slate-500">
            The actual inspection checklist depends on the vehicle, access and
            selected package. Odometer tampering, hidden damage and internal
            defects may not always be detectable through a visual inspection.
            Confirm the scope when booking.
          </p>
        </div>
      </section>

      {/* Used-car inspection detail */}
      <section className="bg-white py-16 sm:py-20">
        <div className="mx-auto grid max-w-7xl gap-10 px-5 sm:px-8 lg:grid-cols-[0.8fr_1.2fr] lg:items-center lg:gap-16">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-blue-700">
              Look beyond appearances
            </p>
            <h2 className="mt-4 text-3xl font-black tracking-tight sm:text-4xl">
              Used-car checks that look for more than a shiny exterior.
            </h2>
            <p className="mt-5 leading-7 text-slate-600">
              A used car can look good at first glance and still have signs of
              wear or previous repairs. Our inspection process records relevant
              observations within the agreed scope to help you ask better
              questions before buying.
            </p>

            <Link
              href="/#book-inspection"
              className="mt-7 inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-sky-400 px-6 py-3 text-sm font-bold text-[#0B1220] transition hover:bg-sky-300"
            >
              Book an inspection <span aria-hidden="true">↗</span>
            </Link>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {inspectionHighlights.map((item) => (
              <article
                key={item.number}
                className="rounded-2xl border border-slate-200 bg-slate-50 p-5 transition hover:border-sky-300 hover:bg-sky-50/50"
              >
                <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-[#0B1220] text-xs font-black text-sky-300">
                  {item.number}
                </span>
                <h3 className="mt-4 font-bold text-slate-900">
                  {item.title}
                </h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  {item.description}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* City pricing — dark cards */}
      <section
        id="city-pricing"
        className="scroll-mt-24 bg-[#0B1220] py-16 text-white sm:py-20"
      >
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-sky-400">
                Pricing by location
              </p>

              <h2 className="mt-4 text-3xl font-black tracking-tight sm:text-4xl">
                Find your city.
              </h2>

              <p className="mt-4 max-w-2xl leading-7 text-slate-300">
                Select a location to view the inspection options and rates
                configured for that city.
              </p>
            </div>

            <span className="inline-flex w-fit items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-xs font-semibold text-slate-300">
              <span className="h-2 w-2 rounded-full bg-sky-400" />
              Select your location
            </span>
          </div>

          <div className="mt-9 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {cities.map(([slug, city]) => (
              <Link
                key={slug}
                href={`/${slug}`}
                className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.045] p-5 transition duration-300 hover:-translate-y-1 hover:border-sky-400/50 hover:bg-white/[0.075] hover:shadow-lg hover:shadow-black/10"
              >
                <div
                  aria-hidden="true"
                  className="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-sky-400 via-blue-500 to-transparent opacity-60 transition group-hover:opacity-100"
                />

                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm text-slate-400">{city.state}</p>
                    <h3 className="mt-1 text-xl font-bold text-white transition group-hover:text-sky-300">
                      {city.name}
                    </h3>
                  </div>

                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] text-sky-300 transition group-hover:border-sky-400/30 group-hover:bg-sky-400/10">
                    ↗
                  </span>
                </div>

                <div className="mt-6 flex items-center justify-between border-t border-white/10 pt-4">
                  <span className="text-sm font-semibold text-slate-300 transition group-hover:text-white">
                    View services and prices
                  </span>
                  <span className="text-sky-400 transition-transform group-hover:translate-x-1">
                    →
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-5 py-16 sm:px-8 sm:py-20">
        <div className="mx-auto flex max-w-7xl flex-col justify-between gap-7 rounded-3xl border border-slate-200 bg-[#0B1220] px-6 py-10 text-white sm:px-10 sm:py-12 md:flex-row md:items-center">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-sky-400">
              Need a little guidance?
            </p>
            <h2 className="mt-3 text-2xl font-black sm:text-3xl">
              Not sure which inspection you need?
            </h2>
            <p className="mt-3 max-w-2xl leading-7 text-slate-300">
              Start with your vehicle type and location, then confirm the
              appropriate inspection scope before booking.
            </p>
          </div>

          <Link
            href="/pricing"
            className="inline-flex min-h-12 shrink-0 items-center justify-center gap-2 self-start rounded-full bg-sky-400 px-6 py-3 text-sm font-bold text-[#0B1220] transition hover:bg-sky-300 md:self-center"
          >
            Explore inspection pricing <span aria-hidden="true">↗</span>
          </Link>
        </div>
      </section>
    </main>
  );
}
