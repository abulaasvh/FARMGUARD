"use client";
import { cn } from "@/lib/utils";
import { useI18n } from "@/lib/i18n";

interface LogoProps {
  className?: string;
  compact?: boolean;
  size?: "sm" | "md" | "lg" | "xl" | "sidebar";
}

export function Logo({ className, compact = false, size = "md" }: LogoProps) {
  const { t } = useI18n();
  return (
    <span className={cn("inline-flex items-center select-none", className)}>
      <img
        src="/farmguard-logo.png"
        alt="FarmGuard Logo"
        className={cn(
          "object-contain max-w-full transition-all drop-shadow-sm",
          size === "sm" && "h-7 sm:h-8 w-auto",
          size === "md" && "h-10 sm:h-12 w-auto",
          size === "lg" && "h-14 sm:h-16 w-auto",
          size === "xl" && "h-20 sm:h-24 w-auto",
          size === "sidebar" && "w-[225px] max-w-[225px] h-auto my-1",
          compact && "h-8 sm:h-9 w-auto",
        )}
      />
    </span>
  );
}
