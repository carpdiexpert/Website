
"use client";

import Link from "next/link";
import { useCity } from "@/components/CityProvider";
import { CITIES } from "@/lib/cities";
import { CITY_OPTIONS } from "@/lib/cityOptions";

const services = [
  {
    number: "01",
    code: "PDI / STANDARD",
    title: "New-car inspection",
    description:
      "Review your new vehicle before accepting delivery, with checks based on the agreed inspection scope.",
  },
  {
    number: "02",
    code: "PDI / PREMIUM",
    title: "Luxury-car inspection",
    description:
      "A dedicated inspection option for customers purchasing premium vehicles.",
  },
  {
    number: "03",
    code: "EV / ELECTRIC",
    title: "Electric vehicles",
    description:
      "Review vehicle condition and available EV-related checks where supported.",
  },
  {
    number: "04",
    code: "PPI / PRE-OWNED",
    title: "Used-car inspection",
    description:
      "Understand observable vehicle condition before making a pre-owned car purchase.",
  },
];

const processSteps = [
  {
    number: "01",
    title: "Book your inspection",
    time: "Booking",
    text: "Choose your service and share the vehicle, location and preferred appointment time.",
  },
  {
    number: "02",
    title: "Inspector assigned",
    time: "Coordination",
    text: "We coordinate an inspector for your selected location and inspection request.",
  },
  {
    number: "03",
    title: "Thorough vehicle check",
    time: "Inspection",
    text: "The inspector reviews the agreed checkpoints and records relevant observations.",
  },
  {
    number: "04",
    title: "Receive your report",
    time: "Report",
    text: "Review the inspection findings and any available AI-assisted analysis to help inform your decision.",
  },
];

const heroStats = [
  { value: "5,000+", label: "New and used-car inspections" },
  { value: "400-point", label: "Comprehensive inspection checks" },
  { value: "Independent", label: "Unbiased inspection approach" },
  { value: "AI-assisted", label: "Report analysis" },
];

const inspectionAreas = [
  {
    number: "01",
    title: "Engine and mechanical",
    description:
      "Review accessible engine components, visible leaks, condition indicators and relevant mechanical observations.",
    icon: "⚙",
  },
  {
    number: "02",
    title: "Accident damage",
    description:
      "Look for visible signs of previous repairs, panel misalignment, inconsistent gaps and potential accident-related damage.",
    icon: "◇",
  },
  {
    number: "03",
    title: "Paint, dents and scratches",
    description:
      "Examine visible paint differences, repainting, scratches, dents and exterior body condition.",
    icon: "▦",
  },
  {
    number: "04",
    title: "Rust and corrosion",
    description:
      "Check accessible areas for visible rust, corrosion and other signs of deterioration.",
    icon: "◉",
  },
  {
    number: "05",
    title: "Mileage consistency",
    description:
      "Compare displayed mileage with available records and observable wear where information is available.",
    icon: "↗",
  },
  {
    number: "06",
    title: "Safety and electrical",
    description:
      "Review accessible safety-related components, electrical features and visible warning indicators.",
    icon: "ϟ",
  },
  {
    number: "07",
    title: "Wheels and tyres",
    description:
      "Inspect tyre condition, visible wear, wheels and other accessible components.",
    icon: "◌",
  },
  {
    number: "08",
    title: "OBD-2 and diagnostics",
    description:
      "Review available diagnostic information when the vehicle and equipment support the relevant checks.",
    icon: "⌁",
  },
];

const reportFeatures = [
  {
    number: "01",
    title: "Documented observations",
    description:
      "Review the findings recorded by the inspector across the agreed inspection scope.",
  },
  {
    number: "02",
    title: "AI-assisted analysis",
    description:
      "AI-assisted insights can help organise and explain available inspection findings and potential concerns.",
  },
  {
    number: "03",
    title: "Understand potential risks",
    description:
      "Use the report to identify areas that may need clarification, further testing or professional assessment.",
  },
];

