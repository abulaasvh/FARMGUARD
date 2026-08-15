"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { PageTitle } from "@/components/dashboard/dashboard-shell-next";
import { useSession } from "@/lib/session";
import { useI18n } from "@/lib/i18n";
import { useFarmerRealtime } from "@/hooks/use-farmer-realtime";
import { ChartCard } from "@/components/dashboard/widgets";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { axis, tooltipStyle } from "@/components/dashboard/chart-theme";
import { Button } from "@/components/ui/button";
import {
  Sprout,
  Droplets,
  Thermometer,
  Wind,
  CloudRain,
  Info,
  Calendar,
  Clock,
  AlertTriangle,
  Loader2,
} from "lucide-react";
import { CROP_CONFIGS, DEFAULT_CROP_CONFIG } from "@/constants";
import { formatRelativeTime, getLocalizedCrop, getLocalizedStatus, shortDate } from "@/utils/format";

export default function PageFarmerCropHealth() {
  const { t } = useI18n();
  const user = useSession();
  const {
    sensorReadings = [],
    farmPlots = [],
    weeklyMoisture = [],
    pumpActual,
    valveActual,
    irrigationStatus,
    loading,
    error,
  } = useFarmerRealtime();

  const [selectedPlotId, setSelectedPlotId] = useState<string | null>(null);

  // Synchronize default selected plot when farmPlots load or change
  useEffect(() => {
    if (farmPlots.length > 0) {
      if (!selectedPlotId || !farmPlots.some((p) => p.id === selectedPlotId)) {
        setSelectedPlotId(farmPlots[0]!.id);
      }
    }
  }, [farmPlots, selectedPlotId]);

  const currentPlot = farmPlots.find((p) => p.id === selectedPlotId) || farmPlots[0] || null;
  const currentCropName = currentPlot?.crop || "Tomato";
  const cropConfig = CROP_CONFIGS[currentCropName] || CROP_CONFIGS[currentPlot?.crop || ""] || DEFAULT_CROP_CONFIG;

  // Extract live sensor values from hardware
  const soilItem = sensorReadings.find((r) => r.id === "soil-moisture");
  const tempItem = sensorReadings.find((r) => r.id === "temperature");
  const humItem = sensorReadings.find((r) => r.id === "humidity");
  const rainItem = sensorReadings.find((r) => r.id === "rain-prediction");

  const soilMoistureVal = typeof soilItem?.value === "number" ? soilItem.value : null;
  const tempVal = typeof tempItem?.value === "number" ? tempItem.value : null;
  const humVal = typeof humItem?.value === "number" ? humItem.value : null;
  const rainDetected = rainItem?.value === 100;

  // Transparent crop health score calculation based on real sensor inputs and crop thresholds
  let scoreAchieved = 0;
  let maxPossibleScore = 0;

  if (soilMoistureVal != null) {
    maxPossibleScore += 40;
    if (soilMoistureVal >= cropConfig.minMoisture && soilMoistureVal <= cropConfig.maxMoisture) {
      scoreAchieved += 40;
    } else if (
      soilMoistureVal >= cropConfig.minMoisture - 10 &&
      soilMoistureVal <= cropConfig.maxMoisture + 10
    ) {
      scoreAchieved += 25;
    } else {
      scoreAchieved += 10;
    }
  }

  if (tempVal != null) {
    maxPossibleScore += 30;
    if (tempVal >= cropConfig.minTemp && tempVal <= cropConfig.maxTemp) {
      scoreAchieved += 30;
    } else if (tempVal >= cropConfig.minTemp - 5 && tempVal <= cropConfig.maxTemp + 5) {
      scoreAchieved += 20;
    } else {
      scoreAchieved += 10;
    }
  }

  if (humVal != null) {
    maxPossibleScore += 30;
    if (humVal >= cropConfig.minHumidity && humVal <= cropConfig.maxHumidity) {
      scoreAchieved += 30;
    } else {
      scoreAchieved += 15;
    }
  }

  const cropHealthScore =
    maxPossibleScore > 0 ? Math.round((scoreAchieved / maxPossibleScore) * 100) : null;

  const cropHealthStatus =
    cropHealthScore != null
      ? cropHealthScore >= 80
        ? t("crop_health.status_good")
        : cropHealthScore >= 60
          ? t("crop_health.status_fair")
          : t("crop_health.status_poor")
      : t("crop_health.data_not_available");

  // Harvest Timeline Calculations based on real database records
  const sowingDateStr = currentPlot?.sowingDate || "";
  let harvestDateStr = currentPlot?.expectedHarvest || "";
  let isEstimatedHarvest = false;

  // If expected harvest is missing but sowing date is present, calculate estimated harvest date
  if (!harvestDateStr && sowingDateStr) {
    const sow = new Date(sowingDateStr);
    if (!Number.isNaN(sow.getTime())) {
      const estDate = new Date(sow.getTime() + cropConfig.durationDays * 86400000);
      harvestDateStr = estDate.toISOString().slice(0, 10);
      isEstimatedHarvest = true;
    }
  }

  let daysRemaining: number | null = null;
  let progressPct = 0;
  let harvestStatusText = t("crop_health.status_not_started");
  let growthStageLabel = t("crop_health.data_not_available");

  if (sowingDateStr && harvestDateStr) {
    const sow = new Date(sowingDateStr);
    const harvest = new Date(harvestDateStr);
    const today = new Date();

    if (!Number.isNaN(sow.getTime()) && !Number.isNaN(harvest.getTime()) && harvest > sow) {
      const totalMs = harvest.getTime() - sow.getTime();
      const passedMs = today.getTime() - sow.getTime();
      const remainingMs = harvest.getTime() - today.getTime();

      daysRemaining = Math.max(0, Math.ceil(remainingMs / (1000 * 60 * 60 * 24)));
      progressPct = Math.min(100, Math.max(0, Math.round((passedMs / totalMs) * 100)));

      if (passedMs < 0) {
        harvestStatusText = t("crop_health.status_not_started");
        growthStageLabel = t("crop_health.status_not_started");
      } else if (daysRemaining === 0 || progressPct >= 100) {
        harvestStatusText = t("crop_health.status_due");
        growthStageLabel = t("crop_health.growth_stage_ready");
      } else if (daysRemaining <= 7) {
        harvestStatusText = t("crop_health.status_approaching");
        growthStageLabel = t("crop_health.growth_stage_maturation");
      } else {
        harvestStatusText = t("crop_health.status_growing");
        if (progressPct < 40) {
          growthStageLabel = t("crop_health.growth_stage_vegetative");
        } else if (progressPct < 75) {
          growthStageLabel = t("crop_health.growth_stage_flowering");
        } else {
          growthStageLabel = t("crop_health.growth_stage_maturation");
        }
      }
    }
  }

  const lastUpdatedStr =
    soilItem?.updatedAt || tempItem?.updatedAt || humItem?.updatedAt
      ? formatRelativeTime(soilItem?.updatedAt || tempItem?.updatedAt || humItem?.updatedAt, t)
      : t("common.just_now");

  return (
    <div className="space-y-6">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <PageTitle title={t("crop_health.title")} subtitle={t("crop_health.subtitle")} />

        {farmPlots.length > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-muted-foreground shrink-0">
              {t("crop_health.select_plot")}:
            </span>
            <select
              value={selectedPlotId || ""}
              onChange={(e) => setSelectedPlotId(e.target.value)}
              className="surface-card rounded-lg border border-border px-3 py-1.5 text-sm font-medium text-foreground bg-background focus:outline-none focus:ring-2 focus:ring-primary"
            >
              {farmPlots.map((plot) => (
                <option key={plot.id} value={plot.id}>
                  {plot.name} ({getLocalizedCrop(plot.crop, t)})
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {loading && (
        <div className="surface-card p-12 text-center my-6 flex flex-col items-center justify-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">{t("weather.loading")}</p>
        </div>
      )}

      {error && !loading && (
        <div className="surface-card p-6 text-center rounded-xl border border-destructive/30 my-4">
          <AlertTriangle className="mx-auto h-8 w-8 text-destructive mb-2" />
          <p className="text-sm font-semibold text-foreground">
            {t("crop_health.sensor_unavailable")}
          </p>
          <p className="text-xs text-muted-foreground mt-1">{error}</p>
        </div>
      )}

      {!loading && (
        <>
          {/* Top Banner: Overall Crop Condition */}
          <div className="surface-card p-6 rounded-xl border border-border bg-gradient-to-br from-card via-card to-primary/5">
            <div className="grid gap-6 md:grid-cols-3 items-center">
              <div className="flex items-center gap-4 md:col-span-2">
                <div className="grid h-16 w-16 place-items-center rounded-2xl bg-primary/10 text-primary shrink-0">
                  <Sprout className="h-8 w-8" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      {t("crop_health.overall_condition")}
                    </span>
                    {currentPlot && (
                      <span className="rounded-full bg-secondary px-2.5 py-0.5 text-xs font-bold text-secondary-foreground">
                        {getLocalizedCrop(currentPlot.crop, t)} · {currentPlot.name}
                      </span>
                    )}
                  </div>
                  <div className="flex items-baseline gap-3 mt-1">
                    <span className="text-3xl font-extrabold text-foreground">
                      {cropHealthScore != null ? `${cropHealthScore}%` : t("crop_health.data_not_available")}
                    </span>
                    {cropHealthScore != null && (
                      <span
                        className={`text-sm font-semibold px-2.5 py-0.5 rounded-full ${
                          cropHealthScore >= 80
                            ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                            : cropHealthScore >= 60
                              ? "bg-amber-500/10 text-amber-600 dark:text-amber-400"
                              : "bg-rose-500/10 text-rose-600 dark:text-rose-400"
                        }`}
                      >
                        {cropHealthStatus}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {t("crop_health.based_on")}
                  </p>
                </div>
              </div>

              <div className="border-t md:border-t-0 md:border-l border-border pt-4 md:pt-0 md:pl-6 text-xs text-muted-foreground space-y-2">
                <div className="flex items-start gap-2">
                  <Info className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                  <span>{t("crop_health.disclaimer")}</span>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground pt-1">
                  <Clock className="h-3.5 w-3.5" />
                  <span>
                    {t("crop_health.last_updated", { time: lastUpdatedStr })}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Telemetry Metric Cards */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {/* Soil Moisture */}
            <div className="surface-card p-5 flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  {t("crop_health.soil_moisture")}
                </span>
                <Droplets className="h-5 w-5 text-sky-500" />
              </div>
              <div className="mt-3">
                <span className="text-2xl font-bold text-foreground">
                  {soilMoistureVal != null ? `${soilMoistureVal}%` : t("crop_health.data_not_available")}
                </span>
                {soilMoistureVal != null && (
                  <span
                    className={`ml-2 text-xs font-medium px-2 py-0.5 rounded ${
                      soilMoistureVal >= cropConfig.minMoisture && soilMoistureVal <= cropConfig.maxMoisture
                        ? "bg-emerald-500/10 text-emerald-500"
                        : "bg-amber-500/10 text-amber-500"
                    }`}
                  >
                    {soilMoistureVal >= cropConfig.minMoisture && soilMoistureVal <= cropConfig.maxMoisture
                      ? t("crop_health.status_good")
                      : t("status.warning")}
                  </span>
                )}
              </div>
              <p className="mt-2 text-xs text-muted-foreground">
                {t("crop_health.target_moisture_range", { min: cropConfig.minMoisture, max: cropConfig.maxMoisture })}
              </p>
            </div>

            {/* Temperature */}
            <div className="surface-card p-5 flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  {t("crop_health.temperature")}
                </span>
                <Thermometer className="h-5 w-5 text-amber-500" />
              </div>
              <div className="mt-3">
                <span className="text-2xl font-bold text-foreground">
                  {tempVal != null ? `${tempVal} °C` : t("crop_health.data_not_available")}
                </span>
              </div>
              <p className="mt-2 text-xs text-muted-foreground">{t("crop_health.dht22_temp_desc")}</p>
            </div>

            {/* Humidity */}
            <div className="surface-card p-5 flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  {t("crop_health.humidity")}
                </span>
                <Wind className="h-5 w-5 text-teal-500" />
              </div>
              <div className="mt-3">
                <span className="text-2xl font-bold text-foreground">
                  {humVal != null ? `${humVal}%` : t("crop_health.data_not_available")}
                </span>
              </div>
              <p className="mt-2 text-xs text-muted-foreground">{t("crop_health.dht22_hum_desc")}</p>
            </div>

            {/* Rain Status */}
            <div className="surface-card p-5 flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  {t("crop_health.rain_status")}
                </span>
                <CloudRain className="h-5 w-5 text-indigo-500" />
              </div>
              <div className="mt-3">
                <span className="text-2xl font-bold text-foreground">
                  {rainItem?.value != null
                    ? rainDetected
                      ? t("crop_health.rain_detected")
                      : t("crop_health.no_rain")
                    : t("crop_health.data_not_available")}
                </span>
              </div>
              <p className="mt-2 text-xs text-muted-foreground">{t("crop_health.rain_sensor_desc")}</p>
            </div>
          </div>

          {/* Harvest Information Section */}
          {farmPlots.length === 0 ? (
            <div className="surface-card p-8 text-center rounded-xl border border-border/60">
              <Sprout className="mx-auto h-10 w-10 text-muted-foreground mb-3" />
              <h3 className="text-base font-semibold text-foreground">
                {t("crop_health.no_plots")}
              </h3>
              <p className="text-xs text-muted-foreground mt-1">
                {t("crop_health.no_plots_desc")}
              </p>
              <Button size="sm" className="mt-4" asChild>
                <Link href="/farmer/my-farm">+ {t("myfarm.add_plot")}</Link>
              </Button>
            </div>
          ) : (
            <div className="grid gap-6 xl:grid-cols-2">
              {/* Harvest Timeline Card */}
              <div className="surface-card p-6 rounded-xl space-y-4">
                <div className="flex items-center justify-between border-b border-border pb-3">
                  <h3 className="text-base font-semibold text-foreground flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-primary" />
                    {t("crop_health.harvest_info")}
                  </h3>
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-primary/10 text-primary">
                    {harvestStatusText}
                  </span>
                </div>

                {currentPlot ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="text-xs text-muted-foreground block">{t("myfarm.crop_name")}</span>
                        <span className="font-bold text-foreground">{currentPlot.name}</span>
                        <span className="text-xs text-muted-foreground block">
                          ({getLocalizedCrop(currentPlot.crop, t)})
                        </span>
                      </div>
                      <div>
                        <span className="text-xs text-muted-foreground block">
                          {t("crop_health.sowing_date")}
                        </span>
                        <span className="font-bold text-foreground">
                          {sowingDateStr ? shortDate(sowingDateStr) : t("crop_health.data_not_available")}
                        </span>
                      </div>
                      <div>
                        <span className="text-xs text-muted-foreground block">
                          {isEstimatedHarvest ? t("crop_health.estimated_harvest") : t("crop_health.expected_harvest")}
                        </span>
                        <span className="font-bold text-foreground">
                          {harvestDateStr ? shortDate(harvestDateStr) : t("crop_health.data_not_available")}
                        </span>
                      </div>
                      <div>
                        <span className="text-xs text-muted-foreground block">
                          {t("crop_health.growth_stage")}
                        </span>
                        <span className="font-bold text-foreground">{growthStageLabel}</span>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div>
                      <div className="flex justify-between items-center text-xs font-semibold mb-1.5">
                        <span className="text-muted-foreground">
                          {t("crop_health.harvest_progress")}
                        </span>
                        <span className="text-foreground">
                          {sowingDateStr && harvestDateStr ? `${progressPct}%` : t("crop_health.data_not_available")}
                        </span>
                      </div>
                      <div className="h-2.5 w-full bg-secondary rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary transition-all duration-500 rounded-full"
                          style={{ width: `${progressPct}%` }}
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-xs text-muted-foreground pt-2">
                      <div className="flex items-center gap-1.5">
                        <Clock className="h-4 w-4 text-primary" />
                        <span>
                          {daysRemaining != null
                            ? t("crop_health.days_remaining_text", { days: daysRemaining })
                            : t("crop_health.timeline_unavailable")}
                        </span>
                      </div>
                      <span>{t("crop_health.area_acres_text", { acres: currentPlot.areaAcres })}</span>
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground">
                    {t("crop_health.timeline_unavailable")}
                  </p>
                )}
              </div>

              {/* Irrigation & Hardware State Card */}
              <div className="surface-card p-6 rounded-xl space-y-4">
                <div className="flex items-center justify-between border-b border-border pb-3">
                  <h3 className="text-base font-semibold text-foreground flex items-center gap-2">
                    <Droplets className="h-5 w-5 text-sky-500" />
                    {t("crop_health.irrigation_condition")}
                  </h3>
                  <span
                    className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                      pumpActual === "on"
                        ? "bg-emerald-500/10 text-emerald-500"
                        : "bg-secondary text-secondary-foreground"
                    }`}
                  >
                    {t("crop_health.pump_status")}: {pumpActual === "on" ? t("status.on") : t("status.off")}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-xs text-muted-foreground block">
                      {t("crop_health.pump_status")}
                    </span>
                    <span className="font-bold text-foreground flex items-center gap-1.5 mt-0.5">
                      <span
                        className={`h-2.5 w-2.5 rounded-full ${
                          pumpActual === "on" ? "bg-emerald-500" : "bg-slate-400"
                        }`}
                      />
                      {pumpActual === "on" ? t("status.on") : t("status.off")}
                    </span>
                  </div>

                  <div>
                    <span className="text-xs text-muted-foreground block">
                      {t("crop_health.valve_status")}
                    </span>
                    <span className="font-bold text-foreground flex items-center gap-1.5 mt-0.5">
                      <span
                        className={`h-2.5 w-2.5 rounded-full ${
                          valveActual === "open"
                            ? "bg-sky-500"
                            : valveActual === "closed"
                              ? "bg-slate-400"
                              : "bg-amber-400"
                        }`}
                      />
                      {valveActual != null
                        ? valveActual === "open"
                          ? t("status.open")
                          : t("status.closed")
                        : t("crop_health.no_valve_data")}
                    </span>
                  </div>
                </div>

                <div className="pt-2">
                  <span className="text-xs text-muted-foreground block">{t("crop_health.cycle_status")}</span>
                  <p className="text-xs font-medium text-foreground mt-0.5">
                    {getLocalizedStatus(irrigationStatus, t) || t("status.idle")}
                  </p>
                </div>

                <div className="rounded-lg bg-secondary/40 p-3 text-xs text-muted-foreground flex items-center gap-2 border border-border/40">
                  <Info className="h-4 w-4 text-primary shrink-0" />
                  <span>{t("crop_health.nutrient_note")}</span>
                </div>
              </div>
            </div>
          )}

          {/* Historical Telemetry Chart */}
          <ChartCard
            title={t("crop_health.historical_trend")}
            description={t("crop_health.historical_trend_desc")}
          >
            {weeklyMoisture.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={weeklyMoisture}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                  <XAxis dataKey="label" {...axis} />
                  <YAxis domain={[0, 100]} {...axis} />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Line
                    type="monotone"
                    dataKey="moisture"
                    name={t("crop_health.metric_moisture")}
                    stroke="var(--color-chart-1)"
                    strokeWidth={2.5}
                    dot={{ r: 3 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="target"
                    name={t("crop_health.target_threshold", { pct: cropConfig.minMoisture })}
                    stroke="var(--color-chart-2)"
                    strokeDasharray="4 4"
                    strokeWidth={1.5}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center p-6 text-muted-foreground">
                <AlertTriangle className="h-8 w-8 mb-2 text-amber-500/70" />
                <p className="text-sm font-medium">{t("crop_health.no_history")}</p>
              </div>
            )}
          </ChartCard>
        </>
      )}
    </div>
  );
}
