import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

function getSupabaseServerClient(authHeader?: string | null) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) return null;

  return createClient(url, key, {
    global: {
      headers: authHeader ? { Authorization: authHeader } : {},
    },
  });
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const authHeader = request.headers.get("authorization");
    const supabase = getSupabaseServerClient(authHeader);

    if (!supabase) {
      return NextResponse.json(
        { success: false, error: "Supabase client unavailable", data: [] },
        { status: 503 },
      );
    }

    let buyerId = searchParams.get("buyer_id");

    const { data: authUser } = await supabase.auth.getUser();
    if (authUser?.user?.id) {
      buyerId = authUser.user.id;
    }

    if (!buyerId) {
      return NextResponse.json(
        { success: false, error: "Missing buyer_id parameter or unauthenticated session", data: [] },
        { status: 400 },
      );
    }

    const { data, error } = await supabase
      .from("purchase_offers")
      .select(`
        id,
        buyer_id,
        farm_id,
        offered_price_per_kg,
        quantity_kg,
        status,
        created_at,
        farms (
          id,
          name,
          village,
          district,
          state,
          crops (
            name
          )
        )
      `)
      .eq("buyer_id", buyerId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Supabase purchase_offers fetch error:", error);
      return NextResponse.json(
        { success: false, error: error.message || "Failed to fetch offers", data: [] },
        { status: 500 },
      );
    }

    const offers = (data ?? []).map((rowRecord: unknown) => {
      const row = rowRecord as Record<string, any>;
      const farmObj = Array.isArray(row.farms) ? row.farms[0] : row.farms;
      const cropObj = farmObj?.crops
        ? Array.isArray(farmObj.crops)
          ? farmObj.crops[0]
          : farmObj.crops
        : null;

      return {
        id: row.id,
        buyerId: row.buyer_id,
        farmId: row.farm_id,
        farm: farmObj?.name || "Farm " + row.farm_id.slice(0, 6),
        crop: cropObj?.name || "Crop",
        quantityTonnes: Number((row.quantity_kg / 1000).toFixed(2)),
        quantityKg: Number(row.quantity_kg),
        offeredPricePerKg: Number(row.offered_price_per_kg),
        offeredPricePerQuintal: Number(row.offered_price_per_kg * 100),
        status: row.status,
        createdAt: row.created_at,
        requestedOn: row.created_at ? row.created_at.split("T")[0] : new Date().toISOString().split("T")[0],
      };
    });

    return NextResponse.json({ success: true, data: offers }, { status: 200 });
  } catch (err) {
    console.error("API /api/offers/list error:", err);
    return NextResponse.json(
      { success: false, error: err instanceof Error ? err.message : "Internal server error", data: [] },
      { status: 500 },
    );
  }
}
