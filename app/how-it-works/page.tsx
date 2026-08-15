import { MarketingLayout, PageHeader } from "@/components/landing/marketing-layout";
import { CtaSection, FaqSection, HowItWorksSection } from "@/components/landing/sections";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "How FarmGuard Works — From Sensor to Harvest Forecast",
  description:
    "See how FarmGuard maps your farm, installs solar IoT sensors, automates irrigation and shares verified harvest forecasts with buyers.",
};

export default function HowItWorksPage() {
  return (
    <MarketingLayout>
      <PageHeader
        title="From installation to intelligence in one week"
        subtitle="A guided onboarding built around rural connectivity, shared pumps and seasonal crop calendars."
      />
      <HowItWorksSection />
      <FaqSection />
      <CtaSection />
    </MarketingLayout>
  );
}
