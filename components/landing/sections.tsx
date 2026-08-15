"use client";
import Link from "next/link";
import { useI18n } from "@/lib/i18n";

import {
  Activity,
  BarChart3,
  Bell,
  Cloud,
  Cpu,
  Droplets,
  Gauge,
  Leaf,
  LineChart,
  MapPin,
  Package,
  Quote,
  Satellite,
  ShieldCheck,
  Signal,
  Sprout,
  TrendingUp,
  Users,
} from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/common/reveal";

function SectionHeader({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <div className="mx-auto max-w-2xl text-center">
      <p className="text-xs font-bold tracking-[0.18em] text-primary uppercase">{eyebrow}</p>
      <h2 className="mt-3 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
        {title}
      </h2>
      <p className="mt-4 text-base leading-relaxed text-muted-foreground">{description}</p>
    </div>
  );
}

export function FeaturesSection() {
  const { t } = useI18n();

  const features = [
    {
      icon: Droplets,
      title: t("landing.feat_auto_irrigation"),
      body: t("landing.feat_auto_irrigation_desc"),
    },
    {
      icon: Cpu,
      title: t("landing.feat_iot_kit"),
      body: t("landing.feat_iot_kit_desc"),
    },
    {
      icon: Cloud,
      title: t("landing.feat_weather"),
      body: t("landing.feat_weather_desc"),
    },
    {
      icon: Leaf,
      title: t("landing.feat_crop_health"),
      body: t("landing.feat_crop_health_desc"),
    },
    {
      icon: Bell,
      title: t("landing.feat_alerts"),
      body: t("landing.feat_alerts_desc"),
    },
    {
      icon: LineChart,
      title: t("landing.feat_harvest"),
      body: t("landing.feat_harvest_desc"),
    },
  ];

  return (
    <section id="features" className="section-shell py-16 sm:py-24">
      <Reveal>
        <SectionHeader
          eyebrow={t("landing.platform")}
          title={t("landing.platform_eyebrow_title")}
          description={t("landing.platform_desc")}
        />
      </Reveal>
      <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {features.map((feature, i) => (
          <Reveal key={feature.title} delay={i * 0.05}>
            <article className="surface-card h-full p-6 transition-shadow hover:shadow-[var(--shadow-lift)]">
              <span className="grid h-11 w-11 place-items-center rounded-xl bg-secondary text-secondary-foreground">
                <feature.icon className="h-5 w-5" aria-hidden="true" />
              </span>
              <h3 className="mt-4 text-lg font-semibold text-foreground">{feature.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{feature.body}</p>
            </article>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

export function HowItWorksSection() {
  const { t } = useI18n();

  const steps = [
    {
      icon: MapPin,
      title: t("landing.step1_title"),
      body: t("landing.step1_desc"),
    },
    {
      icon: Satellite,
      title: t("landing.step2_title"),
      body: t("landing.step2_desc"),
    },
    {
      icon: Activity,
      title: t("landing.step3_title"),
      body: t("landing.step3_desc"),
    },
    {
      icon: TrendingUp,
      title: t("landing.step4_title"),
      body: t("landing.step4_desc"),
    },
  ];

  return (
    <section id="how-it-works" className="border-y border-border bg-surface py-16 sm:py-24">
      <div className="section-shell">
        <Reveal>
          <SectionHeader
            eyebrow={t("nav.how")}
            title={t("landing.how_title")}
            description={t("landing.how_desc")}
          />
        </Reveal>
        <ol className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          {steps.map((step, i) => (
            <Reveal key={step.title} delay={i * 0.06}>
              <li className="surface-card h-full p-6">
                <div className="flex items-center justify-between">
                  <span className="grid h-11 w-11 place-items-center rounded-xl bg-primary text-primary-foreground">
                    <step.icon className="h-5 w-5" aria-hidden="true" />
                  </span>
                  <span className="text-3xl font-bold text-border">0{i + 1}</span>
                </div>
                <h3 className="mt-4 text-lg font-semibold text-foreground">{step.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{step.body}</p>
              </li>
            </Reveal>
          ))}
        </ol>
      </div>
    </section>
  );
}

function BenefitList({ items }: { items: string[] }) {
  return (
    <ul className="mt-6 space-y-3">
      {items.map((item) => (
        <li key={item} className="flex items-start gap-3 text-sm text-foreground">
          <ShieldCheck className="mt-0.5 h-4.5 w-4.5 shrink-0 text-primary" aria-hidden="true" />
          <span className="leading-relaxed">{item}</span>
        </li>
      ))}
    </ul>
  );
}

export function BenefitsSections() {
  const { t } = useI18n();

  const farmerBenefits = [
    t("landing.farmer_benefit1"),
    t("landing.farmer_benefit2"),
    t("landing.farmer_benefit3"),
    t("landing.farmer_benefit4"),
    t("landing.farmer_benefit5"),
  ];

  const buyerBenefits = [
    t("landing.buyer_benefit1"),
    t("landing.buyer_benefit2"),
    t("landing.buyer_benefit3"),
    t("landing.buyer_benefit4"),
    t("landing.buyer_benefit5"),
  ];

  return (
    <section className="section-shell space-y-16 py-16 sm:space-y-24 sm:py-24">
      <Reveal>
        <div className="grid items-center gap-10 lg:grid-cols-2">
          <div>
            <p className="text-xs font-bold tracking-[0.18em] text-primary uppercase">
              {t("landing.for_farmers")}
            </p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              {t("landing.farmer_headline")}
            </h2>
            <p className="mt-4 leading-relaxed text-muted-foreground">
              {t("landing.farmer_desc")}
            </p>
            <BenefitList items={farmerBenefits} />
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Button asChild>
                <Link href="/farmer/signup">{t("landing.start_farmer")}</Link>
              </Button>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/farmer/login">{t("landing.farmer_sign_in")} →</Link>
              </Button>
            </div>
          </div>
          <div className="w-full rounded-3xl border border-border bg-gradient-to-br from-emerald-950/30 via-secondary/40 to-card p-10 text-center shadow-[var(--shadow-soft)] flex flex-col items-center justify-center min-h-[320px]">
            <Sprout className="h-16 w-16 text-primary mb-4" />
            <h3 className="text-xl font-bold text-foreground">{t("landing.farmer_advisory_title")}</h3>
            <p className="mt-2 text-sm text-muted-foreground max-w-md">{t("landing.farmer_advisory_desc")}</p>
          </div>
        </div>
      </Reveal>

      <Reveal>
        <div className="grid items-center gap-10 lg:grid-cols-2">
          <div className="w-full rounded-3xl border border-border bg-gradient-to-br from-blue-950/30 via-secondary/40 to-card p-10 text-center shadow-[var(--shadow-soft)] lg:order-2 flex flex-col items-center justify-center min-h-[320px]">
            <LineChart className="h-16 w-16 text-primary mb-4" />
            <h3 className="text-xl font-bold text-foreground">{t("landing.buyer_proc_title")}</h3>
            <p className="mt-2 text-sm text-muted-foreground max-w-md">{t("landing.buyer_proc_desc")}</p>
          </div>
          <div>
            <p className="text-xs font-bold tracking-[0.18em] text-primary uppercase">
              {t("landing.for_buyers")}
            </p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              {t("landing.buyer_headline")}
            </h2>
            <p className="mt-4 leading-relaxed text-muted-foreground">
              {t("landing.buyer_desc")}
            </p>
            <BenefitList items={buyerBenefits} />
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Button variant="secondary" asChild>
                <Link href="/buyer/signup">{t("landing.start_buyer")}</Link>
              </Button>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/buyer/login">{t("landing.buyer_sign_in")} →</Link>
              </Button>
            </div>
          </div>
        </div>
      </Reveal>
    </section>
  );
}

export function WorkflowSection() {
  const { t } = useI18n();

  const workflow = [
    { icon: Gauge, label: t("landing.wf1_title"), detail: t("landing.wf1_desc") },
    { icon: Signal, label: t("landing.wf2_title"), detail: t("landing.wf2_desc") },
    { icon: Cpu, label: t("landing.wf3_title"), detail: t("landing.wf3_desc") },
    { icon: BarChart3, label: t("landing.wf4_title"), detail: t("landing.wf4_desc") },
  ];

  return (
    <section className="border-y border-border bg-surface py-16 sm:py-24">
      <div className="section-shell">
        <Reveal>
          <SectionHeader
            eyebrow={t("landing.workflow_eyebrow")}
            title={t("landing.workflow_title")}
            description={t("landing.workflow_desc")}
          />
        </Reveal>
        <div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          {workflow.map((node, i) => (
            <Reveal key={node.label} delay={i * 0.06}>
              <div className="surface-card relative h-full p-6">
                <span className="grid h-11 w-11 place-items-center rounded-xl bg-secondary text-secondary-foreground">
                  <node.icon className="h-5 w-5" aria-hidden="true" />
                </span>
                <h3 className="mt-4 text-base font-semibold text-foreground">{node.label}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{node.detail}</p>
                <span className="mt-4 inline-flex items-center gap-2 text-xs font-medium text-primary">
                  <span className="pulse-dot h-1.5 w-1.5 rounded-full bg-primary text-primary" />
                  {t("dashboard.live")}
                </span>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

export function TestimonialsSection() {
  const { t } = useI18n();

  const testimonials = [
    {
      name: t("landing.t1_name"),
      role: t("landing.t1_role"),
      quote: t("landing.t1_quote"),
    },
    {
      name: t("landing.t2_name"),
      role: t("landing.t2_role"),
      quote: t("landing.t2_quote"),
    },
    {
      name: t("landing.t3_name"),
      role: t("landing.t3_role"),
      quote: t("landing.t3_quote"),
    },
  ];

  return (
    <section className="section-shell py-16 sm:py-24">
      <Reveal>
        <SectionHeader
          eyebrow={t("landing.testimonials_eyebrow")}
          title={t("landing.testimonials_title")}
          description={t("landing.testimonials_desc")}
        />
      </Reveal>
      <div className="mt-12 grid gap-5 lg:grid-cols-3">
        {testimonials.map((item, i) => (
          <Reveal key={item.name} delay={i * 0.06}>
            <figure className="surface-card h-full p-6">
              <Quote className="h-6 w-6 text-accent" aria-hidden="true" />
              <blockquote className="mt-4 text-sm leading-relaxed text-foreground">
                {item.quote}
              </blockquote>
              <figcaption className="mt-6 flex items-center gap-3 border-t border-border pt-4">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-secondary text-secondary-foreground">
                  <Users className="h-4.5 w-4.5" aria-hidden="true" />
                </span>
                <span className="min-w-0">
                  <span className="block truncate text-sm font-semibold text-foreground">
                    {item.name}
                  </span>
                  <span className="block truncate text-xs text-muted-foreground">{item.role}</span>
                </span>
              </figcaption>
            </figure>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

export function FaqSection() {
  const { t } = useI18n();

  const faqs = [
    { q: t("landing.faq1_q"), a: t("landing.faq1_a") },
    { q: t("landing.faq2_q"), a: t("landing.faq2_a") },
    { q: t("landing.faq3_q"), a: t("landing.faq3_a") },
    { q: t("landing.faq4_q"), a: t("landing.faq4_a") },
    { q: t("landing.faq5_q"), a: t("landing.faq5_a") },
    { q: t("landing.faq6_q"), a: t("landing.faq6_a") },
  ];

  return (
    <section className="border-t border-border bg-surface py-16 sm:py-24">
      <div className="section-shell">
        <Reveal>
          <SectionHeader
            eyebrow={t("landing.faq_eyebrow")}
            title={t("landing.faq_title")}
            description={t("landing.faq_desc")}
          />
        </Reveal>
        <Reveal delay={0.05}>
          <div className="surface-card mx-auto mt-10 max-w-3xl px-5 py-2 sm:px-7">
            <Accordion type="single" collapsible>
              {faqs.map((faq, i) => (
                <AccordionItem key={faq.q} value={`faq-${i}`}>
                  <AccordionTrigger className="text-left text-base font-semibold">
                    {faq.q}
                  </AccordionTrigger>
                  <AccordionContent className="text-sm leading-relaxed text-muted-foreground">
                    {faq.a}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

export function CtaSection() {
  const { t } = useI18n();

  return (
    <section className="section-shell py-16 sm:py-20">
      <Reveal>
        <div className="surface-card flex flex-col items-start gap-6 p-8 sm:p-12 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-xl">
            <span className="grid h-11 w-11 place-items-center rounded-xl bg-primary text-primary-foreground">
              <Sprout className="h-5 w-5" aria-hidden="true" />
            </span>
            <h2 className="mt-4 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              {t("landing.cta_title")}
            </h2>
            <p className="mt-3 leading-relaxed text-muted-foreground">
              {t("landing.cta_desc")}
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button size="lg" asChild>
              <Link href="/signup">{t("landing.cta_create")}</Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/contact">{t("landing.cta_talk")}</Link>
            </Button>
          </div>
        </div>
      </Reveal>
    </section>
  );
}

export { Package as PackageIcon };
