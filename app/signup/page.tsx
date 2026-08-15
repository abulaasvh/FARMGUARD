"use client";
import { motion } from "motion/react";
import {
  ArrowLeft,
  ArrowRight,
  BarChart3,
  Bell,
  Building2,
  CloudSun,
  Droplets,
  LineChart,
  Sprout,
  Tractor,
  TrendingUp,
  Warehouse,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/common/logo";
import { ThemeToggle } from "@/components/common/theme-toggle";
import { LanguageSelector } from "@/components/common/language-selector";
import { useI18n } from "@/lib/i18n";

export default function RoleSelectionPage() {
  const { t } = useI18n();

  const roles = [
    {
      href: "/farmer/signup",
      loginHref: "/farmer/login",
      icon: Tractor,
      title: t("auth.i_am_farmer"),
      blurb: t("auth.farmer_role_desc"),
      points: [
        { icon: Sprout, label: t("nav.Crop Health") },
        { icon: Droplets, label: t("nav.Smart Irrigation") },
        { icon: CloudSun, label: t("nav.Weather") },
        { icon: Bell, label: t("nav.Alerts") },
        { icon: BarChart3, label: t("nav.Analytics") },
      ],
      cta: t("landing.register_farmer"),
      loginLabel: t("landing.farmer_sign_in"),
    },
    {
      href: "/buyer/signup",
      loginHref: "/buyer/login",
      icon: Warehouse,
      title: t("auth.i_am_buyer"),
      blurb: t("auth.buyer_role_desc"),
      points: [
        { icon: LineChart, label: t("landing.feat_harvest") },
        { icon: Building2, label: t("buyer.procurement_requests") },
        { icon: TrendingUp, label: t("buyer.analytics_title") },
        { icon: BarChart3, label: t("nav.Procurement") },
        { icon: TrendingUp, label: t("landing.feat_crop_health") },
      ],
      cta: t("landing.register_buyer"),
      loginLabel: t("landing.buyer_sign_in"),
    },
  ];

  return (
    <div className="min-h-screen bg-surface px-4 py-8">
      <div className="section-shell">
        <div className="flex items-center justify-between">
          <Link href="/" aria-label={t("header.farmguard_home")}>
            <Logo />
          </Link>
          <div className="flex items-center gap-1">
            <LanguageSelector compact />
            <ThemeToggle />
            <Button variant="ghost" size="sm" asChild>
              <Link href="/login">{t("auth.login")}</Link>
            </Button>
          </div>
        </div>

        <div className="mx-auto mt-12 max-w-2xl text-center">
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
            {t("auth.select_role")}
          </h1>
          <p className="mt-4 text-muted-foreground">
            {t("auth.role_prompt")}
          </p>
        </div>

        <div className="mx-auto mt-10 grid max-w-5xl gap-6 lg:grid-cols-2">
          {roles.map((role, i) => (
            <motion.article
              key={role.href}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: i * 0.08 }}
              className="surface-card flex flex-col p-7 transition-shadow hover:shadow-[var(--shadow-lift)]"
            >
              <span className="grid h-12 w-12 place-items-center rounded-2xl bg-primary text-primary-foreground">
                <role.icon className="h-6 w-6" aria-hidden="true" />
              </span>
              <h2 className="mt-5 text-xl font-bold text-foreground">{role.title}</h2>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{role.blurb}</p>

              <ul className="mt-6 grid flex-1 gap-2.5">
                {role.points.map((point) => (
                  <li key={point.label} className="flex items-center gap-3 text-sm text-foreground">
                    <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-secondary text-secondary-foreground">
                      <point.icon className="h-4 w-4" aria-hidden="true" />
                    </span>
                    {point.label}
                  </li>
                ))}
              </ul>

              <div className="mt-7 space-y-3">
                <Button className="w-full" size="lg" asChild>
                  <Link href={role.href}>
                    {role.cta}
                    <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  </Link>
                </Button>
                <p className="text-center text-xs text-muted-foreground">
                  {t("auth.already_have_account")}{" "}
                  <Link href={role.loginHref} className="font-semibold text-primary hover:underline">
                    {role.loginLabel}
                  </Link>
                </p>
              </div>
            </motion.article>
          ))}
        </div>

        <div className="mt-10 text-center">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            {t("auth.back_to_home")}
          </Link>
        </div>
      </div>
    </div>
  );
}
