"use client";
import type { ComponentType, ReactNode } from "react";
import { useI18n } from "@/lib/i18n";

import { motion } from "motion/react";
import { TrendingDown, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

/** Reusable KPI / sensor tile. */
export function StatCard({
  label,
  value,
  unit,
  icon: Icon,
  trend,
  status = "optimal",
  footnote,
  index = 0,
}: {
  label: string;
  value: string | number;
  unit?: string;
  icon: ComponentType<{ className?: string }>;
  trend?: number;
  status?: "optimal" | "warning" | "critical";
  footnote?: string;
  index?: number;
}) {
  const { t } = useI18n();
  const tone =
    status === "critical"
      ? "bg-destructive/12 text-destructive"
      : status === "warning"
        ? "bg-warning/18 text-warning-foreground"
        : "bg-secondary text-secondary-foreground";

  return (
    <motion.article
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: index * 0.04 }}
      className="surface-card p-5"
    >
      <div className="flex items-start justify-between gap-3">
        <span className={cn("grid h-10 w-10 shrink-0 place-items-center rounded-xl", tone)}>
          <Icon className="h-5 w-5" />
        </span>
        {typeof trend === "number" && (
          <span
            className={cn(
              "inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-semibold",
              trend >= 0 ? "bg-success/15 text-success" : "bg-destructive/12 text-destructive",
            )}
          >
            {trend >= 0 ? (
              <TrendingUp className="h-3.5 w-3.5" />
            ) : (
              <TrendingDown className="h-3.5 w-3.5" />
            )}
            {Math.abs(trend)}%
          </span>
        )}
      </div>
      <p className="mt-4 text-sm text-muted-foreground">{label}</p>
      <p className="mt-1 text-2xl font-bold text-foreground">
        {value}
        {unit && <span className="ml-1 text-base font-semibold text-muted-foreground">{unit}</span>}
      </p>
      {footnote && <p className="mt-1 text-xs text-muted-foreground">{footnote}</p>}
    </motion.article>
  );
}

/** Reusable chart container with consistent header and height. */
export function ChartCard({
  title,
  description,
  children,
  className,
}: {
  title: string;
  description?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("surface-card p-5", className)}>
      <header className="mb-4">
        <h2 className="text-base font-semibold text-foreground">{title}</h2>
        {description && <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>}
      </header>
      <div className="h-64 w-full">{children}</div>
    </section>
  );
}

export function WidgetSkeleton() {
  return <Skeleton className="h-32 w-full rounded-xl" />;
}
