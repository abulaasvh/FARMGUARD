import { delay } from "@/utils/format";
import { getSupabaseClient } from "@/lib/supabase";
import type { Alert, FarmPlot } from "@/types";
import { farmPlots as initialMockPlots } from "@/data/farmer";

// In-memory cache synced with database / fallback for dev session
let localPlotsState: FarmPlot[] = [...initialMockPlots];

export interface FarmerBuyerOffer {
  id: string;
  buyerId: string;
  buyerName: string;
  companyName: string;
  businessType: string;
  buyerLocation: string;
  farmId: string;
  farmName: string;
  cropName: string;
  offeredPricePerKg: number;
  offeredPricePerQuintal: number;
  quantityKg: number;
  quantityTonnes: number;
  totalValueInr: number;
  status: "pending" | "accepted" | "rejected" | "completed";
  createdAt: string;
}

export interface InterestedBuyer {
  id: string;
  name: string;
  companyName: string;
  businessType: string;
  interestedCrops: string[];
  location: string;
}

export interface FarmerAnalyticsData {
  avgMoisture: number | null;
  minMoisture: number | null;
  maxMoisture: number | null;
  avgTemp: number | null;
  avgHumidity: number | null;
  rainEvents: number;
  totalWaterLiters: number;
  pumpRuntimeMinutes: number;
  irrigationCycles: number;
  moistureTrend: { label: string; moisture: number; target?: number }[];
  waterUsageTrend: { label: string; used: number; saved: number }[];
}

export interface FarmerIrrigationRecord {
  id: string;
  farmId: string;
  farmPlotId: string | null;
  deviceId: string | null;
  source: "manual" | "schedule" | "automation";
  startedAt: string;
  endedAt: string | null;
  durationMinutes: number;
  waterVolumeLiters: number;
  result: "success" | "skipped" | "aborted" | "failed";
  note: string | null;
  plotName?: string;
}

/**
 * Fetch all farm plots (crops) for the current farmer from Supabase farm_plots.
 */
export async function getFarmPlots(farmId?: string): Promise<FarmPlot[]> {
  const supabase = getSupabaseClient();
  if (!supabase) {
    return localPlotsState;
  }

  try {
    const { data: authData } = await supabase.auth.getUser();
    const userId = authData?.user?.id;
    if (!userId) return localPlotsState;

    let targetFarmId = farmId;
    if (!targetFarmId) {
      const { data: userFarms } = await supabase
        .from("farms")
        .select("id")
        .eq("owner_profile_id", userId)
        .limit(1);
      targetFarmId = userFarms?.[0]?.id;
    }

    if (!targetFarmId) return localPlotsState;

    const { data, error } = await supabase
      .from("farm_plots")
      .select(
        "id, name, area_acres, soil_type, irrigation_method, sowing_date, expected_harvest_date, health_score, crops(id, name)",
      )
      .eq("farm_id", targetFarmId);

    if (error || !data) return localPlotsState;

    const mapped: FarmPlot[] = data.map((row) => {
      const cropObj = Array.isArray(row.crops) ? row.crops[0] : row.crops;
      return {
        id: row.id,
        name: row.name,
        crop: cropObj?.name ?? "Crop",
        cropId: cropObj?.id,
        areaAcres: Number(row.area_acres) || 0,
        sowingDate: row.sowing_date ?? new Date().toISOString().split("T")[0]!,
        expectedHarvest: row.expected_harvest_date ?? new Date().toISOString().split("T")[0]!,
        soilType: row.soil_type ?? "Loam",
        irrigation: row.irrigation_method ?? "Drip",
        health: Number(row.health_score) || 85,
        farmId: targetFarmId,
      };
    });

    if (mapped.length > 0) {
      localPlotsState = mapped;
    }
    return localPlotsState;
  } catch (err) {
    console.error("Error fetching farm plots from Supabase:", err);
    return localPlotsState;
  }
}

/**
 * Add a new farm plot / crop for the farmer in Supabase.
 */
