"use client";

import { useEffect, useState } from "react";
import { PageTitle } from "@/components/dashboard/dashboard-shell-next";
import { useI18n } from "@/lib/i18n";
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
import { toast } from "sonner";
import {
  getFarmerBuyerOffers,
  getInterestedBuyers,
  sendFarmerOfferToBuyer,
  updateOfferStatus,
  type FarmerBuyerOffer,
  type InterestedBuyer,
} from "@/services/farmer";
import { getSupabaseClient } from "@/lib/supabase";
import { formatRelativeTime, getLocalizedCrop, getLocalizedStatus, shortDate } from "@/utils/format";
import {
  Building2,
  CheckCircle2,
  Clock,
  DollarSign,
  Handshake,
  Loader2,
  MapPin,
  RefreshCw,
  Send,
  ShoppingBag,
  Sprout,
  Users,
  XCircle,
} from "lucide-react";

interface FarmerFarmOption {
  id: string;
  name: string;
  cropName: string;
}

export default function PageFarmerMarketplace() {
  const { t } = useI18n();
  const [activeTab, setActiveTab] = useState<"offers" | "directory">("offers");
  const [offers, setOffers] = useState<FarmerBuyerOffer[]>([]);
  const [buyers, setBuyers] = useState<InterestedBuyer[]>([]);
  const [farms, setFarms] = useState<FarmerFarmOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionInProgress, setActionInProgress] = useState<string | null>(null);

  // Send Offer Modal State
  const [selectedBuyer, setSelectedBuyer] = useState<InterestedBuyer | null>(null);
  const [selectedFarmId, setSelectedFarmId] = useState<string>("");
  const [offeredPriceKg, setOfferedPriceKg] = useState<string>("25.00");
  const [quantityKg, setQuantityKg] = useState<string>("1000");
  const [isSendingOffer, setIsSendingOffer] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const [offersData, buyersData] = await Promise.all([
        getFarmerBuyerOffers(),
        getInterestedBuyers(),
      ]);
      setOffers(offersData);
      setBuyers(buyersData);

      // Load farmer's farms for the send-offer selector
      const supabase = getSupabaseClient();
      if (supabase) {
        const { data: authData } = await supabase.auth.getUser();
        const userId = authData?.user?.id;
        if (userId) {
          const { data: userFarms } = await supabase
            .from("farms")
            .select("id, name, crops(name)")
            .eq("owner_profile_id", userId);
          if (userFarms) {
            const list: FarmerFarmOption[] = userFarms.map((f: any) => ({
              id: f.id,
              name: f.name || "My Farm",
              cropName: Array.isArray(f.crops) ? f.crops[0]?.name : f.crops?.name || "Harvest Crop",
            }));
            setFarms(list);
            if (list.length > 0 && !selectedFarmId) {
              setSelectedFarmId(list[0]!.id);
            }
          }
        }
      }
    } catch (err) {
      console.error("Error loading buyer section data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadData();
  }, []);

  const handleUpdateStatus = async (offerId: string, newStatus: "accepted" | "rejected") => {
    setActionInProgress(offerId);
    try {
      const ok = await updateOfferStatus(offerId, newStatus);
      if (ok) {
        setOffers((prev) =>
          prev.map((o) => (o.id === offerId ? { ...o, status: newStatus } : o)),
        );
        toast.success(
          newStatus === "accepted"
            ? t("marketplace.offer_accepted")
            : t("marketplace.offer_rejected"),
        );
      } else {
        toast.error(t("marketplace.action_failed"));
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t("marketplace.action_failed"));
    } finally {
      setActionInProgress(null);
    }
  };

  const handleOpenSendOfferModal = (buyer: InterestedBuyer) => {
    setSelectedBuyer(buyer);
    setOfferedPriceKg("25.00");
    setQuantityKg("1000");
  };

  const handleSendOfferSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBuyer || !selectedFarmId) {
      toast.error(t("marketplace.offer_send_failed"));
      return;
    }

    const priceNum = Number(offeredPriceKg);
    const qtyNum = Number(quantityKg);

    if (isNaN(priceNum) || priceNum <= 0) {
      toast.error(t("buyer.invalid_price"));
      return;
    }

    if (isNaN(qtyNum) || qtyNum <= 0) {
      toast.error(t("buyer.invalid_quantity"));
      return;
    }

    setIsSendingOffer(true);
    try {
      const success = await sendFarmerOfferToBuyer({
        buyerId: selectedBuyer.id,
        farmId: selectedFarmId,
        offeredPricePerKg: priceNum,
        quantityKg: qtyNum,
      });

      if (success) {
        toast.success(t("marketplace.offer_sent_success"));
        setSelectedBuyer(null);
        void loadData();
      } else {
        toast.error(t("marketplace.offer_send_failed"));
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t("marketplace.offer_send_failed"));
    } finally {
      setIsSendingOffer(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with Tab Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <PageTitle
          title={t("marketplace.buyer_section_title")}
          subtitle={t("marketplace.buyer_section_subtitle")}
        />

        <div className="flex items-center gap-2">
          <div className="surface-card rounded-lg p-1 border border-border flex items-center gap-1">
            <Button
              variant={activeTab === "offers" ? "default" : "ghost"}
              size="sm"
              className="text-xs h-7 px-3 gap-1.5"
              onClick={() => setActiveTab("offers")}
            >
              <ShoppingBag className="h-3.5 w-3.5" />
              {t("marketplace.incoming_offers")}
              {offers.length > 0 && (
                <span className="ml-1 rounded-full bg-primary-foreground/20 px-1.5 py-0.2 text-[10px] font-bold">
                  {offers.length}
                </span>
              )}
            </Button>
            <Button
              variant={activeTab === "directory" ? "default" : "ghost"}
              size="sm"
              className="text-xs h-7 px-3 gap-1.5"
              onClick={() => setActiveTab("directory")}
            >
              <Users className="h-3.5 w-3.5" />
              {t("marketplace.interested_buyers")}
            </Button>
          </div>

          <Button variant="outline" size="sm" onClick={() => void loadData()} disabled={loading}>
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="surface-card p-12 text-center my-8 flex flex-col items-center justify-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">{t("common.loading")}</p>
        </div>
      ) : activeTab === "offers" ? (
        /* Section 1: Incoming Purchase Offers */
        <div className="space-y-4">
          {offers.length === 0 ? (
            <div className="surface-card p-12 text-center rounded-xl border border-border/60">
              <div className="grid h-16 w-16 place-items-center rounded-2xl bg-secondary text-primary mx-auto">
                <Handshake className="h-8 w-8" />
              </div>
              <h2 className="mt-4 text-base font-bold text-foreground">
                {t("marketplace.no_offers")}
              </h2>
              <p className="mt-1 max-w-md mx-auto text-xs text-muted-foreground">
                {t("marketplace.no_offers_desc")}
              </p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {offers.map((offer) => (
                <article
                  key={offer.id}
                  className="surface-card p-5 rounded-xl border border-border flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="inline-block rounded-md bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">
                            {getLocalizedCrop(offer.cropName, t)}
                          </span>
                          <span className="text-xs text-muted-foreground font-medium">
                            {offer.farmName}
                          </span>
                        </div>
                        <h3 className="mt-2 text-base font-bold text-foreground">
                          {offer.companyName}
                        </h3>
                        <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                          <Building2 className="h-3 w-3" />
                          <span>{offer.businessType}</span> ·
                          <MapPin className="h-3 w-3 ml-1" />
                          <span>{offer.buyerLocation}</span>
                        </p>
                      </div>

                      <Badge
                        variant={
                          offer.status === "accepted"
                            ? "secondary"
                            : offer.status === "rejected"
                              ? "destructive"
                              : "outline"
                        }
                        className="shrink-0 text-xs"
                      >
                        {getLocalizedStatus(offer.status, t)}
                      </Badge>
                    </div>

                    <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-3 p-3 rounded-lg bg-secondary/30 border border-border/40 text-xs">
                      <div>
                        <span className="text-muted-foreground block">
                          {t("marketplace.offered_price")}
                        </span>
                        <span className="font-bold text-foreground text-sm">
                          {t("marketplace.price_per_kg", { price: offer.offeredPricePerKg })}
                        </span>
                        <span className="text-[10px] text-muted-foreground block">
                          {t("marketplace.price_per_quintal", {
                            price: offer.offeredPricePerQuintal,
                          })}
                        </span>
                      </div>

                      <div>
                        <span className="text-muted-foreground block">
                          {t("marketplace.quantity")}
                        </span>
                        <span className="font-bold text-foreground text-sm">
                          {offer.quantityTonnes} T
                        </span>
                        <span className="text-[10px] text-muted-foreground block">
                          ({offer.quantityKg.toLocaleString()} kg)
                        </span>
                      </div>

                      <div className="col-span-2 sm:col-span-1">
                        <span className="text-muted-foreground block">
                          {t("marketplace.total_value")}
                        </span>
                        <span className="font-bold text-emerald-600 dark:text-emerald-400 text-sm">
                          ₹{offer.totalValueInr.toLocaleString()}
                        </span>
                      </div>
                    </div>

                    <p className="mt-3 text-[11px] text-muted-foreground flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      <span>
                        {t("marketplace.request_date")}: {shortDate(offer.createdAt, t)}
                      </span>
                    </p>
                  </div>

                  {offer.status === "pending" && (
                    <div className="mt-5 pt-3 border-t border-border/40 flex items-center gap-3">
                      <Button
                        size="sm"
                        className="flex-1 gap-1.5"
                        onClick={() => void handleUpdateStatus(offer.id, "accepted")}
                        disabled={actionInProgress === offer.id}
                      >
                        {actionInProgress === offer.id ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <CheckCircle2 className="h-3.5 w-3.5" />
                        )}
                        {t("marketplace.accept_offer")}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1 gap-1.5 text-destructive hover:bg-destructive/10"
                        onClick={() => void handleUpdateStatus(offer.id, "rejected")}
                        disabled={actionInProgress === offer.id}
                      >
                        <XCircle className="h-3.5 w-3.5" />
                        {t("marketplace.reject_offer")}
                      </Button>
                    </div>
                  )}

                  {offer.status === "accepted" && (
                    <div className="mt-4 p-2.5 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-700 dark:text-emerald-300">
                      <p>{t("marketplace.buyer_contact_notice")}</p>
                    </div>
                  )}
                </article>
              ))}
            </div>
          )}
        </div>
      ) : (
        /* Section 2: Interested Buyers Directory with Direct Offer Action */
        <div className="space-y-4">
          {buyers.length === 0 ? (
            <div className="surface-card p-12 text-center rounded-xl border border-border/60">
              <Users className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
              <h2 className="text-base font-bold text-foreground">
                {t("marketplace.no_buyers")}
              </h2>
              <p className="mt-1 text-xs text-muted-foreground">
                {t("marketplace.interested_buyers_desc")}
              </p>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {buyers.map((buyer) => (
                <article key={buyer.id} className="surface-card p-5 rounded-xl border border-border flex flex-col justify-between">
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="text-base font-bold text-foreground">{buyer.companyName}</h3>
                        <p className="text-xs text-muted-foreground mt-0.5">{buyer.businessType}</p>
                      </div>
                      <Badge variant="outline" className="text-[10px] shrink-0">
                        {buyer.businessType}
                      </Badge>
                    </div>

                    <div className="mt-3 flex items-center gap-1.5 text-xs text-muted-foreground">
                      <MapPin className="h-3.5 w-3.5 text-primary shrink-0" />
                      <span className="truncate">{buyer.location}</span>
                    </div>

                    <div className="mt-4 pt-3 border-t border-border/40">
                      <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block mb-1.5">
                        {t("marketplace.interested_crops")}
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {buyer.interestedCrops.length > 0 ? (
                          buyer.interestedCrops.map((crop, idx) => (
                            <span
                              key={idx}
                              className="rounded bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary"
                            >
                              {getLocalizedCrop(crop, t)}
                            </span>
                          ))
                        ) : (
                          <span className="text-xs text-muted-foreground">
                            {t("common.no_data")}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="mt-5 pt-3 border-t border-border/40">
                    <Button
                      size="sm"
                      variant="outline"
                      className="w-full gap-1.5 text-xs"
                      onClick={() => handleOpenSendOfferModal(buyer)}
                    >
                      <Send className="h-3.5 w-3.5" />
                      {t("marketplace.send_offer_to_buyer")}
                    </Button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Direct Crop Offer Dialog from Farmer to Buyer */}
      <Dialog open={Boolean(selectedBuyer)} onOpenChange={(open) => !open && setSelectedBuyer(null)}>
        <DialogContent className="sm:max-w-[425px]">
          <form onSubmit={handleSendOfferSubmit}>
            <DialogHeader>
              <DialogTitle>{t("marketplace.send_offer_to_buyer")}</DialogTitle>
              <DialogDescription>
                {t("marketplace.send_offer_desc")} ({selectedBuyer?.companyName})
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-4 py-4">
              {farms.length > 0 && (
                <div className="grid gap-2">
                  <Label htmlFor="farmSelect">{t("marketplace.select_plot_or_crop")}</Label>
                  <Select value={selectedFarmId} onValueChange={setSelectedFarmId}>
                    <SelectTrigger id="farmSelect">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {farms.map((f) => (
                        <SelectItem key={f.id} value={f.id}>
                          {f.name} ({getLocalizedCrop(f.cropName, t)})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="grid gap-2">
                <Label htmlFor="offeredPrice">{t("buyer.offered_price_kg")}</Label>
                <Input
                  id="offeredPrice"
                  type="number"
                  step="0.1"
                  min="0.1"
                  value={offeredPriceKg}
                  onChange={(e) => setOfferedPriceKg(e.target.value)}
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
                onClick={() => setSelectedBuyer(null)}
                disabled={isSendingOffer}
              >
                {t("common.cancel")}
              </Button>
              <Button type="submit" disabled={isSendingOffer}>
                {isSendingOffer ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-1.5" />
                ) : (
                  <Send className="h-4 w-4 mr-1.5" />
                )}
                {t("marketplace.send_offer_to_buyer")}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
