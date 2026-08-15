import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { Alert, Device, FarmPlot, SensorReading, SeriesPoint } from "@/types";
import { getSupabaseClient, hasSupabaseConfig } from "@/lib/supabase";
import type {
  ActuatorState,
  CommandStatus,
  ConnectionState,
  LiveDeviceEventRow,
  LiveDeviceRow,
  LiveFarmPlotRow,
  LiveIrrigationRow,
  LiveSensorRow,
} from "@/services/realtime";
import {
  loadFarmerBootData,
  requestDeviceCommand,
  subscribeFarmerDashboard,
} from "@/services/realtime";

const OFFLINE_AFTER_MS = 5 * 60 * 1000;

type PumpControlState = {
  actualPump: "on" | "off";
  actualValve: "open" | "closed" | null; // null = ESP32 has not reported valve_status yet
  requestedPump: "on" | "off" | null;
  requestedValve: "open" | "closed" | null;
  commandStatus: CommandStatus | null;
  irrigationStatus: string;
};

export interface FarmerRealtimeViewModel {
  sensorReadings: SensorReading[];
  devices: Device[];
  alerts: Alert[];
  farmPlots: FarmPlot[];
  weeklyMoisture: SeriesPoint[];
  waterUsage: SeriesPoint[];
  cropHealthTrend: SeriesPoint[];
  pumpActual: ActuatorState;
  /** null means the ESP32 has not reported valve_status in any sensor row yet */
  valveActual: ActuatorState | null;
  requestedPump: "on" | "off" | null;
  requestedValve: "open" | "closed" | null;
  commandStatus: CommandStatus | null;
  irrigationStatus: string;
  pumpHeaderSubtitle: string;
  connectionState: ConnectionState;
  loading: boolean;
  error: string | null;
  lastSyncedAt: string | null;
  stale: boolean;
  liveEnabled: boolean;
  refresh: () => Promise<void>;
  requestPumpCommand: (state: "on" | "off") => Promise<void>;
  requestValveCommand: (state: "open" | "closed") => Promise<void>;
}

function toRelativeTime(value: string | null | undefined) {
  if (!value) return "just now";
  const diffMs = Date.now() - new Date(value).getTime();
  if (Number.isNaN(diffMs) || diffMs <= 0) return "just now";
  const diffMins = Math.max(1, Math.round(diffMs / 60000));
  if (diffMins < 60) return `${diffMins} min ago`;
  const diffHours = Math.round(diffMins / 60);
  return `${diffHours} hr${diffHours === 1 ? "" : "s"} ago`;
}

function toDayLabel(dateStr: string | null | undefined): string {
  if (!dateStr) return "N/A";
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return "N/A";
  return d.toLocaleDateString([], { weekday: "short" });
}

function latestByTimestamp<T extends { id: string }>(rows: T[], timestampKey: keyof T) {
  return [...rows].sort((left, right) =>
    String(right[timestampKey]).localeCompare(String(left[timestampKey])),
  );
}

