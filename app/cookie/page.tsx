import { LegalPage } from "@/components/legal-page";
import { legalContent } from "@/lib/legal-content";
export const metadata = { title: legalContent.cookie.title, description: legalContent.cookie.intro, alternates: { canonical: "/cookie" } };
export default function CookiePage() { return <LegalPage topic="cookie" />; }