export async function addFarmPlot(payload: {
  name?: string;
  crop?: string;
  cropName?: string;
  areaAcres: number;
  soilType?: string;
  irrigation?: string;
  sowingDate?: string;
  sownDate?: string;
  expectedHarvest?: string;
  expectedHarvestDate?: string;
  health?: number;
  status?: string;
  farmId?: string;
}): Promise<FarmPlot> {
  const supabase = getSupabaseClient();
  const plotId = `plot_${Date.now()}`;
  const crop = payload.crop || payload.cropName || "Crop";
  const sowingDate = payload.sowingDate || payload.sownDate || new Date().toISOString().split("T")[0]!;
  const expectedHarvest = payload.expectedHarvest || payload.expectedHarvestDate || new Date(Date.now() + 90 * 86400000).toISOString().split("T")[0]!;
  const newPlot: FarmPlot = {
    id: plotId,
    name: payload.name || `${crop} Field`,
    crop: crop,
    areaAcres: payload.areaAcres,
    soilType: payload.soilType || "Clay Loam",
    irrigation: payload.irrigation || "Drip Irrigation",
    sowingDate: sowingDate,
    sownDate: sowingDate,
    expectedHarvest: expectedHarvest,
    expectedHarvestDate: expectedHarvest,
    health: payload.health ?? 90,
  };

  if (!supabase) {
    localPlotsState = [newPlot, ...localPlotsState];
    return newPlot;
  }

  try {
    const { data: authData } = await supabase.auth.getUser();
    const userId = authData?.user?.id;
    if (!userId) {
      localPlotsState = [newPlot, ...localPlotsState];
      return newPlot;
    }

    let targetFarmId = payload.farmId;
    if (!targetFarmId) {
      const { data: userFarms } = await supabase
        .from("farms")
        .select("id")
        .eq("owner_profile_id", userId)
        .limit(1);
      targetFarmId = userFarms?.[0]?.id;
    }

    // Ensure target farm exists
    if (!targetFarmId) {
      const { data: newFarm, error: farmErr } = await supabase
        .from("farms")
        .insert({
          owner_profile_id: userId,
          name: "My Farm",
          district: "Krishnagiri",
          state: "Tamil Nadu",
          total_acres: payload.areaAcres,
        })
        .select("id")
        .single();
      if (!farmErr && newFarm) {
        targetFarmId = newFarm.id;
      }
    }

    // Lookup or insert crop into crops table
    const cropNameStr = payload.crop || payload.cropName || "Crop";
    let cropId: string | null = null;
    const { data: existingCrops } = await supabase
      .from("crops")
      .select("id")
      .ilike("name", cropNameStr)
      .limit(1);

    if (existingCrops && existingCrops.length > 0) {
      cropId = existingCrops[0]!.id;
    } else {
      const { data: createdCrop } = await supabase
        .from("crops")
        .insert({ name: cropNameStr, category: "Agriculture" })
        .select("id")
        .single();
      if (createdCrop) cropId = createdCrop.id;
    }

    if (targetFarmId && cropId) {
      const { data: createdPlot, error: plotErr } = await supabase
        .from("farm_plots")
        .insert({
          farm_id: targetFarmId,
          crop_id: cropId,
          name: newPlot.name,
          area_acres: payload.areaAcres,
          soil_type: newPlot.soilType,
          irrigation_method: newPlot.irrigation,
          sowing_date: newPlot.sowingDate,
          expected_harvest_date: newPlot.expectedHarvest,
          health_score: 90,
        })
        .select("id")
        .single();

      if (!plotErr && createdPlot) {
        newPlot.id = createdPlot.id;
        newPlot.cropId = cropId;
        newPlot.farmId = targetFarmId;
      }
    }
  } catch (err) {
    console.error("Error creating farm plot in Supabase:", err);
  }

  localPlotsState = [newPlot, ...localPlotsState.filter((p) => p.id !== newPlot.id)];
  return newPlot;
}

/**
 * Update an existing crop / farm plot in Supabase.
 */
