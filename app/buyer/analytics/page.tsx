"use client";

import { useEffect, useState } from "react";
import { PageTitle } from "@/components/dashboard/dashboard-shell-next";
import { ChartCard } from "@/components/dashboard/widgets";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { axis, tooltipStyle } from "@/components/dashboard/chart-theme";
import { useI18n } from "@/lib/i18n";
import { getBuyerCharts, type BuyerChartData } from "@/services/buyer";
import { AlertTriangle, Loader2 } from "lucide-react";

export default function PageBuyerAnalytics() {
  const { t } = useI18n();
  const [charts, setCharts] = useState<BuyerChartData>({
    cropAvailability: [],
    regionProduction: [],
    supplyForecast: [],
    demandTrend: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        const data = await getBuyerCharts();
        if (mounted && data) {
          setCharts(data);
        }
      } catch (err) {
        console.error("Error loading buyer analytics:", err);
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div>
      <PageTitle title={t("analytics.title")} subtitle={t("buyer.demand_trend_desc")} />

      {loading ? (
        <div className="surface-card p-12 text-center my-6 flex flex-col items-center justify-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">{t("common.loading")}</p>
        </div>
      ) : (
        <div className="grid gap-5 xl:grid-cols-2">
          <ChartCard
            title={t("buyer.supply_forecast")}
            description={t("buyer.supply_forecast_desc")}
          >
            {charts.supplyForecast.some((f) => f.forecast > 0 || f.committed > 0) ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={charts.supplyForecast}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                  <XAxis dataKey="label" {...axis} />
                  <YAxis {...axis} />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                  <Area
                    type="monotone"
                    dataKey="forecast"
                    name={t("buyer.forecast")}
                    stroke="var(--color-chart-1)"
                    fill="var(--color-chart-1)"
                    fillOpacity={0.16}
                    strokeWidth={2}
                  />
                  <Area
                    type="monotone"
                    dataKey="committed"
                    name={t("buyer.committed")}
                    stroke="var(--color-chart-3)"
                    fill="var(--color-chart-3)"
                    fillOpacity={0.16}
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full flex-col items-center justify-center text-xs text-muted-foreground p-6">
                <AlertTriangle className="h-6 w-6 mb-2 text-muted-foreground/60" />
                {t("common.no_data")}
              </div>
            )}
          </ChartCard>

          <ChartCard
            title={t("buyer.demand_trend")}
            description={t("buyer.demand_trend_desc")}
          >
            {charts.demandTrend.some((d) => d.demand > 0 || d.fulfilled > 0) ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={charts.demandTrend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                  <XAxis dataKey="label" {...axis} />
                  <YAxis {...axis} />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                  <Line
                    type="monotone"
                    dataKey="demand"
                    name={t("buyer.demand")}
                    stroke="var(--color-chart-4)"
                    strokeWidth={2}
                    dot={false}
                  />
                  <Line
                    type="monotone"
                    dataKey="fulfilled"
                    name={t("buyer.fulfilled")}
                    stroke="var(--color-chart-2)"
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full flex-col items-center justify-center text-xs text-muted-foreground p-6">
                <AlertTriangle className="h-6 w-6 mb-2 text-muted-foreground/60" />
                {t("common.no_data")}
              </div>
            )}
          </ChartCard>

          <ChartCard
            title={t("buyer.region_prod")}
            description={t("buyer.region_prod_desc")}
            className="xl:col-span-2"
          >
            {charts.regionProduction.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={charts.regionProduction}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                  <XAxis dataKey="label" {...axis} />
                  <YAxis {...axis} />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Bar
                    dataKey="tonnes"
                    name={t("buyer.tonnes")}
                    fill="var(--color-chart-2)"
                    radius={[6, 6, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full flex-col items-center justify-center text-xs text-muted-foreground p-6">
                <AlertTriangle className="h-6 w-6 mb-2 text-muted-foreground/60" />
                {t("common.no_data")}
              </div>
            )}
          </ChartCard>
        </div>
      )}
    </div>
  );
}
