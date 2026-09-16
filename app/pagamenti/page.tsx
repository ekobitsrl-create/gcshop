import { StoreHelpPage } from "@/components/store-help-page";
import { getRequestLocale } from "@/lib/i18n-server";
import { paymentHelp } from "@/lib/store-help";

export async function generateMetadata() {
  const copy = paymentHelp[await getRequestLocale()];
  return { title: copy.title, description: copy.intro, alternates: { canonical: "/pagamenti" } };
}
export default function PaymentsPage() { return <StoreHelpPage topic="payment" />; }
