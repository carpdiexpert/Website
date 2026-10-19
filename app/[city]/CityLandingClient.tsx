
"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getCity } from "@/lib/cities";

type Props = {
  citySlug: string;
};


  const whatsapp = (process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "").replace(
    /\D/g,
    ""
  );
const inputClass =
  "w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none transition-colors duration-200 placeholder:text-slate-400 focus:border-sky-500 focus:ring-2 focus:ring-sky-100";

const primaryButtonClass =
  "inline-flex items-center justify-center rounded-xl bg-blue-600 px-6 py-3 font-bold text-white transition-colors duration-200 hover:bg-sky-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 focus-visible:ring-offset-2";

const secondaryButtonClass =
  "inline-flex items-center justify-center rounded-xl border border-sky-400 bg-sky-400 px-6 py-3 font-bold text-[#0B1220] transition-colors duration-200 hover:border-blue-600 hover:bg-blue-600 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 focus-visible:ring-offset-2";
export default function CityLandingClient({ citySlug }: Props) {
  const city = getCity(citySlug);

  const [service, setService] = useState("standardCars");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [vehicle, setVehicle] = useState("");
  const [date, setDate] = useState("");
  const [notes, setNotes] = useState("");
  const [minDate, setMinDate] = useState("");

  useEffect(() => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");

    setMinDate(`${year}-${month}-${day}`);
  }, []);

  if (!city) {
    return (
      <main className="mx-auto max-w-3xl px-6 py-24 text-center">
        <h1 className="text-3xl font-black text-[#0B1220]">
          City not found
        </h1>
        <p className="mt-3 text-slate-600">
          Please return to the homepage and choose another location.
        </p>
        <Link href="/" className={`${primaryButtonClass} mt-6`}>
          Back to home
        </Link>
      </main>
    );
  }

  const serviceOptions = [
    {
      key: "standardCars",
      title: "Standard New-Car PDI",
      description: "Pre-delivery checks before accepting a new car.",
      price: city.newCars.standardCars,
    },
    {
      key: "luxuryCars",
      title: "Luxury-Car Inspection",
      description: "Inspection option for premium vehicles.",
      price: city.newCars.luxuryCars,
    },
    {
      key: "evCars",
      title: "Electric Vehicle Inspection",
      description: "EV-focused checks where supported.",
      price: city.newCars.evCars,
    },
    {
      key: "usedCar",
      title: "Used-Car PPI",
      description: "Pre-purchase inspection for a used vehicle.",
      price: city.usedCar,
    },
  ];

  const selectedService =
    serviceOptions.find((item) => item.key === service) ??
    serviceOptions[0];

  function submitEnquiry(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!whatsapp) {
      window.alert(
        "Please configure NEXT_PUBLIC_WHATSAPP_NUMBER in your environment variables."
      );
      return;
    }

    const message = [
      `Hello CarPDIExpert, I would like to enquire about an inspection in ${city.name}.`,
      "",
      `Name: ${name}`,
      `Phone: ${phone}`,
      `City: ${city.name}`,
      `Service: ${selectedService.title}`,
      `Listed price: ₹${selectedService.price.toLocaleString("en-IN")}`,
      `Vehicle: ${vehicle || "Not specified"}`,
      `Preferred date: ${date || "To be discussed"}`,
      `Additional details: ${notes || "None"}`,
    ].join("\n");

    window.open(
      `https://wa.me/${whatsapp}?text=${encodeURIComponent(message)}`,
      "_blank",
      "noopener,noreferrer"
    );
  }

  return (
    <main className="overflow-hidden bg-white text-slate-900">
      {/* City hero with animated horizontal and vertical inspection scans */}
      <section className="relative isolate overflow-hidden bg-[#061426] text-white">
        <div aria-hidden="true" className="absolute inset-0 bg-[radial-gradient(ellipse_at_75%_20%,rgba(0,210,255,0.20),transparent_48%)]" />
        <div className="mx-auto grid max-w-7xl items-center gap-10 px-5 py-12 sm:px-6 sm:py-16 lg:grid-cols-[0.8fr_1.2fr] lg:gap-12 lg:py-20">
          <div className="relative z-10">
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-cyan-300">
              CarPDIExpert / {city.name}
            </p>
            <h1 className="mt-5 max-w-2xl text-4xl font-black leading-tight sm:text-5xl lg:text-6xl">
              Professional car PDI service in <span className="text-cyan-300">{city.name}</span>
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-8 text-slate-200">
              Before you sign, pay or accept delivery, understand the car you are buying. Explore vehicle inspection options and transparent listed prices.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="#pricing" className={primaryButtonClass}>View inspection prices</Link>
              <Link href="#book" className="inline-flex items-center justify-center rounded-xl border border-white/25 bg-white/5 px-6 py-3 font-bold text-white transition-colors duration-200 hover:border-cyan-300 hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300 focus-visible:ring-offset-2 focus-visible:ring-offset-[#061426]">Send an enquiry</Link>
            </div>
            <p className="mt-6 text-sm text-slate-400">Location: {city.name}, {city.state}</p>
          </div>

          <div className="relative isolate overflow-hidden rounded-2xl border border-cyan-300/40 bg-[#061426] shadow-[0_0_45px_rgba(0,195,255,0.15)]">
            <img
              src="/carpdiexpert-hero.png"
              alt={`CarPDIExpert professional pre-delivery inspection service with 400 inspection checkpoints in ${city.name}`}
              width={1536}
              height={1024}
              fetchPriority="high"
              className="block h-auto w-full object-cover"
            />
            <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
<div className="pdi-scan-vertical absolute top-[20%] h-[60%] w-[2px] bg-gradient-to-b from-transparent via-cyan-300 to-transparent shadow-[0_0_16px_4px_rgba(34,211,238,0.8)]" />
              <div className="absolute inset-0 bg-cyan-300/[0.035]" />
            </div>
            <div className="pointer-events-none absolute inset-0 rounded-2xl ring-1 ring-inset ring-white/10" />
          </div>
        </div>

<style jsx>{`
  .pdi-scan-vertical {
    animation: pdi-scan-v 2.2s ease-in-out infinite alternate;
  }

  @keyframes pdi-scan-v {
    from {
      left: 23%;
      opacity: 0.95;
    }
    to {
      left: 82%;
      opacity: 0.95;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .pdi-scan-vertical {
      animation: none;
      left: 50%;
      opacity: 0.55;
    }
  }
`}</style>

      </section>

      {/* Pricing */}
      <section id="pricing" className="scroll-mt-24 py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-6">
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-sky-600">
            Pricing in {city.name}
          </p>

          <h2 className="mt-4 text-3xl font-black text-[#0B1220] sm:text-4xl">
            Choose your inspection.
          </h2>

          <p className="mt-4 max-w-2xl leading-7 text-slate-600">
            Select a service to review the listed price and start an enquiry.
          </p>

          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {serviceOptions.map((item) => {
              const selected = service === item.key;

              return (
                <button
                  type="button"
                  key={item.key}
                  aria-pressed={selected}
                  onClick={() => {
                    setService(item.key);
                    document
                      .getElementById("book")
                      ?.scrollIntoView({ behavior: "smooth" });
                  }}
                  className={`rounded-2xl border p-6 text-left transition-all duration-200 hover:-translate-y-1 hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 focus-visible:ring-offset-2 ${
                    selected
                      ? "border-sky-500 bg-sky-50 ring-1 ring-sky-500 shadow-md shadow-sky-900/5"
                      : "border-slate-200 bg-white hover:border-sky-300"
                  }`}
                >
                  <span className="text-xs font-bold uppercase tracking-wider text-sky-600">
                    {item.key === "usedCar" ? "PRE-OWNED" : "NEW VEHICLE"}
                  </span>

                  <h3 className="mt-4 text-lg font-bold text-[#0B1220]">
                    {item.title}
                  </h3>

                  <p className="mt-3 min-h-12 text-sm leading-6 text-slate-600">
                    {item.description}
                  </p>

                  <p className="mt-5 text-3xl font-black text-[#0B1220]">
                    ₹{item.price.toLocaleString("en-IN")}
                  </p>

                  <p className="mt-2 text-sm font-bold text-sky-600">
                    {selected ? "Selected" : "Select this service"}
                  </p>
                </button>
              );
            })}
          </div>

          <p className="mt-6 text-xs leading-6 text-slate-500">
            Prices shown are from the current configuration. Confirm the
            final rate, inspection scope and availability before booking.
          </p>
        </div>
      </section>

      {/* Process */}
      <section className="bg-slate-50 py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-6">
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-sky-600">
            Simple process
          </p>

          <h2 className="mt-3 text-3xl font-black text-[#0B1220] sm:text-4xl">
            How it works
          </h2>

          <div className="mt-8 grid gap-5 md:grid-cols-3">
            {[
              [
                "01",
                "Choose a service",
                "Select the inspection that fits your vehicle.",
              ],
              [
                "02",
                "Share vehicle details",
                "Tell us the model, location and preferred date.",
              ],
              [
                "03",
                "Confirm the arrangement",
                "Discuss scope, availability and next steps with the team.",
              ],
            ].map(([number, title, description]) => (
              <article
                key={number}
                className="rounded-2xl border border-slate-200 bg-white p-6 transition-colors duration-200 hover:border-sky-200"
              >
                <p className="text-sm font-black text-sky-600">{number}</p>
                <h3 className="mt-4 text-xl font-bold text-[#0B1220]">
                  {title}
                </h3>
                <p className="mt-3 leading-7 text-slate-600">
                  {description}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Booking enquiry */}
      <section id="book" className="scroll-mt-24 py-16 sm:py-24">
        <div className="mx-auto grid max-w-7xl gap-10 px-6 lg:grid-cols-2">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-sky-600">
              Start an enquiry
            </p>

            <h2 className="mt-4 text-3xl font-black text-[#0B1220] sm:text-4xl">
              Arrange an inspection in {city.name}.
            </h2>

            <p className="mt-5 max-w-xl leading-8 text-slate-600">
              Share your contact and vehicle details. The enquiry will open
              in WhatsApp so you can review and send it to the business.
            </p>

            <div className="mt-8 rounded-2xl bg-[#0B1220] p-6 text-white">
              <p className="text-sm font-semibold text-sky-400">
                YOUR SELECTED SERVICE
              </p>

              <h3 className="mt-3 text-xl font-bold">
                {selectedService.title}
              </h3>

              <p className="mt-3 text-3xl font-black">
                ₹{selectedService.price.toLocaleString("en-IN")}
              </p>

              <p className="mt-2 text-sm text-slate-400">
                {city.name}, {city.state}
              </p>
            </div>
          </div>

          <form
            onSubmit={submitEnquiry}
            className="space-y-5 rounded-3xl border border-slate-200 bg-white p-6 shadow-xl shadow-slate-900/5 sm:p-8"
          >
            <div>
              <label
                htmlFor="customer-name"
                className="mb-2 block text-sm font-semibold text-[#0B1220]"
              >
                Full name *
              </label>
              <input
                id="customer-name"
                required
                autoComplete="name"
                value={name}
                onChange={(event) => setName(event.target.value)}
                className={inputClass}
                placeholder="Your name"
              />
            </div>

            <div>
              <label
                htmlFor="customer-phone"
                className="mb-2 block text-sm font-semibold text-[#0B1220]"
              >
                Phone number *
              </label>
              <input
                id="customer-phone"
                required
                type="tel"
                inputMode="tel"
                autoComplete="tel"
                pattern="[+]?[0-9 ()-]{8,20}"
                value={phone}
                onChange={(event) => setPhone(event.target.value)}
                className={inputClass}
                placeholder="Your contact number"
              />
            </div>

            <div>
              <label
                htmlFor="vehicle-model"
                className="mb-2 block text-sm font-semibold text-[#0B1220]"
              >
                Vehicle make and model
              </label>
              <input
                id="vehicle-model"
                value={vehicle}
                onChange={(event) => setVehicle(event.target.value)}
                className={inputClass}
                placeholder="e.g. Hyundai Creta"
              />
            </div>

            <div>
              <label
                htmlFor="preferred-date"
                className="mb-2 block text-sm font-semibold text-[#0B1220]"
              >
                Preferred inspection date
              </label>
              <input
                id="preferred-date"
                type="date"
                min={minDate || undefined}
                value={date}
                onChange={(event) => setDate(event.target.value)}
                className={inputClass}
              />
            </div>

            <div>
              <label
                htmlFor="extra-notes"
                className="mb-2 block text-sm font-semibold text-[#0B1220]"
              >
                Additional details
              </label>
              <textarea
                id="extra-notes"
                rows={3}
                value={notes}
                onChange={(event) => setNotes(event.target.value)}
                className={`${inputClass} resize-y`}
                placeholder="Any questions or additional requirements?"
              />
            </div>

            <button
              type="submit"
              className={`${primaryButtonClass} w-full py-4`}
            >
              Continue to WhatsApp
            </button>

            <p className="text-xs leading-5 text-slate-500">
              This is an enquiry, not a confirmed booking. Final pricing,
              scope and availability must be confirmed with the team.
            </p>
          </form>
        </div>
      </section>

      {/* Related pages */}
      <section className="bg-slate-50 px-6 py-12">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-xl font-black text-[#0B1220]">
              Need more information?
            </h2>
            <p className="mt-2 text-sm text-slate-600">
              Learn about our process or browse all inspection services.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link href="/services" className={secondaryButtonClass}>
              Our services
            </Link>

            <Link href="/about" className={secondaryButtonClass}>
              About us
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