function buildSensorCards(
  sensorRows: LiveSensorRow[],
  deviceRows: LiveDeviceRow[],
): SensorReading[] {
  const latest = sensorRows[0] ?? null;
  const gatewayDevice =
    deviceRows.find((d) => d.device_type === "gateway") ?? deviceRows[0] ?? null;

  return [
    {
      id: "soil-moisture",
      label: "Soil Moisture",
      value: latest?.soil_moisture_pct != null ? latest.soil_moisture_pct : "No data available",
      unit: latest?.soil_moisture_pct != null ? "%" : "",
      status:
        latest?.soil_moisture_pct != null && latest.soil_moisture_pct <= 20
          ? "critical"
          : latest?.soil_moisture_pct != null && latest.soil_moisture_pct <= 35
            ? "warning"
            : "optimal",
      trend: 0,
      updatedAt: latest?.recorded_at ? toRelativeTime(latest.recorded_at) : "No readings",
    },
    {
      id: "temperature",
      label: "Temperature",
      value: latest?.temperature_c != null ? latest.temperature_c : "No data available",
      unit: latest?.temperature_c != null ? "°C" : "",
      status: latest?.temperature_c != null && latest.temperature_c >= 35 ? "warning" : "optimal",
      trend: 0,
      updatedAt: latest?.recorded_at ? toRelativeTime(latest.recorded_at) : "No readings",
    },
    {
      id: "humidity",
      label: "Humidity",
      value: latest?.humidity_pct != null ? latest.humidity_pct : "No data available",
      unit: latest?.humidity_pct != null ? "%" : "",
      status: latest?.humidity_pct != null && latest.humidity_pct <= 35 ? "warning" : "optimal",
      trend: 0,
      updatedAt: latest?.recorded_at ? toRelativeTime(latest.recorded_at) : "No readings",
    },
    {
      id: "tank-level",
      label: "Water Tank",
      value: latest?.tank_level_pct != null ? latest.tank_level_pct : "No data available",
      unit: latest?.tank_level_pct != null ? "%" : "",
      status:
        latest?.tank_level_pct != null && latest.tank_level_pct <= 15
          ? "critical"
          : latest?.tank_level_pct != null && latest.tank_level_pct <= 30
            ? "warning"
            : "optimal",
      trend: 0,
      updatedAt: latest?.recorded_at ? toRelativeTime(latest.recorded_at) : "No readings",
    },
    {
      id: "rain-prediction",
      label: "Rain Prediction",
      value: latest?.rain_detected != null ? (latest.rain_detected ? 100 : 0) : "No data available",
      unit: latest?.rain_detected != null ? "%" : "",
      status: latest?.rain_detected ? "warning" : "optimal",
      trend: 0,
      updatedAt: latest?.recorded_at ? toRelativeTime(latest.recorded_at) : "No readings",
    },
    {
      id: "gateway-battery",
      label: "Gateway Battery",
      value: gatewayDevice?.battery_pct != null ? gatewayDevice.battery_pct : "No data available",
      unit: gatewayDevice?.battery_pct != null ? "%" : "",
      status:
        gatewayDevice?.battery_pct != null && gatewayDevice.battery_pct <= 20
          ? "warning"
          : "optimal",
      trend: 0,
      updatedAt: gatewayDevice?.last_seen_at
        ? toRelativeTime(gatewayDevice.last_seen_at)
        : "No device",
    },
  ];
}

function buildDevices(deviceRows: LiveDeviceRow[]): Device[] {
  return deviceRows.map((row, index) => ({
    id: row.device_code || row.id,
    name: row.name,
    type: (row.device_type as Device["type"]) || "pump",
    zone: row.farm_plot_id ? `Plot ${row.farm_plot_id.slice(0, 8)}` : row.device_type,
    online: row.is_online,
    battery: row.battery_pct ?? 0,
    signal: row.signal_pct ?? 0,
    firmware: row.firmware_version ?? "unknown",
    lastSeen: row.last_seen_at ? toRelativeTime(row.last_seen_at) : "never",
    health: row.is_online ? Math.max(0, 100 - index * 4) : 0,
    lastSeenAt: row.last_seen_at,
    stale: Boolean(
      row.last_seen_at && Date.now() - new Date(row.last_seen_at).getTime() > OFFLINE_AFTER_MS,
    ),
    actualPumpStatus: row.pump_status,
    actualValveStatus: row.valve_status,
    requestedPumpStatus: null,
    requestedValveStatus: null,
    commandStatus: null,
  }));
}

function buildAlerts(eventRows: LiveDeviceEventRow[]): Alert[] {
  return eventRows.map((row) => ({
    id: row.id,
    title: row.title,
    description: row.description,
    severity: row.severity,
    createdAt: toRelativeTime(row.created_at),
    source: row.device_id ? `Device ${row.device_id.slice(0, 8)}` : "System",
    read: Boolean(row.read_at),
  }));
}

function buildFarmPlots(plotRows: LiveFarmPlotRow[]): FarmPlot[] {
  return plotRows.map((row) => {
    const cropName = Array.isArray(row.crops) ? row.crops[0]?.name : row.crops?.name;
    return {
      id: row.id,
      name: row.name,
      crop: cropName ?? "Crop",
      areaAcres: Number(row.area_acres) || 0,
      sowingDate: row.sowing_date ?? "",
      expectedHarvest: row.expected_harvest_date ?? "",
      soilType: row.soil_type ?? "N/A",
      irrigation: row.irrigation_method ?? "N/A",
      health: Number(row.health_score) || 0,
    };
  });
}

