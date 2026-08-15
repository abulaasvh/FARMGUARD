import { delay } from "@/utils/format";
import { getSupabaseClient } from "@/lib/supabase";
import { saveSession, clearSession } from "@/lib/session";
import type { AuthUser, UserRole } from "@/types";

export interface LoginPayload {
  email: string;
  password: string;
  remember?: boolean;
  expectedRole?: UserRole;
}

export interface FarmerSignupPayload {
  fullName: string;
  phone: string;
  email: string;
  village: string;
  district: string;
  state: string;
  language: string;
  farmSize: string;
  primaryCrop: string;
  password: string;
  latitude?: number;
  longitude?: number;
}

export interface BuyerSignupPayload {
  companyName: string;
  representativeName: string;
  email: string;
  phone: string;
  businessType: string;
  location: string;
  password: string;
}

export interface BuyerSignupResult {
  user: AuthUser | null;
  requiresConfirmation: boolean;
  message?: string;
}

export interface SignupResult {
  user: AuthUser | null;
  requiresConfirmation: boolean;
  message?: string;
}

function detectRole(email: string): UserRole {
  return /buyer|corp|foods|agro\.in|traders/i.test(email) ? "buyer" : "farmer";
}

async function createProfileAndFarmInSupabase(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  supabase: any,
  userId: string,
  meta: {
    fullName: string;
    phone: string;
    village: string;
    district: string;
    state: string;
    language: string;
    farmSize: string | number;
    primaryCrop: string;
    latitude?: number | null;
    longitude?: number | null;
  },
) {
  try {
    await supabase.from("profiles").upsert({
      id: userId,
      role: "farmer",
      full_name: meta.fullName,
      phone: meta.phone,
      location_text:
        meta.village && meta.district
          ? `${meta.village}, ${meta.district}, ${meta.state}`
          : meta.state,
      preferred_language: meta.language || "en",
    });

    let cropId: string | null = null;
    if (meta.primaryCrop) {
      const { data: existing } = await supabase
        .from("crops")
        .select("id")
        .ilike("name", meta.primaryCrop)
        .limit(1);

      if (existing && existing.length > 0) {
        cropId = existing[0]!.id;
      } else {
        const { data: newCrop } = await supabase
          .from("crops")
          .insert({ name: meta.primaryCrop, category: "Agriculture" })
          .select("id")
          .single();
        if (newCrop) cropId = newCrop.id;
      }
    }

    const { data: farm } = await supabase
      .from("farms")
      .insert({
        owner_profile_id: userId,
        name: meta.village ? `${meta.village} Farm` : "My Farm",
        village: meta.village || null,
        district: meta.district || "Local",
        state: meta.state || "Tamil Nadu",
        total_acres: Number(meta.farmSize) || 1.0,
        primary_crop_id: cropId,
        latitude: meta.latitude ?? null,
        longitude: meta.longitude ?? null,
      })
      .select("id")
      .single();

    if (farm && cropId) {
      await supabase.from("farm_plots").insert({
        farm_id: farm.id,
        crop_id: cropId,
        name: `${meta.primaryCrop || "Primary"} Plot`,
        area_acres: Number(meta.farmSize) || 1.0,
        sowing_date: new Date().toISOString().split("T")[0]!,
        health_score: 90,
      });
    }
  } catch (err) {
    console.error("Error populating profile/farm in Supabase:", err);
  }
}

