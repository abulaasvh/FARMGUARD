import { MarketingLayout } from "@/components/landing/marketing-layout";
import { Hero } from "@/components/landing/hero";
import {
  BenefitsSections,
  CtaSection,
  FaqSection,
  FeaturesSection,
  HowItWorksSection,
  TestimonialsSection,
  WorkflowSection,
} from "@/components/landing/sections";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "FarmGuard — Smart Irrigation & Harvest Intelligence",
  description:
    "FarmGuard automates irrigation with affordable IoT sensors for Indian farms and gives buyers verified harvest forecasts for procurement planning.",
};

export default function LandingPage() {
  return (
    <MarketingLayout>
      <Hero />
      <FeaturesSection />
      <HowItWorksSection />
      <BenefitsSections />
      <WorkflowSection />
      <TestimonialsSection />
      <FaqSection />
      <CtaSection />
    </MarketingLayout>
  );
}
