"use client";
import { PageTitle } from "@/components/dashboard/dashboard-shell-next";
import { HarvestTable } from "@/components/dashboard/harvest-table";

import { useI18n } from "@/lib/i18n";

export default function PageBuyerFarms() {
  const { t } = useI18n();

  return (
    <div>
      <PageTitle title={t("nav.Available Farms")} subtitle={t("buyer.high_quality_farms")} />
      <HarvestTable title={t("buyer.forecast_coverage")} />
    </div>
  );
}