export async function resolveCurrentSupabaseSession(): Promise<AuthUser | null> {
  const supabase = getSupabaseClient();
  if (!supabase) return null;

  try {
    const { data: authData } = await supabase.auth.getUser();
    const user = authData?.user;
    if (!user) return null;

    const { data: profile } = await supabase
      .from("profiles")
      .select("full_name, location_text, role, company_name, business_type")
      .eq("id", user.id)
      .maybeSingle();

    const profileRecord = profile as Record<string, unknown> | null;
    const meta = user.user_metadata ?? {};

    let role: UserRole;
    if (profileRecord?.role === "buyer" || profileRecord?.role === "farmer") {
      role = profileRecord.role as UserRole;
    } else if (meta.role === "buyer" || meta.role === "farmer") {
      role = meta.role as UserRole;
    } else {
      role = detectRole(user.email ?? "");
    }

    const fullName = profileRecord?.full_name
      ? String(profileRecord.full_name)
      : meta.full_name
        ? String(meta.full_name)
        : role === "farmer"
          ? "Farmer"
          : "Buyer";

    let village: string | undefined;
    let district: string | undefined;
    let state: string | undefined;
    let lat: number | undefined;
    let lon: number | undefined;

    if (role === "farmer") {
      const { data: userFarms } = await supabase
        .from("farms")
        .select("village, district, state, latitude, longitude")
        .eq("owner_profile_id", user.id)
        .limit(1);

      if (userFarms && userFarms.length > 0) {
        const f = userFarms[0]!;
        village = f.village ?? undefined;
        district = f.district ?? undefined;
        state = f.state ?? undefined;
        if (f.latitude != null && !Number.isNaN(Number(f.latitude))) lat = Number(f.latitude);
        if (f.longitude != null && !Number.isNaN(Number(f.longitude))) lon = Number(f.longitude);
      }
    }

    const companyName: string | undefined =
      (profileRecord?.company_name as string | undefined) ?? (meta.company_name as string | undefined);

    const authUser: AuthUser = {
      id: user.id,
      name: fullName,
      email: user.email ?? "",
      role,
      organisation:
        role === "buyer"
          ? (companyName ?? "Buyer Org")
          : village && district
            ? `${village}, ${district}`
            : "Farmer Org",
      location: role === "buyer" ? (state ?? (profileRecord?.location_text as string) ?? "") : (state ?? ""),
      village: role === "buyer" ? undefined : village,
      district: role === "buyer" ? undefined : district,
      state,
      latitude: lat,
      longitude: lon,
    };

    saveSession(authUser);
    return authUser;
  } catch (err) {
    console.error("Error resolving Supabase session:", err);
    return null;
  }
}

