
import { Suspense } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import CityLandingClient from "./CityLandingClient";
import { CITIES, getCity } from "@/lib/cities";

type PageProps = {
  params: Promise<{ city: string }>;
};

export function generateStaticParams() {
  return Object.keys(CITIES).map((city) => ({ city }));
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { city: slug } = await params;
  const city = getCity(slug);

  if (!city) {
    return { title: "City Not Found | CarpdiExpert" };
  }

  return {
    title: `Car Inspection in ${city.name} | CarpdiExpert`,
    description: `Explore standard new-car PDI, luxury-car inspection, EV inspection and used-car PPI prices in ${city.name}.`,
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
            <div
              key={item}
              className="h-48 rounded-2xl border border-slate-200 bg-slate-50"
            />
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
  const { city: slug } = await params;
  const city = getCity(slug);

  if (!city) {
    notFound();
  }

  return <CityLandingClient citySlug={slug.toLowerCase()} />;
}
