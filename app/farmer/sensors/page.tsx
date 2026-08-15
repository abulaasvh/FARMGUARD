"use client";

import { PageTitle } from "@/components/dashboard/dashboard-shell-next";
import { useFarmerRealtime } from "@/hooks/use-farmer-realtime";
import { useI18n } from "@/lib/i18n";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import {
  Activity,
  CloudRain,
  Droplets,
  Gauge,
  Radio,
  RefreshCw,
  Server,
  Thermometer,
  Waves,
  Wind,
  Battery,
  AlertTriangle,
  Loader2,
} from "lucide-react";
import { formatRelativeTime, getLocalizedStatus } from "@/utils/format";

export default function PageFarmerSensors() {
  const { t } = useI18n();
  const {
    sensorReadings = [],
    devices = [],
    connectionState,
    loading,
    error,
    lastSyncedAt,
    stale,
    refresh,
  } = useFarmerRealtime();

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

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <PageTitle
          title={t("sensors.title")}
          subtitle={
            connectionState === "live"
              ? `${t("sensors.subtitle")}${
                  lastSyncedAt
                    ? ` · ${t("common.updated_at", {
                        time: formatRelativeTime(lastSyncedAt, t),
                      })}`
                    : ""
                }`
              : t("sensors.subtitle")
          }
          action={
            <div className="flex items-center gap-2">
              <Badge
                variant={connectionState === "live" ? "secondary" : "outline"}
                className="shrink-0"
              >
                {connectionLabel}
                {stale ? ` · ${t("dashboard.stale")}` : ""}
              </Badge>
              <Button
                variant="outline"
                size="sm"
                onClick={() => void refresh()}
                disabled={loading}
              >
                <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
              </Button>
            </div>
          }
        />
      </div>

      {error && (
        <div className="surface-card p-4 rounded-xl border border-destructive/30 bg-destructive/10 text-sm text-destructive flex items-center justify-between gap-3">
          <p>{error}</p>
          <Button variant="outline" size="sm" onClick={() => void refresh()}>
            {t("common.retry")}
          </Button>
        </div>
      )}

      {loading && (
        <div className="surface-card p-12 text-center my-6 flex flex-col items-center justify-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">{t("common.loading")}</p>
        </div>
      )}

      {!loading && (
        <>
          {/* Live Sensor Telemetry Section */}
          <section className="space-y-4">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              {t("sensors.telemetry_title")}
            </h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {sensorReadings.map((reading) => {
                const cardLabelKey = `dashboard.${reading.id.replace("-", "_")}`;
                const cardLabel =
                  t(cardLabelKey) !== cardLabelKey ? t(cardLabelKey) : reading.label;
                const displayValue =
                  reading.value === "No data available" ? t("common.no_data") : reading.value;

                const foot =
                  reading.updatedAt && reading.updatedAt !== "No readings"
                    ? t("common.updated_at", { time: formatRelativeTime(reading.updatedAt, t) })
                    : t("common.no_data");

                return (
                  <article
                    key={reading.id}
                    className="surface-card p-5 flex flex-col justify-between"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                        {cardLabel}
                      </span>
                      {reading.id === "soil-moisture" && (
                        <Waves className="h-5 w-5 text-primary" />
                      )}
                      {reading.id === "temperature" && (
                        <Thermometer className="h-5 w-5 text-amber-500" />
                      )}
                      {reading.id === "humidity" && <Wind className="h-5 w-5 text-teal-500" />}
                      {reading.id === "tank-level" && (
                        <Droplets className="h-5 w-5 text-sky-500" />
                      )}
                      {reading.id === "rain-prediction" && (
                        <CloudRain className="h-5 w-5 text-indigo-500" />
                      )}
                      {reading.id === "gateway-battery" && (
                        <Battery className="h-5 w-5 text-emerald-500" />
                      )}
                    </div>

                    <div className="mt-3">
                      <span className="text-3xl font-extrabold text-foreground">
                        {displayValue}
                        {reading.unit && typeof reading.value === "number" && (
                          <span className="text-lg font-normal text-muted-foreground ml-1">
                            {reading.unit}
                          </span>
                        )}
                      </span>
                    </div>

                    <div className="mt-3 pt-3 border-t border-border/40 flex items-center justify-between text-xs text-muted-foreground">
                      <span>{foot}</span>
                      <span
                        className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                          reading.status === "critical"
                            ? "bg-destructive/15 text-destructive"
                            : reading.status === "warning"
                              ? "bg-amber-500/15 text-amber-600 dark:text-amber-400"
                              : "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                        }`}
                      >
                        {getLocalizedStatus(reading.status, t)}
                      </span>
                    </div>
                  </article>
                );
              })}
            </div>
          </section>

          {/* Field Hardware Nodes Section */}
          <section className="space-y-4 pt-4">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              {t("sensors.devices_title")}
            </h2>

            {devices.length === 0 ? (
              <div className="surface-card p-8 text-center rounded-xl border border-border/60 text-muted-foreground text-sm">
                <Server className="mx-auto h-8 w-8 text-muted-foreground/60 mb-2" />
                <p>{t("sensors.no_devices_found")}</p>
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {devices.map((device) => (
                  <article key={device.id} className="surface-card p-5">
                    <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
                      <div className="min-w-0">
                        <h3 className="truncate text-base font-semibold text-foreground">
                          {device.name}
                        </h3>
                        <p className="truncate text-xs text-muted-foreground">
                          {device.id} · {device.zone} · {device.firmware}
                        </p>
                      </div>
                      <Badge
                        variant={device.online ? "secondary" : "destructive"}
                        className="shrink-0"
                      >
                        {device.stale
                          ? t("dashboard.stale")
                          : getLocalizedStatus(device.online ? "online" : "offline", t)}
                      </Badge>
                    </div>

                    <div className="mt-4 space-y-3">
                      <div>
                        <div className="flex justify-between text-xs text-muted-foreground mb-1">
                          <span>{t("sensors.battery")}</span>
                          <span>{device.battery}%</span>
                        </div>
                        <Progress
                          value={device.battery}
                          aria-label={t("sensors.battery")}
                        />
                      </div>
                      <div>
                        <div className="flex justify-between text-xs text-muted-foreground mb-1">
                          <span>{t("sensors.signal")}</span>
                          <span>{device.signal}%</span>
                        </div>
                        <Progress
                          value={device.signal}
                          aria-label={t("sensors.signal")}
                        />
                      </div>
                      <div>
                        <div className="flex justify-between text-xs text-muted-foreground mb-1">
                          <span>{t("sensors.sensor_health", { health: device.health })}</span>
                          <span>{device.health}%</span>
                        </div>
                        <Progress
                          value={device.health}
                          aria-label={t("sensors.sensor_health", { health: device.health })}
                        />
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-border/40 flex items-center justify-between text-xs text-muted-foreground">
                      <span>
                        {t("common.last_seen_at", {
                          time: formatRelativeTime(device.lastSeen, t),
                        })}
                      </span>
                      <span className="font-mono text-[11px]">
                        {device.actualPumpStatus ? `Pump: ${device.actualPumpStatus}` : ""}
                      </span>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>
        </>
      )}
    </div>
  );
}
