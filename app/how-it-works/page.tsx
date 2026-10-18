import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";

import Link from "next/link";


export const metadata: Metadata = pageMetadata({
  title: "How Car Inspection Booking Works",
  description: "See how to request a CarpdiExpert car inspection, coordinate your appointment and receive observations from the inspection process.",
  path: "/how-it-works",
});

const steps = [
  {
    number: "01",
    title: "Book your inspection",
    time: "1 hour",
    label: "GET STARTED",
    description:
      "Choose your inspection type and share your vehicle details, location and preferred appointment time.",
    details: [
      "Select new-car PDI, luxury, EV or used-car PPI",
      "Provide the vehicle and location details",
      "Request your preferred inspection slot",
    ],
    icon: "calendar",
  },
  {
    number: "02",
    title: "Inspector assigned",
    time: "1 hour",
    label: "COORDINATION",
    description:
      "We coordinate an inspector for your location and inspection request, then confirm the appointment details.",
    details: [
      "Inspection request reviewed",
      "Inspector availability coordinated",
      "Appointment details confirmed",
    ],
    icon: "user",
  },
  {
    number: "03",
    title: "Thorough inspection",
    time: "45 min – 1½ hours",
    label: "VEHICLE CHECK",
    description:
      "The inspector checks the agreed inspection areas and records observations about the vehicle's condition.",
    details: [
      "Exterior and interior observations",
      "Tyres and visible components",
      "Available mechanical and diagnostic checks",
    ],
    icon: "car",
  },
  {
    number: "04",
    title: "Receive your report",
    time: "Within 4 hours",
    label: "YOUR FINDINGS",
    description:
      "Review the inspection findings and recorded observations to help you make a more informed car-buying decision.",
    details: [
      "Review the recorded inspection findings",
      "Understand observations and potential concerns",
      "Use the report to support your decision",
    ],
    icon: "report",
  },
];

const inspectionAreas = [
  {
    number: "01",
    title: "Engine & mechanical",
    description: "Engine condition and accessible mechanical components.",
    icon: "⚙",
  },
  {
    number: "02",
    title: "Safety systems",
    description: "Key safety-related features and visible components.",
    icon: "◈",
  },
  {
    number: "03",
    title: "Body & exterior",
    description: "Body panels, paintwork and visible exterior condition.",
    icon: "▦",
  },
  {
    number: "04",
    title: "Wheels & tyres",
    description: "Tyre condition, visible wear and wheel inspection.",
    icon: "◉",
  },
  {
    number: "05",
    title: "OBD-2 diagnostics",
    description: "Diagnostic checks where compatible equipment and access are available.",
    icon: "⌁",
  },
  {
    number: "06",
    title: "Electrical systems",
    description: "Accessible electrical features and component operation.",
    icon: "ϟ",
  },
];

