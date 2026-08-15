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

export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get("authorization");
    const supabase = getSupabaseServerClient(authHeader);

    if (!supabase) {
      return NextResponse.json(
        { success: false, error: "Supabase client unavailable" },
        { status: 503 },
      );
    }

    const body = await request.json();
    const { farm_id, offered_price_per_kg, quantity_kg, buyer_id: rawBuyerId } = body ?? {};

    // Determine authenticated user and target buyer_id
    const { data: authUser } = await supabase.auth.getUser();
    const currentUserId = authUser?.user?.id;

    if (!currentUserId) {
      return NextResponse.json(
        { success: false, error: "Unauthorized session. Please log in first." },
        { status: 401 },
      );
    }

    let buyerId = currentUserId;

    // Check if the current user is the owner of the farm (Farmer sending offer to a specific buyer)
    if (rawBuyerId && typeof rawBuyerId === "string" && rawBuyerId !== currentUserId) {
      const { data: farmData } = await supabase
        .from("farms")
        .select("owner_profile_id")
        .eq("id", farm_id)
        .maybeSingle();

      if (farmData?.owner_profile_id === currentUserId) {
        buyerId = rawBuyerId;
      }
    }


    if (!farm_id || typeof farm_id !== "string") {
      return NextResponse.json(
        { success: false, error: "Invalid or missing farm ID" },
        { status: 400 },
      );
    }

    const price = Number(offered_price_per_kg);
    if (isNaN(price) || price <= 0) {
      return NextResponse.json(
        { success: false, error: "Invalid price per kg. Must be a positive number." },
        { status: 400 },
      );
    }

    const qty = Number(quantity_kg);
    if (isNaN(qty) || qty <= 0) {
      return NextResponse.json(
        { success: false, error: "Invalid quantity in kg. Must be a positive number." },
        { status: 400 },
      );
    }

    // Verify farm exists in Supabase
    const { data: farm, error: farmErr } = await supabase
      .from("farms")
      .select("id")
      .eq("id", farm_id)
      .maybeSingle();

    if (farmErr || !farm) {
      // If farm_id is a mock ID, check if any farm exists or insert mock row fallback
      console.warn("Farm lookup failed or not found for ID:", farm_id);
    }

    const { data: offer, error: insertError } = await supabase
      .from("purchase_offers")
      .insert({
        buyer_id: buyerId,
        farm_id,
        offered_price_per_kg: price,
        quantity_kg: qty,
        status: "pending",
      })
      .select("id, buyer_id, farm_id, offered_price_per_kg, quantity_kg, status, created_at")
      .single();

    if (insertError) {
      console.error("Supabase purchase_offers insert error:", insertError);
      return NextResponse.json(
        { success: false, error: insertError.message || "Failed to create purchase offer" },
        { status: 500 },
      );
    }

    return NextResponse.json(
      { success: true, data: offer },
      { status: 201 },
    );
  } catch (err) {
    console.error("API /api/offers/create error:", err);
    return NextResponse.json(
      { success: false, error: err instanceof Error ? err.message : "Internal server error" },
      { status: 500 },
    );
  }
}
