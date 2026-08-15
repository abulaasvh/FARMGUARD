"use client";
import { Building2, Target, Users } from "lucide-react";
import { MarketingLayout, PageHeader } from "@/components/landing/marketing-layout";
import { CtaSection, TestimonialsSection } from "@/components/landing/sections";
import { Reveal } from "@/components/common/reveal";
import { useI18n } from "@/lib/i18n";

export default function AboutPage() {
  const { t } = useI18n();

  const pillars = [
    {
      icon: Target,
      title: "Our mission",
      body: "Make precision irrigation affordable for the 86% of Indian farmers who cultivate under two hectares.",
    },
    {
      icon: Users,
      title: "Who we serve",
      body: "Individual farmers, farmer producer organisations, cooperatives and the buyers who source from them.",
    },
    {
      icon: Building2,
      title: "Where we work",
      body: "Active deployments across Tamil Nadu, Karnataka, Kerala, Maharashtra, Telangana and Andhra Pradesh.",
    },
  ];

  const stats = [
    { value: "4,200+", label: "Acres monitored" },
    { value: "38%", label: "Average water saved" },
    { value: "1,150", label: "Farms onboarded" },
    { value: "62", label: "Buyer subscriptions" },
  ];

  return (
    <MarketingLayout>
      <PageHeader
        title="Built by agronomists, engineers and farmers"
        subtitle="FarmGuard started in the Cauvery delta with twelve pilot farms and a single question: why should irrigation still be a guess?"
      />

      <section className="section-shell py-16 sm:py-20">
        <div className="grid gap-5 md:grid-cols-3">
          {pillars.map((item, i) => (
            <Reveal key={item.title} delay={i * 0.06}>
              <article className="surface-card h-full p-6">
                <span className="grid h-11 w-11 place-items-center rounded-xl bg-secondary text-secondary-foreground">
                  <item.icon className="h-5 w-5" aria-hidden="true" />
                </span>
                <h2 className="mt-4 text-lg font-semibold text-foreground">{item.title}</h2>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{item.body}</p>
              </article>
            </Reveal>
          ))}
        </div>

        <Reveal delay={0.1}>
          <dl className="surface-card mt-8 grid grid-cols-2 gap-6 p-8 lg:grid-cols-4">
            {stats.map((stat) => (
              <div key={stat.label}>
                <dt className="text-sm text-muted-foreground">{stat.label}</dt>
                <dd className="mt-1 text-3xl font-bold text-primary">{stat.value}</dd>
              </div>
            ))}
          </dl>
        </Reveal>
      </section>

      <TestimonialsSection />
      <CtaSection />
    </MarketingLayout>
  );
}
