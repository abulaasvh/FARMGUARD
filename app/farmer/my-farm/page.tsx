"use client";
import { useEffect, useState } from "react";
import { PageTitle } from "@/components/dashboard/dashboard-shell-next";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { CROPS } from "@/constants";
import {
  shortDate,
  getLocalizedCrop,
  getLocalizedSoil,
  getLocalizedIrrigation,
} from "@/utils/format";
import { getFarmPlots, addFarmPlot, updateFarmPlot, deleteFarmPlot } from "@/services/farmer";
import { useI18n } from "@/lib/i18n";
import type { FarmPlot } from "@/types";
import { Plus, Edit2, Trash2, Sprout, Loader2, X } from "lucide-react";
import { toast } from "sonner";

export default function PageFarmerMyFarm() {
  const { t } = useI18n();

  const [plots, setPlots] = useState<FarmPlot[]>([]);
  const [loading, setLoading] = useState(true);

  // Dialog state
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingPlot, setEditingPlot] = useState<FarmPlot | null>(null);
  const [saving, setSaving] = useState(false);

  // Form states
  const [cropName, setCropName] = useState(CROPS[0]!);
  const [customCrop, setCustomCrop] = useState("");
  const [plotName, setPlotName] = useState("");
  const [areaAcres, setAreaAcres] = useState("2.5");
  const [soilType, setSoilType] = useState("Loam");
  const [irrigation, setIrrigation] = useState("Drip Irrigation");
  const [sowingDate, setSowingDate] = useState("");
  const [expectedHarvest, setExpectedHarvest] = useState("");

  const loadPlots = async () => {
    setLoading(true);
    try {
      const data = await getFarmPlots();
      setPlots(data);
    } catch (err) {
      console.error("Failed to load plots:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadPlots();
  }, []);

  const openAddDialog = () => {
    setEditingPlot(null);
    setCropName(CROPS[0]!);
    setCustomCrop("");
    setPlotName("");
    setAreaAcres("2.5");
    setSoilType("Loam");
    setIrrigation("Drip Irrigation");
    setSowingDate("");
    setExpectedHarvest("");
    setIsAddOpen(true);
  };

  const openEditDialog = (plot: FarmPlot) => {
    setEditingPlot(plot);
    const knownCrop = CROPS.includes(plot.crop) ? plot.crop : "Other";
    setCropName(knownCrop);
    setCustomCrop(knownCrop === "Other" ? plot.crop : "");
    setPlotName(plot.name);
    setAreaAcres(String(plot.areaAcres || 2.5));
    setSoilType(plot.soilType || "Loam");
    setIrrigation(plot.irrigation || "Drip Irrigation");
    setSowingDate(plot.sownDate || "");
    setExpectedHarvest(plot.expectedHarvestDate || "");
    setIsAddOpen(true);
  };

  const handleSaveCrop = async (e: React.FormEvent) => {
    e.preventDefault();
    const finalCrop = cropName === "Other" ? customCrop.trim() || "Crop" : cropName;
    const finalAcres = Number(areaAcres) || 1.0;
    setSaving(true);

    try {
      if (editingPlot) {
        const updated = await updateFarmPlot(editingPlot.id, {
          name: plotName.trim() || `${finalCrop} Plot`,
          crop: finalCrop,
          cropName: finalCrop,
          areaAcres: finalAcres,
          soilType,
          irrigation,
          sowingDate: sowingDate || undefined,
          expectedHarvest: expectedHarvest || undefined,
        });
        if (updated) {
          setPlots((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
          toast.success(t("myfarm.updated_plot", { name: updated.name }));
        }
      } else {
        const created = await addFarmPlot({
          name: plotName.trim() || `${finalCrop} Plot`,
          crop: finalCrop,
          cropName: finalCrop,
          areaAcres: finalAcres,
          soilType,
          irrigation,
          health: 85,
          status: "optimal",
          sowingDate: sowingDate || new Date().toISOString().slice(0, 10),
          sownDate: sowingDate || new Date().toISOString().slice(0, 10),
          expectedHarvest: expectedHarvest || undefined,
          expectedHarvestDate: expectedHarvest || undefined,
        });
        setPlots((prev) => [created, ...prev]);
        toast.success(t("myfarm.added_plot", { name: created.name }));
      }
      setIsAddOpen(false);
    } catch (err) {
      toast.error(t("myfarm.save_failed"));
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleDeletePlot = async (id: string, name: string, crop: string) => {
    if (!confirm(t("myfarm.delete_confirm", { name, crop }))) return;
    try {
      await deleteFarmPlot(id);
      setPlots((prev) => prev.filter((p) => p.id !== id));
      toast.success(t("myfarm.removed_plot", { name }));
    } catch (err) {
      toast.error(t("myfarm.delete_failed"));
      console.error(err);
    }
  };

  return (
    <div>
      <PageTitle
        title={t("myfarm.title")}
        subtitle={t("myfarm.subtitle")}
        action={
          <Button onClick={openAddDialog} className="gap-2">
            <Plus className="h-4 w-4" />
            {t("myfarm.add_crop")}
          </Button>
        }
      />

      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : plots.length === 0 ? (
        <div className="surface-card flex flex-col items-center justify-center p-12 text-center">
          <div className="grid h-16 w-16 place-items-center rounded-2xl bg-secondary text-primary">
            <Sprout className="h-8 w-8" />
          </div>
          <h2 className="mt-4 text-lg font-bold text-foreground">{t("myfarm.no_crops")}</h2>
          <p className="mt-1 max-w-md text-sm text-muted-foreground">{t("myfarm.no_crops_desc")}</p>
          <Button onClick={openAddDialog} className="mt-6 gap-2">
            <Plus className="h-4 w-4" />
            {t("myfarm.add_first")}
          </Button>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {plots.map((plot) => (
            <div key={plot.id} className="surface-card flex flex-col justify-between p-5">
              <div>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <span className="inline-block rounded-md bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary">
                      {getLocalizedCrop(plot.crop, t)}
                    </span>
                    <h2 className="mt-2 text-lg font-bold text-foreground">{plot.name}</h2>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground hover:text-foreground"
                      onClick={() => openEditDialog(plot)}
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground hover:text-destructive"
                      onClick={() => handleDeletePlot(plot.id, plot.name, plot.crop)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-3 text-xs text-muted-foreground">
                  <div>
                    <span className="font-medium text-foreground">{t("myfarm.area_acres")}:</span>{" "}
                    {plot.areaAcres} {t("common.acres_label")}
                  </div>
                  <div>
                    <span className="font-medium text-foreground">{t("myfarm.soil")}:</span>{" "}
                    {getLocalizedSoil(plot.soilType, t)}
                  </div>
                  <div>
                    <span className="font-medium text-foreground">{t("myfarm.irrigation")}:</span>{" "}
                    {getLocalizedIrrigation(plot.irrigation, t)}
                  </div>
                  <div>
                    <span className="font-medium text-foreground">{t("myfarm.sown")}:</span>{" "}
                    {shortDate(plot.sownDate, t)}
                  </div>
                </div>

                {plot.expectedHarvestDate && (
                  <p className="mt-2 text-xs text-muted-foreground">
                    <span className="font-medium text-foreground">
                      {t("myfarm.expected_harvest")}:
                    </span>{" "}
                    {shortDate(plot.expectedHarvestDate, t)}
                  </p>
                )}
              </div>

              <div className="mt-5 border-t border-border/50 pt-4">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">{t("myfarm.crop_health")}</span>
                  <span className="font-semibold text-foreground">{plot.health}%</span>
                </div>
                <Progress value={plot.health} className="mt-2 h-2" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Dialog */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 p-4 backdrop-blur-sm">
          <div className="surface-card w-full max-w-lg p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-border/50">
              <h2 className="text-lg font-bold text-foreground">
                {editingPlot ? t("myfarm.update_crop") : t("myfarm.add_crop")}
              </h2>
              <Button variant="ghost" size="icon" onClick={() => setIsAddOpen(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>

            <form onSubmit={handleSaveCrop} className="mt-4 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="cropSelect">{t("myfarm.crop_type")}</Label>
                  <Select value={cropName} onValueChange={setCropName}>
                    <SelectTrigger id="cropSelect">
                      <SelectValue placeholder={t("myfarm.select_crop")} />
                    </SelectTrigger>
                    <SelectContent>
                      {CROPS.map((c) => (
                        <SelectItem key={c} value={c}>
                          {getLocalizedCrop(c, t)}
                        </SelectItem>
                      ))}
                      <SelectItem value="Other">{t("common.other")}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {cropName === "Other" ? (
                  <div className="space-y-1.5">
                    <Label htmlFor="customCrop">{t("myfarm.custom_crop")}</Label>
                    <Input
                      id="customCrop"
                      value={customCrop}
                      onChange={(e) => setCustomCrop(e.target.value)}
                      placeholder={t("myfarm.custom_crop_placeholder")}
                      required
                    />
                  </div>
                ) : (
                  <div className="space-y-1.5">
                    <Label htmlFor="areaAcres">{t("myfarm.area_acres")}</Label>
                    <Input
                      id="areaAcres"
                      type="number"
                      step="0.1"
                      min="0.1"
                      value={areaAcres}
                      onChange={(e) => setAreaAcres(e.target.value)}
                      required
                    />
                  </div>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="plotName">{t("myfarm.plot_name")}</Label>
                <Input
                  id="plotName"
                  value={plotName}
                  onChange={(e) => setPlotName(e.target.value)}
                  placeholder={t("myfarm.plot_name_placeholder")}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="soilType">{t("myfarm.soil_type")}</Label>
                  <Select value={soilType} onValueChange={setSoilType}>
                    <SelectTrigger id="soilType">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {["Loam", "Clay Loam", "Sandy Loam", "Black Soil", "Red Soil", "Alluvial"].map(
                        (s) => (
                          <SelectItem key={s} value={s}>
                            {getLocalizedSoil(s, t)}
                          </SelectItem>
                        ),
                      )}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="irrigation">{t("myfarm.irrigation_method")}</Label>
                  <Select value={irrigation} onValueChange={setIrrigation}>
                    <SelectTrigger id="irrigation">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {["Drip Irrigation", "Sprinkler", "Flood / Canal", "Sub-surface Drip"].map(
                        (i) => (
                          <SelectItem key={i} value={i}>
                            {getLocalizedIrrigation(i, t)}
                          </SelectItem>
                        ),
                      )}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="sowingDate">{t("myfarm.sowing_date")}</Label>
                  <Input
                    id="sowingDate"
                    type="date"
                    value={sowingDate}
                    onChange={(e) => setSowingDate(e.target.value)}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="expectedHarvest">{t("myfarm.expected_harvest")}</Label>
                  <Input
                    id="expectedHarvest"
                    type="date"
                    value={expectedHarvest}
                    onChange={(e) => setExpectedHarvest(e.target.value)}
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-border/40">
                <Button type="button" variant="outline" onClick={() => setIsAddOpen(false)}>
                  {t("myfarm.cancel")}
                </Button>
                <Button type="submit" disabled={saving}>
                  {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {t("myfarm.save")}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
