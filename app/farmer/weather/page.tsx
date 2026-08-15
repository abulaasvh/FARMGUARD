"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { PageTitle } from "@/components/dashboard/dashboard-shell-next";
import { Button } from "@/components/ui/button";
import { useSession, saveSession } from "@/lib/session";
import { useI18n } from "@/lib/i18n";
import { fetchLiveWeather, type LiveWeatherResponse } from "@/services/weather";
import { getSupabaseClient } from "@/lib/supabase";
import {
  Cloud,
  CloudLightning,
  CloudRain,
  Sun,
  CloudSun,
  MapPin,
  RefreshCw,
  AlertTriangle,
  Loader2,
  ExternalLink,
} from "lucide-react";

export function WeatherIcon({
  condition,
  className = "h-6 w-6",
}: {
  condition: string;
  className?: string;
}) {
  switch (condition) {
    case "sunny":
      return <Sun className={`${className} text-amber-400`} />;
    case "partly":
      return <CloudSun className={`${className} text-amber-300`} />;
    case "cloudy":
      return <Cloud className={`${className} text-slate-300`} />;
    case "rain":
      return <CloudRain className={`${className} text-sky-400`} />;
    case "storm":
      return <CloudLightning className={`${className} text-indigo-400`} />;
    default:
      return <Sun className={`${className} text-amber-400`} />;
  }
}

function getLocalizedCondition(condition: string, t: (key: string) => string): string {
  const condLower = condition.toLowerCase();
  if (condLower.includes("sun") || condLower.includes("clear")) return t("weather.sunny");
  if (condLower.includes("partly")) return t("weather.partly");
  if (condLower.includes("cloud")) return t("weather.cloudy");
  if (condLower.includes("drizzle")) return t("weather.drizzle");
  if (condLower.includes("rain") || condLower.includes("shower")) return t("weather.rain");
  if (condLower.includes("storm") || condLower.includes("thunder")) return t("weather.storm");
  const fallback = t(`weather.${condLower}`);
  return fallback !== `weather.${condLower}` ? fallback : condition;
}

