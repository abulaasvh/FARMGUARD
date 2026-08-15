"use client";

import { useEffect, useState, useMemo } from "react";
import { PageTitle } from "@/components/dashboard/dashboard-shell-next";
import { useFarmerRealtime } from "@/hooks/use-farmer-realtime";
import { useI18n } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  getFarmerIrrigationHistory,
  type FarmerIrrigationRecord,
} from "@/services/farmer";
import {
  formatRelativeTime,
  getLocalizedStatus,
  shortDate,
} from "@/utils/format";
import {
  CloudRain,
  Droplets,
  Loader2,
  Play,
  Power,
  RefreshCw,
  Server,
  Waves,
  CheckCircle2,
  AlertTriangle,
  Info,
} from "lucide-react";

export default function PageFarmerIrrigation() {
  const { t } = useI18n();
  const {
    pumpActual,
    requestedPump,
    valveActual,
    requestedValve,
    commandStatus,
    irrigationStatus,
    pumpHeaderSubtitle,
    sensorReadings = [],
    devices = [],
    connectionState,
    loading: realtimeLoading,
    error: realtimeError,
    liveEnabled,
    requestPumpCommand,
    requestValveCommand,
    refresh: refreshRealtime,
  } = useFarmerRealtime();

  const [history, setHistory] = useState<FarmerIrrigationRecord[]>([]);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [commandInProgress, setCommandInProgress] = useState<string | null>(null);

  const loadHistory = async () => {
    setHistoryLoading(true);
    try {
      const data = await getFarmerIrrigationHistory();
      setHistory(data);
    } catch (err) {
      console.error("Failed to load irrigation history:", err);
    } finally {
      setHistoryLoading(false);
    }
  };

  useEffect(() => {
    void loadHistory();
  }, []);

  const handlePumpToggle = async (state: "on" | "off") => {
    if (!liveEnabled) {
      toast.info(t("dashboard.pump_realtime_notice"));
      return;
    }
    setCommandInProgress(`pump_${state}`);
    try {
      await requestPumpCommand(state);
      toast.success(
        state === "on"
          ? "Pump ON command sent to device controller."
          : "Pump OFF command sent to device controller.",
      );
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to execute pump command.");
    } finally {
      setCommandInProgress(null);
    }
  };

  const handleValveToggle = async (state: "open" | "closed") => {
    if (!liveEnabled) {
      toast.info(t("dashboard.valve_realtime_notice"));
      return;
    }
    setCommandInProgress(`valve_${state}`);
    try {
      await requestValveCommand(state);
      toast.success(
        state === "open"
          ? "Valve OPEN command sent to device controller."
          : "Valve CLOSE command sent to device controller.",
      );
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to execute valve command.");
    } finally {
      setCommandInProgress(null);
    }
  };

  const soilItem = sensorReadings.find((r) => r.id === "soil-moisture");
  const rainItem = sensorReadings.find((r) => r.id === "rain-prediction");
  const soilMoisture = typeof soilItem?.value === "number" ? soilItem.value : null;
  const isRaining = rainItem?.value === 100;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <PageTitle title={t("irrigation.title")} subtitle={t("irrigation.subtitle")} />
        <div className="flex items-center gap-2">
          <Badge
            variant={connectionState === "live" ? "secondary" : "outline"}
            className="shrink-0"
          >
            {connectionState === "live" ? t("dashboard.live") : t("dashboard.offline")}
          </Badge>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              void refreshRealtime();
              void loadHistory();
            }}
            disabled={realtimeLoading || historyLoading}
          >
            <RefreshCw
              className={`h-4 w-4 ${realtimeLoading || historyLoading ? "animate-spin" : ""}`}
            />
          </Button>
        </div>
      </div>

      {realtimeError && (
        <div className="surface-card p-4 rounded-xl border border-destructive/30 bg-destructive/10 text-sm text-destructive flex items-center justify-between">
          <p>{realtimeError}</p>
          <Button variant="outline" size="sm" onClick={() => void refreshRealtime()}>
            {t("common.retry")}
          </Button>
        </div>
      )}

      {/* Control Panel Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Pump Hardware Actuator Card */}
        <section className="surface-card p-6 rounded-xl space-y-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-border/50 pb-3">
              <h2 className="text-base font-semibold text-foreground flex items-center gap-2">
                <Power className="h-5 w-5 text-primary" />
                {t("irrigation.pump_control")}
              </h2>
              <span
                className={`flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full ${
                  pumpActual === "on"
                    ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                    : "bg-secondary text-secondary-foreground"
                }`}
              >
                <span
                  className={`h-2 w-2 rounded-full ${
                    pumpActual === "on" ? "bg-emerald-500 animate-pulse" : "bg-muted-foreground"
                  }`}
                />
                {pumpActual === "on" ? t("status.running") : t("status.idle")}
              </span>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-4 text-xs text-muted-foreground">
              <div>
                <span className="block font-medium text-foreground">
                  {t("irrigation.command_status")}
                </span>
                <span className="font-mono text-sm font-semibold text-foreground mt-0.5 block">
                  {commandStatus ? getLocalizedStatus(commandStatus, t) : t("common.none")}
                </span>
              </div>
              <div>
                <span className="block font-medium text-foreground">
                  {t("dashboard.requested")}
                </span>
                <span className="font-mono text-sm font-semibold text-foreground mt-0.5 block">
                  {requestedPump ? getLocalizedStatus(requestedPump, t) : t("common.none")}
                </span>
              </div>
            </div>

            <div className="mt-4 p-3 rounded-lg bg-secondary/40 border border-border/40 text-xs text-muted-foreground">
              <p>{t("irrigation.hardware_notice")}</p>
            </div>
          </div>

          <div className="flex flex-wrap gap-3 pt-2">
            <Button
              className="flex-1 gap-2"
              onClick={() => void handlePumpToggle("on")}
              disabled={!liveEnabled || commandInProgress !== null || pumpActual === "on"}
            >
              {commandInProgress === "pump_on" ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Play className="h-4 w-4" />
              )}
              {t("irrigation.turn_on")}
            </Button>
            <Button
              variant="outline"
              className="flex-1 gap-2"
              onClick={() => void handlePumpToggle("off")}
              disabled={!liveEnabled || commandInProgress !== null || pumpActual === "off"}
            >
              {commandInProgress === "pump_off" ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Power className="h-4 w-4" />
              )}
              {t("irrigation.turn_off")}
            </Button>
          </div>
        </section>

        {/* Valve & Live Condition Actuator Card */}
        <section className="surface-card p-6 rounded-xl space-y-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-border/50 pb-3">
              <h2 className="text-base font-semibold text-foreground flex items-center gap-2">
                <Droplets className="h-5 w-5 text-sky-500" />
                {t("irrigation.valve_control")}
              </h2>
              <span
                className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                  valveActual === "open"
                    ? "bg-sky-500/15 text-sky-600 dark:text-sky-400"
                    : valveActual === "closed"
                      ? "bg-secondary text-secondary-foreground"
                      : "bg-amber-500/15 text-amber-600 dark:text-amber-400"
                }`}
              >
                {valveActual != null ? getLocalizedStatus(valveActual, t) : t("common.no_data")}
              </span>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-4">
              <div className="p-3 rounded-lg border border-border/50 bg-card">
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <Waves className="h-3.5 w-3.5 text-primary" />
                  {t("irrigation.current_soil_moisture")}
                </span>
                <span className="text-xl font-bold text-foreground mt-1 block">
                  {soilMoisture != null ? `${soilMoisture}%` : t("common.no_data")}
                </span>
              </div>

              <div className="p-3 rounded-lg border border-border/50 bg-card">
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <CloudRain className="h-3.5 w-3.5 text-indigo-500" />
                  {t("irrigation.rain_status")}
                </span>
                <span
                  className={`text-xs font-bold mt-1.5 block ${
                    isRaining ? "text-amber-500" : "text-emerald-500"
                  }`}
                >
                  {isRaining ? t("irrigation.rain_detected") : t("irrigation.no_rain")}
                </span>
              </div>
            </div>

            <p className="mt-3 text-xs text-muted-foreground">
              {t("dashboard.irrigation_label", {
                val: getLocalizedStatus(irrigationStatus, t) || t("status.idle"),
              })}
            </p>
          </div>

          <div className="flex flex-wrap gap-3 pt-2">
            <Button
              variant="outline"
              className="flex-1 gap-2"
              onClick={() => void handleValveToggle("open")}
              disabled={!liveEnabled || commandInProgress !== null || valveActual === "open"}
            >
              {commandInProgress === "valve_open" ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Droplets className="h-4 w-4" />
              )}
              {t("irrigation.open_valve")}
            </Button>
            <Button
              variant="outline"
              className="flex-1 gap-2"
              onClick={() => void handleValveToggle("closed")}
              disabled={!liveEnabled || commandInProgress !== null || valveActual === "closed"}
            >
              {commandInProgress === "valve_closed" ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Droplets className="h-4 w-4" />
              )}
              {t("irrigation.close_valve")}
            </Button>
          </div>
        </section>
      </div>

      {/* Real Irrigation History Table */}
      <section className="surface-card p-6 rounded-xl space-y-4">
        <div>
          <h2 className="text-base font-semibold text-foreground">
            {t("irrigation.history_title")}
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">{t("irrigation.history_desc")}</p>
        </div>

        {historyLoading ? (
          <div className="flex h-32 items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : history.length === 0 ? (
          <div className="p-8 text-center rounded-xl border border-border/50 text-sm text-muted-foreground">
            <Droplets className="mx-auto h-8 w-8 text-muted-foreground/60 mb-2" />
            <p>{t("irrigation.no_history")}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-border text-xs uppercase text-muted-foreground">
                <tr>
                  <th className="pb-3 pr-4 font-semibold">{t("irrigation.table_time")}</th>
                  <th className="pb-3 pr-4 font-semibold">{t("irrigation.table_plot")}</th>
                  <th className="pb-3 pr-4 font-semibold">{t("irrigation.table_duration")}</th>
                  <th className="pb-3 pr-4 font-semibold">{t("irrigation.table_volume")}</th>
                  <th className="pb-3 pr-4 font-semibold">{t("irrigation.table_source")}</th>
                  <th className="pb-3 font-semibold">{t("irrigation.table_result")}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {history.map((record) => (
                  <tr key={record.id} className="hover:bg-muted/30 transition-colors">
                    <td className="py-3 pr-4 text-xs font-mono text-foreground">
                      {formatRelativeTime(record.startedAt, t)}
                    </td>
                    <td className="py-3 pr-4 text-xs font-medium text-foreground">
                      {record.note || record.plotName}
                    </td>
                    <td className="py-3 pr-4 text-xs text-foreground">
                      {t("irrigation.duration_mins", { mins: record.durationMinutes })}
                    </td>
                    <td className="py-3 pr-4 text-xs font-semibold text-sky-500">
                      {t("irrigation.volume_liters", { liters: record.waterVolumeLiters })}
                    </td>
                    <td className="py-3 pr-4 text-xs">
                      <Badge variant="outline" className="text-[10px] capitalize">
                        {record.source}
                      </Badge>
                    </td>
                    <td className="py-3 text-xs">
                      <span
                        className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                          record.result === "success"
                            ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                            : record.result === "skipped"
                              ? "bg-amber-500/15 text-amber-600 dark:text-amber-400"
                              : "bg-destructive/15 text-destructive"
                        }`}
                      >
                        {getLocalizedStatus(record.result, t)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
