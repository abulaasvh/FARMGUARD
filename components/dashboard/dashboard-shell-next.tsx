"use client";

import { useState, useEffect, type ComponentType, type ReactNode } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Bell, Check, LogOut, Menu, Search, Trash2, User, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Logo } from "@/components/common/logo";
import { ThemeToggle } from "@/components/common/theme-toggle";
import { LanguageSelector } from "@/components/common/language-selector";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { useSession } from "@/lib/session";
import { useI18n } from "@/lib/i18n";
import { logout } from "@/services/auth";
import { getSupabaseClient } from "@/lib/supabase";
import {
  subscribeUserNotifications,
  type AppNotification,
} from "@/services/realtime";
import { cn } from "@/lib/utils";

export interface NavItem {
  label: string;
  href: string;
  icon: ComponentType<{ className?: string }>;
}

/** Shared dashboard chrome: responsive sidebar + top bar. Used by both roles. */
export function DashboardShellNext({
  items,
  workspace,
  children,
}: {
  items: NavItem[];
  workspace: string;
  children: ReactNode;
}) {
  const { t } = useI18n();
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const user = useSession();
  const pathname = usePathname();

  const [notificationsList, setNotificationsList] = useState<AppNotification[]>([]);
  const isFarmer = workspace.toLowerCase().includes("farmer");
  const userRole = isFarmer ? "farmer" : "buyer";

  // Load persistent notifications for the user
  useEffect(() => {
    if (!user?.id) return;
    const storageKey = `farmguard_notifications_${user.id}`;
    const stored = window.localStorage.getItem(storageKey);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          setNotificationsList(parsed);
        }
      } catch (err) {
        console.error("Failed to parse notifications:", err);
      }
    }
  }, [user?.id]);

  // Save persistent notifications when changed
  const saveNotifications = (newList: AppNotification[]) => {
    setNotificationsList(newList);
    if (user?.id) {
      window.localStorage.setItem(
        `farmguard_notifications_${user.id}`,
        JSON.stringify(newList.slice(0, 30)),
      );
    }
  };

  // Subscribe to real-time notification events
  useEffect(() => {
    const supabase = getSupabaseClient();
    if (!supabase || !user?.id) return;

    let isMounted = true;
    let farmIds: string[] = [];

    const initSubscription = async () => {
      if (isFarmer) {
        const { data: farms } = await supabase
          .from("farms")
          .select("id")
          .eq("owner_profile_id", user.id);
        if (farms) {
          farmIds = farms.map((f) => f.id);
        }
      }

      if (!isMounted) return;

      const channel = subscribeUserNotifications(
        supabase,
        user.id,
        userRole,
        farmIds,
        (newNotif) => {
          if (!isMounted) return;

          setNotificationsList((prev) => {
            const next = [newNotif, ...prev.filter((n) => n.id !== newNotif.id)].slice(0, 30);
            if (user?.id) {
              window.localStorage.setItem(
                `farmguard_notifications_${user.id}`,
                JSON.stringify(next),
              );
            }
            return next;
          });

          // Show realtime toast alert
          toast.info(newNotif.title, {
            description: newNotif.description,
            action: newNotif.link
              ? {
                  label: t("buyer.details"),
                  onClick: () => router.push(newNotif.link!),
                }
              : undefined,
          });
        },
      );

      return () => {
        supabase.removeChannel(channel);
      };
    };

    const cleanupPromise = initSubscription();

    return () => {
      isMounted = false;
      cleanupPromise.then((cleanup) => {
        if (cleanup) cleanup();
      });
    };
  }, [user?.id, isFarmer, userRole, router, t]);

  const unreadCount = notificationsList.filter((n) => !n.read).length;

  const markAllAsRead = () => {
    const updated = notificationsList.map((n) => ({ ...n, read: true }));
    saveNotifications(updated);
  };

  const clearAll = () => {
    saveNotifications([]);
  };

  const markAsRead = (id: string, link?: string) => {
    const updated = notificationsList.map((n) => (n.id === id ? { ...n, read: true } : n));
    saveNotifications(updated);
    if (link) {
      router.push(link);
    }
  };

  const signOut = async () => {
    await logout();
    router.push("/");
  };

  const workspaceLabel = t(isFarmer ? "workspace.farmer" : "workspace.buyer");

  const nav = (
    <nav className="flex flex-col gap-1" aria-label={`${workspaceLabel} sections`}>
      {items.map((item) => {
        const active = pathname === item.href;
        const translatedLabel = t(`nav.${item.label}`);
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={() => setOpen(false)}
            className={cn(
              "flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition-colors",
              active
                ? "bg-sidebar-accent text-sidebar-accent-foreground"
                : "text-muted-foreground hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground",
            )}
            aria-current={active ? "page" : undefined}
          >
            <item.icon className="h-4.5 w-4.5 shrink-0" />
            <span className="truncate">{translatedLabel}</span>
          </Link>
        );
      })}
    </nav>
  );

  return (
    <div className="min-h-screen bg-background">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 flex-col border-r border-sidebar-border bg-sidebar p-4 lg:flex no-scrollbar overflow-y-auto">
        <div className="flex items-center justify-center pt-1 pb-2 shrink-0">
          <Link href="/" aria-label={t("header.farmguard_home")} className="inline-flex justify-center">
            <Logo size="sidebar" />
          </Link>
        </div>
        <p className="mt-1 mb-2 px-2 text-center text-[0.68rem] font-bold tracking-[0.16em] text-muted-foreground uppercase shrink-0">
          {workspaceLabel}
        </p>
        <div className="flex-1 overflow-y-auto no-scrollbar">{nav}</div>
        <Button variant="ghost" className="mt-2 justify-start shrink-0" onClick={signOut}>
          <LogOut className="h-4 w-4" />
          {t("common.logout")}
        </Button>
      </aside>

      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            className="absolute inset-0 bg-foreground/40"
            aria-label={t("nav.close_nav")}
            onClick={() => setOpen(false)}
          />
          <div className="relative flex h-full w-72 max-w-[85vw] flex-col border-r border-sidebar-border bg-sidebar p-4 no-scrollbar overflow-y-auto">
            <div className="flex items-center justify-between pb-2 border-b border-sidebar-border/40 shrink-0">
              <Link href="/" aria-label={t("header.farmguard_home")} className="inline-flex items-center">
                <Logo size="sidebar" />
              </Link>
              <Button variant="ghost" size="icon" aria-label={t("nav.close_nav")} onClick={() => setOpen(false)}>
                <X className="h-5 w-5" />
              </Button>
            </div>
            <p className="mt-2 mb-2 px-2 text-[0.68rem] font-bold tracking-[0.16em] text-muted-foreground uppercase shrink-0">
              {workspaceLabel}
            </p>
            <div className="flex-1 overflow-y-auto no-scrollbar">{nav}</div>
            <Button variant="ghost" className="mt-2 justify-start shrink-0" onClick={signOut}>
              <LogOut className="h-4 w-4" />
              {t("common.logout")}
            </Button>
          </div>
        </div>
      )}

      <div className="lg:pl-64">
        <header className="sticky top-0 z-30 border-b border-border bg-background/90 backdrop-blur-xl">
          <div className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 px-4 py-3 sm:px-6">
            <Button variant="ghost" size="icon" className="lg:hidden" aria-label={t("nav.open_nav")} onClick={() => setOpen(true)}>
              <Menu className="h-5 w-5" />
            </Button>
            <div className="relative hidden min-w-0 sm:block">
              <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
              <Input type="search" placeholder={t("nav.search_placeholder")} aria-label={t("nav.search_placeholder")} className="max-w-md pl-9" />
            </div>
            <span className="sm:hidden" />
            <div className="flex items-center gap-1 justify-self-end">
              <LanguageSelector compact />
              <ThemeToggle />

              {/* Real-time Notification Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" aria-label={t("notifications.title")} className="relative">
                    <Bell className="h-5 w-5" />
                    {unreadCount > 0 && (
                      <span className="absolute top-1.5 right-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-bold text-destructive-foreground">
                        {unreadCount > 9 ? "9+" : unreadCount}
                      </span>
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-80 p-0">
                  <div className="flex items-center justify-between p-3 border-b border-border">
                    <span className="text-sm font-semibold">{t("notifications.title")}</span>
                    {notificationsList.length > 0 && (
                      <div className="flex items-center gap-1">
                        {unreadCount > 0 && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 text-[11px] px-2 text-muted-foreground"
                            onClick={markAllAsRead}
                          >
                            <Check className="h-3 w-3 mr-1" />
                            {t("notifications.mark_all_read")}
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 text-[11px] px-1.5 text-muted-foreground"
                          onClick={clearAll}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    )}
                  </div>

                  <div className="max-h-80 overflow-y-auto divide-y divide-border/40">
                    {notificationsList.length === 0 ? (
                      <div className="p-6 text-center text-xs text-muted-foreground">
                        {t("notifications.no_notifications")}
                      </div>
                    ) : (
                      notificationsList.map((n) => (
                        <DropdownMenuItem
                          key={n.id}
                          className={`flex flex-col items-start gap-1 p-3 cursor-pointer ${
                            !n.read ? "bg-primary/5 font-medium" : ""
                          }`}
                          onClick={() => markAsRead(n.id, n.link)}
                        >
                          <div className="flex items-center justify-between w-full">
                            <span className="text-xs font-semibold text-foreground">{n.title}</span>
                            <span className="text-[10px] text-muted-foreground">{n.time}</span>
                          </div>
                          <span className="text-xs text-muted-foreground leading-snug">
                            {n.description}
                          </span>
                        </DropdownMenuItem>
                      ))
                    )}
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Profile Menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" aria-label={t("header.profile_menu")}>
                    <User className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel className="flex flex-col gap-0.5">
                    <span className="truncate">{user?.name ?? t("header.guest_user")}</span>
                    <span className="truncate text-xs font-normal text-muted-foreground">
                      {user?.organisation ?? workspaceLabel}
                    </span>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onSelect={signOut}>{t("common.logout")}</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </header>

        <main className="px-4 py-6 sm:px-6 sm:py-8">{children}</main>
      </div>
    </div>
  );
}

export function PageTitle({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle?: string;
  action?: ReactNode;
}) {
  return (
    <div className="mb-6 grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4">
      <div className="min-w-0">
        <h1 className="truncate text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          {title}
        </h1>
        {subtitle && <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}
