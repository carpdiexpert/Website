import { Suspense } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import CityLandingClient from "./CityLandingClient";
import { CITIES, getCity } from "@/lib/cities";
import SeoJsonLd from "@/components/SeoJsonLd";
import { SITE_URL } from "@/lib/seo";

type PageProps = {
  params: Promise<{ city: string }>;
};

export function generateStaticParams() {
  return Object.keys(CITIES).map((city) => ({ city }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { city: rawSlug } = await params;
  const slug = rawSlug.toLowerCase();
  const city = getCity(slug);

  if (!city) {
    return {
      title: "City Not Found",
      robots: { index: false, follow: false },
    };
  }

  const title = `Car Inspection in ${city.name} – PDI & Used Car Inspection`;
  const description =
    `Compare car inspection options in ${city.name}, including new-car pre-delivery inspection (PDI), used-car pre-purchase inspection (PPI), luxury-car checks and EV inspection. Explore local pricing and book online with CarpdiExpert.`;
  const canonical = `${SITE_URL}/${encodeURIComponent(slug)}`;

  return {
    title,
    description,
    keywords: [
      `car inspection ${city.name}`,
      `used car inspection ${city.name}`,
      `pre delivery inspection ${city.name}`,
      `car PDI ${city.name}`,
      `pre purchase car inspection ${city.name}`,
      `EV inspection ${city.name}`,
    ],
    alternates: { canonical },
    openGraph: {
      type: "website",
      siteName: "CarpdiExpert",
      url: canonical,
      title,
      description,
      locale: "en_IN",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
    robots: {
      index: true,
      follow: true,
      googleBot: { index: true, follow: true, "max-image-preview": "large" },
    },
  };
}

function CityPageFallback() {
  return (
    <main className="min-h-[60vh] bg-white px-6 py-24">
      <div className="mx-auto max-w-7xl animate-pulse">
        <div className="h-4 w-40 rounded bg-slate-200" />
        <div className="mt-6 h-12 max-w-xl rounded bg-slate-200" />
        <div className="mt-4 h-5 max-w-2xl rounded bg-slate-100" />
        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((item) => (
            <div key={item} className="h-48 rounded-2xl border border-slate-200 bg-slate-50" />
          ))}
        </div>
      </div>
    </main>
  );
}

export default function CityPage({ params }: PageProps) {
  return (
    <Suspense fallback={<CityPageFallback />}>
      <CityPageContent params={params} />
    </Suspense>
  );
}

async function CityPageContent({ params }: PageProps) {
  const { city: rawSlug } = await params;
  const slug = rawSlug.toLowerCase();
  const city = getCity(slug);

  if (!city) notFound();

  const pagePath = `/${encodeURIComponent(slug)}`;
  const title = `Car Inspection in ${city.name} – PDI & Used Car Inspection`;
  const description =
    `Compare car inspection options in ${city.name}, including new-car PDI, used-car PPI, luxury-car checks and EV inspection. Explore local pricing and book online with CarpdiExpert.`;

  return (
    <>
      <SeoJsonLd
        pagePath={pagePath}
        pageTitle={title}
        pageDescription={description}
      />
      <CityLandingClient citySlug={slug} />
    </>
  );
}
