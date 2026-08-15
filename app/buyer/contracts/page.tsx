"use client";

import { useEffect, useState } from "react";
import { PageTitle } from "@/components/dashboard/dashboard-shell-next";
import { Badge } from "@/components/ui/badge";
import { inr, shortDate, getLocalizedCrop, getLocalizedStatus } from "@/utils/format";
import { useI18n } from "@/lib/i18n";
import { getContracts } from "@/services/buyer";
import type { Contract } from "@/types";
import { FileText, Loader2 } from "lucide-react";

export default function PageBuyerContracts() {
  const { t } = useI18n();
  const [contractsList, setContractsList] = useState<Contract[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        const data = await getContracts();
        if (mounted) setContractsList(data);
      } catch (err) {
        console.error("Error loading contracts:", err);
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div>
      <PageTitle title={t("nav.Contracts")} subtitle={t("buyer.supply_forecast_desc")} />

      {loading ? (
        <div className="surface-card p-12 text-center my-6 flex flex-col items-center justify-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">{t("common.loading")}</p>
        </div>
      ) : contractsList.length === 0 ? (
        <div className="surface-card p-12 text-center rounded-xl border border-border/60">
          <div className="grid h-16 w-16 place-items-center rounded-2xl bg-secondary text-primary mx-auto">
            <FileText className="h-8 w-8" />
          </div>
          <h2 className="mt-4 text-base font-bold text-foreground">
            {t("contracts.no_contracts")}
          </h2>
          <p className="mt-1 max-w-md mx-auto text-xs text-muted-foreground">
            {t("contracts.no_contracts_desc")}
          </p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {contractsList.map((c) => (
            <article key={c.id} className="surface-card p-5 rounded-xl border border-border">
              <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
                <h2 className="truncate text-base font-semibold text-foreground">{c.farm}</h2>
                <Badge variant={c.status === "completed" ? "secondary" : "default"} className="shrink-0">
                  {getLocalizedStatus(c.status, t)}
                </Badge>
              </div>
              <p className="mt-1 text-sm text-muted-foreground">
                {getLocalizedCrop(c.crop, t)} · {c.volumeTonnes} t
              </p>
              <p className="mt-3 text-xl font-bold text-primary">{inr(c.valueInr)}</p>
              <p className="mt-2 text-xs text-muted-foreground">
                {shortDate(c.startDate)} – {shortDate(c.endDate)}
              </p>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
