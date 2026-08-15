"use client";
import {
  Activity,
  BarChart3,
  Bell,
  CloudSun,
  Cpu,
  Droplets,
  LayoutDashboard,
  Leaf,
  Settings,
  Sprout,
  Store,
} from "lucide-react";
import { DashboardShellNext, type NavItem } from "@/components/dashboard/dashboard-shell-next";
import type { ReactNode } from "react";

export const farmerNav: NavItem[] = [
  { label: "Dashboard", href: "/farmer", icon: LayoutDashboard },
  { label: "My Farm", href: "/farmer/my-farm", icon: Sprout },
  { label: "Sensors", href: "/farmer/sensors", icon: Cpu },
  { label: "Smart Irrigation", href: "/farmer/irrigation", icon: Droplets },
  { label: "Weather", href: "/farmer/weather", icon: CloudSun },
  { label: "Crop Health", href: "/farmer/crop-health", icon: Leaf },
  { label: "Analytics", href: "/farmer/analytics", icon: BarChart3 },
  { label: "Alerts", href: "/farmer/alerts", icon: Bell },
  { label: "Marketplace", href: "/farmer/marketplace", icon: Store },
  { label: "Settings", href: "/farmer/settings", icon: Settings },
];

import { usePathname } from "next/navigation";
import { useSession } from "@/lib/session";
import { useI18n } from "@/lib/i18n";

export default function FarmerLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const user = useSession();
  const { t } = useI18n();

  // Do not wrap login / signup pages in the dashboard shell
  if (pathname?.startsWith("/farmer/login") || pathname?.startsWith("/farmer/signup")) {
    return <>{children}</>;
  }

  // Workspace protection: if logged in as buyer, show notice
  if (user && user.role === "buyer") {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background p-6 text-center">
        <h1 className="text-xl font-bold text-destructive">{t("auth.access_restricted")}</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {t("auth.buyer_in_farmer_notice", { email: user.email || "" })}
        </p>
        <a href="/buyer" className="mt-4 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground">
          {t("auth.go_to_buyer")}
        </a>
      </div>
    );
  }

  return (
    <DashboardShellNext items={farmerNav} workspace="farmer">
      {children}
    </DashboardShellNext>
  );
}

export { Activity };