export async function login(payload: LoginPayload): Promise<AuthUser> {
  const supabase = getSupabaseClient();
  if (!supabase) {
    throw new Error("Supabase client not configured");
  }

  // Clear any existing session to start from a completely clean state
  clearSession();

  const { data, error } = await supabase.auth.signInWithPassword({
    email: payload.email,
    password: payload.password,
  });

  if (error) {
    if (error.message.toLowerCase().includes("email not confirmed")) {
      throw new Error(
        "Your email address has not been confirmed yet. Please check your inbox for the confirmation link before logging in.",
      );
    }
    throw new Error(error.message || "Could not sign you in. Please check your credentials.");
  }

  const userData = data.user;
  if (!userData) {
    throw new Error("No user returned from Supabase");
  }

  let profileRecord: Record<string, unknown> | null = null;
  try {
    const { data: profile } = await supabase
      .from("profiles")
      .select("full_name, location_text, role, company_name, business_type")
      .eq("id", userData.id)
      .maybeSingle();

    profileRecord = profile as Record<string, unknown> | null;
  } catch (err) {
    console.error("Error loading profile on login:", err);
  }

  // 1. Primary role detection: profiles.role from database
  // 2. Secondary role detection: user_metadata.role from auth user
  // 3. Fallback: detectRole regex
  let role: UserRole;
  if (profileRecord?.role === "buyer" || profileRecord?.role === "farmer") {
    role = profileRecord.role as UserRole;
  } else if (userData.user_metadata?.role === "buyer" || userData.user_metadata?.role === "farmer") {
    role = userData.user_metadata.role as UserRole;
  } else {
    role = detectRole(userData.email ?? payload.email);
  }

  // Enforce role separation if expectedRole is passed
  if (payload.expectedRole && role !== payload.expectedRole) {
    if (role === "farmer") {
      throw new Error("This account is registered as a Farmer account. Please use Farmer Sign In.");
    } else if (role === "buyer") {
      throw new Error("This account is registered as a Buyer account. Please use Buyer Sign In.");
    }
  }

  let village: string | undefined;
  let district: string | undefined;
  let state: string | undefined;
  let lat: number | undefined;
  let lon: number | undefined;

  // Extract farmer full name prioritizing database profiles -> user_metadata -> default
  const meta = userData.user_metadata ?? {};
  let fullName = profileRecord?.full_name
    ? String(profileRecord.full_name)
    : meta.full_name
      ? String(meta.full_name)
      : role === "farmer"
        ? "Farmer"
        : "Buyer";

  try {
    if (!profileRecord && role === "farmer") {
      // Self-heal profile and farm records if signup occurred while email confirmation was pending
      await createProfileAndFarmInSupabase(supabase, userData.id, {
        fullName: fullName || "Farmer",
        phone: (meta.phone as string) || "",
        village: (meta.village as string) || "",
        district: (meta.district as string) || "",
        state: (meta.state as string) || "",
        language: (meta.language as string) || "en",
        farmSize: (meta.farm_size as string) || 1.0,
        primaryCrop: (meta.primary_crop as string) || "",
        latitude: meta.latitude != null ? Number(meta.latitude) : null,
        longitude: meta.longitude != null ? Number(meta.longitude) : null,
      });

      if (meta.village) village = meta.village as string;
      if (meta.district) district = meta.district as string;
      if (meta.state) state = meta.state as string;
      if (meta.latitude != null) lat = Number(meta.latitude);
      if (meta.longitude != null) lon = Number(meta.longitude);
    } else if (!profileRecord && role === "buyer") {
      // Self-heal buyer profile if upsert was skipped during signup
      try {
        await supabase.from("profiles").upsert({
          id: userData.id,
          role: "buyer",
          full_name: fullName || "Buyer",
          phone: (meta.phone as string) || "",
          location_text: (meta.location as string) || "",
          company_name: (meta.company_name as string) || "",
          business_type: (meta.business_type as string) || "",
        });
      } catch (healErr) {
        console.error("Buyer profile self-heal failed:", healErr);
      }
      if (meta.location) state = meta.location as string;
    }

    if (role === "farmer") {
      const { data: userFarms } = await supabase
        .from("farms")
        .select("village, district, state, latitude, longitude")
        .eq("owner_profile_id", userData.id)
        .limit(1);

      if (userFarms && userFarms.length > 0) {
        const f = userFarms[0]!;
        village = f.village ?? village;
        district = f.district ?? district;
        state = f.state ?? state;
        if (f.latitude != null && !Number.isNaN(Number(f.latitude))) lat = Number(f.latitude);
        if (f.longitude != null && !Number.isNaN(Number(f.longitude))) lon = Number(f.longitude);
      }
    }
  } catch (err) {
    console.error("Error populating profile/farm on login:", err);
  }

  const companyName: string | undefined =
    (profileRecord?.company_name as string | undefined) ?? (userData.user_metadata?.company_name as string | undefined);

  const authUser: AuthUser = {
    id: userData.id,
    name: fullName,
    email: userData.email ?? payload.email,
    role,
    organisation:
      role === "buyer"
        ? (companyName ?? "Buyer Org")
        : village && district
          ? `${village}, ${district}`
          : "Farmer Org",
    location: role === "buyer" ? (state ?? (profileRecord?.location_text as string) ?? "") : (state ?? ""),
    village: role === "buyer" ? undefined : village,
    district: role === "buyer" ? undefined : district,
    state,
    latitude: lat,
    longitude: lon,
  };

  saveSession(authUser);
  return authUser;
}

