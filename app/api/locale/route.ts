import { NextResponse } from "next/server";
import { isLocale } from "@/lib/i18n";
import { LOCALE_COOKIE } from "@/lib/i18n-server";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null) as { locale?: unknown } | null;
  if (!isLocale(body?.locale)) return NextResponse.json({ error: "Invalid locale" }, { status: 400 });
  const response = NextResponse.json({ locale: body.locale });
  response.cookies.set(LOCALE_COOKIE, body.locale, {
    httpOnly: false,
    maxAge: 60 * 60 * 24 * 365,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
  });
  return response;
}
