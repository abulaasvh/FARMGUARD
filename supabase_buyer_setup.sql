-- Create purchase_offers table if it does not exist
CREATE TABLE IF NOT EXISTS public.purchase_offers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    buyer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    farm_id UUID NOT NULL REFERENCES public.farms(id) ON DELETE CASCADE,
    offered_price_per_kg NUMERIC NOT NULL CHECK (offered_price_per_kg > 0),
    quantity_kg NUMERIC NOT NULL CHECK (quantity_kg > 0),
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'completed')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.purchase_offers ENABLE ROW LEVEL SECURITY;

-- Policy: Buyers can view their own purchase offers
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'purchase_offers' AND policyname = 'Buyers can view their own purchase offers'
    ) THEN
        CREATE POLICY "Buyers can view their own purchase offers"
        ON public.purchase_offers
        FOR SELECT
        USING (auth.uid() = buyer_id);
    END IF;
END $$;

-- Policy: Farmers can view offers made on their farms
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'purchase_offers' AND policyname = 'Farmers can view offers for their farms'
    ) THEN
        CREATE POLICY "Farmers can view offers for their farms"
        ON public.purchase_offers
        FOR SELECT
        USING (
            EXISTS (
                SELECT 1 FROM public.farms
                WHERE public.farms.id = public.purchase_offers.farm_id
                AND public.farms.owner_profile_id = auth.uid()
            )
        );
    END IF;
END $$;

-- Policy: Buyers can insert purchase offers under their own buyer_id
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'purchase_offers' AND policyname = 'Buyers can insert their own purchase offers'
    ) THEN
        CREATE POLICY "Buyers can insert their own purchase offers"
        ON public.purchase_offers
        FOR INSERT
        WITH CHECK (auth.uid() = buyer_id);
    END IF;
END $$;

-- Policy: Farmers can update offer statuses for their farms
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'purchase_offers' AND policyname = 'Farmers can update offer status for their farms'
    ) THEN
        CREATE POLICY "Farmers can update offer status for their farms"
        ON public.purchase_offers
        FOR UPDATE
        USING (
            EXISTS (
                SELECT 1 FROM public.farms
                WHERE public.farms.id = public.purchase_offers.farm_id
                AND public.farms.owner_profile_id = auth.uid()
            )
        );
    END IF;
END $$;

-- Enable Supabase Realtime for purchase_offers
ALTER PUBLICATION supabase_realtime ADD TABLE public.purchase_offers;

-- ============================================================
-- BUYER PROFILE FIELDS
-- Add buyer-specific columns to profiles (nullable, ignored by Farmer side)
-- ============================================================
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS company_name    TEXT,
  ADD COLUMN IF NOT EXISTS business_type   TEXT,
  ADD COLUMN IF NOT EXISTS interested_crops TEXT[];