export async function updateFarmPlot(
  plotId: string,
  payload: Partial<{
    name: string;
    crop: string;
    cropName: string;
    areaAcres: number;
    soilType: string;
    irrigation: string;
    sowingDate: string;
    sownDate: string;
    expectedHarvest: string;
    expectedHarvestDate: string;
  }>,
): Promise<FarmPlot | null> {
  const supabase = getSupabaseClient();
  const existingIndex = localPlotsState.findIndex((p) => p.id === plotId);
  const current = existingIndex !== -1 ? localPlotsState[existingIndex]! : null;

  if (!current) return null;

  const sowing = payload.sowingDate ?? payload.sownDate ?? current.sowingDate;
  const harvest = payload.expectedHarvest ?? payload.expectedHarvestDate ?? current.expectedHarvest;

  const updated: FarmPlot = {
    ...current,
    name: payload.name ?? current.name,
    crop: payload.crop ?? payload.cropName ?? current.crop,
    areaAcres: payload.areaAcres ?? current.areaAcres,
    soilType: payload.soilType ?? current.soilType,
    irrigation: payload.irrigation ?? current.irrigation,
    sowingDate: sowing,
    sownDate: sowing,
    expectedHarvest: harvest,
    expectedHarvestDate: harvest,
  };

  if (supabase && !plotId.startsWith("plot_")) {
    try {
      let cropId: string | undefined;
      if (payload.cropName) {
        const { data: existingCrops } = await supabase
          .from("crops")
          .select("id")
          .ilike("name", payload.cropName)
          .limit(1);

        if (existingCrops && existingCrops.length > 0) {
          cropId = existingCrops[0]!.id;
        } else {
          const { data: createdCrop } = await supabase
            .from("crops")
            .insert({ name: payload.cropName, category: "Agriculture" })
            .select("id")
            .single();
          if (createdCrop) cropId = createdCrop.id;
        }
      }

      await supabase
        .from("farm_plots")
        .update({
          ...(payload.name ? { name: payload.name } : {}),
          ...(payload.areaAcres ? { area_acres: payload.areaAcres } : {}),
          ...(payload.soilType ? { soil_type: payload.soilType } : {}),
          ...(payload.irrigation ? { irrigation_method: payload.irrigation } : {}),
          ...(payload.sowingDate ? { sowing_date: payload.sowingDate } : {}),
          ...(payload.expectedHarvest ? { expected_harvest_date: payload.expectedHarvest } : {}),
          ...(cropId ? { crop_id: cropId } : {}),
        })
        .eq("id", plotId);
    } catch (err) {
      console.error("Error updating farm plot in Supabase:", err);
    }
  }

  localPlotsState[existingIndex] = updated;
  return updated;
}

/**
 * Delete a crop / farm plot from Supabase.
 */
export async function deleteFarmPlot(plotId: string): Promise<boolean> {
  const supabase = getSupabaseClient();
  localPlotsState = localPlotsState.filter((p) => p.id !== plotId);

  if (supabase && !plotId.startsWith("plot_")) {
    try {
      await supabase.from("farm_plots").delete().eq("id", plotId);
    } catch (err) {
      console.error("Error deleting farm plot from Supabase:", err);
    }
  }
  return true;
}

/**
 * Fetch real purchase offers made by verified buyers for the authenticated Farmer's farms.
 */
export async function getFarmerBuyerOffers(): Promise<FarmerBuyerOffer[]> {
  const supabase = getSupabaseClient();
  if (!supabase) return [];

  try {
    const { data: authData } = await supabase.auth.getUser();
    const userId = authData?.user?.id;
    if (!userId) return [];

    const { data: userFarms } = await supabase
      .from("farms")
      .select("id, name")
      .eq("owner_profile_id", userId);

    const farmList = userFarms ?? [];
    if (farmList.length === 0) return [];

    const farmIds = farmList.map((f) => f.id);
    const farmNameMap = new Map(farmList.map((f) => [f.id, f.name]));

    const { data: offersData, error } = await supabase
      .from("purchase_offers")
      .select(`
        id,
        buyer_id,
        farm_id,
        offered_price_per_kg,
        quantity_kg,
        status,
        created_at,
        farms (
          name,
          crops (name)
        )
      `)
      .in("farm_id", farmIds)
      .order("created_at", { ascending: false });

    if (error || !offersData) {
      console.error("Error fetching farmer buyer offers:", error);
      return [];
    }

    const buyerIds = [...new Set(offersData.map((o: any) => o.buyer_id).filter(Boolean))];
    const profileMap = new Map<string, any>();

    if (buyerIds.length > 0) {
      const { data: profilesData } = await supabase
        .from("profiles")
        .select("id, full_name, company_name, business_type, village, district, state")
        .in("id", buyerIds);

      if (profilesData) {
        profilesData.forEach((p) => profileMap.set(p.id, p));
      }
    }

    return offersData.map((row: unknown) => {
      const r = row as Record<string, any>;
      const buyerProf = profileMap.get(r.buyer_id);
      const farmObj = Array.isArray(r.farms) ? r.farms[0] : r.farms;
      const cropObj = farmObj?.crops ? (Array.isArray(farmObj.crops) ? farmObj.crops[0] : farmObj.crops) : null;

      const buyerLocation = [buyerProf?.village, buyerProf?.district, buyerProf?.state]
        .filter(Boolean)
        .join(", ") || "India";

      const pricePerKg = Number(r.offered_price_per_kg) || 0;
      const qtyKg = Number(r.quantity_kg) || 0;

      return {
        id: r.id,
        buyerId: r.buyer_id,
        buyerName: buyerProf?.full_name || "Verified Buyer",
        companyName: buyerProf?.company_name || buyerProf?.full_name || "Agri Procurement Ltd",
        businessType: buyerProf?.business_type || "Wholesaler",
        buyerLocation,
        farmId: r.farm_id,
        farmName: farmObj?.name || farmNameMap.get(r.farm_id) || "My Farm",
        cropName: cropObj?.name || "Harvest Crop",
        offeredPricePerKg: pricePerKg,
        offeredPricePerQuintal: pricePerKg * 100,
        quantityKg: qtyKg,
        quantityTonnes: Number((qtyKg / 1000).toFixed(2)),
        totalValueInr: Math.round(pricePerKg * qtyKg),
        status: r.status,
        createdAt: r.created_at,
      };
    });
  } catch (err) {
    console.error("Unexpected error fetching buyer offers for farmer:", err);
    return [];
  }
}

