
"use client";

import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { useCity } from "@/components/CityProvider";
import { CITY_OPTIONS } from "@/lib/cityOptions";

const mainLinks = [
  { label: "Home", href: "/" },
  { label: "Services", href: "/services" },
  { label: "Pricing", href: "/pricing" },
  { label: "How It Works", href: "/how-it-works" },
  { label: "About Us", href: "/about" },

];

const informationLinks = [
  { label: "FAQs", href: "/info/faqs" },
  { label: "Privacy Policy", href: "/info/privacy-policy" },
  { label: "Terms of Service", href: "/info/terms-of-service" },
  { label: "Cancellation Policy", href: "/info/cancellation-policy" },
];

function FooterLink({
  href,
  children,
}: {
  href: string;
  children: ReactNode;
}) {
  return (
    <Link
      href={href}
      className="text-sm !text-white transition-colors duration-200 hover:!text-sky-400"
    >
      {children}
    </Link>
  );
}

export default function Footer() {
  const { city: selectedCity } = useCity();

  const cityName =
    CITY_OPTIONS.find((option) => option.slug === selectedCity)?.name ??
    CITY_OPTIONS[0]?.name ??
    "Pune";

  const tagline = `Professional PDI Service in ${cityName}`;

  return (
    <footer className="bg-[#0B1220] text-white">
      <div className="mx-auto max-w-[1440px] px-5 pb-7 pt-12 sm:px-8 sm:pt-16 lg:px-12">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-[1.5fr_1fr_1fr] lg:gap-12">
          {/* Brand */}
          <div>
            <Link
              href="/"
              aria-label="CarPDIExpert home"
              className="inline-flex items-center gap-3"
            >
              <Image
                src="/carpdiexpert-logo.png"
                alt="CarPDIExpert logo"
                width={180}
                height={120}
                sizes="100px"
                className="h-14 w-[90px] object-contain"
              />

              <span className="flex flex-col leading-tight">
                <span className="whitespace-nowrap text-xl font-extrabold tracking-tight text-white sm:text-2xl">
                  CarPDI<span className="text-sky-400">Expert</span>
                </span>

                <span className="mt-1 text-[10px] font-semibold tracking-wide text-slate-300 sm:text-xs">
                  {tagline}
                </span>
              </span>
            </Link>


<p className="mt-5 max-w-md text-sm leading-7 text-slate-300">
  Helping car buyers make more informed decisions through vehicle
  inspection services for new cars, luxury vehicles, EVs and used
  cars.
</p>

{/* Social Media & Contact Buttons */}
<div className="mt-5 flex flex-wrap items-center gap-3">
  {/* Instagram */}
  <a
    href="https://www.instagram.com/carpdiexpert/"
    target="_blank"
    rel="noopener noreferrer"
    aria-label="Follow CarPDIExpert on Instagram"
    className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/15 bg-white/5 text-white transition-all duration-200 hover:border-pink-400 hover:bg-pink-500/15 hover:text-pink-400"
  >
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      className="h-5 w-5"
      aria-hidden="true"
    >
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
    </svg>
  </a>

  {/* WhatsApp */}
  <a
    href="https://wa.me/917822937299"
    target="_blank"
    rel="noopener noreferrer"
    aria-label="Chat with CarPDIExpert on WhatsApp"
    className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/15 bg-white/5 text-white transition-all duration-200 hover:border-green-400 hover:bg-green-500/15 hover:text-green-400"
  >
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className="h-5 w-5"
      aria-hidden="true"
    >
      <path d="M20.52 3.48A11.82 11.82 0 0 0 12.08 0C5.5 0 .14 5.36.14 11.94c0 2.1.55 4.15 1.59 5.96L0 24l6.25-1.64a11.94 11.94 0 0 0 5.82 1.49h.01c6.58 0 11.94-5.36 11.94-11.94a11.86 11.86 0 0 0-3.5-8.43ZM12.08 21.8a9.88 9.88 0 0 1-5.03-1.37l-.36-.21-3.71.97.99-3.62-.23-.37a9.86 9.86 0 0 1-1.51-5.26c0-5.44 4.43-9.87 9.88-9.87a9.8 9.8 0 0 1 6.98 2.9 9.8 9.8 0 0 1 2.89 6.98c0 5.45-4.43 9.88-9.89 9.88Zm5.42-7.4c-.3-.15-1.76-.87-2.03-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.95 1.17-.17.2-.35.22-.65.07-.3-.15-1.25-.46-2.38-1.47-.88-.78-1.47-1.75-1.64-2.05-.17-.3-.02-.46.13-.61.13-.13.3-.35.45-.52.15-.18.2-.3.3-.5.1-.2.05-.37-.03-.52-.07-.15-.67-1.62-.92-2.22-.24-.58-.48-.5-.67-.51h-.57c-.2 0-.52.07-.79.37-.27.3-1.04 1.02-1.04 2.48s1.07 2.87 1.22 3.07c.15.2 2.1 3.2 5.09 4.49.71.31 1.27.5 1.7.64.72.23 1.37.2 1.89.12.58-.09 1.76-.72 2.01-1.42.25-.7.25-1.3.17-1.42-.07-.12-.27-.2-.57-.35Z" />
    </svg>
  </a>

  {/* Call */}
  <a
    href="tel:+917822937299"
    aria-label="Call CarPDIExpert"
    className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/15 bg-white/5 text-white transition-all duration-200 hover:border-sky-400 hover:bg-sky-500/15 hover:text-sky-400"
  >
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-5 w-5"
      aria-hidden="true"
    >
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2A19.79 19.79 0 0 1 11.2 18.8a19.5 19.5 0 0 1-6-6A19.79 19.79 0 0 1 2.09 3.18 2 2 0 0 1 4.08 1h3a2 2 0 0 1 2 1.72c.12.96.35 1.9.7 2.8a2 2 0 0 1-.45 2.11L8.06 8.9a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.9.35 1.84.58 2.8.7A2 2 0 0 1 22 16.92Z" />
    </svg>
  </a>
</div>

          </div>

          {/* Main navigation */}
          <div>
            <h2 className="text-xs font-bold uppercase tracking-[0.18em] text-sky-400">
              Explore
            </h2>

            <nav
              aria-label="Footer main navigation"
              className="mt-5 grid grid-cols-2 gap-x-4 gap-y-3 sm:grid-cols-1"
            >
              {mainLinks.map((link) => (
                <FooterLink key={link.href} href={link.href}>
                  {link.label}
                </FooterLink>
              ))}
            </nav>
          </div>

          {/* Information navigation */}
          <div>
            <h2 className="text-xs font-bold uppercase tracking-[0.18em] text-sky-400">
              Help &amp; Information
            </h2>

            <nav
              aria-label="Footer information and policies"
              className="mt-5 flex flex-col items-start gap-3"
            >
              {informationLinks.map((link) => (
                <FooterLink key={link.href} href={link.href}>
                  {link.label}
                </FooterLink>
              ))}
            </nav>
          </div>
        </div>

        {/* Copyright and credit */}
        <div className="mt-12 flex flex-col gap-3 border-t border-white/15 pt-6 text-xs text-slate-400 sm:flex-row sm:items-center sm:justify-between">
          <p>© 2026 CarpdiExpert. All rights reserved.</p>

          <p>
            Website by{" "}
            <a
              href="https://techworks.3dvishwa.com"
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-white transition-colors duration-200 hover:text-sky-400"
            >
              3dVishwa Software Solutions
            </a>
          </p>
                    <p>Made for more informed car buying.</p>
        </div>
      </div>
    </footer>
  );
}
