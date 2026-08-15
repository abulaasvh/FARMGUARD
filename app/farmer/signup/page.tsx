"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Loader2, MapPin, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { useI18n } from "@/lib/i18n";
import { AuthShell, Field } from "@/components/auth/auth-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CROPS, INDIAN_STATES } from "@/constants";
import { LANGUAGES } from "@/lib/i18n";
import { signupFarmer } from "@/services/auth";
import { getCurrentCoordinates, searchLocation, type GeocodingResult } from "@/services/geocoding";
import { getLocalizedCrop } from "@/utils/format";

export default function FarmerSignupPage() {
  const router = useRouter();
  const { t } = useI18n();
  const [loading, setLoading] = useState(false);
  const [locLoading, setLocLoading] = useState(false);
  const [state, setState] = useState(INDIAN_STATES[0]!);
  const [language, setLanguage] = useState("English");
  const [crop, setCrop] = useState(CROPS[0]!);
  const [village, setVillage] = useState("");
  const [district, setDistrict] = useState("");
  const [coords, setCoords] = useState<{ lat?: number; lon?: number }>({});
  const [locationQuery, setLocationQuery] = useState("");
  const [suggestions, setSuggestions] = useState<GeocodingResult[]>([]);

  const handleUseCurrentLocation = async () => {
    setLocLoading(true);
    try {
      const position = await getCurrentCoordinates();
      setCoords({ lat: position.latitude, lon: position.longitude });
      toast.success(t("auth.loc_set_gps", { lat: position.latitude.toFixed(4), lng: position.longitude.toFixed(4) }));
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to get current location");
    } finally {
      setLocLoading(false);
    }
  };

  const handleLocationQueryChange = async (val: string) => {
    setLocationQuery(val);
    if (val.trim().length >= 2) {
      const results = await searchLocation(val);
      setSuggestions(results);
    } else {
      setSuggestions([]);
    }
  };

  const handleSelectSuggestion = (item: GeocodingResult) => {
    setCoords({ lat: item.latitude, lon: item.longitude });
    setLocationQuery(`${item.name}${item.admin2 ? `, ${item.admin2}` : ""}${item.admin1 ? `, ${item.admin1}` : ""}`);
    if (item.name) setVillage(item.name);
    if (item.admin2) setDistrict(item.admin2);
    if (item.admin1 && INDIAN_STATES.includes(item.admin1)) setState(item.admin1);
    setSuggestions([]);
    toast.success(t("auth.loc_selected", { name: item.name, lat: item.latitude.toFixed(4), lng: item.longitude.toFixed(4) }));
  };

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    if (form.get("password") !== form.get("confirmPassword")) {
      toast.error(t("auth.passwords_mismatch"));
      return;
    }
    setLoading(true);
    try {
      let finalLat = coords.lat;
      let finalLon = coords.lon;
      if (!finalLat || !finalLon) {
        const queryText = `${form.get("village")}, ${form.get("district")}, ${state}`;
        const searchRes = await searchLocation(queryText);
        if (searchRes.length > 0) {
          finalLat = searchRes[0]!.latitude;
          finalLon = searchRes[0]!.longitude;
        }
      }
      const result = await signupFarmer({
        fullName: String(form.get("fullName")),
        phone: String(form.get("phone")),
        email: String(form.get("email")),
        village: String(form.get("village")),
        district: String(form.get("district")),
        state,
        language,
        farmSize: String(form.get("farmSize")),
        primaryCrop: crop,
        password: String(form.get("password")),
        latitude: finalLat,
        longitude: finalLon,
      });
      if (result.requiresConfirmation) {
        toast.info(result.message || "Account created! Please check your inbox for the confirmation email.", { duration: 8000 });
        router.push("/farmer/login");
      } else {
        toast.success(t("auth.farm_account_created"));
        router.push("/farmer");
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to create farmer account.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      title={t("auth.signup_title")}
      subtitle={t("auth.farmer_role_desc")}
    >
      <form onSubmit={submit} className="space-y-5">
        <div className="surface-card p-4 space-y-3 rounded-lg border border-border/50">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              {t("settings.profile")} & GPS Coordinates
            </span>
            <Button type="button" variant="outline" size="sm" onClick={handleUseCurrentLocation} disabled={locLoading} className="h-8 text-xs gap-1.5">
              {locLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <MapPin className="h-3.5 w-3.5 text-primary" />}
              {t("weather.use_gps")}
            </Button>
          </div>
          <div className="relative">
            <Input
              placeholder={t("weather.search_placeholder")}
              value={locationQuery}
              onChange={(e) => handleLocationQueryChange(e.target.value)}
              className="text-sm"
            />
            {suggestions.length > 0 && (
              <ul className="absolute z-20 mt-1 w-full bg-background border border-border rounded-md shadow-lg overflow-hidden text-sm">
                {suggestions.map((item, idx) => (
                  <li
                    key={idx}
                    onClick={() => handleSelectSuggestion(item)}
                    className="p-2.5 hover:bg-accent hover:text-accent-foreground cursor-pointer flex justify-between items-center"
                  >
                    <span><strong>{item.name}</strong>{item.admin2 ? `, ${item.admin2}` : ""}{item.admin1 ? `, ${item.admin1}` : ""}</span>
                    <span className="text-xs text-muted-foreground font-mono">{item.latitude.toFixed(2)}, {item.longitude.toFixed(2)}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
          {coords.lat != null && coords.lon != null && (
            <p className="text-xs text-emerald-500 flex items-center gap-1 font-medium">
              <CheckCircle2 className="h-3.5 w-3.5" /> Coordinates set: {coords.lat.toFixed(4)}, {coords.lon.toFixed(4)}
            </p>
          )}
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <Field label={t("auth.full_name")} htmlFor="fullName"><Input id="fullName" name="fullName" required autoComplete="name" /></Field>
          <Field label={t("auth.phone")} htmlFor="phone"><Input id="phone" name="phone" type="tel" required autoComplete="tel" placeholder="+91" /></Field>
          <Field label={t("auth.email")} htmlFor="email" className="sm:col-span-2"><Input id="email" name="email" type="email" required autoComplete="email" /></Field>
          <Field label={t("auth.village")} htmlFor="village"><Input id="village" name="village" value={village} onChange={(e) => setVillage(e.target.value)} required /></Field>
          <Field label={t("auth.district")} htmlFor="district"><Input id="district" name="district" value={district} onChange={(e) => setDistrict(e.target.value)} required /></Field>
          <Field label={t("auth.state")} htmlFor="state">
            <Select value={state} onValueChange={setState}>
              <SelectTrigger id="state" className="w-full"><SelectValue placeholder={t("auth.state")} /></SelectTrigger>
              <SelectContent>{INDIAN_STATES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
            </Select>
          </Field>
          <Field label={t("settings.pref_lang")} htmlFor="language">
            <Select value={language} onValueChange={setLanguage}>
              <SelectTrigger id="language" className="w-full"><SelectValue placeholder={t("settings.pref_lang")} /></SelectTrigger>
              <SelectContent>{LANGUAGES.map((l) => <SelectItem key={l.code} value={l.label}>{l.label}</SelectItem>)}</SelectContent>
            </Select>
          </Field>
          <Field label={t("auth.farm_size")} htmlFor="farmSize"><Input id="farmSize" name="farmSize" type="number" min="0.1" step="0.1" required /></Field>
          <Field label={t("auth.primary_crop")} htmlFor="crop">
            <Select value={crop} onValueChange={setCrop}>
              <SelectTrigger id="crop" className="w-full"><SelectValue placeholder={t("auth.primary_crop")} /></SelectTrigger>
              <SelectContent>{CROPS.map((c) => <SelectItem key={c} value={c}>{getLocalizedCrop(c, t)}</SelectItem>)}</SelectContent>
            </Select>
          </Field>
          <Field label={t("auth.password")} htmlFor="password"><Input id="password" name="password" type="password" required minLength={6} autoComplete="new-password" /></Field>
          <Field label={t("auth.confirm_password")} htmlFor="confirmPassword"><Input id="confirmPassword" name="confirmPassword" type="password" required minLength={6} autoComplete="new-password" /></Field>
        </div>

        <Button type="submit" size="lg" className="w-full" disabled={loading}>
          {loading && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
          {loading ? t("common.loading") : t("landing.register_farmer")}
        </Button>

        <p className="text-center text-sm text-muted-foreground">
          {t("auth.already_have_account")}{" "}
          <Link href="/farmer/login" className="font-semibold text-primary hover:underline">
            {t("landing.farmer_sign_in")}
          </Link>
        </p>
      </form>
    </AuthShell>
  );
}
