import { getSupabaseClient } from "@/lib/supabase";
import type { HarvestForecast, PurchaseOffer, Contract } from "@/types";

export interface ForecastFilters {
  crop?: string;
  district?: string;
  month?: string;
  quality?: string;
}

export interface SendOfferPayload {
  farm_id: string;
  offered_price_per_kg: number;
  quantity_kg: number;
  buyer_id?: string;
}

/**
 * Send a purchase offer to Supabase purchase_offers table.
 */
export async function sendOffer(payload: SendOfferPayload): Promise<PurchaseOffer> {
  const supabase = getSupabaseClient();
  let token: string | undefined;

  if (supabase) {
    const sessionRes = await supabase.auth.getSession();
    token = sessionRes.data.session?.access_token;
  }

  const res = await fetch("/api/offers/create", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({
      farm_id: payload.farm_id,
      offered_price_per_kg: payload.offered_price_per_kg,
      quantity_kg: payload.quantity_kg,
      buyer_id: payload.buyer_id,
    }),
  });

  const json = await res.json();
  if (!res.ok || !json.success) {
    throw new Error(json.error || "Failed to create purchase offer");
  }

  return json.data;
}

/**
 * Fetch all purchase offers for the logged-in buyer from Supabase.
 */
export async function getBuyerOffers(buyerId?: string): Promise<PurchaseOffer[]> {
  const supabase = getSupabaseClient();
  if (!supabase) return [];

  let targetBuyerId = buyerId;
  if (!targetBuyerId) {
    const { data: authData } = await supabase.auth.getUser();
    targetBuyerId = authData?.user?.id;
  }

  if (!targetBuyerId) return [];

  try {
    const { data, error } = await supabase
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
          id,
          name,
          village,
          district,
          state,
          crops (name)
        )
      `)
      .eq("buyer_id", targetBuyerId)
      .order("created_at", { ascending: false });

    if (error || !data) {
      console.error("Error fetching buyer offers:", error);
      return [];
    }

    return data.map((row: unknown) => {
      const r = row as Record<string, any>;
      const farmObj = Array.isArray(r.farms) ? r.farms[0] : r.farms;
      const cropObj = farmObj?.crops ? (Array.isArray(farmObj.crops) ? farmObj.crops[0] : farmObj.crops) : null;
      const pricePerKg = Number(r.offered_price_per_kg) || 0;
      const qtyKg = Number(r.quantity_kg) || 0;

      return {
        id: r.id,
        buyerId: r.buyer_id,
        farmId: r.farm_id,
        farm: farmObj?.name || "Farm",
        crop: cropObj?.name || "Crop",
        quantityKg: qtyKg,
        quantityTonnes: Number((qtyKg / 1000).toFixed(2)),
        offeredPricePerKg: pricePerKg,
        offeredPricePerQuintal: pricePerKg * 100,
        status: r.status || "pending",
        createdAt: r.created_at || new Date().toISOString(),
        requestedOn: r.created_at || new Date().toISOString(),
      };

    });
  } catch (err) {
    console.error("Error loading buyer offers:", err);
    return [];
  }
}

/**
 * Fetch real contracts (accepted and completed purchase offers) for the buyer.
 */
export async function getContracts(buyerId?: string): Promise<Contract[]> {
  const offers = await getBuyerOffers(buyerId);
  const acceptedOffers = offers.filter(
    (o) => o.status === "accepted" || o.status === "completed",
  );

  return acceptedOffers.map((o) => {
    const startDate = o.requestedOn;
    const dateObj = new Date(startDate);
    dateObj.setDate(dateObj.getDate() + 45);
    const endDate = dateObj.toISOString().slice(0, 10);

    return {
      id: o.id,
      farm: o.farm,
      crop: o.crop,
      volumeTonnes: o.quantityTonnes,
      valueInr: Math.round(o.offeredPricePerKg * o.quantityKg),
      startDate: o.requestedOn.slice(0, 10),
      endDate,
      status: o.status === "completed" ? "completed" : "active",
    };
  });
}

/**
 * Calculate dynamic buyer KPIs from real Supabase records.
 */
export async function getBuyerKpis(buyerId?: string) {
  const supabase = getSupabaseClient();
  const offers = await getBuyerOffers(buyerId);

  let highQualityFarmsCount = 0;
  if (supabase) {
    try {
      const { count } = await supabase
        .from("farms")
        .select("id", { count: "exact", head: true });
      highQualityFarmsCount = count || 0;
    } catch {
      // ignore
    }
  }

  const totalOffers = offers.length;
  const pendingOffers = offers.filter((o) => o.status === "pending").length;
  const acceptedOffers = offers.filter((o) => o.status === "accepted").length;
  const completedPurchases = offers.filter((o) => o.status === "completed").length;
  const totalSpending = offers
    .filter((o) => o.status === "completed" || o.status === "accepted")
    .reduce((sum, o) => sum + o.offeredPricePerKg * o.quantityKg, 0);

  const totalTonnes = offers.reduce((sum, o) => sum + o.quantityTonnes, 0);

  return {
    totalOffers,
    pendingOffers,
    acceptedOffers,
    completedPurchases,
    totalSpending,
    expectedHarvestTonnes: Number(totalTonnes.toFixed(1)),
    highQualityFarms: highQualityFarmsCount,
    upcomingHarvests: pendingOffers + acceptedOffers,
    riskLevel: pendingOffers > 5 ? "Medium" : "Low",
    riskScore: Math.min(100, pendingOffers * 5 + 10),
  };
}

export interface BuyerChartData {
  cropAvailability: { label: string; tonnes: number }[];
  regionProduction: { label: string; tonnes: number }[];
  supplyForecast: { label: string; forecast: number; committed: number }[];
  demandTrend: { label: string; demand: number; fulfilled: number }[];
}

/**
 * Calculate real aggregated chart data for buyer analytics and overview.
 */
export async function getBuyerCharts(): Promise<BuyerChartData> {
  const supabase = getSupabaseClient();
  if (!supabase) {
    return {
      cropAvailability: [],
      regionProduction: [],
      supplyForecast: [],
      demandTrend: [],
    };
  }

  try {
    const [farmsRes, plotsRes, offersRes] = await Promise.all([
      supabase.from("farms").select("id, district, state, total_acres"),
      supabase.from("farm_plots").select("id, crop_id, area_acres, expected_harvest_date, crops(name)"),
      supabase.from("purchase_offers").select("id, quantity_kg, status, created_at"),
    ]);

    // 1. Crop Availability from real farm plots
    const cropTotals = new Map<string, number>();
    (plotsRes.data ?? []).forEach((p: any) => {
      const cropName = Array.isArray(p.crops) ? p.crops[0]?.name : p.crops?.name || "Other";
      const acreage = Number(p.area_acres) || 1;
      const tonnes = Number((acreage * 3.5).toFixed(1));
      cropTotals.set(cropName, (cropTotals.get(cropName) || 0) + tonnes);
    });

    const cropAvailability = Array.from(cropTotals.entries()).map(([label, tonnes]) => ({
      label,
      tonnes,
    }));

    // 2. Region production from real farms
    const regionTotals = new Map<string, number>();
    (farmsRes.data ?? []).forEach((f: any) => {
      const region = f.district || f.state || "Tamil Nadu";
      const acres = Number(f.total_acres) || 2;
      const tonnes = Number((acres * 3.5).toFixed(1));
      regionTotals.set(region, (regionTotals.get(region) || 0) + tonnes);
    });

    const regionProduction = Array.from(regionTotals.entries()).map(([label, tonnes]) => ({
      label,
      tonnes,
    }));

    // 3. Supply forecast by harvest month
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const monthSupply = new Map<string, { forecast: number; committed: number }>();
    months.forEach((m) => monthSupply.set(m, { forecast: 0, committed: 0 }));

    (plotsRes.data ?? []).forEach((p: any) => {
      if (p.expected_harvest_date) {
        const d = new Date(p.expected_harvest_date);
        if (!isNaN(d.getTime())) {
          const mName = months[d.getMonth()]!;
          const tonnes = Number((Number(p.area_acres || 1) * 3.5).toFixed(1));
          const current = monthSupply.get(mName) || { forecast: 0, committed: 0 };
          current.forecast += tonnes;
          monthSupply.set(mName, current);
        }
      }
    });

    (offersRes.data ?? []).forEach((o: any) => {
      if (o.status === "accepted" || o.status === "completed") {
        const d = new Date(o.created_at);
        if (!isNaN(d.getTime())) {
          const mName = months[d.getMonth()]!;
          const tonnes = Number(((Number(o.quantity_kg) || 0) / 1000).toFixed(1));
          const current = monthSupply.get(mName) || { forecast: 0, committed: 0 };
          current.committed += tonnes;
          monthSupply.set(mName, current);
        }
      }
    });

    const supplyForecast = months.map((m) => ({
      label: m,
      forecast: monthSupply.get(m)?.forecast || 0,
      committed: monthSupply.get(m)?.committed || 0,
    }));

    // 4. Demand trend
    const monthDemand = new Map<string, { demand: number; fulfilled: number }>();
    months.forEach((m) => monthDemand.set(m, { demand: 0, fulfilled: 0 }));

    (offersRes.data ?? []).forEach((o: any) => {
      const d = new Date(o.created_at);
      if (!isNaN(d.getTime())) {
        const mName = months[d.getMonth()]!;
        const tonnes = Number(((Number(o.quantity_kg) || 0) / 1000).toFixed(1));
        const current = monthDemand.get(mName) || { demand: 0, fulfilled: 0 };
        current.demand += tonnes;
        if (o.status === "accepted" || o.status === "completed") {
          current.fulfilled += tonnes;
        }
        monthDemand.set(mName, current);
      }
    });

    const demandTrend = months.map((m) => ({
      label: m,
      demand: monthDemand.get(m)?.demand || 0,
      fulfilled: monthDemand.get(m)?.fulfilled || 0,
    }));

    return {
      cropAvailability,
      regionProduction,
      supplyForecast,
      demandTrend,
    };
  } catch (err) {
    console.error("Error computing buyer charts from Supabase:", err);
    return {
      cropAvailability: [],
      regionProduction: [],
      supplyForecast: [],
      demandTrend: [],
    };
  }
}

/**
 * Fetch marketplace farm forecasts from Supabase farms & farm_plots.
 * Returns empty array when no records exist.
 */
export async function getHarvestForecasts(filters: ForecastFilters = {}): Promise<HarvestForecast[]> {
  const supabase = getSupabaseClient();
  if (!supabase) return [];

  try {
    const { data, error } = await supabase
      .from("farms")
      .select(`
        id,
        name,
        village,
        district,
        state,
        total_acres,
        owner_profile_id,
        crops (id, name),
        farm_plots (
          id,
          name,
          area_acres,
          expected_harvest_date,
          health_score,
          crops (name)
        )
      `);

    if (error || !data || data.length === 0) {
      return [];
    }

    // Fetch farmer profile names by owner_profile_id
    const ownerIds = [...new Set(data.map((f: any) => f.owner_profile_id).filter(Boolean))];
    const farmerNameMap = new Map<string, string>();
    if (ownerIds.length > 0) {
      const { data: profs } = await supabase
        .from("profiles")
        .select("id, full_name")
        .in("id", ownerIds);
      (profs ?? []).forEach((p) => farmerNameMap.set(p.id, p.full_name));
    }

    const liveForecasts: HarvestForecast[] = data.flatMap((farmRow: unknown) => {
      const farm = farmRow as Record<string, any>;
      const farmPlots = Array.isArray(farm.farm_plots) ? farm.farm_plots : [];
      const plots = farmPlots.length > 0 ? farmPlots : [null];
      const ownerName = farmerNameMap.get(farm.owner_profile_id) || "Local Farmer";
      const farmCrop = Array.isArray(farm.crops) ? farm.crops[0]?.name : farm.crops?.name;

      return plots.map((plotItem: unknown, idx: number) => {
        const plot = plotItem as Record<string, any> | null;
        const cropName = plot?.crops
          ? (Array.isArray(plot.crops) ? plot.crops[0]?.name : plot.crops?.name)
          : (farmCrop || "Harvest Crop");
        const harvestDate = plot?.expected_harvest_date || new Date().toISOString().slice(0, 10);
        const dateObj = new Date(harvestDate);
        const harvestMonth = isNaN(dateObj.getTime())
          ? "October"
          : dateObj.toLocaleString("en-US", { month: "long" });
        const acreage = Number(plot?.area_acres || farm.total_acres || 2);
        const predictedYieldTonnes = Number((acreage * 3.5).toFixed(1));

        return {
          id: plot?.id || `${farm.id}_${idx}`,
          farmId: farm.id,
          farm: farm.name || "Farm",
          farmerName: ownerName,
          location: farm.village || farm.district || "India",
          district: farm.district || "District",
          state: farm.state || "State",
          crop: cropName,
          harvestDate,
          harvestMonth,
          predictedYieldTonnes,
          qualityScore: Number(plot?.health_score || 85),
          availability: "available" as const,
          riskLevel: "low" as const,
          pricePerQuintal: 2500,
        };
      });
    });

    return liveForecasts.filter((row) => {
      if (filters.crop && filters.crop !== "All" && row.crop !== filters.crop) return false;
      if (filters.district && filters.district !== "All" && row.district !== filters.district)
        return false;
      if (filters.month && filters.month !== "All" && row.harvestMonth !== filters.month)
        return false;
      if (filters.quality && filters.quality !== "All") {
        const min = Number(filters.quality);
        if (row.qualityScore < min) return false;
      }
      return true;
    });
  } catch (err) {
    console.error("Error fetching live harvest forecasts from Supabase:", err);
    return [];
  }
}

export async function getProcurementRequests(buyerId?: string): Promise<PurchaseOffer[]> {
  return getBuyerOffers(buyerId);
}

export interface FarmPlotDetail {
  id: string;
  name: string | null;
  cropName: string | null;
  areaAcres: number | null;
  sowingDate: string | null;
  expectedHarvestDate: string | null;
  healthScore: number | null;
  soilType: string | null;
  irrigationMethod: string | null;
}

export interface FarmDetail {
  farmId: string;
  farmName: string | null;
  farmerName: string | null;
  village: string | null;
  district: string | null;
  state: string | null;
  totalAcres: number | null;
  latitude: number | null;
  longitude: number | null;
  primaryCropName: string | null;
  plots: FarmPlotDetail[];
}

/**
 * Fetch a single farm's complete detail for the Buyer read-only view.
 */
export async function getFarmDetail(farmId: string): Promise<FarmDetail | null> {
  const supabase = getSupabaseClient();
  if (!supabase || !farmId) return null;

  try {
    const { data: farm, error: farmError } = await supabase
      .from("farms")
      .select(
        `
        id,
        name,
        village,
        district,
        state,
        total_acres,
        latitude,
        longitude,
        owner_profile_id,
        crops (name),
        farm_plots (
          id,
          name,
          area_acres,
          sowing_date,
          expected_harvest_date,
          health_score,
          soil_type,
          irrigation_method,
          crops (name)
        )
      `,
      )
      .eq("id", farmId)
      .maybeSingle();

    if (farmError || !farm) {
      console.error("getFarmDetail: farm not found or error:", farmError);
      return null;
    }

    const f = farm as Record<string, any>;

    let farmerName: string | null = null;
    if (f.owner_profile_id) {
      const { data: prof } = await supabase
        .from("profiles")
        .select("full_name")
        .eq("id", f.owner_profile_id)
        .maybeSingle();
      farmerName = prof?.full_name ?? null;
    }

    const primaryCropObj = Array.isArray(f.crops) ? f.crops[0] : f.crops;
    const farmPlots: FarmPlotDetail[] = (
      Array.isArray(f.farm_plots) ? f.farm_plots : []
    ).map((p: Record<string, any>) => {
      const plotCrop = Array.isArray(p.crops) ? p.crops[0] : p.crops;
      return {
        id: p.id ?? null,
        name: p.name ?? null,
        cropName: plotCrop?.name ?? null,
        areaAcres: p.area_acres != null ? Number(p.area_acres) : null,
        sowingDate: p.sowing_date ?? null,
        expectedHarvestDate: p.expected_harvest_date ?? null,
        healthScore: p.health_score != null ? Number(p.health_score) : null,
        soilType: p.soil_type ?? null,
        irrigationMethod: p.irrigation_method ?? null,
      };
    });

    return {
      farmId: f.id,
      farmName: f.name ?? null,
      farmerName,
      village: f.village ?? null,
      district: f.district ?? null,
      state: f.state ?? null,
      totalAcres: f.total_acres != null ? Number(f.total_acres) : null,
      latitude: f.latitude != null ? Number(f.latitude) : null,
      longitude: f.longitude != null ? Number(f.longitude) : null,
      primaryCropName: primaryCropObj?.name ?? null,
      plots: farmPlots,
    };
  } catch (err) {
    console.error("getFarmDetail unexpected error:", err);
    return null;
  }
}
