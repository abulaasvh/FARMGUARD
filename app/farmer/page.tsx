"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Activity,
  CloudRain,
  Droplets,
  FileBarChart,
  Gauge,
  Play,
  Power,
  Thermometer,
  Timer,
  Waves,
  Loader2,
} from "lucide-react";
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
import { toast } from "sonner";
import { useFarmerRealtime } from "@/hooks/use-farmer-realtime";
import { useI18n } from "@/lib/i18n";
import { getSupabaseClient } from "@/lib/supabase";
import { useSession } from "@/lib/session";
import { fetchLiveWeather, type LiveWeatherResponse } from "@/services/weather";
import { PageTitle } from "@/components/dashboard/dashboard-shell-next";
import { axis, tooltipStyle } from "@/components/dashboard/chart-theme";
import { ChartCard, StatCard } from "@/components/dashboard/widgets";
import { Badge } from "@/components/ui/badge";
import WeatherCard from "@/components/ui/WeatherCard";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  formatRelativeTime,
  getLocalizedCrop,
  getLocalizedIrrigation,
  getLocalizedSoil,
  getLocalizedStatus,
} from "@/utils/format";

const icons = [Activity, Gauge, Thermometer, Waves, CloudRain, Droplets];

export default function FarmerDashboard() {
  const { t } = useI18n();
  const user = useSession();
  const {
    loading,
    error,
    connectionState,
    sensorReadings = [],
    pumpActual,
    requestedPump,
    valveActual,
    commandStatus,
    irrigationStatus,
    farmPlots = [],
    weeklyMoisture = [],
    waterUsage = [],
    cropHealthTrend = [],
    alerts = [],
    devices = [],
    pumpHeaderSubtitle,
    lastSyncedAt,
    stale,
    liveEnabled,
    refresh,
    requestPumpCommand,
    requestValveCommand,
  } = useFarmerRealtime();

  const [weather, setWeather] = useState<LiveWeatherResponse | null>(null);
  const [weatherLoading, setWeatherLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const loadLiveWeather = async () => {
      let lat = user?.latitude;
      let lon = user?.longitude;

      if (lat == null || lon == null) {
        const supabase = getSupabaseClient();
        let userId = user?.id;
        if (!userId && supabase) {
          try {
            const { data } = await supabase.auth.getUser();
            userId = data?.user?.id;
          } catch {
            // ignore
          }
        }

        if (supabase && userId) {
          try {
            const { data: userFarms } = await supabase
              .from("farms")
              .select("latitude, longitude")
              .eq("owner_profile_id", userId)
              .limit(1);

            if (userFarms && userFarms.length > 0 && userFarms[0]?.latitude && userFarms[0]?.longitude) {
              lat = Number(userFarms[0].latitude);
              lon = Number(userFarms[0].longitude);
            }
          } catch {
            // ignore
          }
        }
      }

      if (lat != null && lon != null && !Number.isNaN(lat) && !Number.isNaN(lon)) {
        try {
          const live = await fetchLiveWeather(lat, lon);
          if (isMounted) setWeather(live);
        } catch {
          // ignore weather error
        }
      }
      if (isMounted) setWeatherLoading(false);
    };

    void loadLiveWeather();
    return () => {
      isMounted = false;
    };
  }, [user]);

  const connectionLabel =
    connectionState === "live"
      ? t("dashboard.live")
      : connectionState === "connecting"
        ? t("dashboard.connecting")
        : connectionState === "reconnecting"
          ? t("dashboard.reconnecting")
          : connectionState === "offline"
            ? t("dashboard.offline")
            : connectionState === "error"
              ? t("dashboard.error")
              : t("dashboard.mock");

  const displayPumpSubtitle = useMemo(() => {
    if (!pumpHeaderSubtitle) return t("dashboard.no_recent_cycles");
    if (pumpHeaderSubtitle === "No recent irrigation cycles logged in database")
      return t("dashboard.no_recent_cycles");
    if (pumpHeaderSubtitle === "Active irrigation cycle in progress") return t("status.running");

    const match = pumpHeaderSubtitle.match(
      /^(.*?) · Last run (.*?) for (\d+) min at (\d+) L\/min$/,
    );
    if (match) {
      const [, zone, timeStr, mins, flow] = match;
      const relTime = formatRelativeTime(timeStr, t);
      return t("dashboard.last_run_detail", { zone, time: relTime, mins, flow });
    }
    return pumpHeaderSubtitle;
  }, [pumpHeaderSubtitle, t]);

  const handlePumpCommand = (state: "on" | "off") => {
    if (!liveEnabled) {
      toast.info(t("dashboard.pump_realtime_notice"));
      return;
    }
    void requestPumpCommand(state).catch((commandError) => {
      toast.error(commandError instanceof Error ? commandError.message : "Command failed.");
    });
  };

  const handleValveCommand = (state: "open" | "closed") => {
    if (!liveEnabled) {
      toast.info(t("dashboard.valve_realtime_notice"));
      return;
    }
    void requestValveCommand(state).catch((commandError) => {
      toast.error(commandError instanceof Error ? commandError.message : "Command failed.");
    });
  };

  if (loading && connectionState === "connecting") {
    return (
      <div className="space-y-6">
        <div className="h-20 animate-pulse rounded-xl bg-muted" />
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="h-32 animate-pulse rounded-xl bg-muted" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      <PageTitle
        title={t("dashboard.title")}
        subtitle={
          connectionState === "live"
            ? `${t("dashboard.subtitle_live")}${
                lastSyncedAt
                  ? ` · ${t("common.updated_at", {
                      time: formatRelativeTime(lastSyncedAt, t),
                    })}`
                  : ""
              }`
            : connectionState === "mock"
              ? t("dashboard.subtitle_mock")
              : t("dashboard.subtitle_recovering")
        }
        action={
          <Badge
            variant={connectionState === "live" ? "secondary" : "outline"}
            className="shrink-0"
          >
            {connectionLabel}
            {stale ? ` · ${t("dashboard.stale")}` : ""}
          </Badge>
        }
      />

      {error && (
        <div className="mb-6 rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
          <div className="flex items-center justify-between gap-3">
            <p>{error}</p>
            <Button variant="outline" size="sm" onClick={() => void refresh()}>
              {t("common.retry")}
            </Button>
          </div>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {sensorReadings.map((reading, i) => {
          const cardLabelKey = `dashboard.${reading.id.replace("-", "_")}`;
          const cardLabel = t(cardLabelKey) !== cardLabelKey ? t(cardLabelKey) : reading.label;
          const displayValue =
            reading.value === "No data available" ? t("common.no_data") : reading.value;

          const foot =
            reading.updatedAt && reading.updatedAt !== "No readings"
              ? t("common.updated_at", { time: formatRelativeTime(reading.updatedAt, t) })
              : formatRelativeTime(reading.updatedAt, t);

          return (
            <StatCard
              key={reading.id}
              index={i}
              label={cardLabel}
              value={displayValue}
              unit={reading.unit}
              trend={reading.trend}
              status={reading.status}
              icon={icons[i % icons.length]!}
              footnote={foot}
            />
          );
        })}
      </div>

      <section className="surface-card mt-6 grid gap-5 p-5 lg:grid-cols-[1.1fr_1fr]">
        <div>
          <h2 className="text-base font-semibold text-foreground">{t("dashboard.pump_status")}</h2>
          <p className="mt-1 text-sm text-muted-foreground">{displayPumpSubtitle}</p>

          <div className="mt-4 flex flex-wrap items-center gap-3">
            <span
              className={`pulse-dot h-3 w-3 rounded-full ${
                pumpActual === "on"
                  ? "bg-success text-success"
                  : "bg-muted-foreground text-muted-foreground"
              }`}
            />
            <span className="text-sm font-semibold text-foreground">
              {t("dashboard.actual_pump", {
                status: getLocalizedStatus(pumpActual === "on" ? "running" : "idle", t),
              })}
            </span>
            <Badge variant="outline">
              {t("dashboard.requested", {
                val: requestedPump ? getLocalizedStatus(requestedPump, t) : t("common.none"),
              })}
            </Badge>
            <Badge variant="outline">
              {t("dashboard.valve", {
                val: valveActual ? getLocalizedStatus(valveActual, t) : t("common.no_data"),
              })}
            </Badge>
            <Badge variant="outline">{t("dashboard.ack", { val: commandStatus ?? "n/a" })}</Badge>
          </div>

          <p className="mt-2 text-xs text-muted-foreground">
            {t("dashboard.irrigation_label", { val: getLocalizedStatus(irrigationStatus, t) })}
          </p>

          <div className="mt-5 flex flex-wrap gap-2">
            <Button onClick={() => handlePumpCommand("on")}>
              <Play className="h-4 w-4" />
              {t("dashboard.turn_pump_on")}
            </Button>
            <Button variant="outline" onClick={() => handlePumpCommand("off")}>
              <Power className="h-4 w-4" />
              {t("dashboard.turn_pump_off")}
            </Button>
            <Button variant="outline" onClick={() => handleValveCommand("open")}>
              <Droplets className="h-4 w-4" />
              {t("dashboard.open_valve")}
            </Button>
            <Button variant="outline" onClick={() => handleValveCommand("closed")}>
              <Droplets className="h-4 w-4" />
              {t("dashboard.close_valve")}
            </Button>
          </div>
        </div>

        <div className="space-y-4">
          {farmPlots.length === 0 ? (
            <div className="rounded-xl border border-border p-6 text-center text-sm text-muted-foreground">
              {t("dashboard.no_farm_plots")}
            </div>
          ) : (
            farmPlots.map((plot) => (
              <div key={plot.id} className="rounded-xl border border-border p-4">
                <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
                  <p className="truncate text-sm font-semibold text-foreground">{plot.name}</p>
                  <Badge variant="outline" className="shrink-0">
                    {getLocalizedCrop(plot.crop, t)}
                  </Badge>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  {t("common.acres", { acres: plot.areaAcres })} ·{" "}
                  {getLocalizedSoil(plot.soilType, t)} ·{" "}
                  {getLocalizedIrrigation(plot.irrigation, t)}
                </p>
                <Progress value={plot.health} className="mt-3" aria-label={`${plot.name} health`} />
                <p className="mt-1.5 text-xs text-muted-foreground">
                  {t("dashboard.crop_health_pct", { health: plot.health })}
                </p>
              </div>
            ))
          )}
        </div>
      </section>

      <div className="mt-6 grid gap-5 xl:grid-cols-2">
        <ChartCard
          title={t("dashboard.weekly_soil_moisture")}
          description={t("dashboard.weekly_soil_desc")}
        >
          {weeklyMoisture.length === 0 ? (
            <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
              {t("common.no_data")}
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={weeklyMoisture}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                <XAxis dataKey="label" {...axis} />
                <YAxis {...axis} />
                <Tooltip contentStyle={tooltipStyle} />
                <Area
                  type="monotone"
                  dataKey="moisture"
                  stroke="var(--color-chart-1)"
                  fill="var(--color-chart-1)"
                  fillOpacity={0.25}
                  name={t("dashboard.soil_moisture")}
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </ChartCard>

        <ChartCard
          title={t("dashboard.water_usage")}
          description={t("dashboard.water_usage_desc")}
        >
          {waterUsage.length === 0 ? (
            <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
              {t("common.no_data")}
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={waterUsage}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                <XAxis dataKey="label" {...axis} />
                <YAxis {...axis} />
                <Tooltip contentStyle={tooltipStyle} />
                <Bar
                  dataKey="used"
                  fill="var(--color-chart-1)"
                  radius={[4, 4, 0, 0]}
                  name={t("dashboard.used")}
                />
                <Bar
                  dataKey="saved"
                  fill="var(--color-chart-2)"
                  radius={[4, 4, 0, 0]}
                  name={t("dashboard.saved")}
                />
              </BarChart>
            </ResponsiveContainer>
          )}
        </ChartCard>

        <ChartCard
          title={t("dashboard.crop_health_trend")}
          description={t("dashboard.crop_health_desc")}
        >
          {cropHealthTrend.length === 0 ? (
            <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
              {t("common.no_data")}
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={cropHealthTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                <XAxis dataKey="label" {...axis} />
                <YAxis {...axis} />
                <Tooltip contentStyle={tooltipStyle} />
                <Line
                  type="monotone"
                  dataKey="ndvi"
                  stroke="var(--color-chart-1)"
                  strokeWidth={2}
                  name={t("dashboard.vegetation_index")}
                />
                <Line
                  type="monotone"
                  dataKey="stress"
                  stroke="var(--color-chart-4)"
                  strokeWidth={2}
                  name={t("dashboard.stress_pct")}
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </ChartCard>

        <section className="surface-card p-5">
          <h2 className="text-base font-semibold text-foreground">{t("dashboard.forecast_title")}</h2>
          {weatherLoading ? (
            <div className="flex h-32 items-center justify-center">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : weather && weather.days.length > 0 ? (
            <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-7">
              {weather.days.slice(0, 7).map((w, index) => (
                <WeatherCard key={index} day={w.day} temp={w.tempMax} condition={w.condition} />
              ))}
            </div>
          ) : (
            <div className="p-8 text-center text-xs text-muted-foreground">
              {t("common.no_data")}
            </div>
          )}
        </section>
      </div>

      <div className="mt-6 grid gap-5 xl:grid-cols-2">
        <section className="surface-card p-5">
          <h2 className="text-base font-semibold text-foreground">{t("dashboard.recent_alerts")}</h2>
          {alerts.length === 0 ? (
            <p className="mt-4 text-sm text-muted-foreground">{t("dashboard.no_recent_alerts")}</p>
          ) : (
            <ul className="mt-4 space-y-3">
              {alerts.map((alert) => (
                <li key={alert.id} className="rounded-xl border border-border p-4">
                  <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3">
                    <p className="truncate text-sm font-semibold text-foreground">{alert.title}</p>
                    <Badge
                      variant={alert.severity === "critical" ? "destructive" : "secondary"}
                      className="shrink-0"
                    >
                      {getLocalizedStatus(alert.severity, t)}
                    </Badge>
                  </div>
                  <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                    {alert.description}
                  </p>
                  <p className="mt-2 text-xs text-muted-foreground">
                    {alert.source} · {formatRelativeTime(alert.createdAt, t)}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="surface-card p-5">
          <h2 className="text-base font-semibold text-foreground">{t("dashboard.device_status")}</h2>
          {devices.length === 0 ? (
            <p className="mt-4 text-sm text-muted-foreground">{t("dashboard.no_devices")}</p>
          ) : (
            <ul className="mt-4 space-y-3">
              {devices.map((device) => (
                <li key={device.id} className="rounded-xl border border-border p-4">
                  <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-foreground">
                        {device.name}
                      </p>
                      <p className="truncate text-xs text-muted-foreground">
                        {device.id} · {device.zone} · {device.firmware}
                      </p>
                    </div>
                    <span
                      className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ${
                        device.stale
                          ? "bg-warning/15 text-warning-foreground"
                          : device.online
                            ? "bg-success/15 text-success"
                            : "bg-destructive/12 text-destructive"
                      }`}
                    >
                      {device.stale
                        ? t("dashboard.stale")
                        : device.online
                          ? t("dashboard.online")
                          : t("dashboard.offline_status")}
                    </span>
                  </div>
                  <div className="mt-3 grid grid-cols-3 gap-3 text-xs text-muted-foreground">
                    <span>
                      {t("sensors.battery")} {device.battery}%
                    </span>
                    <span>
                      {t("sensors.signal")} {device.signal}%
                    </span>
                    <span>{t("sensors.sensor_health", { health: device.health })}</span>
                  </div>
                  <div className="mt-3 grid grid-cols-2 gap-2 text-[11px] text-muted-foreground">
                    <span>
                      {t("dashboard.actual_pump", {
                        status: getLocalizedStatus(device.actualPumpStatus, t),
                      })}
                    </span>
                    <span>
                      {t("dashboard.valve", {
                        val: getLocalizedStatus(device.actualValveStatus, t),
                      })}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
