
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
          <p>Made for more informed car buying.</p>
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
        </div>
      </div>
    </footer>
  );
}
