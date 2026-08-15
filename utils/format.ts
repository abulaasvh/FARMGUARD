/** Small shared formatting + helper utilities. */

export const inr = (value: number | null | undefined) => {
  if (value == null || Number.isNaN(Number(value))) return "₹0";
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number(value));
};

export const num = (value: number | null | undefined, digits = 0) => {
  if (value == null || Number.isNaN(Number(value))) return "0";
  return new Intl.NumberFormat("en-IN", { maximumFractionDigits: digits }).format(Number(value));
};

export const shortDate = (iso: string | null | undefined, _t?: unknown) => {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return String(iso);
  return d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
};

/** Simulated network latency so loading skeletons behave like real API calls. */
export const delay = (ms = 320) => new Promise<void>((resolve) => setTimeout(resolve, ms));

export function formatRelativeTime(
  value: string | null | undefined,
  t: (key: string, params?: Record<string, string | number>) => string,
): string {
  if (!value) return t("common.just_now");
  const str = String(value).trim();
  if (str === "just now" || str === "now") return t("common.just_now");
  if (str === "No readings" || str === "No data available") return t("common.no_data");
  if (str === "No device" || str === "never") return t("dashboard.no_device");

  const minMatch = str.match(/^(\d+)\s*(?:min|mins|m)\s*(?:ago)?$/i);
  if (minMatch) return t("common.mins_ago", { mins: minMatch[1] });

  const hrMatch = str.match(/^(\d+)\s*(?:hr|hrs|h)\s*(?:ago)?$/i);
  if (hrMatch) return t("common.hours_ago", { hours: hrMatch[1] });

  const dayMatch = str.match(/^(\d+)\s*(?:day|days|d)\s*(?:ago)?$/i);
  if (dayMatch) return t("common.days_ago", { days: dayMatch[1] });

  const timeMs = new Date(str).getTime();
  if (Number.isNaN(timeMs)) return str;

  const diffMs = Date.now() - timeMs;
  if (diffMs <= 0) return t("common.just_now");

  const diffMins = Math.max(1, Math.round(diffMs / 60000));
  if (diffMins < 60) return t("common.mins_ago", { mins: diffMins });

  const diffHours = Math.round(diffMins / 60);
  if (diffHours < 24) return t("common.hours_ago", { hours: diffHours });

  const diffDays = Math.round(diffHours / 24);
  return t("common.days_ago", { days: diffDays });
}

export function getLocalizedCrop(
  crop: string | null | undefined,
  t: (key: string, params?: Record<string, string | number>) => string,
): string {
  if (!crop) return "";
  const key = `crop.${crop.toLowerCase().trim()}`;
  const translated = t(key);
  return translated !== key ? translated : crop;
}

export function getLocalizedSoil(
  soil: string | null | undefined,
  t: (key: string, params?: Record<string, string | number>) => string,
): string {
  if (!soil) return "";
  const key = `soil.${soil
    .toLowerCase()
    .trim()
    .replace(/[\s/]+/g, "_")}`;
  const translated = t(key);
  return translated !== key ? translated : soil;
}

export function getLocalizedIrrigation(
  irrigation: string | null | undefined,
  t: (key: string, params?: Record<string, string | number>) => string,
): string {
  if (!irrigation) return "";
  const key = `irrigation_type.${irrigation
    .toLowerCase()
    .trim()
    .replace(/[\s/]+/g, "_")}`;
  const translated = t(key);
  return translated !== key ? translated : irrigation;
}

export function getLocalizedStatus(
  status: string | null | undefined,
  t: (key: string, params?: Record<string, string | number>) => string,
): string {
  if (!status) return "";
  const key = `status.${status.toLowerCase().trim()}`;
  const translated = t(key);
  return translated !== key ? translated : status;
}
