"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Building2,
  Leaf,
  MapPin,
  Ruler,
  CalendarDays,
  Activity,
  Droplets,
  Layers,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { shortDate, num, getLocalizedCrop } from "@/utils/format";
import { getFarmDetail } from "@/services/buyer";
import type { FarmDetail, FarmPlotDetail } from "@/services/buyer";
import { useI18n } from "@/lib/i18n";

/** Health score badge tone */
function healthTone(score: number | null): "default" | "outline" | "secondary" | "destructive" {
  if (score === null) return "secondary";
  if (score >= 85) return "default";
  if (score >= 65) return "secondary";
  return "destructive";
}

/** Health label */
function getHealthLabel(score: number | null, t: (k: string) => string): string {
  if (score === null) return t("crop_health.not_set");
  if (score >= 85) return t("crop_health.status_good");
  if (score >= 65) return t("crop_health.status_fair");
  return t("crop_health.status_poor");
}

/** A single info row used throughout the detail cards */
function InfoRow({
  icon: Icon,
  label,
  value,
  fallbackText,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string | null | undefined;
  fallbackText?: string;
}) {
  return (
    <div className="flex items-start gap-3 py-2">
      <Icon className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" aria-hidden="true" />
      <div className="min-w-0">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-sm font-medium text-foreground">
          {value ?? <span className="italic text-muted-foreground">{fallbackText || "Data not available"}</span>}
        </p>
      </div>
    </div>
  );
}

/** Plot card — read-only crop plot view for buyers */
function PlotCard({ plot, index }: { plot: FarmPlotDetail; index: number }) {
  const { t } = useI18n();
  const daysToHarvest = plot.expectedHarvestDate
    ? Math.ceil(
        (new Date(plot.expectedHarvestDate).getTime() - Date.now()) / 86_400_000,
      )
    : null;

  return (
    <article className="surface-card p-5" aria-label={`Plot: ${plot.name ?? `Plot ${index + 1}`}`}>
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-sm font-semibold text-foreground">
          {plot.name ?? t("dashboard.plot_label", { id: index + 1 })}
        </h3>
        <Badge variant={healthTone(plot.healthScore)}>
          {getHealthLabel(plot.healthScore, t)}
          {plot.healthScore !== null && ` — ${plot.healthScore}`}
        </Badge>
      </div>

      <div className="mt-4 grid gap-0 divide-y divide-border/60">
        <InfoRow icon={Leaf} label={t("buyer.table_crop")} value={getLocalizedCrop(plot.cropName || "", t)} fallbackText={t("crop_health.data_not_available")} />
        <InfoRow
          icon={Ruler}
          label={t("myfarm.area_acres")}
          value={plot.areaAcres !== null ? t("common.acres", { acres: num(plot.areaAcres, 1) }) : null}
          fallbackText={t("crop_health.data_not_available")}
        />
        <InfoRow icon={CalendarDays} label={t("myfarm.sowing_date")} value={shortDate(plot.sowingDate)} fallbackText={t("crop_health.data_not_available")} />
        <InfoRow
          icon={CalendarDays}
          label={t("myfarm.expected_harvest")}
          fallbackText={t("crop_health.data_not_available")}
          value={
            plot.expectedHarvestDate
              ? `${shortDate(plot.expectedHarvestDate)}${
                  daysToHarvest !== null && daysToHarvest > 0
                    ? ` (${t("crop_health.days_count", { days: daysToHarvest })})`
                    : daysToHarvest !== null && daysToHarvest <= 0
                    ? ` (${t("crop_health.status_passed")})`
                    : ""
                }`
              : null
          }
        />
        <InfoRow icon={Layers} label={t("myfarm.soil_type")} value={plot.soilType} fallbackText={t("crop_health.data_not_available")} />
        <InfoRow icon={Droplets} label={t("myfarm.irrigation")} value={plot.irrigationMethod} fallbackText={t("crop_health.data_not_available")} />
      </div>

      {/* Yield estimate */}
      {plot.areaAcres !== null ? (
        <div className="mt-4 rounded-lg border border-border bg-secondary/40 p-3">
          <p className="text-xs font-medium text-muted-foreground">
            {t("buyer.est_yield_title")}
          </p>
          {plot.cropName ? (
            <p className="mt-1 text-lg font-bold text-foreground">
              {num(plot.areaAcres * 2.5, 1)} – {num(plot.areaAcres * 3.5, 1)} {t("buyer.tonnes")}
            </p>
          ) : (
            <p className="mt-1 text-sm italic text-muted-foreground">
              {t("buyer.not_avail_no_crop")}
            </p>
          )}
          <p className="mt-1 text-xs text-muted-foreground">
            {t("buyer.rough_est_note", { acres: num(plot.areaAcres, 1) })}
          </p>
        </div>
      ) : (
        <div className="mt-4 rounded-lg border border-border bg-secondary/40 p-3">
          <p className="text-xs text-muted-foreground italic">
            {t("buyer.yield_not_avail")}
          </p>
        </div>
      )}
    </article>
  );
}

