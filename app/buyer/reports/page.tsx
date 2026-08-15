"use client";
import { PageTitle } from "@/components/dashboard/dashboard-shell-next";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useI18n } from "@/lib/i18n";

export default function PageBuyerReports() {
  const { t } = useI18n();

  const reportsList = [
    { title: t("reports.monthly_supply"), note: t("reports.monthly_supply_desc") },
    { title: t("reports.proc_perf"), note: t("reports.proc_perf_desc") },
    { title: t("reports.price_bench"), note: t("reports.price_bench_desc") },
    { title: t("reports.quality_audit"), note: t("reports.quality_audit_desc") },
    { title: t("reports.contract_exp"), note: t("reports.contract_exp_desc") },
    { title: t("reports.risk_reg"), note: t("reports.risk_reg_desc") },
  ];

  return (
    <div>
      <PageTitle title={t("nav.Reports")} subtitle={t("dashboard.view_reports")} />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {reportsList.map((r) => (
          <article key={r.title} className="surface-card p-5">
            <h2 className="text-base font-semibold text-foreground">{r.title}</h2>
            <p className="mt-1 text-sm text-muted-foreground">{r.note}</p>
            <Button
              className="mt-4"
              variant="outline"
              size="sm"
              onClick={() => toast.success(t("reports.export_queued", { title: r.title }))}
            >
              {t("reports.export_csv")}
            </Button>
          </article>
        ))}
      </div>
    </div>
  );
}
