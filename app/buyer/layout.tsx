"use client";
import {
  BarChart3,
  FileText,
  LayoutDashboard,
  LineChart,
  Settings,
  ShoppingCart,
  Sprout,
  Warehouse,
} from "lucide-react";
import { DashboardShellNext, type NavItem } from "@/components/dashboard/dashboard-shell-next";
import type { ReactNode } from "react";

export const buyerNav: NavItem[] = [
  { label: "Dashboard", href: "/buyer", icon: LayoutDashboard },
  { label: "Harvest Forecasts", href: "/buyer/forecasts", icon: LineChart },
  { label: "Available Farms", href: "/buyer/farms", icon: Sprout },
  { label: "Procurement", href: "/buyer/procurement", icon: ShoppingCart },
  { label: "Analytics", href: "/buyer/analytics", icon: BarChart3 },
  { label: "Contracts", href: "/buyer/contracts", icon: FileText },
  { label: "Reports", href: "/buyer/reports", icon: Warehouse },
  { label: "Settings", href: "/buyer/settings", icon: Settings },
];

import { usePathname } from "next/navigation";
import { useSession } from "@/lib/session";
import { useI18n } from "@/lib/i18n";

export default function BuyerLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const user = useSession();
  const { t } = useI18n();

  // Do not wrap login / signup pages in the dashboard shell
  if (pathname?.startsWith("/buyer/login") || pathname?.startsWith("/buyer/signup")) {
    return <>{children}</>;
  }

  // Workspace protection: if logged in as farmer, show notice
  if (user && user.role === "farmer") {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background p-6 text-center">
        <h1 className="text-xl font-bold text-destructive">{t("auth.access_restricted")}</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {t("auth.farmer_in_buyer_notice", { email: user.email || "" })}
        </p>
        <a href="/farmer" className="mt-4 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground">
          {t("auth.go_to_farmer")}
        </a>
      </div>
    );
  }

  return (
    <DashboardShellNext items={buyerNav} workspace="buyer">
      {children}
    </DashboardShellNext>
  );
}
