
import Link from "next/link";

const principles = [
  {
    number: "01",
    title: "Independent perspective",
    description:
      "We help buyers evaluate a vehicle's observed condition before making an important purchase or delivery decision.",
    icon: "◎",
  },
  {
    number: "02",
    title: "Technical approach",
    description:
      "A structured inspection process helps organize observations across the vehicle's condition, features and available diagnostics.",
    icon: "⌘",
  },
  {
    number: "03",
    title: "Transparent findings",
    description:
      "Clear observations help customers understand what was checked and which issues may need further attention.",
    icon: "≡",
  },
  {
    number: "04",
    title: "Informed decisions",
    description:
      "Inspection findings can help buyers ask better questions, discuss concerns and decide on their next steps.",
    icon: "↗",
  },
];

const steps = [
  {
    number: "01",
    title: "Understand the vehicle",
    description:
      "Identify the vehicle type and whether you need a new-car PDI or a used-car pre-purchase inspection.",
  },
  {
    number: "02",
    title: "Inspect systematically",
    description:
      "Review relevant vehicle areas according to the selected service, available access and inspection scope.",
  },
  {
    number: "03",
    title: "Explain the observations",
    description:
      "Present the findings clearly so you can understand the observations and determine what needs follow-up.",
  },
];

export default function AboutPage() {
  return (
    <main className="overflow-hidden bg-white text-slate-900">
      {/* HERO */}
      <section className="relative isolate bg-[#0B1220] text-white">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_80%_15%,rgba(37,99,235,0.3),transparent_45%)]" />

        <div className="mx-auto grid max-w-7xl items-center gap-12 px-6 py-20 sm:py-24 lg:grid-cols-2 lg:py-28">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-sky-400">
              About InspectMyCar
            </p>

            <h1 className="mt-5 text-4xl font-black leading-tight sm:text-5xl lg:text-6xl">
              Better information.
              <span className="block text-sky-400">
                More confident decisions.
              </span>
            </h1>

            <p className="mt-6 max-w-xl text-lg leading-8 text-slate-300">
              Buying a car is a significant decision. InspectMyCar helps
              customers understand a vehicle's observed condition through
              structured inspection services for new and used vehicles.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/services"
                className="rounded-xl bg-blue-600 px-6 py-4 font-bold text-white transition hover:bg-blue-500"
              >
                Explore our services →
              </Link>

              <Link
                href="/#book-inspection"
                className="rounded-xl border border-slate-600 px-6 py-4 font-bold text-white transition hover:bg-white/5"
              >
                View pricing
              </Link>
            </div>
          </div>

          {/* Brand statement card */}
          <div className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur sm:p-9">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-600 text-2xl font-black">
              IM
            </div>

            <p className="mt-8 text-xs font-bold uppercase tracking-[0.2em] text-sky-400">
              Our approach
            </p>

            <h2 className="mt-4 text-3xl font-black leading-snug">
              An inspection should inform your decision, not make it for you.
            </h2>

            <p className="mt-5 leading-7 text-slate-300">
              We believe customers should understand the inspection scope,
              the observations recorded and the limitations of the checks
              performed.
            </p>

            <div className="mt-8 border-t border-white/10 pt-6">
              <p className="text-sm font-semibold text-white">
                Clarity at every step.
              </p>
              <p className="mt-2 text-sm leading-6 text-slate-400">
                From choosing a service to reviewing the inspection findings.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* INTRODUCTION */}
      <section className="py-20 sm:py-24">
        <div className="mx-auto grid max-w-7xl gap-12 px-6 lg:grid-cols-2 lg:items-start">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-blue-700">
              Who we are
            </p>

            <h2 className="mt-4 text-3xl font-black leading-tight sm:text-4xl">
              Helping you look beyond the showroom shine.
            </h2>
          </div>

          <div className="space-y-5 text-base leading-8 text-slate-600">
            <p>
              A vehicle can look impressive on the outside, but important
              buying questions deserve a closer look. An inspection provides
              an opportunity to review relevant areas of the vehicle before
              you commit.
            </p>

            <p>
              InspectMyCar offers inspection options for new-car pre-delivery
              checks, luxury vehicles, electric vehicles and used-car
              pre-purchase assessments.
            </p>

            <p>
              Our goal is to make the inspection process easier to understand
              by presenting the service scope, pricing and observations as
              clearly as possible.
            </p>
          </div>
        </div>
      </section>

      {/* PRINCIPLES */}
      <section className="bg-slate-50 py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-6">
          <div className="max-w-2xl">
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-blue-700">
              What guides us
            </p>

            <h2 className="mt-4 text-3xl font-black sm:text-4xl">
              Built around clarity and confidence.
            </h2>

            <p className="mt-4 leading-7 text-slate-600">
              These principles shape how we present inspection options and
              help customers understand their vehicle assessment.
            </p>
          </div>

          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {principles.map((item) => (
              <article
                key={item.number}
                className="rounded-2xl border border-slate-200 bg-white p-6 transition hover:-translate-y-1 hover:border-blue-300 hover:shadow-lg"
              >
                <div className="flex items-center justify-between">
                  <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-2xl font-bold text-blue-700">
                    {item.icon}
                  </span>
                  <span className="text-sm font-black text-slate-300">
                    {item.number}
                  </span>
                </div>

                <h3 className="mt-6 text-lg font-bold">{item.title}</h3>

                <p className="mt-3 text-sm leading-7 text-slate-600">
                  {item.description}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* PROCESS */}
      <section className="py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-6">
          <div className="max-w-2xl">
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-blue-700">
              Our approach to inspection
            </p>

            <h2 className="mt-4 text-3xl font-black sm:text-4xl">
              A clear process, from start to findings.
            </h2>
          </div>

          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {steps.map((step) => (
              <article
                key={step.number}
                className="relative rounded-2xl border border-slate-200 p-7"
              >
                <span className="text-sm font-black tracking-widest text-blue-700">
                  STEP {step.number}
                </span>

                <h3 className="mt-5 text-xl font-bold">{step.title}</h3>

                <p className="mt-3 leading-7 text-slate-600">
                  {step.description}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* TRANSPARENCY */}
      <section className="bg-[#0B1220] py-16 text-white sm:py-20">
        <div className="mx-auto grid max-w-7xl gap-8 px-6 md:grid-cols-2 md:items-center">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-sky-400">
              Honest expectations
            </p>

            <h2 className="mt-4 text-3xl font-black sm:text-4xl">
              Know what an inspection can—and cannot—tell you.
            </h2>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
            <p className="leading-7 text-slate-300">
              An inspection reflects the checks performed and the conditions
              observed at that time. It cannot guarantee that every hidden
              fault will be detected or that a vehicle will remain
              fault-free in the future.
            </p>

            <p className="mt-4 leading-7 text-slate-300">
              The inspection scope, access to components and diagnostic
              availability can vary by vehicle and service. Ask for the
              applicable checklist before booking.
            </p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 py-20 sm:py-24">
        <div className="mx-auto max-w-5xl text-center">
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-blue-700">
            Take the next step
          </p>

          <h2 className="mt-4 text-3xl font-black sm:text-4xl">
            Make your next car decision an informed one.
          </h2>

          <p className="mx-auto mt-5 max-w-2xl leading-7 text-slate-600">
            Explore our inspection services and find the pricing available
            for your city.
          </p>

          <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link
            href="/services"
            className="inline-flex min-h-12 shrink-0 items-center justify-center gap-3 self-start rounded-full bg-sky-400 px-6 text-sm font-bold text-[#0B1220] transition hover:bg-sky-300 md:self-center"
          >
            Explore services
          </Link>

            <Link
              href="/#book-inspection"
              className="rounded-xl border border-slate-300 px-7 py-4 font-bold text-slate-800 transition hover:bg-slate-50"
            >
              View pricing
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
