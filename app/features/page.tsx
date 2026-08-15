import { MarketingLayout, PageHeader } from "@/components/landing/marketing-layout";
import { CtaSection, FeaturesSection, WorkflowSection } from "@/components/landing/sections";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Features — FarmGuard IoT Irrigation & Crop Analytics",
  description:
    "Explore FarmGuard features: automated irrigation, solar IoT sensors, hyperlocal weather, crop health analytics, alerts and harvest forecasting.",
};

export default function FeaturesPage() {
  return (
    <MarketingLayout>
      <PageHeader
        title="Everything a modern farm needs, in one workspace"
        subtitle="Hardware, automation and analytics designed for two to twenty acre holdings and the buyers who source from them."
      />
      <FeaturesSection />
      <WorkflowSection />
      <CtaSection />
    </MarketingLayout>
  );
}