/**
 * Send a direct crop harvest offer from the farmer to a specific buyer.
 */
export async function sendFarmerOfferToBuyer(payload: {
  buyerId: string;
  farmId: string;
  offeredPricePerKg: number;
  quantityKg: number;
}): Promise<boolean> {
  const supabase = getSupabaseClient();
  if (!supabase) return false;

  try {
    let token: string | undefined;
    const sessionRes = await supabase.auth.getSession();
    token = sessionRes.data.session?.access_token;

    const res = await fetch("/api/offers/create", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({
        farm_id: payload.farmId,
        offered_price_per_kg: payload.offeredPricePerKg,
        quantity_kg: payload.quantityKg,
        buyer_id: payload.buyerId,
      }),
    });

    const json = await res.json();
    return Boolean(res.ok && json.success);
  } catch (err) {
    console.error("Error sending farmer offer to buyer:", err);
    return false;
  }
}

/**
 * Update a purchase offer status (e.g. accept or reject) by the farmer.
 */
export async function updateOfferStatus(
  offerId: string,
  newStatus: "accepted" | "rejected",
): Promise<boolean> {
  const supabase = getSupabaseClient();
  if (!supabase) return false;

  try {
    const { error } = await supabase
      .from("purchase_offers")
      .update({ status: newStatus })
      .eq("id", offerId);

    if (error) {
      console.error("Error updating offer status in Supabase:", error);
      return false;
    }
    return true;
  } catch (err) {
    console.error("Unexpected error updating offer status:", err);
    return false;
  }
}

/**
 * Fetch verified registered buyers in the system.
 */
export async function getInterestedBuyers(): Promise<InterestedBuyer[]> {
  const supabase = getSupabaseClient();
  if (!supabase) return [];

  try {
    const { data, error } = await supabase
      .from("profiles")
      .select("id, full_name, company_name, business_type, interested_crops, village, district, state")
      .eq("role", "buyer")
      .limit(30);

    if (error || !data) return [];

    return data.map((b) => ({
      id: b.id,
      name: b.full_name || "Buyer",
      companyName: b.company_name || b.full_name || "Agri Procurement Enterprise",
      businessType: b.business_type || "Retailer",
      interestedCrops: Array.isArray(b.interested_crops) ? b.interested_crops : [],
      location: [b.village, b.district, b.state].filter(Boolean).join(", ") || "India",
    }));
  } catch (err) {
    console.error("Error fetching buyers list:", err);
    return [];
  }
}

/**
 * Fetch real historical analytics calculated from actual stored sensor readings and irrigation records.
 */