function buildWeeklyMoistureChart(sensorRows: LiveSensorRow[]): SeriesPoint[] {
  const valid = sensorRows
    .filter((r) => r.soil_moisture_pct != null)
    .slice(0, 14)
    .reverse();

  if (valid.length === 0) return [];

  return valid.map((row) => ({
    label: toDayLabel(row.recorded_at),
    moisture: Number(row.soil_moisture_pct) || 0,
    target: 40,
  }));
}

function buildWaterUsageChart(irrigationRows: LiveIrrigationRow[]): SeriesPoint[] {
  const valid = irrigationRows.slice(0, 14).reverse();
  if (valid.length === 0) return [];

  return valid.map((row) => {
    const litres = Number(row.water_volume_liters) || 0;
    return {
      label: toDayLabel(row.started_at),
      litres,
      saved: Math.round(litres * 0.25),
    };
  });
}

function buildCropHealthTrendChart(plotRows: LiveFarmPlotRow[]): SeriesPoint[] {
  if (plotRows.length === 0) return [];

  return plotRows.map((plot) => {
    const health = Number(plot.health_score) || 0;
    return {
      label: plot.name,
      ndvi: Number((health / 100).toFixed(2)),
      stress: Math.max(0, 100 - health),
    };
  });
}

function buildPumpHeaderSubtitle(irrigationRows: LiveIrrigationRow[]): string {
  const latest = irrigationRows[0];
  if (!latest) {
    return "No recent irrigation cycles logged in database";
  }

  const zoneText = latest.note
    ? latest.note
    : `Farm Plot ${latest.farm_plot_id ? latest.farm_plot_id.slice(0, 8) : "A"}`;
  const lastRunText = toRelativeTime(latest.started_at);
  const runtimeMins = latest.duration_minutes ?? 0;
  const flowRate =
    latest.water_volume_liters && runtimeMins > 0
      ? (Number(latest.water_volume_liters) / runtimeMins).toFixed(1)
      : "0";

  return `${zoneText} · Last run ${lastRunText} for ${runtimeMins} min at ${flowRate} L/min`;
}

function buildPumpState(
  deviceRows: LiveDeviceRow[],
  pumpState: PumpControlState,
  irrigationRows: LiveIrrigationRow[],
  sensorRows: LiveSensorRow[],
) {
  // Prefer the latest sensor_readings pump/valve status because the ESP32
  // writes telemetry to sensor_readings but does NOT update the devices table.
  // The devices table pump_status/valve_status defaults ("off"/"closed") are
  // stale and should only be used as a final fallback.
  const latestSensor = sensorRows[0] ?? null;
  const pumpDevice = deviceRows.find((row) => row.device_type === "pump") ?? deviceRows[0] ?? null;
  const latestIrrigation = irrigationRows[0] ?? null;

  // Resolve actual pump: sensor row wins if present, then device row, then saved state
  const resolvedPump: "on" | "off" =
    latestSensor?.pump_status != null
      ? latestSensor.pump_status
      : (pumpDevice?.pump_status ?? pumpState.actualPump);

  // Resolve actual valve: sensor row wins if non-null, then device row (also nullable now),
  // then previously known state.  When ALL sources are null we surface null so the UI can
  // display "No data" rather than the misleading default "closed".
  const resolvedValve: "open" | "closed" | null =
    latestSensor?.valve_status != null
      ? latestSensor.valve_status
      : pumpDevice?.valve_status != null
        ? pumpDevice.valve_status
        : (pumpState.actualValve ?? null);

  return {
    actualPump: resolvedPump,
    actualValve: resolvedValve, // may be null when ESP32 does not send valve_status
    requestedPump: pumpState.requestedPump,
    requestedValve: pumpState.requestedValve,
    commandStatus: pumpState.commandStatus,
    irrigationStatus: latestIrrigation
      ? `${latestIrrigation.source} · ${latestIrrigation.result} · ${toRelativeTime(latestIrrigation.updated_at)}`
      : pumpState.irrigationStatus,
  };
}