export default function HomePage() {
  const { city: selectedCity, setCity: setSelectedCity } = useCity();

  const city =
    selectedCity in CITIES
      ? CITIES[selectedCity as keyof typeof CITIES]
      : null;

  const cityName =
    CITY_OPTIONS.find((item) => item.slug === selectedCity)?.name ??
    CITY_OPTIONS[0]?.name ??
    "Select a city";

  const cityHref = `/${selectedCity}`;

  const priceRows = city
    ? [
        {
          label: "Standard new-car PDI",
          price: city.newCars.standardCars,
        },
        {
          label: "Luxury-car PDI",
          price: city.newCars.luxuryCars,
        },
        {
          label: "EV inspection",
          price: city.newCars.evCars,
        },
        {
          label: "Used-car PPI",
          price: city.usedCar,
        },
      ]
    : [];

  return (
    <main className="overflow-hidden bg-white text-slate-900">
      {/* Hero */}
      <section className="relative overflow-hidden bg-[#0B1220] text-white">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute right-[-10%] top-[-20%] h-[550px] w-[550px] rounded-full border border-white/[0.07]"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute right-[-4%] top-[-10%] h-[420px] w-[420px] rounded-full border border-white/[0.08]"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-40 left-[15%] h-96 w-96 rounded-full bg-sky-400/[0.06] blur-3xl"
        />

        <div className="relative mx-auto max-w-[1440px] px-5 py-8 sm:px-8 lg:px-12">
          {/* Shared city selector */}
          <div className="mb-8 flex flex-wrap items-center justify-end gap-3">
            <label
              htmlFor="city-select"
              className="text-xs font-bold uppercase tracking-[0.16em] text-slate-300"
            >
              Your city
            </label>

            <select
              id="city-select"
              value={selectedCity}
              onChange={(event) => setSelectedCity(event.target.value)}
              className="min-h-11 rounded-full border border-white/20 bg-[#111c2e] px-4 text-sm font-semibold text-white outline-none transition focus:border-sky-400"
            >
              {CITY_OPTIONS.map((option) => (
                <option
                  key={option.slug}
                  value={option.slug}
                  className="bg-[#0B1220] text-white"
                >
                  {option.name}
                </option>
              ))}
            </select>

            <span className="text-xs text-slate-400">
              Inspection pricing for {cityName}
            </span>
          </div>

          <div className="grid items-center gap-12 pb-12 pt-2 lg:grid-cols-[1fr_0.9fr] lg:gap-16 lg:pb-20">
            {/* Hero copy */}
            <div>
              <div className="inline-flex items-center gap-3 rounded-full border border-white/15 px-4 py-2">
                <span className="h-2 w-2 rounded-full bg-sky-400" />
                <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-200">
                  Independent vehicle inspections
                </span>
              </div>

              <h1 className="mt-8 max-w-3xl text-[clamp(3.2rem,7vw,6.7rem)] font-black leading-[0.94] tracking-[-0.075em]">
                Look closer.
                <span className="mt-2 block text-sky-400">
                  Buy smarter.
                </span>
              </h1>

              <p className="mt-7 max-w-xl text-base leading-8 text-slate-200 sm:text-lg">
                Before you sign, pay or accept delivery, understand the car
                you are buying. Explore independent inspection options for
                new cars, premium vehicles, EVs and used cars, with a detailed
                report to help you make a more informed decision.
              </p>

              <div className="mt-9 flex flex-col gap-3 sm:flex-row">
                <Link
                  href={cityHref}
                  className="inline-flex min-h-14 items-center justify-center gap-4 rounded-full bg-blue-600 px-7 text-sm font-bold text-white transition hover:bg-blue-500"
                >
                  View {cityName} pricing
                  <span aria-hidden="true">↗</span>
                </Link>

                <Link
                  href="/services"
                  className="inline-flex min-h-14 items-center justify-center rounded-full border border-white/20 px-7 text-sm font-semibold text-white transition hover:border-sky-400/40 hover:bg-white/10"
                >
                  Discover our services
                </Link>
              </div>

              {/* Trust and service highlights */}
              <div className="mt-10 grid max-w-2xl grid-cols-2 gap-3 sm:grid-cols-4">
                {heroStats.map((stat) => (
                  <div
                    key={stat.label}
                    className="rounded-2xl border border-white/10 bg-white/[0.05] p-4 shadow-sm transition hover:border-sky-400/40 hover:bg-white/[0.08]"
                  >
                    <p className="text-base font-black leading-tight text-white sm:text-lg">
                      {stat.value}
                    </p>
                    <p className="mt-2 text-xs leading-5 text-slate-400">
                      {stat.label}
                    </p>
                  </div>
                ))}
              </div>

              <p className="mt-4 max-w-xl text-xs leading-5 text-slate-400">
                Independent of dealerships. Inspection scope, available
                checks and report timing are confirmed when booking.
              </p>
            </div>

            {/* Animated 400-point inspection dial */}
            <div
              className="relative flex min-w-0 items-center justify-center"
              style={{ animationDelay: ".2s" }}
            >
              <div className="w-full max-w-[560px]">
                <div className="mx-auto flex w-full flex-col items-center">
                  <div className="inspection-dial relative aspect-square w-full">
                    <div className="dial-orbit dial-orbit-outer absolute inset-[4%] rounded-full border border-dashed border-[#6366F1]/40" />

                    <div className="dial-orbit dial-orbit-inner absolute inset-[11%] rounded-full border border-dashed border-[#0D9488]/40" />

                    <div className="dial-orbit dial-orbit-third absolute inset-[20%] rounded-full border border-[#6366F1]/20" />

                    <svg
                      viewBox="0 0 400 400"
                      className="dial-third-ticks absolute inset-[20%] h-[60%] w-[60%]"
                      aria-hidden="true"
                    >
                      {Array.from({ length: 24 }, (_, i) => (
                        <line
                          key={i}
                          x1="200"
                          y1={i % 4 === 0 ? "8" : "14"}
                          x2="200"
                          y2={i % 4 === 0 ? "25" : "20"}
                          transform={`rotate(${i * 15} 200 200)`}
                          stroke={i % 4 === 0 ? "#6366F1" : "#64748B"}
                          strokeOpacity={i % 4 === 0 ? "0.8" : "0.35"}
                          strokeWidth={i % 4 === 0 ? "1.5" : "1"}
                        />
                      ))}
                    </svg>

                    <div className="dial-hand absolute left-1/2 top-1/2 z-[2] h-[42%] w-[3px] rounded-full bg-gradient-to-t from-[#06B6D4] via-[#22D3EE] to-transparent" />

                    <div className="absolute left-1/2 top-1/2 z-[3] h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-[#22D3EE] bg-[#0B1228] shadow-[0_0_18px_#22D3EE]" />

                    <div className="absolute left-1/2 top-[29%] z-[4] -translate-x-1/2 whitespace-nowrap text-[9px] font-black uppercase tracking-[0.2em] text-sky-400 sm:text-sm sm:tracking-[0.3em]">
                      ◉ Inspection checkpoints
                    </div>

                    <div className="absolute left-1/2 top-1/2 z-[4] w-[65%] -translate-x-1/2 -translate-y-1/2 text-center">
                      <div className="bg-gradient-to-b from-sky-300 via-sky-400 to-sky-500 bg-clip-text text-7xl font-black leading-none tracking-[-0.07em] text-transparent sm:text-8xl md:text-9xl">
                        400
                      </div>

                      <p className="mt-3 text-[10px] font-bold text-slate-300 sm:text-base">
                        Inspection checkpoints
                      </p>

                      <p className="mt-1 text-[9px] font-medium text-slate-500 sm:text-xs">
                        Every car. Every time.
                      </p>
                    </div>

                    {[
                      {
                        label: "ENGINE",
                        pos: "left-1/2 top-[2%] -translate-x-1/2",
                        color: "text-[#4F46E5]",
                      },
                      {
                        label: "SAFETY",
                        pos: "left-[3%] top-[27%]",
                        color: "text-[#0891B2]",
                      },
                      {
                        label: "BODY",
                        pos: "right-[2%] top-[29%]",
                        color: "text-[#0D9488]",
                      },
                      {
                        label: "WHEEL & TYRES",
                        pos: "left-[1%] top-[72%]",
                        color: "text-[#E11D48]",
                      },
                      {
                        label: "OBD-2",
                        pos: "right-[2%] top-[74%]",
                        color: "text-[#CA8A04]",
                      },
                      {
                        label: "ELECTRICAL",
                        pos: "left-1/2 bottom-[2%] -translate-x-1/2",
                        color: "text-[#7C3AED]",
                      },
                    ].map((item) => (
                      <div
                        key={item.label}
                        className={`absolute ${item.pos} rounded-full border border-slate-300/80 bg-white/90 px-2 py-2 text-[7px] font-black tracking-[0.05em] shadow-lg backdrop-blur sm:px-4 sm:text-[10px] sm:tracking-[0.1em] ${item.color}`}
                      >
                        {item.label}
                      </div>
                    ))}
                  </div>

                  <p className="mt-2 max-w-sm text-center text-xs leading-5 text-slate-400">
                    Checks depend on vehicle type, accessibility and the
                    agreed inspection package.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Comprehensive inspection highlights */}
      <section className="bg-white px-5 py-16 sm:px-8 sm:py-20 lg:px-12">
        <div className="mx-auto max-w-[1440px]">
          <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:items-start lg:gap-16">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-blue-700">
                01 / Thorough vehicle checks
              </p>

              <h2 className="mt-5 text-3xl font-black leading-tight tracking-[-0.05em] sm:text-4xl lg:text-5xl">
                Look beyond the showroom shine.
              </h2>

              <p className="mt-5 leading-8 text-slate-600">
                A car can look impressive at first glance and still show
                signs of wear or previous repairs. Our inspection process
                focuses on recording relevant observations across the
                agreed inspection scope, so you can ask better questions
                before buying.
              </p>

              <div className="mt-7 rounded-2xl border border-sky-100 bg-sky-50/70 p-5">
                <p className="font-bold text-slate-900">
                  Independent findings. Informed decisions.
                </p>
                <p className="mt-2 text-sm leading-7 text-slate-600">
                  Our goal is to help you understand the vehicle&apos;s
                  observed condition without dealership sales pressure
                  influencing the inspection findings.
                </p>
              </div>

              <Link
                href="/services"
                className="mt-7 inline-flex items-center gap-2 text-sm font-bold text-blue-700 transition hover:text-sky-500"
              >
                Explore all inspection services
                <span aria-hidden="true">↗</span>
              </Link>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {inspectionAreas.map((area) => (
                <article
                  key={area.number}
                  className="rounded-2xl border border-slate-200 bg-white p-5 transition duration-200 hover:-translate-y-0.5 hover:border-sky-300 hover:shadow-md sm:p-6"
                >
                  <div className="flex items-start justify-between gap-3">
                    <span className="flex h-11 w-11 items-center justify-center rounded-xl border border-sky-100 bg-sky-50 text-xl text-blue-700">
                      {area.icon}
                    </span>
                    <span className="text-xs font-black tracking-wider text-slate-300">
                      {area.number}
                    </span>
                  </div>

                  <h3 className="mt-5 text-base font-black text-slate-900">
                    {area.title}
                  </h3>

                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    {area.description}
                  </p>
                </article>
              ))}
            </div>
          </div>

          <p className="mt-7 rounded-xl border border-slate-200 bg-slate-50 p-4 text-xs leading-6 text-slate-500">
            Important: visual checks cannot guarantee detection of every
            hidden defect, previous accident, odometer manipulation or
            internal mechanical issue. Further testing, specialist
            diagnostics or vehicle-history records may be needed.
          </p>
        </div>
      </section>

      {/* AI-assisted report feature */}
      <section className="relative overflow-hidden bg-[#0B1220] px-5 py-16 text-white sm:px-8 sm:py-20 lg:px-12">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-24 top-0 h-96 w-96 rounded-full bg-blue-600/15 blur-3xl"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-32 left-1/4 h-80 w-80 rounded-full bg-sky-400/10 blur-3xl"
        />

        <div className="relative mx-auto max-w-[1440px]">
          <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-center lg:gap-16">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full border border-sky-400/25 bg-sky-400/[0.08] px-4 py-2 text-xs font-bold uppercase tracking-[0.16em] text-sky-300">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.7"
                  className="h-4 w-4"
                  aria-hidden="true"
                >
                  <path
                    d="M12 3v3m0 12v3M3 12h3m12 0h3M5.6 5.6l2.1 2.1m8.6 8.6 2.1 2.1m0-12.8-2.1 2.1m-8.6 8.6-2.1 2.1"
                    strokeLinecap="round"
                  />
                  <circle cx="12" cy="12" r="5" />
                </svg>
                AI-assisted report
              </span>

              <h2 className="mt-5 text-3xl font-black leading-tight tracking-[-0.05em] sm:text-4xl lg:text-5xl">
                More than a checklist.
                <span className="mt-2 block text-sky-400">
                  Understand the findings.
                </span>
              </h2>

              <p className="mt-5 max-w-xl leading-8 text-slate-300">
                A detailed inspection report helps you review recorded
                observations. AI-assisted analysis can help organise and
                explain available findings, highlight potential concerns
                and identify areas you may want to investigate further.
              </p>

              <div className="mt-7 flex flex-wrap gap-3">
                <Link
                  href="/how-it-works"
                  className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-sky-400 px-6 text-sm font-bold text-[#0B1220] transition hover:bg-sky-300"
                >
                  See how it works
                  <span aria-hidden="true">↗</span>
                </Link>

                <Link
                  href="/services"
                  className="inline-flex min-h-12 items-center justify-center rounded-full border border-white/20 px-6 text-sm font-semibold text-white transition hover:border-sky-400/50 hover:bg-white/[0.05]"
                >
                  View services
                </Link>
              </div>
            </div>

            <div className="rounded-3xl border border-white/10 bg-white/[0.045] p-5 shadow-2xl shadow-black/20 sm:p-8">
              <div className="flex items-start justify-between gap-4 border-b border-white/10 pb-5">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-sky-400">
                    Your inspection report
                  </p>
                  <h3 className="mt-2 text-xl font-black text-white sm:text-2xl">
                    Findings at a glance
                  </h3>
                </div>

                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-sky-400/20 bg-sky-400/10 text-sky-300">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.7"
                    className="h-6 w-6"
                    aria-hidden="true"
                  >
                    <path
                      d="M6 3.5h8l4 4V21H6z"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M14 3.5V8h4M9 12h6M9 16h3"
                      strokeLinecap="round"
                    />
                    <path
                      d="m14 16 1.5 1.5L19 14"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
              </div>

              <div className="mt-5 space-y-4">
                {reportFeatures.map((feature) => (
                  <div key={feature.number} className="flex gap-4">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-sky-400/20 bg-sky-400/10 text-xs font-black text-sky-300">
                      {feature.number}
                    </span>

                    <div>
                      <h4 className="font-bold text-white">
                        {feature.title}
                      </h4>
                      <p className="mt-1 text-sm leading-6 text-slate-400">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 rounded-2xl border border-sky-400/15 bg-sky-400/[0.05] p-4">
                <p className="text-sm font-bold text-sky-300">
                  AI supports the report. It does not replace the inspector.
                </p>
                <p className="mt-2 text-xs leading-6 text-slate-400">
                  AI-assisted insights depend on the information available
                  and should be considered alongside the inspector&apos;s
                  recorded findings. Further testing may be required to
                  confirm a suspected issue.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* City-specific pricing */}
      <section
        id="city-pricing"
        className="scroll-mt-24 bg-slate-50 px-5 py-12 sm:px-8 sm:py-16 lg:px-12"
      >
        <div className="mx-auto max-w-5xl rounded-3xl border border-slate-200 bg-white p-6 shadow-xl shadow-slate-900/[0.06] sm:p-10 lg:p-12">
          <div className="text-center">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-blue-700">
              Inspection pricing · INR
            </p>

            <h2 className="mt-3 text-3xl font-black tracking-[-0.045em] text-slate-950 sm:text-4xl">
              Pricing in {cityName}
            </h2>

            <p className="mt-3 text-sm text-slate-600">
              Choose the inspection that fits your next car purchase.
            </p>
          </div>

          <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {priceRows.length > 0 ? (
              priceRows.map((row) => (
                <div
                  key={row.label}
                  className="rounded-2xl border border-slate-200 bg-slate-50 p-5 text-center transition hover:border-sky-300 hover:bg-sky-50/50"
                >
                  <p className="min-h-10 text-sm font-semibold leading-5 text-slate-600">
                    {row.label}
                  </p>
                  <p className="mt-3 text-2xl font-black tracking-tight text-slate-950">
                    ₹{row.price.toLocaleString("en-IN")}
                  </p>
                </div>
              ))
            ) : (
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 text-center sm:col-span-2 lg:col-span-4">
                <p className="font-bold text-slate-900">
                  Pricing on request
                </p>
                <p className="mt-2 text-sm text-slate-600">
                  Rates for this city have not yet been configured. Contact
                  us to confirm availability and pricing.
                </p>
              </div>
            )}
          </div>

          <div className="mt-8 text-center">
            <Link
              href={cityHref}
              className="inline-flex min-h-12 items-center justify-center gap-3 rounded-full bg-blue-600 px-7 text-sm font-bold text-white transition hover:bg-blue-500"
            >
              Explore {cityName} options
              <span aria-hidden="true">↗</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Services */}
      <section
        id="services"
        className="scroll-mt-24 py-20 sm:py-28"
      >
        <div className="mx-auto max-w-[1440px] px-5 sm:px-8 lg:px-12">
          <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-blue-700">
                02 / What we inspect
              </p>

              <h2 className="mt-5 max-w-2xl text-4xl font-black leading-tight tracking-[-0.055em] sm:text-5xl">
                Different cars.
                <br />
                Different inspection needs.
              </h2>
            </div>

            <Link
              href="/services"
              className="inline-flex items-center gap-3 text-sm font-bold transition hover:text-blue-700"
            >
              All services <span>↗</span>
            </Link>
          </div>

          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {services.map((service) => (
              <article
                key={service.number}
                className="group flex min-h-[310px] flex-col rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition duration-200 hover:-translate-y-1 hover:border-sky-300 hover:shadow-lg sm:p-7"
              >
                <div className="flex items-center justify-between gap-3">
                  <span className="text-[10px] font-bold tracking-[0.13em] text-blue-700">
                    {service.code}
                  </span>
                  <span className="text-sm text-slate-400">
                    {service.number}
                  </span>
                </div>

                <div className="mt-8 flex h-12 w-12 items-center justify-center rounded-full border border-slate-200 text-xl transition group-hover:border-blue-600 group-hover:bg-blue-600 group-hover:text-white">
                  ↗
                </div>

                <h3 className="mt-6 text-xl font-black tracking-tight">
                  {service.title}
                </h3>

                <p className="mt-3 flex-1 text-sm leading-7 text-slate-600">
                  {service.description}
                </p>

                <Link
                  href="/services"
                  className="mt-6 inline-flex items-center gap-2 text-sm font-bold text-slate-900 transition hover:text-blue-700"
                >
                  Learn more
                  <span className="transition-transform group-hover:translate-x-1">
                    →
                  </span>
                </Link>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Process timeline */}
      <section className="bg-slate-50 py-20 sm:py-24">
        <div className="mx-auto max-w-[1440px] px-5 sm:px-8 lg:px-12">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-blue-700">
            03 / The process
          </p>

          <h2 className="mt-5 max-w-3xl text-4xl font-black leading-tight tracking-[-0.055em] sm:text-5xl">
            A clear timeline from booking to report.
          </h2>

          <div className="relative mt-12 grid gap-8 md:grid-cols-4 md:gap-5">
            <div
              aria-hidden="true"
              className="absolute left-[12.5%] right-[12.5%] top-5 hidden h-px bg-gradient-to-r from-blue-200 via-sky-400 to-blue-200 md:block"
            />

            {processSteps.map((step) => (
              <article key={step.number} className="relative">
                <div className="relative z-10 mx-auto flex h-10 w-10 items-center justify-center rounded-full border-4 border-slate-50 bg-blue-600 text-xs font-black text-white shadow-sm">
                  {step.number}
                </div>

                <div className="mt-5 rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-sm transition duration-200 hover:-translate-y-1 hover:border-sky-300 hover:shadow-md">
                  <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full border-4 border-sky-100 bg-sky-50">
                    <svg
                      aria-hidden="true"
                      viewBox="0 0 24 24"
                      fill="none"
                      className="h-7 w-7 text-blue-600"
                      stroke="currentColor"
                      strokeWidth="1.8"
                    >
                      <circle cx="12" cy="12" r="9" />
                      <path
                        d="M12 7v5l3 2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>

                  <p className="mt-4 text-[10px] font-bold uppercase tracking-[0.16em] text-blue-700">
                    STEP {step.number}
                  </p>

                  <h3 className="mt-2 text-lg font-black text-slate-900">
                    {step.title}
                  </h3>

                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    {step.text}
                  </p>
                </div>
              </article>
            ))}
          </div>

          <p className="mt-5 text-xs leading-5 text-slate-500">
            Appointment and report timings are indicative and may vary by
            location, vehicle, access and inspection scope. Confirm timing
            when booking.
          </p>
        </div>
      </section>

      {/* Final CTA */}
      <section className="bg-white px-5 py-10 sm:px-8 lg:px-12">
        <div className="mx-auto flex max-w-[1440px] flex-col justify-between gap-6 rounded-3xl border border-slate-200 bg-[#0B1220] p-6 text-white shadow-lg shadow-slate-900/10 sm:p-8 md:flex-row md:items-center lg:px-10">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-sky-400">
              Ready when you are
            </p>

            <h2 className="mt-3 max-w-3xl text-2xl font-black leading-tight tracking-[-0.04em] sm:text-3xl">
              Make your next car decision with more confidence.
            </h2>

            <p className="mt-3 max-w-xl text-sm leading-6 text-slate-300">
              Get Professional PDI Service in {cityName}. Compare inspection
              options, review the available pricing and contact us to arrange
              your booking.
            </p>
          </div>

          <Link
            href={cityHref}
            className="inline-flex min-h-12 shrink-0 items-center justify-center gap-3 self-start rounded-full bg-sky-400 px-6 text-sm font-bold text-[#0B1220] transition hover:bg-sky-300 md:self-center"
          >
            View {cityName} options
            <span aria-hidden="true">↗</span>
          </Link>
        </div>
      </section>
    </main>
  );
}
