
"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";

const navLinks = [
  { label: "Home", href: "/" },
  { label: "Services", href: "/services" },
  { label: "Pricing", href: "/pricing" },
  { label: "How It Works", href: "/how-it-works" },
  { label: "About Us", href: "/about" },
];

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);

  function isActive(href: string) {
    if (href === "/") return pathname === "/";
    return pathname === href || pathname.startsWith(`${href}/`);
  }

  function handleBookInspection() {
    setMenuOpen(false);

    if (pathname !== "/") {
      router.push("/?openBooking=1");
      return;
    }

    window.dispatchEvent(new Event("open-booking-chatbot"));
  }

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-[#0B1220] text-white shadow-lg shadow-slate-950/10">
      <div className="mx-auto flex h-20 max-w-[1440px] items-center justify-between gap-3 px-4 sm:px-8 lg:px-12">
        {/* Logo and two-line brand text */}
        <Link
          href="/"
          aria-label="CarPDIExpert — Professional PDI Service"
          className="flex min-w-0 shrink-0 items-center gap-2 sm:gap-3"
          onClick={() => setMenuOpen(false)}
        >
          <Image
            src="/carpdiexpert-logo.png"
            alt=""
            width={180}
            height={120}
            priority
            sizes="(max-width: 640px) 80px, 120px"
            className="h-12 w-[76px] object-contain sm:h-14 sm:w-[100px] lg:w-[120px]"
          />

          <span className="flex flex-col justify-center leading-tight">
            <span className="whitespace-nowrap text-base font-extrabold tracking-tight text-white sm:text-xl lg:text-2xl">
              CarPDI<span className="text-sky-400">Expert</span>
            </span>
            <span className="mt-1 whitespace-nowrap text-[9px] font-semibold tracking-wide text-slate-300 sm:text-[11px] lg:text-xs">
              Professional PDI Service
            </span>
          </span>
        </Link>

        {/* Desktop navigation */}
        <div className="hidden items-center gap-5 lg:flex xl:gap-8">
          <nav
            aria-label="Main navigation"
            className="flex items-center gap-5 xl:gap-7"
          >
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                aria-current={isActive(link.href) ? "page" : undefined}
                className={`whitespace-nowrap text-sm font-semibold transition-colors ${
                  isActive(link.href)
                    ? "text-sky-400"
                    : "text-slate-300 hover:text-sky-400"
                }`}
              >
                {link.label}
                {isActive(link.href) && (
                  <span className="mt-1 block h-0.5 rounded-full bg-sky-400" />
                )}
              </Link>
            ))}
          </nav>

          <button
            type="button"
            onClick={handleBookInspection}
            className="inline-flex min-h-11 shrink-0 items-center justify-center rounded-full bg-sky-400 px-5 py-3 text-sm font-bold text-[#0B1220] transition hover:bg-sky-300"
          >
            Book Inspection
            <span className="ml-2" aria-hidden="true">
              ↗
            </span>
          </button>
        </div>

        {/* Tablet and mobile controls */}
        <div className="flex shrink-0 items-center gap-2 lg:hidden">
          <button
            type="button"
            onClick={handleBookInspection}
            className="hidden min-h-10 items-center justify-center rounded-full bg-sky-400 px-3 py-2 text-xs font-bold text-[#0B1220] transition hover:bg-sky-300 sm:inline-flex"
          >
            Book Inspection
          </button>

          <button
            type="button"
            className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-white/15 text-white transition hover:border-sky-400/50 hover:bg-white/5"
            aria-label={
              menuOpen ? "Close navigation menu" : "Open navigation menu"
            }
            aria-expanded={menuOpen}
            aria-controls="mobile-navigation"
            onClick={() => setMenuOpen((current) => !current)}
          >
            {menuOpen ? (
              <svg
                aria-hidden="true"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="h-6 w-6"
              >
                <path d="M6 6l12 12M18 6L6 18" />
              </svg>
            ) : (
              <svg
                aria-hidden="true"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="h-6 w-6"
              >
                <path d="M4 7h16M4 12h16M4 17h16" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile and tablet navigation */}
      {menuOpen && (
        <nav
          id="mobile-navigation"
          aria-label="Mobile navigation"
          className="border-t border-white/10 bg-[#0B1220] px-4 py-4 sm:px-5 lg:hidden"
        >
          <div className="mx-auto flex max-w-[1440px] flex-col gap-1 sm:px-3">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                aria-current={isActive(link.href) ? "page" : undefined}
                onClick={() => setMenuOpen(false)}
                className={`rounded-xl px-4 py-3 text-sm font-semibold transition-colors ${
                  isActive(link.href)
                    ? "bg-sky-400/10 text-sky-400"
                    : "text-slate-300 hover:bg-white/5 hover:text-sky-400"
                }`}
              >
                {link.label}
              </Link>
            ))}

            <button
              type="button"
              onClick={handleBookInspection}
              className="mt-3 inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-sky-400 px-5 py-3 text-sm font-bold text-[#0B1220] transition hover:bg-sky-300 sm:hidden"
            >
              Book Inspection
              <span aria-hidden="true">↗</span>
            </button>
          </div>
        </nav>
      )}
    </header>
  );
}
