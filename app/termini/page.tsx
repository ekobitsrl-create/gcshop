import { LegalPage } from "@/components/legal-page";
import { legalContent } from "@/lib/legal-content";
export const metadata = { title: legalContent.termini.title, description: legalContent.termini.intro, alternates: { canonical: "/termini" } };
export default function TermsPage() { return <LegalPage topic="termini" />; }
