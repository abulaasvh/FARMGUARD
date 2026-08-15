"use client";

import { useEffect, useState } from "react";
import { PageTitle } from "@/components/dashboard/dashboard-shell-next";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { shortDate, getLocalizedCrop, getLocalizedStatus } from "@/utils/format";
import { useI18n } from "@/lib/i18n";
import { getBuyerOffers } from "@/services/buyer";
import { subscribeBuyerOffers } from "@/services/realtime";
import { getSupabaseClient } from "@/lib/supabase";
import type { PurchaseOffer } from "@/types";
import { ShoppingBag } from "lucide-react";

export default function PageBuyerProcurement() {
  const { t } = useI18n();
  const [offers, setOffers] = useState<PurchaseOffer[]>([]);
  const [loading, setLoading] = useState(true);

  const loadOffers = async () => {
    try {
      const data = await getBuyerOffers();
      setOffers(data);
    } catch (err) {
      console.error("Error loading buyer offers:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let mounted = true;
    const supabase = getSupabaseClient();

    loadOffers();

    if (supabase) {
      supabase.auth.getUser().then(({ data: authData }) => {
        const buyerId = authData?.user?.id;
        if (buyerId && mounted) {
          const channel = subscribeBuyerOffers(supabase, buyerId, (updatedRow) => {
            setOffers((prev) => {
              const idx = prev.findIndex((o) => o.id === updatedRow.id);
              if (idx !== -1) {
                const copy = [...prev];
                copy[idx] = {
                  ...copy[idx]!,
                  status: updatedRow.status,
                  quantityKg: Number(updatedRow.quantity_kg),
                  quantityTonnes: Number((updatedRow.quantity_kg / 1000).toFixed(2)),
                  offeredPricePerKg: Number(updatedRow.offered_price_per_kg),
                };
                return copy;
              }
              loadOffers();
              return prev;
            });
          });

          return () => {
            supabase.removeChannel(channel);
          };
        }
      });
    }

    return () => {
      mounted = false;
    };
  }, []);

  const getStatusVariant = (status: string) => {
    switch (status) {
      case "accepted":
        return "default";
      case "completed":
        return "secondary";
      case "rejected":
      case "declined":
        return "destructive";
      default:
        return "outline";
    }
  };

  return (
    <div>
      <PageTitle title={t("nav.Procurement")} subtitle={t("buyer.demand_trend_desc")} />
      <section className="surface-card p-5">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("buyer.table_farm")}</TableHead>
                <TableHead>{t("buyer.table_crop")}</TableHead>
                <TableHead className="text-right">{t("buyer.table_est_tonnes")}</TableHead>
                <TableHead className="text-right">{t("buyer.offered_price_kg")}</TableHead>
                <TableHead>{t("buyer.table_expected_date")}</TableHead>
                <TableHead>{t("buyer.table_status")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} className="py-6 text-center text-muted-foreground">
                    {t("common.loading")}
                  </TableCell>
                </TableRow>
              ) : offers.length > 0 ? (
                offers.map((r) => (
                  <TableRow key={r.id}>
                    <TableCell className="font-medium">{r.farm}</TableCell>
                    <TableCell>{getLocalizedCrop(r.crop, t)}</TableCell>
                    <TableCell className="text-right">{r.quantityTonnes} t</TableCell>
                    <TableCell className="text-right font-semibold">₹{r.offeredPricePerKg}</TableCell>
                    <TableCell>{shortDate(r.requestedOn)}</TableCell>
                    <TableCell>
                      <Badge variant={getStatusVariant(r.status)} className="capitalize">
                        {getLocalizedStatus(r.status, t)}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="py-12 text-center text-muted-foreground">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <ShoppingBag className="h-8 w-8 text-muted-foreground/60" />
                      <p className="text-sm font-semibold text-foreground">
                        {t("buyer.no_procurement_records")}
                      </p>
                      <p className="text-xs max-w-sm">{t("buyer.no_procurement_desc")}</p>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </section>
    </div>
  );
}
