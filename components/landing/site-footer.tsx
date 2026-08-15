"use client";
import Link from "next/link";
import { Mail, MapPin, Phone } from "lucide-react";
import { Logo } from "@/components/common/logo";
import { useI18n } from "@/lib/i18n";

export function SiteFooter() {
  const { t } = useI18n();

  const columns = [
    {
      title: t("landing.platform"),
      links: [
        { label: t("nav.features"), href: "/features" },
        { label: t("nav.how"), href: "/how-it-works" },
        { label: t("workspace.farmer"), href: "/farmer" },
        { label: t("workspace.buyer"), href: "/buyer" },
      ],
    },
    {
      title: t("landing.company"),
      links: [
        { label: t("nav.about"), href: "/about" },
        { label: t("nav.contact"), href: "/contact" },
        { label: t("nav.login"), href: "/login" },
        { label: t("nav.signup"), href: "/signup" },
      ],
    },
  ];

  return (
    <footer className="border-t border-border bg-card">
      <div className="section-shell grid gap-10 py-14 md:grid-cols-2 lg:grid-cols-4">
        <div>
          <Logo />
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-muted-foreground">
            {t("landing.footer_desc")}
          </p>
        </div>

        {columns.map((col) => (
          <nav key={col.title} aria-label={col.title}>
            <h3 className="text-sm font-semibold text-foreground">{col.title}</h3>
            <ul className="mt-4 space-y-2.5">
              {col.links.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground transition-colors hover:text-primary"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        ))}

        <address className="text-sm text-muted-foreground not-italic">
          <h3 className="text-sm font-semibold text-foreground">{t("nav.contact")}</h3>
          <ul className="mt-4 space-y-2.5">
            <li className="flex items-start gap-2.5">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
              Guindy Industrial Estate, Chennai 600032
            </li>
            <li className="flex items-center gap-2.5">
              <Phone className="h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
              +91 44 4000 1200
            </li>
            <li className="flex items-center gap-2.5">
              <Mail className="h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
              hello@farmguard.in
            </li>
          </ul>
        </address>
      </div>

      <div className="border-t border-border/60 py-6 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} FarmGuard Technologies Pvt. Ltd. All rights reserved.
      </div>
    </footer>
  );
}
