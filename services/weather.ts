import type { WeatherDay } from "@/types";

export interface LiveWeatherResponse {
  current: WeatherDay;
  days: WeatherDay[];
  locationName?: string;
  timezone?: string;
}

function mapWmoCodeToCondition(code: number): "sunny" | "cloudy" | "rain" | "storm" | "partly" {
  if (code === 0) return "sunny";
  if (code >= 1 && code <= 3) return "partly";
  if (code === 45 || code === 48) return "cloudy";
  if ((code >= 51 && code <= 67) || (code >= 80 && code <= 82)) return "rain";
  if (code >= 95) return "storm";
  return "cloudy";
}

function mapWmoCodeToText(code: number): string {
  switch (code) {
    case 0:
      return "Clear Sky";
    case 1:
      return "Mainly Clear";
    case 2:
      return "Partly Cloudy";
    case 3:
      return "Overcast";
    case 45:
    case 48:
      return "Foggy";
    case 51:
    case 53:
    case 55:
      return "Light Drizzle";
    case 61:
    case 63:
      return "Moderate Rain";
    case 65:
      return "Heavy Rain";
    case 80:
    case 81:
    case 82:
      return "Rain Showers";
    case 95:
    case 96:
    case 99:
      return "Thunderstorm";
    default:
      return "Cloudy";
  }
}

function formatDayName(dateStr: string): string {
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return dateStr;
  const today = new Date();
  if (d.toDateString() === today.toDateString()) return "Today";
  return d.toLocaleDateString("en-US", { weekday: "short" });
}

export async function fetchLiveWeather(
  latitude?: number | null,
  longitude?: number | null,
): Promise<LiveWeatherResponse> {
  if (latitude == null || longitude == null || Number.isNaN(latitude) || Number.isNaN(longitude)) {
    throw new Error("Location not configured");
  }

  const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,precipitation,rain,weather_code,wind_speed_10m&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max,wind_speed_10m_max,relative_humidity_2m_mean&timezone=auto`;

  let response: Response;
  try {
    response = await fetch(url);
  } catch {
    throw new Error("Weather temporarily unavailable");
  }

  if (!response.ok) {
    throw new Error("Weather temporarily unavailable");
  }

  interface OpenMeteoData {
    timezone?: string;
    current?: {
      temperature_2m: number;
      relative_humidity_2m: number;
      precipitation: number;
      rain: number;
      weather_code: number;
      wind_speed_10m: number;
    };
    daily?: {
      time: string[];
      weather_code: number[];
      temperature_2m_max: number[];
      temperature_2m_min: number[];
      precipitation_probability_max: number[];
      wind_speed_10m_max: number[];
      relative_humidity_2m_mean: number[];
    };
  }

  let data: OpenMeteoData;
  try {
    data = (await response.json()) as OpenMeteoData;
  } catch {
    throw new Error("Weather temporarily unavailable");
  }

  if (!data.daily || !data.daily.time || data.daily.time.length === 0) {
    throw new Error("Weather temporarily unavailable");
  }

  const days: WeatherDay[] = data.daily.time.map((timeStr, idx) => {
    const code = data.daily?.weather_code[idx] ?? 0;
    return {
      day: formatDayName(timeStr),
      date: timeStr,
      condition: mapWmoCodeToCondition(code),
      conditionText: mapWmoCodeToText(code),
      tempMax: Math.round(data.daily?.temperature_2m_max[idx] ?? 0),
      tempMin: Math.round(data.daily?.temperature_2m_min[idx] ?? 0),
      humidity: Math.round(
        data.daily?.relative_humidity_2m_mean[idx] ?? data.current?.relative_humidity_2m ?? 0,
      ),
      rainChance: data.daily?.precipitation_probability_max[idx] ?? 0,
      wind: Math.round(data.daily?.wind_speed_10m_max[idx] ?? 0),
      weatherCode: code,
    };
  });

  const currentCode = data.current?.weather_code ?? data.daily.weather_code[0] ?? 0;
  const currentDay: WeatherDay = {
    day: "Now",
    date: data.daily.time[0]!,
    condition: mapWmoCodeToCondition(currentCode),
    conditionText: mapWmoCodeToText(currentCode),
    tempMax: Math.round(data.current?.temperature_2m ?? data.daily.temperature_2m_max[0] ?? 0),
    tempMin: Math.round(data.daily.temperature_2m_min[0] ?? 0),
    humidity: Math.round(
      data.current?.relative_humidity_2m ?? data.daily.relative_humidity_2m_mean[0] ?? 0,
    ),
    rainChance: data.daily.precipitation_probability_max[0] ?? 0,
    wind: Math.round(data.current?.wind_speed_10m ?? data.daily.wind_speed_10m_max[0] ?? 0),
    precipitationMm: data.current?.precipitation ?? 0,
    weatherCode: currentCode,
  };

  return {
    current: currentDay,
    days,
    timezone: data.timezone,
  };
}

/** Legacy wrapper maintaining contract for existing components if any */
export async function getForecast(): Promise<{ current: WeatherDay; days: WeatherDay[] }> {
  return fetchLiveWeather();
}
