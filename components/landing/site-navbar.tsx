"use client";
import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/common/logo";
import { ThemeToggle } from "@/components/common/theme-toggle";
import { LanguageSelector } from "@/components/common/language-selector";
import { useI18n } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const links = [
  { key: "nav.home", href: "/" },
  { key: "nav.features", href: "/features" },
  { key: "nav.how", href: "/how-it-works" },
  { key: "nav.about", href: "/about" },
  { key: "nav.contact", href: "/contact" },
];

export function SiteNavbar() {
  const { t } = useI18n();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-border/70 bg-background/85 backdrop-blur-xl">
      <nav className="section-shell flex h-16 items-center justify-between gap-4" aria-label="Main">
        <Link href="/" aria-label={t("header.farmguard_home")}>
          <Logo />
        </Link>

        <ul className="hidden items-center gap-1 lg:flex">
          {links.map((link) => {
            const isActive = pathname === link.href;
            return (
              <li key={link.key}>
                <Link
                  href={link.href}
                  className={cn(
                    "rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-secondary hover:text-foreground",
                    isActive ? "text-primary bg-secondary" : "text-muted-foreground"
                  )}
                >
                  {t(link.key)}
                </Link>
              </li>
            );
          })}
        </ul>

        <div className="hidden items-center gap-2 lg:flex">
          <LanguageSelector compact />
          <ThemeToggle />

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">
                {t("nav.login")}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem asChild>
                <Link href="/farmer/login" className="cursor-pointer">
                  {t("landing.farmer_sign_in")}
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/buyer/login" className="cursor-pointer">
                  {t("landing.buyer_sign_in")}
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="sm">
                {t("nav.signup")}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem asChild>
                <Link href="/farmer/signup" className="cursor-pointer">
                  {t("landing.register_farmer")}
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/buyer/signup" className="cursor-pointer">
                  {t("landing.register_buyer")}
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="flex items-center gap-2 lg:hidden">
          <LanguageSelector compact />
          <ThemeToggle />
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setOpen((o) => !o)}
            aria-label={open ? t("nav.close_nav") : t("nav.open_nav")}
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </nav>

      {open && (
        <div className="border-b border-border bg-background px-4 py-4 lg:hidden">
          <ul className="flex flex-col gap-2">
            {links.map((link) => (
              <li key={link.key}>
                <Link
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className="block rounded-lg px-3 py-2 text-base font-medium text-foreground hover:bg-secondary"
                >
                  {t(link.key)}
                </Link>
              </li>
            ))}
          </ul>
          <div className="mt-4 grid grid-cols-2 gap-2 pt-4 border-t border-border">
            <Button variant="outline" className="w-full text-xs" asChild>
              <Link href="/farmer/login" onClick={() => setOpen(false)}>{t("landing.farmer_sign_in")}</Link>
            </Button>
            <Button variant="outline" className="w-full text-xs" asChild>
              <Link href="/buyer/login" onClick={() => setOpen(false)}>{t("landing.buyer_sign_in")}</Link>
            </Button>
            <Button className="w-full text-xs" asChild>
              <Link href="/farmer/signup" onClick={() => setOpen(false)}>{t("landing.farmer_register")}</Link>
            </Button>
            <Button variant="secondary" className="w-full text-xs" asChild>
              <Link href="/buyer/signup" onClick={() => setOpen(false)}>{t("landing.buyer_register")}</Link>
            </Button>
          </div>
        </div>
      )}
    </header>
  );
}
