import type { RealtimeChannel, SupabaseClient } from "@supabase/supabase-js";

export type ConnectionState = "mock" | "connecting" | "live" | "reconnecting" | "offline" | "error";
export type DeviceCommand = "pump_on" | "pump_off" | "valve_open" | "valve_close";
export type ActuatorState = "on" | "off" | "open" | "closed";
export type CommandStatus = "queued" | "sent" | "acknowledged" | "failed" | "cancelled";

export interface LiveSensorRow {
  id: string;
  device_id: string;
  recorded_at: string;
  temperature_c: number | null;
  humidity_pct: number | null;
  soil_raw: number | null;
  soil_moisture_pct: number | null;
  rain_detected: boolean | null;
  tank_level_pct: number | null;
  pump_status: "on" | "off" | null;
  valve_status: "open" | "closed" | null;
}

export interface LiveDeviceRow {
  id: string;
  farm_id: string;
  farm_plot_id: string | null;
  name: string;
  device_code: string;
  device_type: string;
  is_online: boolean;
  battery_pct: number | null;
  signal_pct: number | null;
  firmware_version: string | null;
  last_seen_at: string | null;
  pump_mode: "auto" | "manual" | null;
  pump_status: "on" | "off" | null;
  valve_status: "open" | "closed" | null;
  updated_at: string;
}

export interface LiveDeviceEventRow {
  id: string;
  device_id: string;
  actor_profile_id: string | null;
  event_type: string;
  severity: "info" | "warning" | "critical";
  title: string;
  description: string;
  command_type: string | null;
  command_status: CommandStatus | null;
  payload: Record<string, unknown> | null;
  acknowledged_at: string | null;
  read_at: string | null;
  created_at: string;
}

export interface LiveIrrigationRow {
  id: string;
  farm_id: string;
  farm_plot_id: string | null;
  device_id: string | null;
  source: "manual" | "schedule" | "automation";
  started_at: string;
  ended_at: string | null;
  duration_minutes: number | null;
  water_volume_liters: number | null;
  result: "success" | "skipped" | "aborted" | "failed";
  note: string | null;
  created_at: string;
  updated_at: string;
}

export interface LiveFarmPlotRow {
  id: string;
  farm_id: string;
  crop_id: string;
  name: string;
  area_acres: number;
  soil_type: string | null;
  irrigation_method: string | null;
  sowing_date: string | null;
  expected_harvest_date: string | null;
  health_score: number;
  crops?: { name: string } | { name: string }[] | null;
}

export interface RealtimeBootData {
  user: { id: string; email?: string } | null;
  profile: { id: string; full_name: string; role: string } | null;
  farms: { id: string; name: string }[];
  farmPlots: LiveFarmPlotRow[];
  deviceRows: LiveDeviceRow[];
  sensorRows: LiveSensorRow[];
  eventRows: LiveDeviceEventRow[];
  irrigationRows: LiveIrrigationRow[];
}

export interface SubscriptionHandlers {
  onSensorReading: (row: LiveSensorRow) => void;
  onDeviceRow: (row: LiveDeviceRow) => void;
  onDeviceEvent: (row: LiveDeviceEventRow) => void;
  onIrrigationRow: (row: LiveIrrigationRow) => void;
  onStatus: (state: ConnectionState) => void;
  onError: (message: string) => void;
}

export interface CommandRequest {
  deviceId: string;
  command: DeviceCommand;
  requestedByProfileId?: string;
  note?: string;
}

