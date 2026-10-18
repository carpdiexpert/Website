
"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { CITIES } from "@/lib/cities";

const navLinks = [
  { label: "Home", href: "/" },
  { label: "Services", href: "/services" },
  { label: "Pricing", href: "/pricing" },
  { label: "How It Works", href: "/how-it-works" },
  { label: "About Us", href: "/about" },
];

type CityOption = {
  slug: string;
  name: string;
  state?: string;
};

const cityOptions: CityOption[] = Object.entries(CITIES).map(
  ([slug, city]) => ({
    slug,
    name: city.name,
    state: "state" in city ? String(city.state) : undefined,
  })
);

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();

  const [menuOpen, setMenuOpen] = useState(false);
  const [citiesOpen, setCitiesOpen] = useState(false);
  const [citySearch, setCitySearch] = useState("");

  const filteredCities = cityOptions.filter((city) =>
    `${city.name} ${city.state ?? ""}`
      .toLowerCase()
      .includes(citySearch.trim().toLowerCase())
  );

  useEffect(() => {
    if (!citiesOpen) return;

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setCitiesOpen(false);
        setCitySearch("");
      }
    }

    document.addEventListener("keydown", handleEscape);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "";
    };
  }, [citiesOpen]);

  function isActive(href: string) {
    if (href === "/") return pathname === "/";
    return pathname === href || pathname.startsWith(`${href}/`);
  }

  function isCityActive() {
    return cityOptions.some(
      (city) => pathname === `/${city.slug}` || pathname.startsWith(`/${city.slug}/`)
    );
  }

  function openCities() {
    setMenuOpen(false);
    setCitySearch("");
    setCitiesOpen(true);
  }

  function closeCities() {
    setCitiesOpen(false);
    setCitySearch("");
  }

  function selectCity(slug: string) {
    closeCities();
    router.push(`/${slug}`);
  }

  function handleBookInspection() {
    setMenuOpen(false);
    closeCities();

    if (pathname !== "/") {
      router.push("/?openBooking=1");
      return;
    }

    window.dispatchEvent(new Event("open-booking-chatbot"));
  }

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-white/10 bg-[#0B1220] text-white shadow-lg shadow-slate-950/10">
        <div className="mx-auto flex h-20 max-w-[1440px] items-center justify-between gap-3 px-4 sm:px-8 lg:px-12">
          {/* Logo and brand */}
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

              {/* Cities tab — same style as other navigation links */}
              <button
                type="button"
                onClick={openCities}
                aria-haspopup="dialog"
                aria-expanded={citiesOpen}
className={`rounded-xl px-4 py-3 text-left text-sm font-semibold transition-colors ${
  isCityActive()
    ? "bg-sky-400/10 text-sky-400"
    : "text-slate-300 hover:bg-white/5 hover:text-sky-400"
}`}
              >
                Cities
                {isCityActive() && (
                  <span className="mt-1 block h-0.5 rounded-full bg-sky-400" />
                )}
              </button>
            </nav>

            {/* Book Inspection comes immediately after Cities */}
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
  onClick={openCities}
  aria-haspopup="dialog"
  aria-expanded={citiesOpen}
  className={`whitespace-nowrap text-sm font-semibold transition-colors ${
    isCityActive()
      ? "text-sky-400"
      : "text-slate-300 hover:text-sky-400"
  }`}
>
  Cities
  {isCityActive() && (
    <span className="mt-1 block h-0.5 rounded-full bg-sky-400" />
  )}
</button>

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

      {/* City selection modal */}
      {citiesOpen && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-[#020617]/75 p-4 backdrop-blur-sm"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) closeCities();
          }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="cities-modal-title"
            className="flex max-h-[85vh] w-full max-w-2xl flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white text-[#0B1220] shadow-2xl"
          >
            <div className="flex items-start justify-between gap-4 border-b border-slate-100 p-5 sm:p-7">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-sky-600">
                  CarPDIExpert
                </p>
                <h2
                  id="cities-modal-title"
                  className="mt-2 text-2xl font-black sm:text-3xl"
                >
                  Choose your city
                </h2>
                <p className="mt-2 text-sm text-slate-500">
                  Select a location to view inspection services and prices.
                </p>
              </div>

              <button
                type="button"
                onClick={closeCities}
                aria-label="Close city selection"
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-200 text-slate-600 transition hover:bg-slate-100"
              >
                <span aria-hidden="true" className="text-2xl leading-none">
                  ×
                </span>
              </button>
            </div>

            <div className="p-5 sm:px-7">
              <label htmlFor="city-search" className="sr-only">
                Search cities
              </label>
              <input
                id="city-search"
                type="search"
                autoFocus
                value={citySearch}
                onChange={(event) => setCitySearch(event.target.value)}
                placeholder="Search city..."
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
              />
            </div>

            <div className="overflow-y-auto px-5 pb-6 sm:px-7">
              {filteredCities.length > 0 ? (
                <div className="grid gap-3 sm:grid-cols-2">
                  {filteredCities.map((city) => (
                    <button
                      key={city.slug}
                      type="button"
                      onClick={() => selectCity(city.slug)}
                      className="group flex items-center gap-3 rounded-2xl border border-slate-200 p-4 text-left transition hover:border-sky-400 hover:bg-sky-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400"
                    >
                      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#0B1220] text-sky-400 transition group-hover:bg-sky-500 group-hover:text-white">
                        <svg
                          aria-hidden="true"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.8"
                          className="h-5 w-5"
                        >
                          <path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z" />
                          <circle cx="12" cy="10" r="2.5" />
                        </svg>
                      </span>

                      <span className="min-w-0 flex-1">
                        <span className="block font-bold">{city.name}</span>
                        {city.state && (
                          <span className="mt-1 block text-xs text-slate-500">
                            {city.state}
                          </span>
                        )}
                      </span>
                    </button>
                  ))}
                </div>
              ) : (
                <p className="py-10 text-center text-sm text-slate-500">
                  No cities match “{citySearch}”. Try another search.
                </p>
              )}
            </div>

            <div className="border-t border-slate-100 bg-slate-50 px-5 py-3 text-xs text-slate-500 sm:px-7">
              {filteredCities.length}{" "}
              {filteredCities.length === 1 ? "city" : "cities"} available
            </div>
          </section>
        </div>
      )}
    </>
  );
}
