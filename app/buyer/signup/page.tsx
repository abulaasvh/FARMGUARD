"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Loader2 } from "lucide-react";
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
import { BUSINESS_TYPES } from "@/constants";
import { signupBuyer } from "@/services/auth";

export default function BuyerSignupPage() {
  const router = useRouter();
  const { t } = useI18n();
  const [loading, setLoading] = useState(false);
  const [businessType, setBusinessType] = useState(BUSINESS_TYPES[0]!);

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    if (form.get("password") !== form.get("confirmPassword")) {
      toast.error(t("auth.passwords_mismatch"));
      return;
    }
    setLoading(true);
    try {
      const result = await signupBuyer({
        companyName: String(form.get("companyName")),
        representativeName: String(form.get("representativeName")),
        email: String(form.get("email")),
        phone: String(form.get("phone")),
        businessType,
        location: String(form.get("location")),
        password: String(form.get("password")),
      });

      if (result.requiresConfirmation) {
        toast.info(
          result.message ??
            "Account created! Check your inbox to confirm your email, then sign in.",
          { duration: 8000 },
        );
        router.push("/buyer/login");
      } else {
        toast.success(t("auth.buyer_account_created"));
        router.push("/buyer");
      }
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Could not create account. Please try again.";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      title={t("landing.register_buyer")}
      subtitle={t("auth.buyer_role_desc")}
    >
      <form onSubmit={submit} className="space-y-5">
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label={t("auth.company_name")} htmlFor="companyName" className="sm:col-span-2">
            <Input id="companyName" name="companyName" required autoComplete="organization" />
          </Field>
          <Field label={t("auth.full_name")} htmlFor="representativeName">
            <Input id="representativeName" name="representativeName" required autoComplete="name" />
          </Field>
          <Field label={t("auth.email")} htmlFor="email">
            <Input id="email" name="email" type="email" required autoComplete="email" />
          </Field>
          <Field label={t("auth.phone")} htmlFor="phone">
            <Input id="phone" name="phone" type="tel" required autoComplete="tel" placeholder="+91" />
          </Field>
          <Field label={t("auth.business_type")} htmlFor="businessType">
            <Select value={businessType} onValueChange={setBusinessType}>
              <SelectTrigger id="businessType" className="w-full">
                <SelectValue placeholder={t("auth.business_type")} />
              </SelectTrigger>
              <SelectContent>
                {BUSINESS_TYPES.map((b) => (
                  <SelectItem key={b} value={b}>{b}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
          <Field label={t("settings.profile")} htmlFor="location" className="sm:col-span-2">
            <Input id="location" name="location" required placeholder={t("auth.city_state_placeholder")} />
          </Field>
          <Field label={t("auth.password")} htmlFor="password">
            <Input id="password" name="password" type="password" required minLength={6} autoComplete="new-password" />
          </Field>
          <Field label={t("auth.confirm_password")} htmlFor="confirmPassword">
            <Input id="confirmPassword" name="confirmPassword" type="password" required minLength={6} autoComplete="new-password" />
          </Field>
        </div>
        <Button type="submit" size="lg" className="w-full" disabled={loading}>
          {loading && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
          {loading ? t("common.loading") : t("landing.register_buyer")}
        </Button>
        <p className="text-center text-sm text-muted-foreground">
          {t("auth.already_have_account")}{" "}
          <Link href="/buyer/login" className="font-semibold text-primary hover:underline">
            {t("landing.buyer_sign_in")}
          </Link>
        </p>
      </form>
    </AuthShell>
  );
}
