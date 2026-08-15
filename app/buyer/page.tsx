"use client";

import { useEffect, useState } from "react";
import { CalendarClock, ShieldAlert, Sprout, TrendingUp, AlertTriangle } from "lucide-react";
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
import { PageTitle } from "@/components/dashboard/dashboard-shell-next";
import { ChartCard, StatCard } from "@/components/dashboard/widgets";
import { HarvestTable } from "@/components/dashboard/harvest-table";
import { num } from "@/utils/format";
import { useI18n } from "@/lib/i18n";
import {
  getBuyerKpis,
  getBuyerCharts,
  type BuyerChartData,
} from "@/services/buyer";
import { subscribeBuyerOffers } from "@/services/realtime";
import { getSupabaseClient } from "@/lib/supabase";

const axis = {
  stroke: "var(--color-muted-foreground)",
  fontSize: 12,
  tickLine: false,
  axisLine: false,
};

const tooltipStyle = {
  background: "var(--color-card)",
  border: "1px solid var(--color-border)",
  borderRadius: "12px",
  color: "var(--color-foreground)",
  fontSize: "12px",
};

export default function BuyerDashboard() {
  const { t } = useI18n();
  const [kpis, setKpis] = useState({
    expectedHarvestTonnes: 0,
    highQualityFarms: 0,
    upcomingHarvests: 0,
    riskLevel: "Low",
    riskScore: 10,
    totalSpending: 0,
    totalOffers: 0,
  });

  const [charts, setCharts] = useState<BuyerChartData>({
    cropAvailability: [],
    regionProduction: [],
    supplyForecast: [],
    demandTrend: [],
  });

  useEffect(() => {
    let mounted = true;
    const supabase = getSupabaseClient();

    async function loadData() {
      try {
        const [kpiData, chartData] = await Promise.all([
          getBuyerKpis(),
          getBuyerCharts(),
        ]);
        if (mounted) {
          if (kpiData) setKpis(kpiData);
          if (chartData) setCharts(chartData);
        }
      } catch (err) {
        console.error("Error fetching buyer dashboard data:", err);
      }
    }

    loadData();

    // Subscribe to buyer realtime offer changes
    if (supabase) {
      supabase.auth.getUser().then(({ data: authData }) => {
        const buyerId = authData?.user?.id;
        if (buyerId && mounted) {
          const channel = subscribeBuyerOffers(supabase, buyerId, () => {
            loadData();
          });

          return () => {
            supabase.removeChannel(channel);
          };
        }
      });
    }

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div>
      <PageTitle title={t("buyer.harvest_intel")} subtitle={t("buyer.forecast_coverage")} />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          index={0}
          label={t("buyer.exp_harvest")}
          value={num(kpis.expectedHarvestTonnes)}
          unit="t"
          icon={Sprout}
          trend={kpis.totalOffers > 0 ? 5.2 : 0}
        />
        <StatCard
          index={1}
          label={t("buyer.high_quality_farms")}
          value={kpis.highQualityFarms}
          icon={TrendingUp}
          trend={kpis.highQualityFarms > 0 ? 2.5 : 0}
          footnote={t("buyer.quality_score_above")}
        />
        <StatCard
          index={2}
          label={t("buyer.upcoming_harvests")}
          value={kpis.upcomingHarvests}
          icon={CalendarClock}
          footnote={t("buyer.within_30_days")}
        />
        <StatCard
          index={3}
          label={t("buyer.supply_risk")}
          value={kpis.riskLevel}
          icon={ShieldAlert}
          status="warning"
          footnote={t("buyer.risk_score", { score: kpis.riskScore })}
        />
      </div>

      <div className="mt-6 grid gap-5 xl:grid-cols-2">
        <ChartCard title={t("buyer.crop_avail")} description={t("buyer.crop_avail_desc")}>
          {charts.cropAvailability.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={charts.cropAvailability}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                <XAxis dataKey="label" {...axis} />
                <YAxis {...axis} />
                <Tooltip contentStyle={tooltipStyle} />
                <Bar
                  dataKey="tonnes"
                  name={t("buyer.tonnes")}
                  fill="var(--color-chart-1)"
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

        <ChartCard title={t("buyer.region_prod")} description={t("buyer.region_prod_desc")}>
          {charts.regionProduction.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={charts.regionProduction} layout="vertical">
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="var(--color-border)"
                  horizontal={false}
                />
                <XAxis type="number" {...axis} />
                <YAxis type="category" dataKey="label" width={110} {...axis} />
                <Tooltip contentStyle={tooltipStyle} />
                <Bar
                  dataKey="tonnes"
                  name={t("buyer.tonnes")}
                  fill="var(--color-chart-2)"
                  radius={[0, 6, 6, 0]}
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

        <ChartCard title={t("buyer.supply_forecast")} description={t("buyer.supply_forecast_desc")}>
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

        <ChartCard title={t("buyer.demand_trend")} description={t("buyer.demand_trend_desc")}>
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
      </div>

      <div className="mt-6">
        <HarvestTable />
      </div>
    </div>
  );
}
