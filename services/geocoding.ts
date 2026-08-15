/**
 * Geocoding Service for FarmGuard.
 * Uses Open-Meteo Geocoding API for place/village lookups and Browser Geolocation API for live GPS coordinates.
 */

export interface GeocodingResult {
  name: string;
  latitude: number;
  longitude: number;
  admin1?: string; // State
  admin2?: string; // District / County
  country?: string;
  postcode?: string;
}

export async function searchLocation(query: string): Promise<GeocodingResult[]> {
  if (!query || query.trim().length < 2) return [];

  const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(
    query.trim(),
  )}&count=5&language=en&format=json`;

  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error("Geocoding request failed");
    const data = (await res.json()) as {
      results?: Array<{
        name: string;
        latitude: number;
        longitude: number;
        admin1?: string;
        admin2?: string;
        country?: string;
        postcode?: string;
      }>;
    };

    if (!data.results) return [];

    return data.results.map((item) => ({
      name: item.name,
      latitude: item.latitude,
      longitude: item.longitude,
      admin1: item.admin1,
      admin2: item.admin2,
      country: item.country,
      postcode: item.postcode,
    }));
  } catch (error) {
    console.error("Geocoding error:", error);
    return [];
  }
}

export function getCurrentCoordinates(): Promise<{ latitude: number; longitude: number }> {
  return new Promise((resolve, reject) => {
    if (typeof window === "undefined" || !("geolocation" in navigator)) {
      reject(new Error("Geolocation is not supported by your browser"));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
      },
      (error) => {
        let message = "Unable to retrieve your location";
        if (error.code === error.PERMISSION_DENIED) {
          message =
            "Location permission denied. Please allow location access in your browser settings.";
        } else if (error.code === error.POSITION_UNAVAILABLE) {
          message = "Location information is unavailable.";
        } else if (error.code === error.TIMEOUT) {
          message = "The request to get your location timed out.";
        }
        reject(new Error(message));
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000,
      },
    );
  });
}
