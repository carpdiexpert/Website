
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Page Not Found | CarpdiExpert",
  description:
    "Sorry, we couldn't find the page you're looking for. Return to CarpdiExpert to explore professional car inspection services.",
  robots: {
    index: false,
    follow: true,
  },
};

export default function NotFound() {
  return (
    <main className="relative flex min-h-[75vh] items-center justify-center overflow-hidden bg-slate-50 px-4 py-16">
      {/* Decorative background */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-24 -top-24 h-72 w-72 rounded-full bg-sky-200/40 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-24 -right-24 h-80 w-80 rounded-full bg-blue-200/40 blur-3xl"
      />

      <section className="relative w-full max-w-2xl text-center">
        <div className="mx-auto mb-7 flex h-20 w-20 items-center justify-center rounded-3xl bg-[#0B1220] shadow-xl shadow-slate-900/15">
          <svg
            aria-hidden="true"
            viewBox="0 0 24 24"
            fill="none"
            className="h-10 w-10 text-sky-400"
          >
            <path
              d="M3 13.5 5.2 8a2 2 0 0 1 1.85-1.25h9.9A2 2 0 0 1 18.8 8l2.2 5.5v4a1.5 1.5 0 0 1-1.5 1.5h-1a1.5 1.5 0 0 1-1.5-1.5V17H7v2.5A1.5 1.5 0 0 1 5.5 21h-1A1.5 1.5 0 0 1 3 19.5v-6Z"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinejoin="round"
            />
            <path
              d="M5.2 13h13.6M7 17h.01M17 17h.01M6 9.5h12"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
            />
          </svg>
        </div>

        <p className="mb-3 text-sm font-bold uppercase tracking-[0.3em] text-blue-600">
          Error 404
        </p>

        <h1 className="text-4xl font-extrabold tracking-tight text-[#0B1220] sm:text-6xl">
          Looks like this road
          <span className="mt-2 block text-blue-600">
            leads nowhere.
          </span>
        </h1>

        <p className="mx-auto mt-6 max-w-lg text-base leading-7 text-slate-600 sm:text-lg">
          The page you’re looking for may have moved, been removed, or never
          existed. Don’t worry — we’ll help you get back on track.
        </p>

        <div className="mt-9 flex flex-col justify-center gap-3 sm:flex-row">
          <Link
            href="/"
            className="inline-flex min-h-12 shrink-0 items-center justify-center gap-3 self-start rounded-full bg-sky-400 px-6 text-sm font-bold text-[#0B1220] transition hover:bg-sky-300 md:self-center"
          >
            <svg
              aria-hidden="true"
              viewBox="0 0 24 24"
              fill="none"
              className="h-5 w-5"
            >
              <path
                d="m3 10 9-7 9 7M5 9v12h14V9M9 21v-7h6v7"
                stroke="currentColor"
                strokeWidth="1.7"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            Back to Homepage
          </Link>

          <Link
            href="/services"
            className="inline-flex min-h-12 shrink-0 items-center justify-center gap-3 self-start rounded-full bg-sky-400 px-6 text-sm font-bold text-[#0B1220] transition hover:bg-sky-300 md:self-center"
          >
            Explore services <span aria-hidden="true">↗</span>
          </Link>
        </div>

        <div className="mx-auto mt-12 max-w-md border-t border-slate-200 pt-6">
          <p className="text-sm text-slate-500">
            Need help with your car inspection?
          </p>
          <p className="mt-1 text-sm font-medium text-[#0B1220]">
            Explore our services and get back on the road with confidence.
          </p>
        </div>
      </section>
    </main>
  );
}
