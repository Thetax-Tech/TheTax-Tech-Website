import { buildMetadata } from "@/lib/seo";
import { LegalPage } from "@/components/legal-page";

export const revalidate = 3600;

export function generateMetadata() {
  return buildMetadata({ path: "/privacy-policy", title: "Privacy Policy", description: "How ThetaX Tech SMC Private Limited collects, uses and protects your personal information." });
}

export default function PrivacyPage() {
  return <LegalPage k="privacy" path="/privacy-policy" />;
}
