"use client";

import { useState, useMemo } from "react";
import { PageTitle } from "@/components/dashboard/dashboard-shell-next";
import { useFarmerRealtime } from "@/hooks/use-farmer-realtime";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatRelativeTime, getLocalizedStatus } from "@/utils/format";
import { useI18n } from "@/lib/i18n";
import {
  AlertTriangle,
  Bell,
  CheckCircle2,
  CloudRain,
  Droplets,
  Loader2,
  RefreshCw,
  Thermometer,
} from "lucide-react";
import type { Alert } from "@/types";

type SeverityFilter = "all" | "critical" | "warning";

export default function PageFarmerAlerts() {
  const { t } = useI18n();
  const {
    alerts = [],
    sensorReadings = [],
    loading,
    error,
    refresh,
  } = useFarmerRealtime();

  const [filter, setFilter] = useState<SeverityFilter>("all");

  // Derive real-time telemetry threshold alerts from actual sensors
  const telemetryAlerts: Alert[] = useMemo(() => {
    const list: Alert[] = [];
    const soilItem = sensorReadings.find((r) => r.id === "soil-moisture");
    const tempItem = sensorReadings.find((r) => r.id === "temperature");
    const rainItem = sensorReadings.find((r) => r.id === "rain-prediction");

    if (typeof soilItem?.value === "number" && soilItem.value <= 20) {
      list.push({
        id: "alert_soil_crit",
        title: t("alerts.threshold_low_moisture"),
        description: `${t("alerts.threshold_low_moisture_desc")} (Current: ${soilItem.value}%)`,
        severity: "critical",
        createdAt: soilItem.updatedAt || new Date().toISOString(),
        source: "Soil Moisture Probe",
        read: false,
      });
    }

    if (typeof tempItem?.value === "number" && tempItem.value >= 35) {
      list.push({
        id: "alert_temp_high",
        title: t("alerts.threshold_high_temp"),
        description: `${t("alerts.threshold_high_temp_desc")} (Current: ${tempItem.value}°C)`,
        severity: "warning",
        createdAt: tempItem.updatedAt || new Date().toISOString(),
        source: "Ambient Weather Node",
        read: false,
      });
    }

    if (rainItem?.value === 100) {
      list.push({
        id: "alert_rain_det",
        title: t("alerts.threshold_rain"),
        description: t("alerts.threshold_rain_desc"),
        severity: "warning",
        createdAt: rainItem.updatedAt || new Date().toISOString(),
        source: "Rain Detection Sensor",
        read: false,
      });
    }

    return list;
  }, [sensorReadings, t]);

  // Combine database device events and live telemetry alerts
  const combinedAlerts = useMemo(() => {
    const existingIds = new Set(telemetryAlerts.map((a) => a.id));
    const dbAlerts = alerts.filter((a) => !existingIds.has(a.id));
    return [...telemetryAlerts, ...dbAlerts];
  }, [telemetryAlerts, alerts]);

  const filteredAlerts = useMemo(() => {
    if (filter === "all") return combinedAlerts;
    return combinedAlerts.filter((a) => a.severity === filter);
  }, [combinedAlerts, filter]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <PageTitle
          title={t("alerts.title")}
          subtitle={
            combinedAlerts.length > 0
              ? t("alerts.active_count", { count: combinedAlerts.length })
              : t("alerts.subtitle")
          }
        />

        <div className="flex items-center gap-2">
          <div className="surface-card rounded-lg p-1 border border-border flex items-center gap-1">
            <Button
              variant={filter === "all" ? "default" : "ghost"}
              size="sm"
              className="text-xs h-7 px-2.5"
              onClick={() => setFilter("all")}
            >
              {t("alerts.filter_all")}
            </Button>
            <Button
              variant={filter === "critical" ? "default" : "ghost"}
              size="sm"
              className="text-xs h-7 px-2.5"
              onClick={() => setFilter("critical")}
            >
              {t("alerts.filter_critical")}
            </Button>
            <Button
              variant={filter === "warning" ? "default" : "ghost"}
              size="sm"
              className="text-xs h-7 px-2.5"
              onClick={() => setFilter("warning")}
            >
              {t("alerts.filter_warning")}
            </Button>
          </div>

          <Button variant="outline" size="sm" onClick={() => void refresh()} disabled={loading}>
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="surface-card p-12 text-center my-6 flex flex-col items-center justify-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">{t("common.loading")}</p>
        </div>
      ) : filteredAlerts.length === 0 ? (
        <div className="surface-card p-12 text-center rounded-xl border border-border/60">
          <div className="grid h-16 w-16 place-items-center rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 mx-auto">
            <CheckCircle2 className="h-8 w-8" />
          </div>
          <h2 className="mt-4 text-base font-bold text-foreground">
            {t("alerts.no_active_alerts")}
          </h2>
          <p className="mt-1 text-xs text-muted-foreground max-w-sm mx-auto">
            {t("alerts.subtitle")}
          </p>
        </div>
      ) : (
        <ul className="space-y-3">
          {filteredAlerts.map((alert) => (
            <li
              key={alert.id}
              className={`surface-card p-5 rounded-xl border transition-all ${
                alert.severity === "critical"
                  ? "border-destructive/40 bg-destructive/5"
                  : alert.severity === "warning"
                    ? "border-amber-500/40 bg-amber-500/5"
                    : "border-border"
              }`}
            >
              <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3">
                <div className="flex items-start gap-3">
                  {alert.severity === "critical" ? (
                    <AlertTriangle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
                  ) : alert.severity === "warning" ? (
                    <AlertTriangle className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
                  ) : (
                    <Bell className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                  )}
                  <div>
                    <h3 className="text-sm font-semibold text-foreground">{alert.title}</h3>
                    <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                      {alert.description}
                    </p>
                  </div>
                </div>

                <Badge
                  variant={alert.severity === "critical" ? "destructive" : "secondary"}
                  className="shrink-0"
                >
                  {getLocalizedStatus(alert.severity, t)}
                </Badge>
              </div>

              <div className="mt-3 pt-3 border-t border-border/40 flex items-center justify-between text-xs text-muted-foreground">
                <span>{alert.source}</span>
                <span>{formatRelativeTime(alert.createdAt, t)}</span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