export default function BuyerFarmDetailPage() {
  const { farmId } = useParams<{ farmId: string }>();
  const router = useRouter();
  const { t } = useI18n();
  const [farm, setFarm] = useState<FarmDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!farmId) return;
    let mounted = true;
    async function load() {
      try {
        const data = await getFarmDetail(farmId);
        if (!mounted) return;
        if (data) {
          setFarm(data);
        } else {
          setNotFound(true);
        }
      } catch (err) {
        console.error("Farm detail load error:", err);
        if (mounted) setNotFound(true);
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
    return () => { mounted = false; };
  }, [farmId]);

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-40 w-full rounded-xl" />
        <div className="grid gap-5 md:grid-cols-2">
          <Skeleton className="h-64 rounded-xl" />
          <Skeleton className="h-64 rounded-xl" />
        </div>
      </div>
    );
  }

  if (notFound || !farm) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-24 text-center">
        <Building2 className="h-12 w-12 text-muted-foreground/50" />
        <p className="text-lg font-semibold text-foreground">{t("buyer.farm_not_found")}</p>
        <p className="text-sm text-muted-foreground">
          {t("buyer.farm_not_found_desc")}
        </p>
        <Button variant="outline" onClick={() => router.back()}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          {t("common.back")}
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Back navigation */}
      <div>
        <button
          onClick={() => router.back()}
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          {t("buyer.back_to_market")}
        </button>
      </div>

      {/* Farm header */}
      <header className="surface-card p-6">
        <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-xl font-bold tracking-tight text-foreground">
              {farm.farmName ?? t("buyer.unnamed_farm")}
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {[farm.village, farm.district, farm.state].filter(Boolean).join(", ") ||
                t("weather.not_configured")}
            </p>
          </div>
          {farm.primaryCropName && (
            <Badge variant="secondary" className="mt-2 sm:mt-0 shrink-0">
              <Leaf className="mr-1.5 h-3 w-3" />
              {getLocalizedCrop(farm.primaryCropName, t)}
            </Badge>
          )}
        </div>

        {/* Farm-level details */}
        <div className="mt-5 grid gap-0 divide-y divide-border/60 sm:grid-cols-2 sm:divide-y-0 sm:gap-x-8">
          <InfoRow
            icon={Building2}
            label={t("buyer.farmer_label")}
            value={farm.farmerName ?? t("buyer.name_not_disclosed")}
            fallbackText={t("crop_health.data_not_available")}
          />
          <InfoRow
            icon={MapPin}
            label={t("auth.village")}
            value={[farm.village, farm.district, farm.state].filter(Boolean).join(", ") || null}
            fallbackText={t("crop_health.data_not_available")}
          />
          <InfoRow
            icon={Ruler}
            label={t("myfarm.total_area")}
            value={farm.totalAcres !== null ? t("common.acres", { acres: num(farm.totalAcres, 1) }) : null}
            fallbackText={t("crop_health.data_not_available")}
          />
          <InfoRow
            icon={Activity}
            label={t("buyer.num_plots")}
            value={
              farm.plots.length > 0 ? t("buyer.active_plots", { count: farm.plots.length }) : t("buyer.no_plots_registered")
            }
            fallbackText={t("crop_health.data_not_available")}
          />
        </div>

        {/* Read-only notice */}
        <p className="mt-4 rounded-md border border-border bg-secondary/40 px-3 py-2 text-xs text-muted-foreground">
          {t("buyer.readonly_farm_notice")}
        </p>
      </header>

      {/* Plot cards */}
      {farm.plots.length === 0 ? (
        <div className="surface-card p-8 text-center">
          <Layers className="mx-auto h-10 w-10 text-muted-foreground/40" />
          <p className="mt-3 text-sm font-medium text-muted-foreground">{t("buyer.no_plots_registered")}</p>
          <p className="mt-1 text-xs text-muted-foreground">
            {t("buyer.no_plots_desc")}
          </p>
        </div>
      ) : (
        <>
          <h2 className="text-base font-semibold text-foreground">
            {t("buyer.crop_plots_title", { count: farm.plots.length })}
          </h2>
          <div className="grid gap-5 md:grid-cols-2">
            {farm.plots.map((plot, i) => (
              <PlotCard key={plot.id ?? i} plot={plot} index={i} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
