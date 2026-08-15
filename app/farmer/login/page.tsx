"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Eye, EyeOff, Loader2, Tractor } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Logo } from "@/components/common/logo";
import { ThemeToggle } from "@/components/common/theme-toggle";
import { LanguageSelector } from "@/components/common/language-selector";
import { login } from "@/services/auth";

export default function FarmerLoginPage() {
  const { t } = useI18n();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setLoading(true);
    try {
      const user = await login({
        email: String(form.get("email")),
        password: String(form.get("password")),
        remember: form.get("remember") === "on",
        expectedRole: "farmer",
      });
      toast.success(t("auth.welcome_user", { name: user.name }));
      router.push("/farmer");
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Could not sign you in. Please check your credentials.";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-surface px-4 py-10">
      <div className="absolute inset-0 bg-background/70" />

      <div className="relative w-full max-w-md">
        <div className="mb-5 flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            {t("auth.back_to_home")}
          </Link>
          <div className="flex items-center gap-1">
            <LanguageSelector compact />
            <ThemeToggle />
          </div>
        </div>

        <div className="glass-card p-7 sm:p-9">
          <div className="flex items-center justify-between">
            <Logo />
            <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
              <Tractor className="h-3.5 w-3.5" />
              {t("landing.farmer_portal")}
            </span>
          </div>

          <h1 className="mt-6 text-2xl font-bold tracking-tight text-foreground">
            {t("landing.farmer_sign_in")}
          </h1>
          <p className="mt-1.5 text-sm text-muted-foreground">
            {t("auth.farmer_role_desc")}
          </p>

          <form onSubmit={submit} className="mt-7 space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email">{t("auth.email_or_phone")}</Label>
              <Input
                id="email"
                name="email"
                type="text"
                required
                autoComplete="username"
                placeholder="farmer@example.com"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">{t("auth.password")}</Label>
              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  required
                  autoComplete="current-password"
                  placeholder="••••••••"
                  className="pr-11"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  className="absolute inset-y-0 right-0 grid w-11 place-items-center text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between gap-3">
              <label className="flex items-center gap-2 text-sm text-muted-foreground">
                <Checkbox id="remember" name="remember" />
                {t("auth.remember_me")}
              </label>
            </div>

            <Button type="submit" size="lg" className="w-full" disabled={loading}>
              {loading && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
              {loading ? t("auth.signing_in") : t("landing.farmer_sign_in")}
            </Button>
          </form>

          <div className="mt-6 text-center text-sm text-muted-foreground space-y-2">
            <p>
              {t("auth.dont_have_account")}{" "}
              <Link href="/farmer/signup" className="font-semibold text-primary hover:underline">
                {t("landing.register_farmer")}
              </Link>
            </p>
            <p className="text-xs">
              <Link href="/buyer/login" className="font-medium text-muted-foreground underline hover:text-foreground">
                {t("landing.buyer_sign_in")}
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
