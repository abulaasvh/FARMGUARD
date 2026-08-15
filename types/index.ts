/**
 * Shared domain types for FarmGuard.
 * These mirror the response shapes the future backend API should return,
 * so mock services can be swapped for real HTTP calls without UI changes.
 */

export type UserRole = "farmer" | "buyer";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  organisation?: string;
  location?: string;
  village?: string;
  district?: string;
  state?: string;
  latitude?: number;
  longitude?: number;
}

export interface SensorReading {
  id: string;
  label: string;
  value: number | string;
  unit: string;
  status: "optimal" | "warning" | "critical";
  trend: number;
  updatedAt: string;
}

export interface Device {
  id: string;
  name: string;
  type: "soil" | "weather" | "pump" | "tank" | "gateway";
  zone: string;
  online: boolean;
  battery: number;
  signal: number;
  firmware: string;
  lastSeen: string;
  health: number;
  lastSeenAt?: string | null;
  stale?: boolean;
  requestedPumpStatus?: "on" | "off" | null;
  requestedValveStatus?: "open" | "closed" | null;
  actualPumpStatus?: "on" | "off" | null;
  actualValveStatus?: "open" | "closed" | null;
  commandStatus?: "queued" | "sent" | "acknowledged" | "failed" | "cancelled" | null;
}

export interface WeatherDay {
  day: string;
  date: string;
  condition: "sunny" | "cloudy" | "rain" | "storm" | "partly";
  tempMax: number;
  tempMin: number;
  humidity: number;
  rainChance: number;
  wind: number;
  precipitationMm?: number;
  weatherCode?: number;
  conditionText?: string;
}

export interface Alert {
  id: string;
  title: string;
  description: string;
  severity: "info" | "warning" | "critical";
  createdAt: string;
  source: string;
  read: boolean;
}

export interface SeriesPoint {
  label: string;
  [key: string]: string | number;
}

export interface HarvestForecast {
  id: string;
  farmId?: string;
  farm: string;
  farmerName: string;
  location: string;
  district: string;
  state: string;
  crop: string;
  harvestDate: string;
  harvestMonth: string;
  predictedYieldTonnes: number;
  qualityScore: number;
  availability: "available" | "partial" | "committed";
  riskLevel: "low" | "medium" | "high";
  pricePerQuintal: number;
}

export interface PurchaseOffer {
  id: string;
  buyerId: string;
  farmId: string;
  farm: string;
  crop: string;
  quantityTonnes: number;
  quantityKg: number;
  offeredPricePerKg: number;
  offeredPricePerQuintal: number;
  status: "pending" | "accepted" | "rejected" | "completed";
  createdAt: string;
  requestedOn: string;
}

export interface ProcurementRequest {
  id: string;
  farm: string;
  crop: string;
  quantityTonnes: number;
  requestedOn: string;
  status: "draft" | "sent" | "accepted" | "declined" | "fulfilled";
  buyerContact: string;
}

export interface Contract {
  id: string;
  farm: string;
  crop: string;
  volumeTonnes: number;
  valueInr: number;
  startDate: string;
  endDate: string;
  status: "active" | "pending" | "completed";
}

export interface FarmPlot {
  id: string;
  name: string;
  crop: string;
  cropId?: string;
  areaAcres: number;
  sowingDate: string;
  sownDate?: string;
  expectedHarvest: string;
  expectedHarvestDate?: string;
  soilType: string;
  irrigation: string;
  health: number;
  farmId?: string;
}

export interface IrrigationSchedule {
  id: string;
  zone: string;
  startTime: string;
  durationMinutes: number;
  repeat: string;
  enabled: boolean;
  mode: "auto" | "manual";
}

export interface NotificationItem {
  id: string;
  title: string;
  time: string;
  type: "system" | "sensor" | "market" | "weather";
}
