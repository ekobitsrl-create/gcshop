import { StoreHelpPage } from "@/components/store-help-page";
import { getRequestLocale } from "@/lib/i18n-server";
import { sizeHelp } from "@/lib/store-help";

export async function generateMetadata() {
  const copy = sizeHelp[await getRequestLocale()];
  return { title: copy.title, description: copy.intro, alternates: { canonical: "/guida-taglie" } };
}
export default function SizeGuidePage() { return <StoreHelpPage topic="size" />; }