export async function signupFarmer(payload: FarmerSignupPayload): Promise<SignupResult> {
  const supabase = getSupabaseClient();
  let userId = `usr_farmer_${Date.now()}`;

  if (supabase) {
    console.log("[Supabase signUp payload]", {
      email: payload.email,
      fullName: payload.fullName,
      metadata: {
        full_name: payload.fullName,
        role: "farmer",
        email: payload.email,
        phone: payload.phone,
        village: payload.village,
        district: payload.district,
        state: payload.state,
        language: payload.language,
        farm_size: payload.farmSize,
        primary_crop: payload.primaryCrop,
        latitude: payload.latitude ?? null,
        longitude: payload.longitude ?? null,
      },
    });

    const { data: authResult, error: authError } = await supabase.auth.signUp({
      email: payload.email,
      password: payload.password,
      options: {
        data: {
          full_name: payload.fullName,
          role: "farmer",
          email: payload.email,
          phone: payload.phone,
          village: payload.village,
          district: payload.district,
          state: payload.state,
          language: payload.language,
          farm_size: payload.farmSize,
          primary_crop: payload.primaryCrop,
          latitude: payload.latitude ?? null,
          longitude: payload.longitude ?? null,
        },
      },
    });

    console.log("[Supabase signUp response]", {
      user: authResult?.user,
      session: authResult?.session,
      error: authError,
    });

    if (authError) {
      console.error("[Supabase signUp AuthError]", authError);
      throw authError;
    }

    if (!authResult.user) {
      throw new Error("Signup failed. No user was returned from Supabase Auth.");
    }

    userId = authResult.user.id;

    // Check if session was granted immediately (Email Confirmation disabled / auto-confirmed)
    if (authResult.session) {
      await createProfileAndFarmInSupabase(supabase, userId, payload);

      const user: AuthUser = {
        id: userId,
        name: payload.fullName,
        email: payload.email,
        role: "farmer",
        organisation: `${payload.village}, ${payload.district}`,
        location: payload.state,
        village: payload.village,
        district: payload.district,
        state: payload.state,
        latitude: payload.latitude,
        longitude: payload.longitude,
      };

      saveSession(user);
      return { user, requiresConfirmation: false };
    } else {
      // Email confirmation IS required by Supabase project settings.
      // Session is null - this is EXPECTED when email confirmation is enabled.
      return {
        user: null,
        requiresConfirmation: true,
        message: `Account created for ${payload.email}. Please check your inbox for the confirmation email to activate your account before logging in.`,
      };
    }
  } else {
    await delay(700);
    const user: AuthUser = {
      id: userId,
      name: payload.fullName,
      email: payload.email,
      role: "farmer",
      organisation: `${payload.village}, ${payload.district}`,
      location: payload.state,
      village: payload.village,
      district: payload.district,
      state: payload.state,
      latitude: payload.latitude,
      longitude: payload.longitude,
    };
    saveSession(user);
    return { user, requiresConfirmation: false };
  }
}

export async function signupBuyer(payload: BuyerSignupPayload): Promise<BuyerSignupResult> {
  const supabase = getSupabaseClient();

  if (!supabase) {
    // Supabase unavailable — dev fallback only, clearly flagged
    throw new Error(
      "Supabase is not configured. Real buyer signup requires a Supabase connection.",
    );
  }

  const { data: authResult, error: authError } = await supabase.auth.signUp({
    email: payload.email,
    password: payload.password,
    options: {
      data: {
        full_name: payload.representativeName,
        role: "buyer",
        company_name: payload.companyName,
        phone: payload.phone,
        business_type: payload.businessType,
        location: payload.location,
      },
    },
  });

  if (authError) {
    throw new Error(authError.message || "Could not create buyer account. Please try again.");
  }

  if (!authResult.user) {
    throw new Error("Signup failed. No user was returned from Supabase.");
  }

  const userId = authResult.user.id;

  // Upsert buyer profile into profiles table regardless of session state
  // (session may be null if email confirmation is required)
  try {
    await supabase.from("profiles").upsert({
      id: userId,
      role: "buyer",
      full_name: payload.representativeName,
      phone: payload.phone,
      location_text: payload.location,
      company_name: payload.companyName,
      business_type: payload.businessType,
    });
  } catch (profileErr) {
    console.error("Buyer profile upsert failed:", profileErr);
    // Non-fatal: auth user exists, profile will self-heal on next login
  }

  // If Supabase granted a session immediately (email confirmation disabled)
  if (authResult.session) {
    const authUser: AuthUser = {
      id: userId,
      name: payload.representativeName,
      email: payload.email,
      role: "buyer",
      organisation: payload.companyName,
      location: payload.location,
    };
    saveSession(authUser);
    return { user: authUser, requiresConfirmation: false };
  }

  // Email confirmation required — session is null, no mock session saved
  return {
    user: null,
    requiresConfirmation: true,
    message: `Account created for ${payload.email}. Please check your inbox to confirm your email before logging in.`,
  };
}

export async function logout() {
  const supabase = getSupabaseClient();
  if (supabase) {
    await supabase.auth.signOut();
  }
  clearSession();
}
