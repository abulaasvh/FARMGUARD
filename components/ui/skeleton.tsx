import { cn } from "@/lib/utils";
import { useI18n } from "@/lib/i18n";

function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  const { t } = useI18n();
  return <div className={cn("animate-pulse rounded-md bg-primary/10", className)} {...props} />;
}

export { Skeleton };
