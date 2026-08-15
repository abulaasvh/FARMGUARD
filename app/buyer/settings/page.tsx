"use client";
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
import { useSession } from "@/lib/session";
import { toast } from "sonner";

export default function PageBuyerSettings() {
  const { theme, setTheme } = useTheme();
  const { language, setLanguage, t } = useI18n();
  const user = useSession();
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
            onClick={() => toast.info(t("settings.profile_editing_backend"))}
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
