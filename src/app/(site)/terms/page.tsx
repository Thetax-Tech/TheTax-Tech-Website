import { buildMetadata } from "@/lib/seo";
import { LegalPage } from "@/components/legal-page";

export const revalidate = 3600;

export function generateMetadata() {
  return buildMetadata({ path: "/terms", title: "Terms of Service", description: "Terms governing the use of the Theta X Tech website." });
}

export default function TermsPage() {
  return <LegalPage k="terms" path="/terms" />;
}