export async function getFarmerAnalytics(
  timeRange: "today" | "7d" | "30d" | "all" = "7d",
): Promise<FarmerAnalyticsData> {
  const supabase = getSupabaseClient();
  const emptyResult: FarmerAnalyticsData = {
    avgMoisture: null,
    minMoisture: null,
    maxMoisture: null,
    avgTemp: null,
    avgHumidity: null,
    rainEvents: 0,
    totalWaterLiters: 0,
    pumpRuntimeMinutes: 0,
    irrigationCycles: 0,
    moistureTrend: [],
    waterUsageTrend: [],
  };

  if (!supabase) return emptyResult;

  try {
    const { data: authData } = await supabase.auth.getUser();
    const userId = authData?.user?.id;
    if (!userId) return emptyResult;

    // Get farmer farms and devices
    const { data: userFarms } = await supabase
      .from("farms")
      .select("id")
      .eq("owner_profile_id", userId);

    const farmIds = (userFarms ?? []).map((f) => f.id);
    if (farmIds.length === 0) return emptyResult;

    const { data: devices } = await supabase
      .from("devices")
      .select("id")
      .in("farm_id", farmIds);

    const deviceIds = (devices ?? []).map((d) => d.id);

    // Calculate cutoff date based on timeRange
    let cutoffIso: string | null = null;
    const now = Date.now();
    if (timeRange === "today") {
      cutoffIso = new Date(now - 24 * 3600 * 1000).toISOString();
    } else if (timeRange === "7d") {
      cutoffIso = new Date(now - 7 * 24 * 3600 * 1000).toISOString();
    } else if (timeRange === "30d") {
      cutoffIso = new Date(now - 30 * 24 * 3600 * 1000).toISOString();
    }

    let sensorQuery = supabase
      .from("sensor_readings")
      .select("id, recorded_at, temperature_c, humidity_pct, soil_moisture_pct, rain_detected")
      .order("recorded_at", { ascending: true })
      .limit(500);

    if (deviceIds.length > 0) {
      sensorQuery = sensorQuery.in("device_id", deviceIds);
    }
    if (cutoffIso) {
      sensorQuery = sensorQuery.gte("recorded_at", cutoffIso);
    }

    let irrigationQuery = supabase
      .from("irrigation_records")
      .select("id, started_at, duration_minutes, water_volume_liters, result")
      .in("farm_id", farmIds)
      .order("started_at", { ascending: true })
      .limit(200);

    if (cutoffIso) {
      irrigationQuery = irrigationQuery.gte("started_at", cutoffIso);
    }

    const [sensorRes, irrigRes] = await Promise.all([sensorQuery, irrigationQuery]);

    const sensorRows = sensorRes.data ?? [];
    const irrigRows = irrigRes.data ?? [];

    // Calculate moisture & temperature metrics
    const moistures = sensorRows
      .map((r) => Number(r.soil_moisture_pct))
      .filter((v) => !isNaN(v) && v > 0);

    const temps = sensorRows
      .map((r) => Number(r.temperature_c))
      .filter((v) => !isNaN(v) && v > 0);

    const humids = sensorRows
      .map((r) => Number(r.humidity_pct))
      .filter((v) => !isNaN(v) && v > 0);

    const avgMoisture =
      moistures.length > 0
        ? Math.round(moistures.reduce((a, b) => a + b, 0) / moistures.length)
        : null;

    const minMoisture = moistures.length > 0 ? Math.min(...moistures) : null;
    const maxMoisture = moistures.length > 0 ? Math.max(...moistures) : null;

    const avgTemp =
      temps.length > 0
        ? Number((temps.reduce((a, b) => a + b, 0) / temps.length).toFixed(1))
        : null;

    const avgHumidity =
      humids.length > 0
        ? Math.round(humids.reduce((a, b) => a + b, 0) / humids.length)
        : null;

    const rainEvents = sensorRows.filter((r) => r.rain_detected === true).length;

    // Calculate irrigation metrics
    const totalWaterLiters = irrigRows.reduce(
      (sum, r) => sum + (Number(r.water_volume_liters) || 0),
      0,
    );

    const pumpRuntimeMinutes = irrigRows.reduce(
      (sum, r) => sum + (Number(r.duration_minutes) || 0),
      0,
    );

    const irrigationCycles = irrigRows.length;

    // Group moisture readings by day/label
    const moistureTrend = sensorRows
      .filter((r) => r.soil_moisture_pct != null)
      .map((r) => {
        const d = new Date(r.recorded_at);
        const label = !isNaN(d.getTime())
          ? d.toLocaleDateString([], { month: "short", day: "numeric", hour: "2-digit" })
          : "N/A";
        return {
          label,
          moisture: Number(r.soil_moisture_pct),
          target: 40,
        };
      });

    // Group water usage by day
    const usageByDay: Record<string, number> = {};
    irrigRows.forEach((r) => {
      const d = new Date(r.started_at);
      const dayKey = !isNaN(d.getTime()) ? d.toLocaleDateString([], { weekday: "short" }) : "Day";
      usageByDay[dayKey] = (usageByDay[dayKey] || 0) + (Number(r.water_volume_liters) || 0);
    });

    const waterUsageTrend = Object.entries(usageByDay).map(([label, used]) => ({
      label,
      used,
      saved: Math.round(used * 0.25),
    }));

    return {
      avgMoisture,
      minMoisture,
      maxMoisture,
      avgTemp,
      avgHumidity,
      rainEvents,
      totalWaterLiters: Math.round(totalWaterLiters),
      pumpRuntimeMinutes,
      irrigationCycles,
      moistureTrend,
      waterUsageTrend,
    };
  } catch (err) {
    console.error("Error calculating farmer analytics:", err);
    return emptyResult;
  }
}

