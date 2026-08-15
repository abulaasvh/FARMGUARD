"use client";

import { useEffect, useState, useCallback } from "react";
import { PageTitle } from "@/components/dashboard/dashboard-shell-next";
import { ChartCard } from "@/components/dashboard/widgets";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { axis, tooltipStyle } from "@/components/dashboard/chart-theme";
import { useI18n } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import {
  getFarmerAnalytics,
  type FarmerAnalyticsData,
} from "@/services/farmer";
import {
  Droplets,
  Loader2,
  RefreshCw,
  Waves,
  Thermometer,
  Wind,
  CloudRain,
  Timer,
  Activity,
  AlertTriangle,
} from "lucide-react";

type TimeRange = "today" | "7d" | "30d" | "all";

export default function PageFarmerAnalytics() {
  const { t } = useI18n();
  const [timeRange, setTimeRange] = useState<TimeRange>("7d");
  const [analytics, setAnalytics] = useState<FarmerAnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async (range: TimeRange) => {
    setLoading(true);
    try {
      const data = await getFarmerAnalytics(range);
      setAnalytics(data);
    } catch (err) {
      console.error("Error loading analytics data:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadData(timeRange);
  }, [timeRange, loadData]);

  const handleRangeChange = (range: TimeRange) => {
    setTimeRange(range);
  };

  return (
    <div className="space-y-6">
      {/* Page Header with Time Range Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <PageTitle title={t("analytics.title")} subtitle={t("analytics.subtitle")} />

        <div className="flex items-center gap-2">
          <div className="surface-card rounded-lg p-1 border border-border flex items-center gap-1">
            <Button
              variant={timeRange === "today" ? "default" : "ghost"}
              size="sm"
              className="text-xs h-7 px-2.5"
              onClick={() => handleRangeChange("today")}
            >
              {t("analytics.range_today")}
            </Button>
            <Button
              variant={timeRange === "7d" ? "default" : "ghost"}
              size="sm"
              className="text-xs h-7 px-2.5"
              onClick={() => handleRangeChange("7d")}
            >
              {t("analytics.range_7d")}
            </Button>
            <Button
              variant={timeRange === "30d" ? "default" : "ghost"}
              size="sm"
              className="text-xs h-7 px-2.5"
              onClick={() => handleRangeChange("30d")}
            >
              {t("analytics.range_30d")}
            </Button>
            <Button
              variant={timeRange === "all" ? "default" : "ghost"}
              size="sm"
              className="text-xs h-7 px-2.5"
              onClick={() => handleRangeChange("all")}
            >
              {t("analytics.range_all")}
            </Button>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => void loadData(timeRange)}
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="surface-card p-12 text-center my-8 flex flex-col items-center justify-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">{t("common.loading")}</p>
        </div>
      ) : (
        <>
          {/* Summary Metric Cards (Real Derived Values) */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {/* Avg Soil Moisture */}
            <div className="surface-card p-5 flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  {t("analytics.avg_moisture")}
                </span>
                <Waves className="h-5 w-5 text-primary" />
              </div>
              <div className="mt-3">
                <span className="text-3xl font-extrabold text-foreground">
                  {analytics?.avgMoisture != null ? `${analytics.avgMoisture}%` : t("common.no_data")}
                </span>
              </div>
              <p className="mt-2 text-xs text-muted-foreground">
                {analytics?.minMoisture != null && analytics?.maxMoisture != null
                  ? `${t("analytics.min_max_moisture")}: ${analytics.minMoisture}% - ${analytics.maxMoisture}%`
                  : t("common.no_data")}
              </p>
            </div>

            {/* Avg Temperature */}
            <div className="surface-card p-5 flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  {t("analytics.avg_temp")}
                </span>
                <Thermometer className="h-5 w-5 text-amber-500" />
              </div>
              <div className="mt-3">
                <span className="text-3xl font-extrabold text-foreground">
                  {analytics?.avgTemp != null ? `${analytics.avgTemp} °C` : t("common.no_data")}
                </span>
              </div>
              <p className="mt-2 text-xs text-muted-foreground">
                {analytics?.avgHumidity != null
                  ? `${t("analytics.avg_humidity")}: ${analytics.avgHumidity}%`
                  : t("common.no_data")}
              </p>
            </div>

            {/* Total Water Delivered */}
            <div className="surface-card p-5 flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  {t("analytics.total_water_used")}
                </span>
                <Droplets className="h-5 w-5 text-sky-500" />
              </div>
              <div className="mt-3">
                <span className="text-3xl font-extrabold text-foreground">
                  {analytics?.totalWaterLiters != null && analytics.totalWaterLiters > 0
                    ? `${analytics.totalWaterLiters.toLocaleString()} L`
                    : t("common.no_data")}
                </span>
              </div>
              <p className="mt-2 text-xs text-muted-foreground">
                {analytics?.irrigationCycles
                  ? t("analytics.cycles_unit", { count: analytics.irrigationCycles })
                  : t("common.no_data")}
              </p>
            </div>

            {/* Rain Events & Pump Runtime */}
            <div className="surface-card p-5 flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  {t("analytics.pump_runtime")}
                </span>
                <Timer className="h-5 w-5 text-indigo-500" />
              </div>
              <div className="mt-3">
                <span className="text-3xl font-extrabold text-foreground">
                  {analytics?.pumpRuntimeMinutes != null && analytics.pumpRuntimeMinutes > 0
                    ? t("analytics.mins_unit", { mins: analytics.pumpRuntimeMinutes })
                    : t("common.no_data")}
                </span>
              </div>
              <p className="mt-2 text-xs text-muted-foreground">
                {t("analytics.rain_events")}:{" "}
                {analytics?.rainEvents != null
                  ? t("analytics.events_unit", { count: analytics.rainEvents })
                  : "0"}
              </p>
            </div>
          </div>

          {/* Real Charts Grid */}
          <div className="grid gap-6 xl:grid-cols-2">
            {/* Real Moisture Trend Chart */}
            <ChartCard
              title={t("analytics.moisture_trend_title")}
              description={t("analytics.moisture_trend_desc")}
            >
              {analytics?.moistureTrend && analytics.moistureTrend.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={analytics.moistureTrend}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                    <XAxis dataKey="label" {...axis} />
                    <YAxis domain={[0, 100]} {...axis} />
                    <Tooltip contentStyle={tooltipStyle} />
                    <Area
                      type="monotone"
                      dataKey="moisture"
                      name={t("dashboard.soil_moisture")}
                      stroke="var(--color-chart-1)"
                      fill="var(--color-chart-1)"
                      fillOpacity={0.2}
                      strokeWidth={2}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-center p-6 text-muted-foreground">
                  <AlertTriangle className="h-8 w-8 mb-2 text-muted-foreground/60" />
                  <p className="text-sm">{t("analytics.no_data_range")}</p>
                </div>
              )}
            </ChartCard>

            {/* Real Water Usage Chart */}
            <ChartCard
              title={t("analytics.water_usage_title")}
              description={t("analytics.water_usage_desc")}
            >
              {analytics?.waterUsageTrend && analytics.waterUsageTrend.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={analytics.waterUsageTrend}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                    <XAxis dataKey="label" {...axis} />
                    <YAxis {...axis} />
                    <Tooltip contentStyle={tooltipStyle} />
                    <Legend wrapperStyle={{ fontSize: 12 }} />
                    <Bar
                      dataKey="used"
                      name={t("dashboard.used")}
                      fill="var(--color-chart-1)"
                      radius={[4, 4, 0, 0]}
                    />
                    <Bar
                      dataKey="saved"
                      name={t("dashboard.saved")}
                      fill="var(--color-chart-2)"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-center p-6 text-muted-foreground">
                  <AlertTriangle className="h-8 w-8 mb-2 text-muted-foreground/60" />
                  <p className="text-sm">{t("analytics.no_data_range")}</p>
                </div>
              )}
            </ChartCard>
          </div>
        </>
      )}
    </div>
  );
}
