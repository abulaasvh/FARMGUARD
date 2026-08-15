// src/constants.ts
/**
 * Centralized constants for the FarmGuard UI.
 * Adjust values as needed for your application.
 */

export const STORAGE_KEYS = {
  theme: "farmguard_theme",
  language: "farmguard_language",
  session: "farmguard_session",
};

export const CROPS = [
  "Wheat",
  "Rice",
  "Corn",
  "Barley",
  "Soybean",
];

export const INDIAN_STATES = [
  "Andhra Pradesh",
  "Karnataka",
  "Maharashtra",
  "Tamil Nadu",
  "Gujarat",
  // ... add more states as needed
];

export const BUSINESS_TYPES = [
  "Retailer",
  "Wholesaler",
  "Distributor",
  "Food Manufacturer",
  "Vegetable Processor",
  "Tomato Sauce Factory",
  "Juice & Beverage Maker",
  "Grain Miller",
  "Export House",
  "Restaurant / Hotel Chain",
  "Supermarket Chain",
  "Farmer Producer Organisation",
];

export interface CropConfig {
  minMoisture: number;
  maxMoisture: number;
  minTemp: number;
  maxTemp: number;
  minHumidity: number;
  maxHumidity: number;
  durationDays: number;
}

export const DEFAULT_CROP_CONFIG: CropConfig = {
  minMoisture: 40,
  maxMoisture: 70,
  minTemp: 20,
  maxTemp: 33,
  minHumidity: 40,
  maxHumidity: 80,
  durationDays: 110,
};

export const CROP_CONFIGS: Record<string, CropConfig> = {
  Tomato: {
    minMoisture: 50,
    maxMoisture: 75,
    minTemp: 18,
    maxTemp: 30,
    minHumidity: 50,
    maxHumidity: 70,
    durationDays: 100,
  },
  Paddy: {
    minMoisture: 60,
    maxMoisture: 85,
    minTemp: 22,
    maxTemp: 35,
    minHumidity: 60,
    maxHumidity: 85,
    durationDays: 130,
  },
  Rice: {
    minMoisture: 60,
    maxMoisture: 85,
    minTemp: 22,
    maxTemp: 35,
    minHumidity: 60,
    maxHumidity: 85,
    durationDays: 130,
  },
  Sugarcane: {
    minMoisture: 55,
    maxMoisture: 80,
    minTemp: 20,
    maxTemp: 38,
    minHumidity: 50,
    maxHumidity: 80,
    durationDays: 360,
  },
  Wheat: {
    minMoisture: 35,
    maxMoisture: 65,
    minTemp: 12,
    maxTemp: 25,
    minHumidity: 40,
    maxHumidity: 70,
    durationDays: 120,
  },
  Cotton: {
    minMoisture: 40,
    maxMoisture: 65,
    minTemp: 21,
    maxTemp: 35,
    minHumidity: 45,
    maxHumidity: 75,
    durationDays: 160,
  },
  Maize: {
    minMoisture: 45,
    maxMoisture: 70,
    minTemp: 18,
    maxTemp: 32,
    minHumidity: 45,
    maxHumidity: 75,
    durationDays: 105,
  },
  Corn: {
    minMoisture: 45,
    maxMoisture: 70,
    minTemp: 18,
    maxTemp: 32,
    minHumidity: 45,
    maxHumidity: 75,
    durationDays: 105,
  },
  Chilli: {
    minMoisture: 40,
    maxMoisture: 65,
    minTemp: 20,
    maxTemp: 32,
    minHumidity: 50,
    maxHumidity: 75,
    durationDays: 140,
  },
};

