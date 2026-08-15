"use client";
import { PageTitle } from "@/components/dashboard/dashboard-shell-next";
import { HarvestTable } from "@/components/dashboard/harvest-table";

import { useI18n } from "@/lib/i18n";

export default function PageBuyerForecasts() {
  const { t } = useI18n();

  return (
    <div>
      <PageTitle title={t("nav.Harvest Forecasts")} subtitle={t("buyer.crop_avail_desc")} />
      <HarvestTable title={t("buyer.forecast_coverage")} />
    </div>
  );
}



