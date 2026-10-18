
"use client";

import Link from "next/link";
import Script from "next/script";
import { useState } from "react";

const faqs = [
  {
    q: "What is a Pre-Delivery Inspection (PDI)?",
    a: "A PDI is a thorough check of your new car before delivery. It helps identify scratches, dents, mechanical concerns, missing accessories, and other issues before you accept the vehicle.",
  },
  {
    q: "Why should I get an expert PDI?",
    a: "Even new cars can have transport damage, paint issues, or missing accessories. A professional inspection helps identify potential concerns before you complete the delivery process.",
  },
  {
    q: "How long does a PDI take?",
    a: "A standard inspection may take approximately 1–2 hours, depending on the vehicle, inspection scope, and dealership access.",
  },
  {
    q: "Can I do the PDI myself?",
    a: "You can check basic items yourself, but an expert may use specialised tools and diagnostic equipment to check areas such as electronic systems, OBD fault codes, paint condition, and other potential concerns.",
  },
  {
    q: "Do I need to book the PDI in advance?",
    a: "Advance booking is recommended so an inspector can be scheduled for your preferred location and time. Availability depends on the inspection date and service area.",
  },
  {
    q: "How much does a PDI cost?",
    a: "The reference pricing for standard cars starts at ₹1,499 and luxury cars at ₹2,499. Confirm the applicable package and price when booking, as service requirements may vary.",
  },
  {
    q: "What do I get after the inspection?",
    a: "You receive a detailed inspection report containing observations, photographs where applicable, and identified concerns to help you make a more informed decision before accepting delivery.",
  },
  {
    q: "What is a Used Car Inspection (PPI)?",
    a: "A Pre-Purchase Inspection (PPI) is an assessment of a used car before purchase. It helps identify potential mechanical, electrical, structural, paint, or accident-related concerns.",
  },
  {
    q: "Why should I inspect a used car before buying?",
    a: "A used vehicle may have hidden accident repairs, engine issues, suspension wear, electrical faults, or flood damage. An independent inspection can help you understand the vehicle's condition before committing to a purchase.",
  },
  {
    q: "How many checkpoints are covered in a used car inspection?",
    a: "The reference service covers over 300 checkpoints, including the engine, transmission, suspension, brakes, tyres, electrical systems, body panels, paint, chassis, interior, and a road test where applicable. Actual coverage depends on the selected package and vehicle access.",
  },
  {
    q: "Do you provide an OBD diagnostic scan?",
    a: "An OBD scan can be performed on compatible vehicles to help identify stored diagnostic fault codes and electronic system concerns. Not every fault is detectable through a scan, and coverage depends on vehicle compatibility.",
  },
  {
    q: "Can you inspect cars at dealerships and individual sellers?",
    a: "Inspections may be arranged at authorised dealerships, multi-brand showrooms, and private seller locations, subject to access and permission from the dealership or seller.",
  },
  {
    q: "Will I receive a detailed inspection report?",
    a: "Yes. The inspection report is intended to document observations and identified concerns, with photographs where applicable, to help you evaluate the vehicle.",
  },
  {
    q: "Can an inspection report help me negotiate the car price?",
    a: "Inspection findings may help you discuss repairs, maintenance, or the asking price with the seller. The final negotiation and purchase decision remain yours.",
  },
  {
    q: "Do you inspect luxury and premium cars?",
    a: "Inspection requests can include premium vehicles from brands such as BMW, Mercedes-Benz, Audi, Volvo, Jaguar, and Land Rover, subject to inspector expertise and service availability.",
  },
  {
    q: "Which areas of Pune do you cover?",
    a: "The service area includes Pune locations such as Baner, Hinjewadi, Wakad, Kharadi, Hadapsar, Kothrud, Aundh, Pimpri-Chinchwad, Magarpatta, and nearby areas, subject to availability.",
  },
  {
    q: "Can I book an inspection on short notice?",
    a: "Same-day or next-day appointments may be possible depending on inspector availability and location. Booking in advance is recommended to improve your chances of securing your preferred slot.",
  },
];

