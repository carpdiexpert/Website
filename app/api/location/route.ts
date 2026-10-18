
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const forwardedFor = request.headers.get("x-forwarded-for");
    const realIp = request.headers.get("x-real-ip");

    // Prefer the first forwarded IP when provided by your hosting proxy.
    const ip = forwardedFor?.split(",")[0]?.trim() || realIp;

    // Local development often uses a private/local IP.
    if (!ip || ip === "::1" || ip === "127.0.0.1") {
      return NextResponse.json({
        city: null,
        region: null,
        country: null,
      });
    }

    const response = await fetch(
      `https://ipapi.co/${encodeURIComponent(ip)}/json/`,
      { cache: "no-store" }
    );

    if (!response.ok) {
      return NextResponse.json({
        city: null,
        region: null,
        country: null,
      });
    }

    const data = await response.json();

    return NextResponse.json({
      city: data.city ?? null,
      region: data.region ?? null,
      country: data.country_name ?? null,
    });
  } catch (error) {
    console.error("Location lookup failed:", error);

    return NextResponse.json({
      city: null,
      region: null,
      country: null,
    });
  }
}