function StepIcon({ type }: { type: string }) {
  const common = "h-7 w-7 text-sky-400";

  if (type === "calendar") {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" className={common} aria-hidden="true">
        <rect x="3.5" y="5" width="17" height="16" rx="2.5" />
        <path d="M7.5 3v4M16.5 3v4M3.5 10h17M8 14h3M8 17h2" strokeLinecap="round" />
      </svg>
    );
  }

  if (type === "user") {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" className={common} aria-hidden="true">
        <circle cx="12" cy="8" r="4" />
        <path d="M4 21a8 8 0 0 1 16 0" strokeLinecap="round" />
        <path d="m16.5 12.5 1.5 1.5 3-3" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }

  if (type === "car") {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" className={common} aria-hidden="true">
        <path d="m5 11 1.8-5h10.4l1.8 5M3 13l2-2h14l2 2v6h-3v-2H6v2H3z" strokeLinejoin="round" />
        <path d="M6 14h.01M18 14h.01M7 6l-1-2M17 6l1-2" strokeLinecap="round" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" className={common} aria-hidden="true">
      <path d="M6 3.5h8l4 4V21H6z" strokeLinejoin="round" />
      <path d="M14 3.5V8h4M9 12h6M9 16h6" strokeLinecap="round" />
      <path d="m9 8 1.5 1.5L13 7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function InspectionCheckIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5" aria-hidden="true">
      <path d="m5 12 4 4L19 6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function HowItWorksPage() {
  return (
    <main className="overflow-hidden bg-white text-slate-900">
      {/* Hero */}
      <section className="relative overflow-hidden bg-[#0B1220] text-white">
        <div aria-hidden="true" className="pointer-events-none absolute -right-20 -top-24 h-80 w-80 rounded-full bg-blue-600/20 blur-3xl" />
        <div aria-hidden="true" className="pointer-events-none absolute -bottom-32 left-1/4 h-80 w-80 rounded-full bg-sky-400/10 blur-3xl" />

        <div className="relative mx-auto grid max-w-[1440px] items-center gap-12 px-5 py-16 sm:px-8 sm:py-20 lg:grid-cols-[1fr_0.9fr] lg:gap-16 lg:px-12 lg:py-24">
          <div className="relative z-10">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-sky-400">
              CarpdiExpert / How it works
            </p>

            <h1 className="mt-5 max-w-4xl text-4xl font-black leading-tight tracking-[-0.055em] sm:text-5xl lg:text-6xl">
              From booking to report.
              <span className="mt-2 block text-sky-400">
                Four simple steps.
              </span>
            </h1>

            <p className="mt-6 max-w-2xl text-base leading-8 text-slate-300 sm:text-lg">
              Get a clearer picture of the car you are buying with a straightforward
              inspection process, from your first request to the final findings.
            </p>

            <Link
              href="/#book-inspection"
              className="mt-8 inline-flex min-h-12 items-center justify-center gap-3 rounded-full bg-sky-400 px-7 py-3 text-sm font-bold text-[#0B1220] transition hover:bg-sky-300"
            >
              Book an inspection <span aria-hidden="true">↗</span>
            </Link>
          </div>

          {/* Rotating inspection process dial */}
          <div className="relative mx-auto flex w-full max-w-[540px] items-center justify-center py-5 sm:py-8">
            <div aria-hidden="true" className="absolute h-[85%] w-[85%] rounded-full bg-sky-400/10 blur-3xl" />

            <div className="pdi-process-dial relative aspect-square w-full max-w-[500px]">
              <div aria-hidden="true" className="absolute inset-[5%] rounded-full border border-sky-300/15" />
              <div aria-hidden="true" className="absolute inset-[13%] rounded-full border border-dashed border-sky-300/30" />
              <div aria-hidden="true" className="absolute inset-[22%] rounded-full border border-sky-300/20" />

<div
  aria-hidden="true"
  className="absolute inset-[7%] animate-spin rounded-full border-2 border-transparent border-t-sky-300 border-r-sky-400/70 motion-reduce:animate-none"
  style={{ animationDuration: "12s" }}
>

                <span className="absolute -right-1 top-[48%] h-3 w-3 rounded-full bg-cyan-200 shadow-[0_0_18px_rgba(103,232,249,0.95)]" />
              </div>

              {steps.map((step, index) => {
                const positions = [
                  "left-1/2 top-[1%] -translate-x-1/2",
                  "right-[1%] top-1/2 -translate-y-1/2",
                  "left-1/2 bottom-[1%] -translate-x-1/2",
                  "left-[1%] top-1/2 -translate-y-1/2",
                ];
                return (
                  <div
                    key={step.number}
                    className={`absolute z-10 ${positions[index]}`}
                  >
                    <div className="flex w-[112px] flex-col items-center gap-2 text-center sm:w-[132px]">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full border border-sky-300/50 bg-[#10243A] text-sm font-black text-sky-200 shadow-[0_0_22px_rgba(56,189,248,0.16)] sm:h-14 sm:w-14">
                        {step.number}
                      </div>
                      <span className="max-w-[112px] text-xs font-bold leading-4 text-white sm:max-w-[132px] sm:text-sm">
                        {step.title}
                      </span>
                    </div>
                  </div>
                );
              })}

              <div className="absolute inset-[31%] flex flex-col items-center justify-center rounded-full border border-sky-300/30 bg-gradient-to-br from-[#132A43] via-[#0B1A2D] to-[#071321] text-center shadow-[0_0_45px_rgba(14,165,233,0.16)]">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-sky-300/30 bg-sky-300/10 text-sky-300 sm:h-14 sm:w-14">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className="h-7 w-7 sm:h-8 sm:w-8" aria-hidden="true">
                    <path d="m3 13 2-2 2-5h10l2 5 2 2v5h-3v-2H6v2H3z" strokeLinejoin="round" />
                    <path d="M7 6 6 4m11 2 1-2M6 13h.01M18 13h.01M8 10h8" strokeLinecap="round" />
                  </svg>
                </div>
                <span className="mt-3 text-[10px] font-black uppercase tracking-[0.18em] text-sky-300 sm:text-xs">
                  CarPDIExpert
                </span>
                <span className="mt-1 text-xs font-bold text-white sm:text-sm">
                  Your car. Checked.
                </span>
              </div>
            </div>
          </div>
        </div>


      </section>

      {/* 400 inspection checkpoints highlight */}
      <section className="relative overflow-hidden bg-[#0B1220] px-5 pb-16 sm:px-8 sm:pb-20 lg:px-12">
        <div aria-hidden="true" className="pointer-events-none absolute left-1/2 top-0 h-72 w-72 -translate-x-1/2 rounded-full bg-sky-400/10 blur-3xl" />

        <div className="relative mx-auto max-w-[1440px]">
          <div className="overflow-hidden rounded-[2rem] border border-sky-400/20 bg-gradient-to-br from-[#111E33] via-[#0D192B] to-[#0B1220] shadow-2xl shadow-black/20">
            <div className="grid lg:grid-cols-[0.85fr_1.15fr]">
              {/* Main number */}
              <div className="relative flex flex-col items-center justify-center overflow-hidden px-6 py-12 text-center sm:px-10 lg:py-16">
                <div aria-hidden="true" className="absolute inset-0 opacity-20">
                  <div className="absolute inset-6 rounded-full border border-sky-400/30" />
                  <div className="absolute inset-12 rounded-full border border-sky-400/20" />
                  <div className="absolute inset-[4.5rem] rounded-full border border-dashed border-sky-400/30" />
                </div>

                <p className="relative text-xs font-black uppercase tracking-[0.25em] text-sky-300">
                  A closer look at your car
                </p>

                <div className="relative mt-5">
                  <div aria-hidden="true" className="absolute inset-0 scale-75 rounded-full bg-sky-400/20 blur-3xl" />
                  <div className="relative bg-gradient-to-b from-white via-sky-300 to-sky-500 bg-clip-text text-8xl font-black leading-none tracking-[-0.08em] text-transparent drop-shadow-[0_0_24px_rgba(56,189,248,0.22)] sm:text-9xl">
                    400
                  </div>
                </div>

                <div className="relative mt-4 inline-flex items-center gap-2 rounded-full border border-sky-400/30 bg-[#0B1220]/70 px-4 py-2">
                  <span className="h-2 w-2 rounded-full bg-sky-400 shadow-[0_0_10px_rgba(56,189,248,0.8)]" />
                  <span className="text-xs font-extrabold uppercase tracking-[0.18em] text-white sm:text-sm">
                    Inspection checkpoints
                  </span>
                </div>

                <p className="relative mt-5 max-w-sm text-sm leading-7 text-slate-300">
                  A structured approach to checking important areas of a vehicle
                  before you make your buying decision.
                </p>
              </div>

              {/* Inspection categories */}
              <div className="border-t border-white/10 px-5 py-8 sm:px-8 sm:py-10 lg:border-l lg:border-t-0 lg:px-10 lg:py-12">
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-sky-400">
                  What we look at
                </p>

                <h2 className="mt-3 max-w-xl text-2xl font-black leading-tight tracking-[-0.04em] text-white sm:text-3xl">
                  More detail. A clearer picture.
                </h2>

                <p className="mt-3 max-w-xl text-sm leading-7 text-slate-300">
                  The inspection covers relevant vehicle areas according to the
                  agreed scope, vehicle type and accessibility.
                </p>

                <div className="mt-7 grid gap-3 sm:grid-cols-2">
                  {inspectionAreas.map((area) => (
                    <article
                      key={area.number}
                      className="rounded-2xl border border-white/10 bg-white/[0.035] p-4 transition duration-200 hover:border-sky-400/40 hover:bg-sky-400/[0.06]"
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-sky-400/20 bg-sky-400/10 text-xl font-bold text-sky-300">
                          {area.icon}
                        </div>

                        <div className="min-w-0">
                          <h3 className="text-sm font-bold text-white">
                            {area.title}
                          </h3>
                          <p className="mt-1 text-xs leading-5 text-slate-400">
                            {area.description}
                          </p>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>

                <div className="mt-6 flex items-start gap-3 rounded-xl border border-sky-400/15 bg-sky-400/[0.05] p-4">
                  <span className="mt-0.5 text-sky-300">
                    <InspectionCheckIcon />
                  </span>
                  <p className="text-xs leading-6 text-slate-300">
                    The checks performed can vary by vehicle, access, equipment
                    availability and the inspection package. Any checkpoint
                    count should reflect your actual inspection checklist.
                  </p>
                </div>

                <Link
                  href="/services"
                  className="mt-7 inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-sky-400 px-6 py-3 text-sm font-bold text-[#0B1220] transition hover:bg-sky-300"
                >
                  Explore inspection services
                  <span aria-hidden="true">↗</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Process overview */}
      <section className="bg-slate-50 py-16 sm:py-24">
        <div className="mx-auto max-w-[1440px] px-5 sm:px-8 lg:px-12">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-blue-700">
              Your inspection journey
            </p>
            <h2 className="mt-4 text-3xl font-black tracking-[-0.045em] sm:text-4xl">
              Know what happens at every step.
            </h2>
            <p className="mt-4 leading-7 text-slate-600">
              Each stage helps move your inspection request towards a documented
              view of the vehicle&apos;s observed condition.
            </p>
          </div>

          <div className="relative mt-14">
            <div
              aria-hidden="true"
              className="absolute left-[12.5%] right-[12.5%] top-7 hidden h-px bg-gradient-to-r from-blue-200 via-sky-400 to-blue-200 lg:block"
            />

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {steps.map((step) => (
                <article
                  key={step.number}
                  className="group relative flex flex-col rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_4px_20px_rgba(15,23,42,0.04)] transition-all duration-300 hover:-translate-y-1 hover:border-sky-300 hover:shadow-[0_14px_35px_rgba(15,23,42,0.09)] sm:p-7"
                >
                  <div className="relative z-10 mx-auto flex h-14 w-14 items-center justify-center rounded-full border-4 border-slate-50 bg-blue-600 text-sm font-black text-white shadow-md shadow-blue-900/15 transition group-hover:bg-sky-400 group-hover:text-[#0B1220]">
                    {step.number}
                  </div>

                  <div className="mx-auto mt-5 flex h-16 w-16 items-center justify-center rounded-2xl border border-sky-100 bg-sky-50 transition group-hover:border-sky-200 group-hover:bg-sky-100">
                    <StepIcon type={step.icon} />
                  </div>

                  <div className="mt-5 text-center">
                    <span className="inline-flex items-center gap-2 rounded-full border border-sky-100 bg-sky-50 px-3 py-1.5 text-xs font-bold text-blue-700">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-4 w-4" aria-hidden="true">
                        <circle cx="12" cy="12" r="9" />
                        <path d="M12 7v5l3 2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                      {step.time}
                    </span>
                  </div>

                  <p className="mt-5 text-center text-[10px] font-bold uppercase tracking-[0.16em] text-blue-700">
                    {step.label}
                  </p>

                  <h3 className="mt-2 text-center text-xl font-black tracking-tight text-slate-900">
                    {step.title}
                  </h3>

                  <p className="mt-3 text-center text-sm leading-7 text-slate-600">
                    {step.description}
                  </p>

                  <div className="my-6 h-px bg-slate-100" />

                  <ul className="flex-1 space-y-3">
                    {step.details.map((detail) => (
                      <li key={detail} className="flex items-start gap-2.5 text-sm leading-6 text-slate-600">
                        <span className="mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-sky-50 text-xs font-bold text-blue-700">
                          ✓
                        </span>
                        <span>{detail}</span>
                      </li>
                    ))}
                  </ul>
                </article>
              ))}
            </div>
          </div>

          <p className="mt-8 rounded-2xl border border-slate-200 bg-white px-5 py-4 text-sm leading-6 text-slate-500">
            <strong className="text-slate-700">About timing:</strong> The
            displayed timings are indicative and may vary with location,
            inspector availability, vehicle access and inspection scope. Confirm
            the appointment and report timeline when booking.
          </p>
        </div>
      </section>

      {/* What to prepare */}
      <section className="py-16 sm:py-20">
        <div className="mx-auto grid max-w-[1440px] gap-10 px-5 sm:px-8 lg:grid-cols-2 lg:items-center lg:gap-16 lg:px-12">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-blue-700">
              Before your appointment
            </p>
            <h2 className="mt-4 text-3xl font-black tracking-[-0.045em] sm:text-4xl">
              Help us get your inspection ready.
            </h2>
            <p className="mt-4 leading-7 text-slate-600">
              A few details in advance can help us coordinate the inspection
              more smoothly.
            </p>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
            {[
              ["Vehicle details", "Make, model and available vehicle information."],
              ["Inspection location", "The dealership, seller or agreed inspection address."],
              ["Preferred timing", "Your preferred date and a suitable appointment window."],
              ["Access coordination", "Confirm that the vehicle can be accessed for the agreed checks."],
            ].map(([title, description], index) => (
              <div
                key={title}
                className={`flex gap-4 py-4 ${index !== 0 ? "border-t border-slate-100" : ""}`}
              >
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-sky-50 text-sm font-black text-blue-700">
                  {String(index + 1).padStart(2, "0")}
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
              Explore the inspection options available for your vehicle and
              confirm the scope before booking.
            </p>
          </div>

          <Link
            href="/services"
            className="inline-flex min-h-12 shrink-0 items-center justify-center gap-3 self-start rounded-full bg-sky-400 px-6 text-sm font-bold text-[#0B1220] transition hover:bg-sky-300 md:self-center"
          >
            Explore services <span aria-hidden="true">↗</span>
          </Link>
        </div>
      </section>
    </main>
  );
}