function buildEmptySnapshot(): FarmerRealtimeViewModel {
  return {
    sensorReadings: buildSensorCards([], []),
    devices: [],
    alerts: [],
    farmPlots: [],
    weeklyMoisture: [],
    waterUsage: [],
    cropHealthTrend: [],
    pumpActual: "off",
    valveActual: null,
    requestedPump: null,
    requestedValve: null,
    commandStatus: null,
    irrigationStatus: "No active irrigation cycle",
    pumpHeaderSubtitle: "No recent irrigation cycles logged in database",
    connectionState: "offline",
    loading: false,
    error: null,
    lastSyncedAt: null,
    stale: false,
    liveEnabled: false,
    refresh: async () => undefined,
    requestPumpCommand: async () => undefined,
    requestValveCommand: async () => undefined,
  };
}

export function useFarmerRealtime(): FarmerRealtimeViewModel {
  const [sensorReadings, setSensorReadings] = useState<SensorReading[]>(() =>
    buildSensorCards([], []),
  );
  const [devices, setDevices] = useState<Device[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [farmPlots, setFarmPlots] = useState<FarmPlot[]>([]);
  const [weeklyMoisture, setWeeklyMoisture] = useState<SeriesPoint[]>([]);
  const [waterUsage, setWaterUsage] = useState<SeriesPoint[]>([]);
  const [cropHealthTrend, setCropHealthTrend] = useState<SeriesPoint[]>([]);

  const [pumpState, setPumpState] = useState<PumpControlState>({
    actualPump: "off",
    actualValve: null, // starts as null; will be set once sensor_readings are loaded
    requestedPump: null,
    requestedValve: null,
    commandStatus: null,
    irrigationStatus: "No active irrigation cycle",
  });
  const [pumpHeaderSubtitle, setPumpHeaderSubtitle] = useState<string>(
    "No recent irrigation cycles logged in database",
  );
  const [connectionState, setConnectionState] = useState<ConnectionState>("connecting");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastSyncedAt, setLastSyncedAt] = useState<string | null>(null);
  const [stale, setStale] = useState(false);
  const [liveEnabled, setLiveEnabled] = useState(false);

  const client = useMemo(() => getSupabaseClient(), []);
  const channelRef = useRef<ReturnType<typeof subscribeFarmerDashboard> | null>(null);
  const pumpStateRef = useRef<PumpControlState>({
    actualPump: "off",
    actualValve: null,
    requestedPump: null,
    requestedValve: null,
    commandStatus: null,
    irrigationStatus: "No active irrigation cycle",
  });

  const plotRowsRef = useRef<LiveFarmPlotRow[]>([]);
  const sensorRowsRef = useRef<LiveSensorRow[]>([]);
  const deviceRowsRef = useRef<LiveDeviceRow[]>([]);
  const eventRowsRef = useRef<LiveDeviceEventRow[]>([]);
  const irrigationRowsRef = useRef<LiveIrrigationRow[]>([]);
  const sensorVersionRef = useRef<Map<string, string>>(new Map());
  const deviceVersionRef = useRef<Map<string, string>>(new Map());
  const eventVersionRef = useRef<Set<string>>(new Set());
  const irrigationVersionRef = useRef<Set<string>>(new Set());

  const syncSnapshot = useCallback((nextPumpState?: Partial<PumpControlState>) => {
    const mergedPumpState = { ...pumpStateRef.current, ...nextPumpState };
    const nextPump = buildPumpState(
      deviceRowsRef.current,
      mergedPumpState,
      irrigationRowsRef.current,
      sensorRowsRef.current,
    );

    setSensorReadings(buildSensorCards(sensorRowsRef.current, deviceRowsRef.current));
    setDevices(buildDevices(deviceRowsRef.current));
    setAlerts(buildAlerts(eventRowsRef.current.slice(0, 4)));
    setFarmPlots(buildFarmPlots(plotRowsRef.current));
    setWeeklyMoisture(buildWeeklyMoistureChart(sensorRowsRef.current));
    setWaterUsage(buildWaterUsageChart(irrigationRowsRef.current));
    setCropHealthTrend(buildCropHealthTrendChart(plotRowsRef.current));
    setPumpHeaderSubtitle(buildPumpHeaderSubtitle(irrigationRowsRef.current));

    setPumpState(nextPump);
    pumpStateRef.current = nextPump;

    const latestTimestamp =
      sensorRowsRef.current[0]?.recorded_at ??
      deviceRowsRef.current[0]?.updated_at ??
      irrigationRowsRef.current[0]?.updated_at ??
      eventRowsRef.current[0]?.created_at ??
      null;

    setLastSyncedAt(latestTimestamp);
    setStale(
      Boolean(
        deviceRowsRef.current.some(
          (row) =>
            row.last_seen_at &&
            Date.now() - new Date(row.last_seen_at).getTime() > OFFLINE_AFTER_MS,
        ),
      ),
    );
    return nextPump;
  }, []);

  const bootstrap = useCallback(async () => {
    if (!client || !hasSupabaseConfig()) {
      setConnectionState("offline");
      setLoading(false);
      setError(null);
      setLiveEnabled(false);
      return;
    }

    setConnectionState((current) => (current === "live" ? "reconnecting" : "connecting"));
    setLoading(true);
    setError(null);

    try {
      // Ensure user is authenticated before loading boot data
      const { data: authData, error: authError } = await client.auth.getUser();
      if (authError) {
        throw authError;
      }
      if (!authData || !authData.user) {
        throw new Error("No authenticated user");
      }
      const boot = await loadFarmerBootData(client);
      plotRowsRef.current = boot.farmPlots;
      sensorRowsRef.current = latestByTimestamp(boot.sensorRows, "recorded_at");
      deviceRowsRef.current = latestByTimestamp(boot.deviceRows, "updated_at");
      eventRowsRef.current = latestByTimestamp(boot.eventRows, "created_at");
      irrigationRowsRef.current = latestByTimestamp(boot.irrigationRows, "updated_at");

      sensorVersionRef.current = new Map(
        sensorRowsRef.current.map((row) => [row.id, row.recorded_at]),
      );
      deviceVersionRef.current = new Map(
        deviceRowsRef.current.map((row) => [row.id, row.updated_at]),
      );
      eventVersionRef.current = new Set(eventRowsRef.current.map((row) => row.id));
      irrigationVersionRef.current = new Set(irrigationRowsRef.current.map((row) => row.id));

      syncSnapshot();
      setConnectionState("live");
      setLiveEnabled(true);

      // Ensure any existing channel is cleaned up before creating a new one
      if (channelRef.current) {
        // Unsubscribe and remove the old channel to avoid duplicate callbacks
        void client.removeChannel(channelRef.current);
        channelRef.current = null;
      }
      const deviceIdsSet = new Set(deviceRowsRef.current.map((d) => d.id));
      const farmIdsSet = new Set(boot.farms.map((f) => f.id));
      channelRef.current = subscribeFarmerDashboard(
        client,
        {
          onSensorReading: (row) => {
            const previousVersion = sensorVersionRef.current.get(row.id);
            if (previousVersion === row.recorded_at) return;
            sensorVersionRef.current.set(row.id, row.recorded_at);
            sensorRowsRef.current = latestByTimestamp(
              [row, ...sensorRowsRef.current.filter((item) => item.id !== row.id)],
              "recorded_at",
            );
            syncSnapshot();
            setConnectionState("live");
            setLiveEnabled(true);
          },
          onDeviceRow: (row) => {
            const previousVersion = deviceVersionRef.current.get(row.id);
            if (previousVersion === row.updated_at) return;
            deviceVersionRef.current.set(row.id, row.updated_at);
            deviceRowsRef.current = latestByTimestamp(
              [row, ...deviceRowsRef.current.filter((item) => item.id !== row.id)],
              "updated_at",
            );
            syncSnapshot();
            setConnectionState("live");
            setLiveEnabled(true);
          },
          onDeviceEvent: (row) => {
            if (eventVersionRef.current.has(row.id)) return;
            eventVersionRef.current.add(row.id);
            eventRowsRef.current = latestByTimestamp(
              [row, ...eventRowsRef.current.filter((item) => item.id !== row.id)],
              "created_at",
            );
            syncSnapshot({
              commandStatus: row.command_status ?? null,
              requestedPump:
                row.command_type === "pump_on"
                  ? "on"
                  : row.command_type === "pump_off"
                    ? "off"
                    : null,
              requestedValve:
                row.command_type === "valve_open"
                  ? "open"
                  : row.command_type === "valve_close"
                    ? "closed"
                    : null,
              irrigationStatus:
                row.event_type === "tamper" ? row.title : pumpStateRef.current.irrigationStatus,
            });
            setConnectionState("live");
            setLiveEnabled(true);
          },
          onIrrigationRow: (row) => {
            if (irrigationVersionRef.current.has(row.id)) return;
            irrigationVersionRef.current.add(row.id);
            irrigationRowsRef.current = latestByTimestamp(
              [row, ...irrigationRowsRef.current.filter((item) => item.id !== row.id)],
              "updated_at",
            );
            syncSnapshot({
              irrigationStatus: `${row.source} · ${row.result} · ${toRelativeTime(row.updated_at)}`,
              commandStatus:
                row.result === "success" ? "acknowledged" : pumpStateRef.current.commandStatus,
            });
            setConnectionState("live");
            setLiveEnabled(true);
          },
          onStatus: (nextState) => {
            setConnectionState(nextState);
            setLiveEnabled(nextState === "live");
          },
          onError: (message) => {
            setError(message);
            setConnectionState("error");
            setLiveEnabled(false);
            setLoading(false);
          },
        },
        { deviceIds: deviceIdsSet, farmIds: farmIdsSet },
      );
    } catch (loadError) {
      const message =
        loadError instanceof Error ? loadError.message : "Unable to load realtime data.";
      setError(message);
      setConnectionState("error");
      setLiveEnabled(false);
    } finally {
      setLoading(false);
    }
  }, [client, syncSnapshot]);

  useEffect(() => {
    void bootstrap();
    const timer = window.setInterval(() => {
      const deviceStale = deviceRowsRef.current.some(
        (row) =>
          row.last_seen_at && Date.now() - new Date(row.last_seen_at).getTime() > OFFLINE_AFTER_MS,
      );
      setStale(deviceStale);
    }, 30_000);

    return () => {
      window.clearInterval(timer);
      if (client && channelRef.current) {
        void client.removeChannel(channelRef.current);
      }
    };
  }, [bootstrap, client]);

  const refresh = useCallback(async () => {
    await bootstrap();
  }, [bootstrap]);

  const requestPumpCommand = useCallback(
    async (state: "on" | "off") => {
      if (!client || !liveEnabled) return;
      setPumpState((current) => ({ ...current, requestedPump: state, commandStatus: "queued" }));
      const activeDeviceId =
        deviceRowsRef.current.find((row) => row.device_type === "pump")?.id ??
        deviceRowsRef.current[0]?.id;
      if (!activeDeviceId) return;
      await requestDeviceCommand(client, {
        deviceId: activeDeviceId,
        command: state === "on" ? "pump_on" : "pump_off",
      });
    },
    [client, liveEnabled],
  );

  const requestValveCommand = useCallback(
    async (state: "open" | "closed") => {
      if (!client || !liveEnabled) return;
      setPumpState((current) => ({ ...current, requestedValve: state, commandStatus: "queued" }));
      const activeDeviceId =
        deviceRowsRef.current.find((row) => row.device_type === "pump")?.id ??
        deviceRowsRef.current[0]?.id;
      if (!activeDeviceId) return;
      await requestDeviceCommand(client, {
        deviceId: activeDeviceId,
        command: state === "open" ? "valve_open" : "valve_close",
      });
    },
    [client, liveEnabled],
  );

  if (!hasSupabaseConfig()) {
    return buildEmptySnapshot();
  }

  return {
    sensorReadings,
    devices,
    alerts,
    farmPlots,
    weeklyMoisture,
    waterUsage,
    cropHealthTrend,
    pumpActual: pumpState.actualPump,
    valveActual: pumpState.actualValve,
    requestedPump: pumpState.requestedPump,
    requestedValve: pumpState.requestedValve,
    commandStatus: pumpState.commandStatus,
    irrigationStatus: pumpState.irrigationStatus,
    pumpHeaderSubtitle,
    connectionState,
    loading,
    error,
    lastSyncedAt,
    stale,
    liveEnabled,
    refresh,
    requestPumpCommand,
    requestValveCommand,
  };
}
