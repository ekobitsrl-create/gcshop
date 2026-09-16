import { LegalPage } from "@/components/legal-page";
import { legalContent } from "@/lib/legal-content";
export const metadata = { title: legalContent.privacy.title, description: legalContent.privacy.intro, alternates: { canonical: "/privacy" } };
export default function PrivacyPage() { return <LegalPage topic="privacy" />; }
