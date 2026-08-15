"use client";
import Link from "next/link";
import { motion } from "motion/react";
import { ArrowRight, Droplets, LineChart, Radio, ShoppingBasket } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/lib/i18n";

const pillars = [
  { icon: Droplets, label: "Smart Irrigation" },
  { icon: Radio, label: "IoT Monitoring" },
  { icon: LineChart, label: "Harvest Prediction" },
  { icon: ShoppingBasket, label: "Marketplace Intelligence" },
];

export function Hero() {
  const { t } = useI18n();

  return (
    <section className="relative overflow-hidden border-b border-border bg-surface">
      <div className="section-shell grid items-center gap-12 py-14 lg:grid-cols-2 lg:py-24">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        >
          <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1.5 text-xs font-semibold tracking-wide text-secondary-foreground uppercase">
            <span className="pulse-dot h-2 w-2 rounded-full bg-primary text-primary" />
            {t("hero.built_for")}
          </span>

          <h1 className="mt-5 text-4xl leading-[1.1] font-extrabold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
            {t("hero.title")}
          </h1>

          <p className="mt-5 max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg">
            {t("hero.subtitle")}
          </p>

          <div className="mt-8 grid gap-3 sm:grid-cols-2">
            <div className="rounded-xl border border-border bg-card p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-primary">
                  {t("landing.farmer_portal")}
                </span>
              </div>
              <div className="flex gap-2">
                <Button size="sm" className="w-full" asChild>
                  <Link href="/farmer/signup">{t("landing.register")}</Link>
                </Button>
                <Button size="sm" variant="outline" className="w-full" asChild>
                  <Link href="/farmer/login">{t("landing.sign_in")}</Link>
                </Button>
              </div>
            </div>

            <div className="rounded-xl border border-border bg-card p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-secondary-foreground">
                  {t("landing.buyer_portal")}
                </span>
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="secondary" className="w-full" asChild>
                  <Link href="/buyer/signup">{t("landing.register")}</Link>
                </Button>
                <Button size="sm" variant="outline" className="w-full" asChild>
                  <Link href="/buyer/login">{t("landing.sign_in")}</Link>
                </Button>
              </div>
            </div>
          </div>

          <ul className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {pillars.map((pillar) => (
              <li
                key={pillar.label}
                className="surface-card flex flex-col gap-2 p-3 text-sm font-medium text-foreground"
              >
                <pillar.icon className="h-5 w-5 text-primary" aria-hidden="true" />
                {t(`nav.${pillar.label}`)}
              </li>
            ))}
          </ul>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
          className="relative"
        >
          <div
            className="w-full rounded-3xl border border-border shadow-[var(--shadow-lift)] overflow-hidden"
            style={{ aspectRatio: "16/11" }}
          >
            <div className="w-full h-full bg-gradient-to-br from-[oklch(0.42_0.104_148.5)] via-[oklch(0.62_0.14_150)] to-[oklch(0.74_0.14_148)] flex items-center justify-center">
              <div className="text-center text-primary-foreground opacity-80">
                <Droplets className="h-20 w-20 mx-auto mb-4 opacity-60" />
                <p className="text-xl font-semibold">{t("landing.platform_name")}</p>
              </div>
            </div>
          </div>
          <div className="glass-card absolute bottom-4 left-4 right-4 flex items-center justify-between gap-4 p-4 sm:left-6 sm:right-auto sm:w-72">
            <div>
              <p className="text-xs font-medium text-muted-foreground">
                {t("hero.zone_a_moisture")}
              </p>
              <p className="text-2xl font-bold text-foreground">42%</p>
            </div>
            <div className="text-right">
              <p className="text-xs font-medium text-muted-foreground">
                {t("dashboard.pump_status")}
              </p>
              <p className="text-sm font-semibold text-primary">{t("hero.auto_paused")}</p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
