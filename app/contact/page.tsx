"use client";
import { useState } from "react";
import { Mail, MapPin, Phone } from "lucide-react";
import { toast } from "sonner";
import { MarketingLayout, PageHeader } from "@/components/landing/marketing-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useI18n } from "@/lib/i18n";

export default function ContactPage() {
  const { t } = useI18n();
  const [sending, setSending] = useState(false);

  const details = [
    { icon: MapPin, label: t("settings.profile"), value: "Guindy Industrial Estate, Chennai 600032" },
    { icon: Phone, label: t("auth.phone"), value: "+91 44 4000 1200" },
    { icon: Mail, label: t("auth.email"), value: "hello@farmguard.in" },
  ];

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSending(true);
    await new Promise((r) => setTimeout(r, 600));
    setSending(false);
    toast.success(t("contact.msg_received"));
    event.currentTarget.reset();
  };

  return (
    <MarketingLayout>
      <PageHeader
        title={t("landing.cta_talk")}
        subtitle={t("landing.cta_desc")}
      />

      <section className="section-shell grid gap-10 py-16 lg:grid-cols-[1fr_1.2fr] sm:py-20">
        <div className="space-y-4">
          {details.map((item) => (
            <div key={item.label} className="surface-card flex items-start gap-4 p-5">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-secondary text-secondary-foreground">
                <item.icon className="h-4.5 w-4.5" aria-hidden="true" />
              </span>
              <div className="min-w-0">
                <p className="text-xs font-medium text-muted-foreground">{item.label}</p>
                <p className="text-sm font-semibold break-words text-foreground">{item.value}</p>
              </div>
            </div>
          ))}
        </div>

        <form onSubmit={submit} className="surface-card space-y-5 p-6 sm:p-8">
          <div className="grid gap-5 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name">{t("auth.full_name")}</Label>
              <Input id="name" name="name" required autoComplete="name" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">{t("auth.email")}</Label>
              <Input id="email" name="email" type="email" required autoComplete="email" />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="subject">{t("contact.subject")}</Label>
            <Input id="subject" name="subject" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="message">{t("contact.message")}</Label>
            <Textarea id="message" name="message" rows={6} required />
          </div>
          <Button type="submit" size="lg" disabled={sending} className="w-full sm:w-auto">
            {sending ? t("common.loading") : t("common.submit")}
          </Button>
        </form>
      </section>
    </MarketingLayout>
  );
}
