"use client";
import { useState, useEffect } from "react";
import { PageTitle } from "@/components/dashboard/dashboard-shell-next";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { LANGUAGES, useI18n } from "@/lib/i18n";
import { useTheme } from "@/lib/theme";
import { useSession, saveSession } from "@/lib/session";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { getCurrentCoordinates, searchLocation, type GeocodingResult } from "@/services/geocoding";
import { getSupabaseClient } from "@/lib/supabase";
import { MapPin, Loader2, CheckCircle2 } from "lucide-react";

export default function PageFarmerSettings() {
  const { theme, setTheme } = useTheme();
  const { language, setLanguage, t } = useI18n();
  const user = useSession();

  // Location configuration state and handlers
  const [configuringLocation, setConfiguringLocation] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState<GeocodingResult[]>([]);
  const [locSaving, setLocSaving] = useState(false);
  const [currentLocLabel, setCurrentLocLabel] = useState<string>("");

  useEffect(() => {
    let isMounted = true;

    const loadLocationAndProfile = async () => {
      let label = user?.organisation || user?.location || "";
      if (user?.village || user?.district || user?.state) {
        label = [user.village, user.district, user.state].filter(Boolean).join(", ");
      }

      const supabase = getSupabaseClient();
      let activeUserId = user?.id;
      if (!activeUserId && supabase) {
        try {
          const { data: authData } = await supabase.auth.getUser();
          activeUserId = authData?.user?.id;
        } catch {
          // ignore
        }
      }

      if (supabase && activeUserId) {
        try {
          const { data: userFarms } = await supabase
            .from("farms")
            .select("village, district, state, latitude, longitude")
            .eq("owner_profile_id", activeUserId)
            .limit(1);

          if (userFarms && userFarms.length > 0) {
            const f = userFarms[0]!;
            const farmLabel = [f.village, f.district, f.state].filter(Boolean).join(", ");
            if (farmLabel) label = farmLabel;
          }
        } catch (err) {
          console.error("Error loading location for settings:", err);
        }
      }

      if (!label && activeUserId) {
        const locKey = `farmguard.weather.location.${activeUserId}`;
        try {
          const storedStr = localStorage.getItem(locKey);
          if (storedStr) {
            const parsed = JSON.parse(storedStr) as { address?: string };
            if (parsed.address) label = parsed.address;
          }
        } catch {
          // ignore
        }
      }

      if (isMounted) {
        setCurrentLocLabel(label || "Not configured");
      }
    };

    void loadLocationAndProfile();

    return () => {
      isMounted = false;
    };
  }, [user]);

  const handleUseCurrentGPS = async () => {
    setLocSaving(true);
    try {
      const coords = await getCurrentCoordinates();
      await updateFarmerCoordinates(coords.latitude, coords.longitude, "My GPS Location");
      toast.success(t("settings.loc_updated_gps"));
      setConfiguringLocation(false);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to acquire location";
      toast.error(msg);
    } finally {
      setLocSaving(false);
    }
  };

  const handleSelectLocationItem = async (item: GeocodingResult) => {
    if (item.latitude == null || item.longitude == null || Number.isNaN(item.latitude) || Number.isNaN(item.longitude)) {
      toast.error(t("settings.loc_not_found"));
      return;
    }

    setLocSaving(true);
    try {
      const label = `${item.name}${item.admin2 ? `, ${item.admin2}` : ""}${item.admin1 ? `, ${item.admin1}` : ""}`;
      await updateFarmerCoordinates(item.latitude, item.longitude, label, item.name, item.admin2, item.admin1);
      toast.success(t("settings.loc_set_to", { name: item.name }));
      setConfiguringLocation(false);
      setSuggestions([]);
      setSearchQuery("");
    } catch {
      toast.error(t("settings.loc_save_failed"));
    } finally {
      setLocSaving(false);
    }
  };

  const handleManualSearchSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setLocSaving(true);
    try {
      const results = await searchLocation(searchQuery);
      if (!results || results.length === 0) {
        toast.error(t("settings.loc_not_found"));
        return;
      }
      await handleSelectLocationItem(results[0]!);
    } catch {
      toast.error(t("settings.geocoding_failed"));
    } finally {
      setLocSaving(false);
    }
  };

  const updateFarmerCoordinates = async (
    lat: number,
    lon: number,
    label: string,
    villageName?: string,
    districtName?: string,
    stateName?: string,
  ) => {
    // Safety check: Never save null/NaN coordinates
    if (lat == null || lon == null || Number.isNaN(lat) || Number.isNaN(lon)) {
      throw new Error("Invalid coordinates");
    }

    const supabase = getSupabaseClient();
    let activeUserId = user?.id;

    if (!activeUserId && supabase) {
      const { data: authData } = await supabase.auth.getUser();
      activeUserId = authData?.user?.id;
    }

    const targetUserId = activeUserId || "demo";
    const locKey = `farmguard.weather.location.${targetUserId}`;

    // 1. Persist to localStorage
    try {
      localStorage.setItem(
        locKey,
        JSON.stringify({
          address: label,
          latitude: lat,
          longitude: lon,
          village: villageName,
          district: districtName,
          state: stateName,
        }),
      );
    } catch {
      // ignore
    }

    // 2. Update active session state
    const baseUser = user || {
      id: targetUserId,
      name: "Farmer",
      email: "",
      role: "farmer" as const,
    };

    const updatedUser = {
      ...baseUser,
      latitude: lat,
      longitude: lon,
      organisation: label,
      location: stateName || baseUser.location,
      ...(villageName ? { village: villageName } : {}),
      ...(districtName ? { district: districtName } : {}),
      ...(stateName ? { state: stateName } : {}),
    };
    saveSession(updatedUser);
    setCurrentLocLabel(label);

    // 3. Update Supabase farms and profiles tables for authenticated farmer
    if (supabase && activeUserId && activeUserId !== "demo") {
      try {
        await supabase
          .from("profiles")
          .update({ location_text: label })
          .eq("id", activeUserId);

        const { data: userFarms } = await supabase
          .from("farms")
          .select("id")
          .eq("owner_profile_id", activeUserId)
          .limit(1);

        if (userFarms && userFarms.length > 0) {
          await supabase
            .from("farms")
            .update({
              latitude: lat,
              longitude: lon,
              ...(villageName ? { village: villageName } : {}),
              ...(districtName ? { district: districtName } : {}),
              ...(stateName ? { state: stateName } : {}),
            })
            .eq("id", userFarms[0]!.id);
        } else {
          await supabase.from("farms").insert({
            owner_profile_id: activeUserId,
            name: villageName ? `${villageName} Farm` : "My Farm",
            village: villageName || null,
            district: districtName || "Local",
            state: stateName || "Tamil Nadu",
            latitude: lat,
            longitude: lon,
            total_acres: 1.0,
          });
        }
      } catch (err) {
        console.error("Error persisting location to Supabase farm:", err);
      }
    }
  };

  return (
    <div>
      <PageTitle title={t("settings.title")} subtitle={t("settings.subtitle")} />
      <div className="grid gap-5 xl:grid-cols-2">
        <section className="surface-card p-5">
          <h2 className="text-base font-semibold text-foreground">{t("settings.appearance")}</h2>
          <div className="mt-4 flex items-center justify-between">
            <span className="text-sm text-muted-foreground">{t("settings.dark_mode")}</span>
            <Switch
              checked={theme === "dark"}
              onCheckedChange={(v) => setTheme(v ? "dark" : "light")}
              aria-label={t("settings.dark_mode")}
            />
          </div>
          <div className="mt-5">
            <p className="mb-2 text-sm text-muted-foreground">{t("settings.pref_lang")}</p>
            <Select value={language} onValueChange={(v) => setLanguage(v as never)}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {LANGUAGES.map((l) => (
                  <SelectItem key={l.code} value={l.code}>
                    {l.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </section>

        <section className="surface-card p-5">
          <h2 className="text-base font-semibold text-foreground">{t("settings.notifications")}</h2>
          <ul className="mt-4 space-y-4">
            {[
              { key: "settings.crit_sensor", label: t("settings.crit_sensor") },
              { key: "settings.irrigation_sums", label: t("settings.irrigation_sums") },
              { key: "settings.weather_warns", label: t("settings.weather_warns") },
              { key: "settings.market_updates", label: t("settings.market_updates") },
            ].map((item) => (
              <li key={item.key} className="flex items-center justify-between gap-4">
                <span className="text-sm text-muted-foreground">{item.label}</span>
                <Switch defaultChecked aria-label={item.label} />
              </li>
            ))}
          </ul>
        </section>

        {/* Farm Location Section */}
        <section className="surface-card p-5">
          <h2 className="text-base font-semibold text-foreground">{t("settings.farm_loc_title")}</h2>
          <p className="mt-1 text-xs text-muted-foreground">
            {t("settings.farm_loc_desc")}
          </p>

          <div className="mt-4 rounded-lg border border-border bg-secondary/30 p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  {t("settings.saved_farm_loc")}
                </p>
                <p className="mt-1 text-sm font-semibold text-foreground flex items-center gap-1.5">
                  <MapPin className="h-4 w-4 text-primary shrink-0" />
                  {currentLocLabel}
                </p>
                {user?.latitude != null && user?.longitude != null && (
                  <p className="mt-0.5 text-xs text-emerald-500 font-mono flex items-center gap-1">
                    <CheckCircle2 className="h-3.5 w-3.5" /> {t("settings.coordinates", { lat: user.latitude.toFixed(4), lng: user.longitude.toFixed(4) })}
                  </p>
                )}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setConfiguringLocation((prev) => !prev)}
              >
                {configuringLocation ? t("common.cancel") : t("settings.change_loc")}
              </Button>
            </div>
          </div>

          {configuringLocation && (
            <div className="surface-card p-5 mt-4 rounded-xl border border-primary/30 space-y-4 animate-in fade-in">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-primary" /> {t("settings.update_loc")}
                </h3>
                <Button variant="ghost" size="sm" onClick={() => setConfiguringLocation(false)}>
                  {t("common.cancel")}
                </Button>
              </div>

              <form onSubmit={handleManualSearchSubmit} className="space-y-3">
                <div className="grid gap-3 sm:grid-cols-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleUseCurrentGPS}
                    disabled={locSaving}
                    className="w-full justify-center gap-2"
                  >
                    {locSaving ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <MapPin className="h-4 w-4 text-primary" />
                    )}
                    {t("weather.use_gps")}
                  </Button>

                  <div className="relative">
                    <Input
                      placeholder={t("weather.search_placeholder")}
                      value={searchQuery}
                      onChange={async (e) => {
                        setSearchQuery(e.target.value);
                        if (e.target.value.trim().length >= 2) {
                          const res = await searchLocation(e.target.value);
                          setSuggestions(res);
                        } else {
                          setSuggestions([]);
                        }
                      }}
                    />
                    {suggestions.length > 0 && (
                      <ul className="absolute z-20 mt-1 w-full bg-background border border-border rounded-md shadow-lg overflow-hidden text-sm max-h-48 overflow-y-auto">
                        {suggestions.map((item, idx) => (
                          <li
                            key={idx}
                            className="p-2.5 hover:bg-accent cursor-pointer flex justify-between items-center"
                            onClick={() => void handleSelectLocationItem(item)}
                          >
                            <span>
                              <strong>{item.name}</strong>
                              {item.admin2 ? `, ${item.admin2}` : ""}
                              {item.admin1 ? `, ${item.admin1}` : ""}
                            </span>
                            <span className="text-xs text-muted-foreground font-mono">
                              {item.latitude.toFixed(2)}, {item.longitude.toFixed(2)}
                            </span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              </form>
            </div>
          )}
        </section>

        <section className="surface-card p-5">
          <h2 className="text-base font-semibold text-foreground">{t("settings.profile")}</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            {user?.name ?? t("header.guest_user")}
          </p>
          <p className="text-sm text-muted-foreground">{user?.email ?? ""}</p>
          <p className="text-sm text-muted-foreground">{user?.organisation ?? ""}</p>
          <Button
            className="mt-4"
            variant="outline"
            onClick={() => toast.info(t("settings.profile_managed_loc"))}
          >
            {t("settings.edit_profile")}
          </Button>
        </section>

        <section className="surface-card p-5">
          <h2 className="text-base font-semibold text-foreground">
            {t("settings.security_devices")}
          </h2>
          <div className="mt-4 space-y-3">
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={() => toast.info(t("settings.password_reset_sent"))}
            >
              {t("settings.change_password")}
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={() => toast.info(t("settings.two_factor_notice"))}
            >
              {t("settings.two_factor")}
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={() => toast.info(t("settings.device_manage_notice"))}
            >
              {t("settings.manage_devices")}
            </Button>
          </div>
        </section>
      </div>
    </div>
  );
}
