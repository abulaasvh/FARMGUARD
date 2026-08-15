"use client";
import type { ReactNode } from "react";
import { useI18n } from "@/lib/i18n";

import { SiteNavbar } from "./site-navbar";
import { SiteFooter } from "./site-footer";

export function MarketingLayout({ children }: { children: ReactNode }) {
  const { t } = useI18n();
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteNavbar />
      <main className="flex-1">{children}</main>
      <SiteFooter />
    </div>
  );
}

export function PageHeader({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <section className="border-b border-border bg-surface">
      <div className="section-shell py-14 sm:py-20">
        <h1 className="max-w-3xl text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl">
          {title}
        </h1>
        <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
          {subtitle}
        </p>
      </div>
    </section>
  );
}