/**
 * Fetch real irrigation records for the farmer's plots.
 */
export async function getFarmerIrrigationHistory(): Promise<FarmerIrrigationRecord[]> {
  const supabase = getSupabaseClient();
  if (!supabase) return [];

  try {
    const { data: authData } = await supabase.auth.getUser();
    const userId = authData?.user?.id;
    if (!userId) return [];

    const { data: userFarms } = await supabase
      .from("farms")
      .select("id")
      .eq("owner_profile_id", userId);

    const farmIds = (userFarms ?? []).map((f) => f.id);
    if (farmIds.length === 0) return [];

    const { data, error } = await supabase
      .from("irrigation_records")
      .select("id, farm_id, farm_plot_id, device_id, source, started_at, ended_at, duration_minutes, water_volume_liters, result, note")
      .in("farm_id", farmIds)
      .order("started_at", { ascending: false })
      .limit(50);

    if (error || !data) return [];

    return data.map((r) => ({
      id: r.id,
      farmId: r.farm_id,
      farmPlotId: r.farm_plot_id,
      deviceId: r.device_id,
      source: r.source || "manual",
      startedAt: r.started_at,
      endedAt: r.ended_at,
      durationMinutes: Number(r.duration_minutes) || 0,
      waterVolumeLiters: Number(r.water_volume_liters) || 0,
      result: r.result || "success",
      note: r.note,
      plotName: r.farm_plot_id ? `Plot ${r.farm_plot_id.slice(0, 8)}` : "Field A",
    }));
  } catch (err) {
    console.error("Error fetching irrigation history:", err);
    return [];
  }
}

/**
 * Fetch actual device events / alerts for the authenticated farmer.
 */
export async function getFarmerAlerts(): Promise<Alert[]> {
  const supabase = getSupabaseClient();
  if (!supabase) return [];

  try {
    const { data: authData } = await supabase.auth.getUser();
    const userId = authData?.user?.id;
    if (!userId) return [];

    const { data: userFarms } = await supabase
      .from("farms")
      .select("id")
      .eq("owner_profile_id", userId);

    const farmIds = (userFarms ?? []).map((f) => f.id);
    if (farmIds.length === 0) return [];

    const { data: devices } = await supabase
      .from("devices")
      .select("id")
      .in("farm_id", farmIds);

    const deviceIds = (devices ?? []).map((d) => d.id);
    if (deviceIds.length === 0) return [];

    const { data: events, error } = await supabase
      .from("device_events")
      .select("id, device_id, title, description, severity, created_at, read_at")
      .in("device_id", deviceIds)
      .order("created_at", { ascending: false })
      .limit(50);

    if (error || !events) return [];

    return events.map((e) => ({
      id: e.id,
      title: e.title,
      description: e.description,
      severity: e.severity || "info",
      createdAt: e.created_at,
      source: e.device_id ? `Device ${e.device_id.slice(0, 8)}` : "Field Controller",
      read: Boolean(e.read_at),
    }));
  } catch (err) {
    console.error("Error fetching farmer alerts:", err);
    return [];
  }
}