export default function FAQsPage() {

  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.q,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.a,
      },
    })),
  };

  function toggleFAQ(index: number) {
    setOpenIndex((current) => (current === index ? null : index));
  }

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <Script
        id="faq-schema"
        type="application/ld+json"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Hero */}
      <section className="bg-[#0B1220] px-5 pb-16 pt-24 text-white sm:px-8 sm:pb-20 sm:pt-32">
        <div className="mx-auto max-w-6xl text-center">
          <p className="mb-4 text-xs font-bold uppercase tracking-[0.3em] text-sky-400">
            Help & Information
          </p>

          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl md:text-7xl">
            Car PDI{" "}
            <span className="bg-gradient-to-r from-sky-400 to-blue-500 bg-clip-text text-transparent">
              FAQs
            </span>
          </h1>

          <p className="mx-auto mt-6 max-w-3xl text-base leading-8 text-slate-300 sm:text-lg">
            Whether you're buying a <strong className="text-white">new car</strong>{" "}
            or a <strong className="text-white">used car</strong>, our
            inspection services help you identify potential concerns before
            making one of your biggest investments.
          </p>
        </div>
      </section>

      {/* FAQ list */}
      <section
        aria-label="Frequently asked questions"
        className="mx-auto max-w-4xl space-y-4 px-5 py-12 sm:px-8 sm:py-16"
      >
        {faqs.map((faq, index) => {
          const isOpen = openIndex === index;
          const answerId = `faq-answer-${index}`;

          return (
            <article
              key={faq.q}
              className={`overflow-hidden rounded-2xl border bg-white transition-all duration-200 ${
                isOpen
                  ? "border-sky-200 shadow-md shadow-sky-900/5"
                  : "border-slate-200 shadow-sm hover:border-sky-200 hover:shadow-md"
              }`}
            >
              <button
                type="button"
                onClick={() => toggleFAQ(index)}
                aria-expanded={isOpen}
                aria-controls={answerId}
                className="flex w-full items-start justify-between gap-4 px-5 py-5 text-left sm:px-6 sm:py-6"
              >
                <h2 className="flex-1 text-base font-bold leading-7 text-slate-900 transition-colors duration-200 hover:text-sky-600 sm:text-lg">
                  <span className="mr-2 text-sky-500">Q.</span>
                  {faq.q}
                </h2>

                <span
                  aria-hidden="true"
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-2xl font-medium transition-all duration-300 ${
                    isOpen
                      ? "rotate-45 bg-sky-500 text-white"
                      : "bg-sky-50 text-sky-600"
                  }`}
                >
                  +
                </span>
              </button>

              <div
                id={answerId}
                aria-hidden={!isOpen}
                className={`grid transition-[grid-template-rows,opacity] duration-300 ease-in-out ${
                  isOpen
                    ? "grid-rows-[1fr] opacity-100"
                    : "grid-rows-[0fr] opacity-0"
                }`}
              >
                <div className="overflow-hidden">
                  <p className="px-5 pb-6 text-sm leading-7 text-slate-600 sm:px-6 sm:text-base">
                    {faq.a}
                  </p>
                </div>
              </div>
            </article>
          );
        })}
      </section>

      {/* Internal links */}
      <section className="mx-auto max-w-4xl px-5 pb-16 sm:px-8">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-sm sm:p-8">
          <h2 className="text-2xl font-extrabold tracking-tight text-slate-900">
            Learn More Before Delivery
          </h2>

          <p className="mx-auto mt-3 max-w-2xl text-sm leading-7 text-slate-600">
            Explore our inspection services and practical guides before making
            your car-buying decision.
          </p>

          <div className="mt-6 flex flex-col justify-center gap-4 sm:flex-row sm:flex-wrap">
            <Link
              href="/new-cars"
              className="font-semibold text-sky-600 underline-offset-4 transition-colors hover:text-blue-700 hover:underline"
            >
              New Car PDI
            </Link>

            <Link
              href="/car-delivery-checklist-pune"
              className="font-semibold text-sky-600 underline-offset-4 transition-colors hover:text-blue-700 hover:underline"
            >
              Delivery Checklist
            </Link>

            <Link
              href="/top-10-mistakes-while-buying-car-in-pune"
              className="font-semibold text-sky-600 underline-offset-4 transition-colors hover:text-blue-700 hover:underline"
            >
              Common Car-Buying Mistakes
            </Link>
          </div>
        </div>
      </section>

      {/* Booking CTA */}
      <section className="px-5 pb-20 sm:px-8 sm:pb-24">
        <div className="relative mx-auto max-w-4xl overflow-hidden rounded-3xl border border-sky-100 bg-white px-6 py-10 text-center shadow-lg shadow-slate-900/5 sm:px-12 sm:py-14">
          <div className="absolute left-0 top-0 h-1 w-full bg-gradient-to-r from-sky-400 to-blue-600" />

          <p className="text-xs font-bold uppercase tracking-[0.25em] text-sky-600">
            We're Here to Help
          </p>

          <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
            Still Have Questions?
          </h2>

          <p className="mx-auto mt-5 max-w-xl text-sm leading-7 text-slate-600 sm:text-base">
            Talk to our team or book a professional inspection before accepting
            your new car or purchasing a used vehicle.
          </p>

          <div className="mt-8 flex flex-col justify-center gap-4 sm:flex-row">


            <a
              href="https://wa.me/919975934213"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-8 py-4 text-base font-bold text-slate-800 transition-colors duration-200 hover:border-sky-300 hover:text-sky-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 focus-visible:ring-offset-2"
            >
              WhatsApp Expert
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}
