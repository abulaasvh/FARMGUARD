"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Eye, EyeOff, Loader2 } from "lucide-react";
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

export default function LoginPage() {
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
      });
      toast.success(t("auth.welcome_user", { name: user.name }));
      router.push(user.role === "buyer" ? "/buyer" : "/farmer");
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Could not sign you in. Please try again.";
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
          <Logo />
          <h1 className="mt-6 text-2xl font-bold tracking-tight text-foreground">
            {t("auth.welcome_back")}
          </h1>
          <p className="mt-1.5 text-sm text-muted-foreground">{t("auth.sign_in_prompt")}</p>

          <div className="mt-5 grid grid-cols-2 gap-2 pb-2">
            <Link
              href="/farmer/login"
              className="rounded-lg border border-primary/20 bg-primary/10 px-3 py-2 text-center text-xs font-semibold text-primary hover:bg-primary/20 transition-colors"
            >
              {t("landing.farmer_sign_in")} →
            </Link>
            <Link
              href="/buyer/login"
              className="rounded-lg border border-secondary/40 bg-secondary px-3 py-2 text-center text-xs font-semibold text-secondary-foreground hover:bg-secondary/80 transition-colors"
            >
              {t("landing.buyer_sign_in")} →
            </Link>
          </div>

          <form onSubmit={submit} className="mt-5 space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email">{t("auth.email_or_phone")}</Label>
              <Input
                id="email"
                name="email"
                type="text"
                required
                autoComplete="username"
                placeholder="you@example.com"
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
              {loading ? t("auth.signing_in") : t("auth.login")}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            {t("auth.new_to")}{" "}
            <Link href="/signup" className="font-semibold text-primary hover:underline">
              {t("auth.create_account")}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