export async function loadFarmerBootData(client: SupabaseClient): Promise<RealtimeBootData> {
  const { data: authData } = await client.auth.getUser();
  let userId = authData?.user?.id ?? null;

  if (!userId) {
    const { data: sessionData } = await client.auth.getSession();
    userId = sessionData?.session?.user?.id ?? null;
  }

  if (!userId) {
    return {
      user: null,
      profile: null,
      farms: [],
      farmPlots: [],
      deviceRows: [],
      sensorRows: [],
      eventRows: [],
      irrigationRows: [],
    };
  }

  const { data: profile } = await client
    .from("profiles")
    .select("id, full_name, role")
    .eq("id", userId)
    .maybeSingle();

  const { data: farms } = await client
    .from("farms")
    .select("id, name, owner_profile_id")
    .eq("owner_profile_id", userId);

  const farmList = farms ?? [];
  const farmIds = farmList.map((f) => f.id);

  const userObj = {
    id: userId,
    ...(authData?.user?.email ? { email: authData.user.email } : {}),
  };

  if (farmIds.length === 0) {
    return {
      user: userObj,
      profile: profile ?? null,
      farms: [],
      farmPlots: [],
      deviceRows: [],
      sensorRows: [],
      eventRows: [],
      irrigationRows: [],
    };
  }

  const [plotResult, deviceResult, irrigationResult] = await Promise.all([
    client
      .from("farm_plots")
      .select(
        "id, farm_id, crop_id, name, area_acres, soil_type, irrigation_method, sowing_date, expected_harvest_date, health_score, crops(name)",
      )
      .in("farm_id", farmIds),
    client
      .from("devices")
      .select(
        "id, farm_id, farm_plot_id, name, device_code, device_type, is_online, battery_pct, signal_pct, firmware_version, last_seen_at, pump_mode, pump_status, valve_status, updated_at",
      )
      .in("farm_id", farmIds)
      .order("updated_at", { ascending: false }),
    client
      .from("irrigation_records")
      .select(
        "id, farm_id, farm_plot_id, device_id, source, started_at, ended_at, duration_minutes, water_volume_liters, result, note, created_at, updated_at",
      )
      .in("farm_id", farmIds)
      .order("started_at", { ascending: false })
      .limit(50),
  ]);

  if (plotResult.error) throw plotResult.error;
  if (deviceResult.error) throw deviceResult.error;
  if (irrigationResult.error) throw irrigationResult.error;

  const deviceRows = (deviceResult.data ?? []) as LiveDeviceRow[];
  const deviceIds = deviceRows.map((d) => d.id);

  let sensorRows: LiveSensorRow[] = [];
  let eventRows: LiveDeviceEventRow[] = [];

  if (deviceIds.length > 0) {
    const [sensorResult, eventResult] = await Promise.all([
      client
        .from("sensor_readings")
        .select(
          "id, device_id, recorded_at, temperature_c, humidity_pct, soil_raw, soil_moisture_pct, rain_detected, tank_level_pct, pump_status, valve_status",
        )
        .in("device_id", deviceIds)
        .order("recorded_at", { ascending: false })
        .limit(100),
      client
        .from("device_events")
        .select(
          "id, device_id, actor_profile_id, event_type, severity, title, description, command_type, command_status, payload, acknowledged_at, read_at, created_at",
        )
        .in("device_id", deviceIds)
        .order("created_at", { ascending: false })
        .limit(50),
    ]);

    if (sensorResult.error) throw sensorResult.error;
    if (eventResult.error) throw eventResult.error;

    sensorRows = (sensorResult.data ?? []) as LiveSensorRow[];
    eventRows = (eventResult.data ?? []) as LiveDeviceEventRow[];
  }

  return {
    user: userObj,
    profile: profile ?? null,
    farms: farmList,
    farmPlots: (plotResult.data ?? []) as unknown as LiveFarmPlotRow[],
    deviceRows,
    sensorRows,
    eventRows,
    irrigationRows: (irrigationResult.data ?? []) as LiveIrrigationRow[],
  };
}

export function subscribeFarmerDashboard(
  client: SupabaseClient,
  handlers: SubscriptionHandlers,
  filterIds?: { deviceIds?: Set<string>; farmIds?: Set<string> },
): RealtimeChannel {
  const channel = client.channel("farmguard-farmer-dashboard");

  channel
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "sensor_readings" },
      (payload) => {
        const row = payload.new as LiveSensorRow;
        if (filterIds?.deviceIds?.size && row?.device_id && !filterIds.deviceIds.has(row.device_id))
          return;
        handlers.onSensorReading(row);
      },
    )
    .on("postgres_changes", { event: "*", schema: "public", table: "devices" }, (payload) => {
      const row = payload.new as LiveDeviceRow;
      if (filterIds?.deviceIds?.size && row?.id && !filterIds.deviceIds.has(row.id)) return;
      handlers.onDeviceRow(row);
    })
    .on("postgres_changes", { event: "*", schema: "public", table: "device_events" }, (payload) => {
      const row = payload.new as LiveDeviceEventRow;
      if (filterIds?.deviceIds?.size && row?.device_id && !filterIds.deviceIds.has(row.device_id))
        return;
      handlers.onDeviceEvent(row);
    })
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "irrigation_records" },
      (payload) => {
        const row = payload.new as LiveIrrigationRow;
        if (filterIds?.farmIds?.size && row?.farm_id && !filterIds.farmIds.has(row.farm_id)) return;
        handlers.onIrrigationRow(row);
      },
    )
    .subscribe((status) => {
      if (status === "SUBSCRIBED") handlers.onStatus("live");
      if (status === "CHANNEL_ERROR") handlers.onStatus("error");
      if (status === "TIMED_OUT") handlers.onStatus("reconnecting");
      if (status === "CLOSED") handlers.onStatus("offline");
    });

  return channel;
}

