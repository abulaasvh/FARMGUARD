"use client";

import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useI18n } from "@/lib/i18n";
import { getHarvestForecasts, sendOffer } from "@/services/buyer";
import type { HarvestForecast } from "@/types";
import { num, shortDate, getLocalizedCrop, getLocalizedStatus } from "@/utils/format";

/** Filterable harvest forecast table — shared by dashboard and forecasts pages. */
export function HarvestTable({ title }: { title?: string }) {
  const { t } = useI18n();

  const [forecasts, setForecasts] = useState<HarvestForecast[]>([]);
  const [loading, setLoading] = useState(true);

  const [crop, setCrop] = useState("All");
  const [district, setDistrict] = useState("All");
  const [month, setMonth] = useState("All");
  const [quality, setQuality] = useState("All");

  // Offer modal state
  const [selectedFarm, setSelectedFarm] = useState<HarvestForecast | null>(null);
  const [offeredPrice, setOfferedPrice] = useState<string>("");
  const [quantityKg, setQuantityKg] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    let mounted = true;
    async function loadData() {
      try {
        const data = await getHarvestForecasts();
        if (mounted) {
          setForecasts(data || []);
        }
      } catch (err) {
        console.error("Error loading harvest forecasts:", err);
      } finally {
        if (mounted) setLoading(false);
      }
    }
    loadData();
    return () => {
      mounted = false;
    };
  }, []);


  const crops = useMemo(
    () => ["All", ...new Set(forecasts.map((h) => h.crop))],
    [forecasts],
  );
  const districts = useMemo(
    () => ["All", ...new Set(forecasts.map((h) => h.district))],
    [forecasts],
  );
  const months = useMemo(
    () => ["All", ...new Set(forecasts.map((h) => h.harvestMonth))],
    [forecasts],
  );
  const qualities = ["All", "70", "80", "90"];

  const rows = useMemo(
    () =>
      forecasts.filter(
        (r) =>
          (crop === "All" || r.crop === crop) &&
          (district === "All" || r.district === district) &&
          (month === "All" || r.harvestMonth === month) &&
          (quality === "All" || r.qualityScore >= Number(quality)),
      ),
    [forecasts, crop, district, month, quality],
  );

  const filters = [
    { label: t("buyer.table_crop"), value: crop, set: setCrop, options: crops },
    { label: t("auth.district"), value: district, set: setDistrict, options: districts },
    { label: t("myfarm.expected_harvest"), value: month, set: setMonth, options: months },
    { label: t("buyer.table_quality"), value: quality, set: setQuality, options: qualities },
  ];

  const handleOpenOfferModal = (farm: HarvestForecast) => {
    setSelectedFarm(farm);
    const defaultPrice = farm.pricePerQuintal ? (farm.pricePerQuintal / 100).toFixed(2) : "25.00";
    const defaultQty = farm.predictedYieldTonnes
      ? (farm.predictedYieldTonnes * 1000).toFixed(0)
      : "1000";
    setOfferedPrice(defaultPrice);
    setQuantityKg(defaultQty);
  };

  const handleSendOfferSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFarm) return;

    const priceNum = Number(offeredPrice);
    const qtyNum = Number(quantityKg);

    if (isNaN(priceNum) || priceNum <= 0) {
      toast.error(t("buyer.invalid_price"));
      return;
    }

    if (isNaN(qtyNum) || qtyNum <= 0) {
      toast.error(t("buyer.invalid_quantity"));
      return;
    }

    setIsSubmitting(true);
    try {
      const targetFarmId = selectedFarm.farmId || selectedFarm.id;
      await sendOffer({
        farm_id: targetFarmId,
        offered_price_per_kg: priceNum,
        quantity_kg: qtyNum,
      });

      toast.success(
        t("buyer.offer_submitted", { farm: selectedFarm.farm }),
      );
      setSelectedFarm(null);
    } catch (err: unknown) {
      console.error("Failed to send offer:", err);
      const errMsg = err instanceof Error ? err.message : "Failed to create purchase offer. Please try again.";
      toast.error(errMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="surface-card p-5">
      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4">
        <h2 className="truncate text-base font-semibold text-foreground">
          {title || t("nav.Harvest Forecasts")}
        </h2>
        <Badge variant="secondary" className="shrink-0">
          {rows.length} {t("nav.Available Farms")}
        </Badge>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {filters.map((f, idx) => (
          <div key={idx}>
            <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
              {f.label}
            </label>
            <Select value={f.value} onValueChange={f.set}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {f.options.map((o) => (
                  <SelectItem key={o} value={o}>
                    {o === "All" ? t("common.none") : getLocalizedCrop(o, t)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        ))}
      </div>

      <div className="mt-5 overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t("buyer.table_farm")}</TableHead>
              <TableHead>{t("auth.district")}</TableHead>
              <TableHead>{t("buyer.table_crop")}</TableHead>
              <TableHead>{t("buyer.table_expected_date")}</TableHead>
              <TableHead className="text-right">{t("buyer.table_est_tonnes")}</TableHead>
              <TableHead className="text-right">{t("buyer.table_quality")}</TableHead>
              <TableHead>{t("buyer.table_status")}</TableHead>
              <TableHead className="text-right">{t("common.actions")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={8} className="py-6 text-center text-muted-foreground">
                  {t("buyer.loading_farms")}
                </TableCell>
              </TableRow>
            ) : rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="py-6 text-center text-muted-foreground">
                  {t("buyer.no_farms_found")}
                </TableCell>
              </TableRow>
            ) : (
              rows.map((row) => (
                <TableRow key={row.id}>
                  <TableCell className="font-medium">{row.farm}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {row.location}, {row.state}
                  </TableCell>
                  <TableCell>{getLocalizedCrop(row.crop, t)}</TableCell>
                  <TableCell>{shortDate(row.harvestDate)}</TableCell>
                  <TableCell className="text-right">{num(row.predictedYieldTonnes, 1)} t</TableCell>
                  <TableCell className="text-right font-semibold">{row.qualityScore}</TableCell>
                  <TableCell>
                    <Badge variant={row.availability === "committed" ? "outline" : "secondary"}>
                      {getLocalizedStatus(row.availability, t)}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      {(row.farmId || row.id) && (
                        <a
                          href={`/buyer/farms/${row.farmId || row.id}`}
                          className="inline-flex h-8 items-center rounded-md border border-border bg-background px-3 text-xs font-medium text-foreground hover:bg-secondary"
                        >
                          {t("buyer.details")}
                        </a>
                      )}
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleOpenOfferModal(row)}
                      >
                        {t("common.request")}
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Offer Submission Dialog */}
      <Dialog open={Boolean(selectedFarm)} onOpenChange={(open) => !open && setSelectedFarm(null)}>
        <DialogContent className="sm:max-w-[425px]">
          <form onSubmit={handleSendOfferSubmit}>
            <DialogHeader>
              <DialogTitle>{t("buyer.send_offer")}</DialogTitle>
              <DialogDescription>
                {t("buyer.offer_dialog_desc", { farm: selectedFarm?.farm || "", crop: getLocalizedCrop(selectedFarm?.crop || "", t) })}
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="offeredPrice">{t("buyer.offered_price_kg")}</Label>
                <Input
                  id="offeredPrice"
                  type="number"
                  step="0.1"
                  min="0.1"
                  value={offeredPrice}
                  onChange={(e) => setOfferedPrice(e.target.value)}
                  placeholder="e.g. 25.00"
                  required
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="quantityKg">{t("buyer.quantity_kg")}</Label>
                <Input
                  id="quantityKg"
                  type="number"
                  step="1"
                  min="1"
                  value={quantityKg}
                  onChange={(e) => setQuantityKg(e.target.value)}
                  placeholder="e.g. 1000"
                  required
                />
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setSelectedFarm(null)}
                disabled={isSubmitting}
              >
                {t("common.cancel")}
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? t("buyer.submitting_offer") : t("buyer.submit_offer")}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </section>
  );
}