export default function PageFarmerWeather() {
  const user = useSession();
  const { t } = useI18n();
  const [weather, setWeather] = useState<LiveWeatherResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorState, setErrorState] = useState<"NO_LOCATION" | "FETCH_ERROR" | null>(null);
  const [locationName, setLocationName] = useState<string>("");

  const loadWeather = useCallback(async () => {
    setLoading(true);
    setErrorState(null);
    setWeather(null); // Clear stale weather data immediately to prevent flash from previous user

    let lat: number | undefined;
    let lon: number | undefined;
    let locLabel = "";

    const supabase = getSupabaseClient();
    let userId = user?.id;

    if (!userId && supabase) {
      try {
        const { data: authData } = await supabase.auth.getUser();
        userId = authData?.user?.id;
      } catch {
        // ignore
      }
    }

    if (userId && userId !== "demo" && !userId.startsWith("usr_mock")) {
      // Real authenticated Supabase farmer

      // Priority 1: Query Supabase farm record for current authenticated user ID
      if (supabase) {
        try {
          const { data: userFarms } = await supabase
            .from("farms")
            .select("village, district, state, latitude, longitude")
            .eq("owner_profile_id", userId)
            .limit(1);

          if (userFarms && userFarms.length > 0) {
            const farm = userFarms[0]!;
            if (
              farm.latitude != null &&
              farm.longitude != null &&
              !Number.isNaN(Number(farm.latitude)) &&
              !Number.isNaN(Number(farm.longitude))
            ) {
              lat = Number(farm.latitude);
              lon = Number(farm.longitude);
              locLabel = [farm.village, farm.district, farm.state].filter(Boolean).join(", ");
            }
          }
        } catch (err) {
          console.error("Error querying farm coordinates from Supabase:", err);
        }
      }

      // Priority 2: Check current user session object coordinates if matched
      if ((lat == null || lon == null) && user?.latitude != null && user?.longitude != null) {
        if (!Number.isNaN(user.latitude) && !Number.isNaN(user.longitude)) {
          lat = user.latitude;
          lon = user.longitude;
          locLabel = locLabel || user.organisation || user.location || user.village || "";
        }
      }

      // Priority 3: Check user-specific localStorage key: farmguard.weather.location.<userId>
      if (lat == null || lon == null || Number.isNaN(lat) || Number.isNaN(lon)) {
        const userLocKey = `farmguard.weather.location.${userId}`;
        try {
          const storedStr = localStorage.getItem(userLocKey);
          if (storedStr) {
            const stored = JSON.parse(storedStr) as {
              address?: string;
              latitude?: number;
              longitude?: number;
            };
            if (
              stored.latitude != null &&
              stored.longitude != null &&
              !Number.isNaN(Number(stored.latitude)) &&
              !Number.isNaN(Number(stored.longitude))
            ) {
              lat = Number(stored.latitude);
              lon = Number(stored.longitude);
              if (stored.address) locLabel = stored.address;
            }
          }
        } catch {
          // ignore parsing error
        }
      }
    } else if (userId === "demo") {
      // Demo fallback only
      const demoKey = "farmguard.weather.location.demo";
      try {
        const storedStr = localStorage.getItem(demoKey);
        if (storedStr) {
          const stored = JSON.parse(storedStr) as {
            address?: string;
            latitude?: number;
            longitude?: number;
          };
          if (stored.latitude != null && stored.longitude != null) {
            lat = Number(stored.latitude);
            lon = Number(stored.longitude);
            if (stored.address) locLabel = stored.address;
          }
        }
      } catch {
        // ignore
      }
    }

    if (lat == null || lon == null || Number.isNaN(lat) || Number.isNaN(lon)) {
      setErrorState("NO_LOCATION");
      setLoading(false);
      return;
    }

    const finalLabel = locLabel || `${lat.toFixed(2)}, ${lon.toFixed(2)}`;
    setLocationName(finalLabel);

    try {
      const liveData = await fetchLiveWeather(lat, lon);
      setWeather(liveData);
      if (!locLabel && liveData.timezone) {
        setLocationName(liveData.timezone);
      }
    } catch (err) {
      console.error("Weather fetch error:", err);
      setErrorState("FETCH_ERROR");
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    void loadWeather();
  }, [loadWeather]);

  return (
    <div className="space-y-6">
      {/* Header bar with location indicator */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <PageTitle
          title={t("weather.title")}
          subtitle={
            locationName
              ? t("weather.forecast_for", { location: locationName })
              : t("weather.subtitle")
          }
        />
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => void loadWeather()} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-1.5 ${loading ? "animate-spin" : ""}`} />
            {t("common.refresh")}
          </Button>

          {/* Location is managed from Profile/Settings ONLY */}
          <Button variant="secondary" size="sm" asChild>
            <Link href="/farmer/settings">
              <MapPin className="h-4 w-4 mr-1.5 text-primary" />
              {t("settings.edit_profile")}
            </Link>
          </Button>
        </div>
      </div>

      {/* Loading state */}
      {loading && (
        <div className="surface-card p-12 text-center my-8 flex flex-col items-center justify-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm font-medium text-muted-foreground">{t("weather.loading")}</p>
        </div>
      )}

      {/* Error State: Location Not Configured */}
      {!loading && errorState === "NO_LOCATION" && (
        <div className="surface-card p-8 text-center my-6 max-w-xl mx-auto rounded-xl border border-amber-500/30">
          <AlertTriangle className="mx-auto h-12 w-12 text-amber-400 mb-3" />
          <h2 className="text-lg font-bold text-foreground">{t("weather.not_configured")}</h2>
          <p className="text-sm text-muted-foreground mt-2">
            {t("weather.configure_prompt")}
          </p>
          <Button className="mt-5" asChild>
            <Link href="/farmer/settings">
              <MapPin className="h-4 w-4 mr-2" /> {t("weather.setup_btn")}
            </Link>
          </Button>
        </div>
      )}

      {/* Error State: Weather Temporarily Unavailable (Preserves saved location) */}
      {!loading && errorState === "FETCH_ERROR" && (
        <div className="surface-card p-8 text-center my-6 max-w-xl mx-auto rounded-xl border border-destructive/30">
          <AlertTriangle className="mx-auto h-12 w-12 text-destructive mb-3" />
          <h2 className="text-lg font-bold text-foreground">{t("weather.temp_unavailable")}</h2>
          <p className="text-sm text-muted-foreground mt-2">
            {t("weather.temp_unavailable_desc")}
          </p>
          <Button variant="outline" className="mt-5" onClick={() => void loadWeather()}>
            <RefreshCw className="h-4 w-4 mr-2" /> {t("weather.retry_connection")}
          </Button>
        </div>
      )}

      {/* Live Weather Content */}
      {!loading && !errorState && weather && (
        <div className="space-y-6">
          {/* Current Weather Banner */}
          <div className="surface-card p-6 rounded-xl border border-border/60 bg-gradient-to-br from-card via-card to-primary/5">
            <div className="grid gap-6 md:grid-cols-4 items-center">
              <div className="md:col-span-2 flex items-center gap-5">
                <WeatherIcon condition={weather.current.condition} className="h-16 w-16" />
                <div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-extrabold text-foreground">
                      {weather.current.tempMax}°C
                    </span>
                    <span className="text-sm font-medium text-muted-foreground">
                      {t("weather.low_temp", { temp: weather.current.tempMin })}
                    </span>
                  </div>
                  <p className="text-base font-semibold text-foreground mt-0.5">
                    {getLocalizedCondition(
                      weather.current.conditionText || weather.current.condition,
                      t,
                    )}
                  </p>
                  <div className="text-xs text-muted-foreground mt-1 flex items-center gap-1.5">
                    <MapPin className="h-3 w-3 text-primary inline" />
                    <span>{t("settings.profile")}: <strong>{locationName}</strong></span>
                    <Link
                      href="/farmer/settings"
                      className="ml-2 inline-flex items-center gap-0.5 text-xs text-primary underline hover:text-primary/80"
                    >
                      {t("settings.edit_profile")} <ExternalLink className="h-3 w-3" />
                    </Link>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm md:col-span-2 border-t md:border-t-0 md:border-l border-border pt-4 md:pt-0 md:pl-6">
                <div>
                  <span className="text-xs text-muted-foreground block">
                    {t("weather.humidity")}
                  </span>
                  <span className="text-lg font-bold text-foreground">
                    {weather.current.humidity}%
                  </span>
                </div>
                <div>
                  <span className="text-xs text-muted-foreground block">
                    {t("weather.rain_prob")}
                  </span>
                  <span className="text-lg font-bold text-sky-400">
                    {weather.current.rainChance}%
                  </span>
                </div>
                <div>
                  <span className="text-xs text-muted-foreground block">{t("weather.wind")}</span>
                  <span className="text-lg font-bold text-foreground">
                    {weather.current.wind} km/h
                  </span>
                </div>
                <div>
                  <span className="text-xs text-muted-foreground block">{t("weather.precip")}</span>
                  <span className="text-lg font-bold text-foreground">
                    {weather.current.precipitationMm ?? 0} mm
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* 7-Day Forecast Grid */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-3">
              {t("weather.upcoming_7day")}
            </h3>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7">
              {weather.days.map((day, idx) => (
                <article
                  key={idx}
                  className="surface-card p-5 text-center flex flex-col items-center justify-between"
                >
                  <div>
                    <p className="text-sm font-semibold text-foreground">
                      {t(`day.${day.day}`) !== `day.${day.day}` ? t(`day.${day.day}`) : day.day}
                    </p>
                    <p className="text-xs text-muted-foreground">{day.date}</p>
                  </div>
                  <WeatherIcon condition={day.condition} className="my-3 h-8 w-8" />
                  <div>
                    <p className="text-lg font-bold text-foreground">
                      {day.tempMax}° /{" "}
                      <span className="text-muted-foreground font-normal text-sm">
                        {day.tempMin}°
                      </span>
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {getLocalizedCondition(day.conditionText || day.condition, t)}
                    </p>
                    <div className="mt-2 pt-2 border-t border-border/40 text-xs w-full space-y-0.5">
                      <p className="text-info font-medium">
                        {t("weather.rain_val", { pct: day.rainChance })}
                      </p>
                      <p className="text-muted-foreground">
                        {t("weather.wind_val", { speed: day.wind })}
                      </p>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