export async function requestDeviceCommand(client: SupabaseClient, payload: CommandRequest) {
  const { error } = await client.functions.invoke("device-command", {
    body: payload,
  });

  if (error) {
    const { error: insertError } = await client.from("device_events").insert({
      device_id: payload.deviceId,
      actor_profile_id: payload.requestedByProfileId ?? null,
      event_type: "command_requested",
      severity: "info",
      title: `${payload.command.toUpperCase().replace("_", " ")} requested`,
      description: `Command ${payload.command} requested from dashboard`,
      command_type: payload.command,
      command_status: "queued",
      payload: payload.note ? { note: payload.note } : null,
    });

    if (insertError) throw error;
  }
}

export interface LivePurchaseOfferRow {
  id: string;
  buyer_id: string;
  farm_id: string;
  offered_price_per_kg: number;
  quantity_kg: number;
  status: "pending" | "accepted" | "rejected" | "completed";
  created_at: string;
}

export function subscribeBuyerOffers(
  client: SupabaseClient,
  buyerId: string,
  onOfferChange: (row: LivePurchaseOfferRow) => void,
  onStatus?: (state: ConnectionState) => void,
): RealtimeChannel {
  const channel = client.channel(`farmguard-buyer-offers-${buyerId}`);

  channel
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "purchase_offers",
        filter: `buyer_id=eq.${buyerId}`,
      },
      (payload) => {
        const row = (payload.new || payload.old) as LivePurchaseOfferRow;
        if (row) {
          onOfferChange(row);
        }
      },
    )
    .subscribe((status) => {
      if (onStatus) {
        if (status === "SUBSCRIBED") onStatus("live");
        if (status === "CHANNEL_ERROR") onStatus("error");
        if (status === "TIMED_OUT") onStatus("reconnecting");
        if (status === "CLOSED") onStatus("offline");
      }
    });

  return channel;
}

export interface AppNotification {

  id: string;
  title: string;
  description: string;
  time: string;
  createdAt: string;
  read: boolean;
  type: "offer_received" | "offer_status" | "crop_offer" | "alert" | "system";
  link?: string;
}

export function subscribeUserNotifications(
  client: SupabaseClient,
  userId: string,
  role: "farmer" | "buyer",
  farmIds: string[],
  onNotification: (notification: AppNotification) => void,
): RealtimeChannel {
  const channelName = `user-notifications-${userId}-${Date.now()}`;
  const channel = client.channel(channelName);

  if (role === "farmer") {
    // Listen for incoming offers on farmer's farms
    channel.on(
      "postgres_changes",
      {
        event: "INSERT",
        schema: "public",
        table: "purchase_offers",
      },
      (payload) => {
        const row = payload.new as LivePurchaseOfferRow;
        if (row && farmIds.includes(row.farm_id)) {
          onNotification({
            id: `notif_offer_${row.id}_${Date.now()}`,
            title: "New Purchase Offer",
            description: `New purchase offer received for your farm (₹${row.offered_price_per_kg}/kg)`,
            time: "Just now",
            createdAt: new Date().toISOString(),
            read: false,
            type: "offer_received",
            link: "/farmer/marketplace",
          });
        }
      },
    );
  } else {
    // Listen for updates on buyer's offers
    channel.on(
      "postgres_changes",
      {
        event: "UPDATE",
        schema: "public",
        table: "purchase_offers",
        filter: `buyer_id=eq.${userId}`,
      },
      (payload) => {
        const row = payload.new as LivePurchaseOfferRow;
        if (row) {
          onNotification({
            id: `notif_buyer_offer_${row.id}_${Date.now()}`,
            title: `Offer ${row.status.toUpperCase()}`,
            description: `Your purchase offer status changed to ${row.status}`,
            time: "Just now",
            createdAt: new Date().toISOString(),
            read: false,
            type: "offer_status",
            link: "/buyer/procurement",
          });
        }
      },
    );

    // Also listen for new offers initiated directly to this buyer
    channel.on(
      "postgres_changes",
      {
        event: "INSERT",
        schema: "public",
        table: "purchase_offers",
        filter: `buyer_id=eq.${userId}`,
      },
      (payload) => {
        const row = payload.new as LivePurchaseOfferRow;
        if (row) {
          onNotification({
            id: `notif_farmer_crop_offer_${row.id}_${Date.now()}`,
            title: "Direct Crop Offer Received",
            description: `A farmer submitted a crop supply offer (₹${row.offered_price_per_kg}/kg)`,
            time: "Just now",
            createdAt: new Date().toISOString(),
            read: false,
            type: "crop_offer",
            link: "/buyer/procurement",
          });
        }
      },
    );
  }

  channel.subscribe();
  return channel;
}


