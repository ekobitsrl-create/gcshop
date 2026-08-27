import { cookies } from "next/headers";
import { isLocale, type Locale } from "@/lib/i18n";

export const LOCALE_COOKIE = "lcs_locale";

export async function getRequestLocale(): Promise<Locale> {
  const value = (await cookies()).get(LOCALE_COOKIE)?.value;
  return isLocale(value) ? value : "it";
}
