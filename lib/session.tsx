"use client";
import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import type { AuthUser } from "@/types";
import { STORAGE_KEYS } from "@/constants";
import { getSupabaseClient } from "@/lib/supabase";

import { resolveCurrentSupabaseSession } from "@/services/auth";

const SessionContext = createContext<AuthUser | null>(null);

const SESSION_EVENT = "farmguard_session_change";

export function SessionProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<AuthUser | null>(() => {
    const loaded = readSession();
    if (loaded) {
      if (loaded.id === "demo" || loaded.id === "usr_mock_buyer" || loaded.id?.startsWith("usr_mock")) {
        clearSession();
        return null;
      }
      return loaded;
    }
    return null;
  });

  useEffect(() => {
    const syncSession = () => {
      const current = readSession();
      if (current && (current.id === "demo" || current.id === "usr_mock_buyer" || current.id?.startsWith("usr_mock"))) {
        clearSession();
        setSession(null);
      } else {
        setSession(current);
      }
    };

    window.addEventListener(SESSION_EVENT, syncSession);
    window.addEventListener("storage", syncSession);

    // Initial check against active Supabase Auth session on client mount
    void resolveCurrentSupabaseSession().then((resolvedUser) => {
      if (resolvedUser) {
        setSession(resolvedUser);
      }
    });

    const supabase = getSupabaseClient();
    let authListener: { subscription: { unsubscribe: () => void } } | null = null;

    if (supabase) {
      const { data } = supabase.auth.onAuthStateChange((event, sbSession) => {
        if (event === "SIGNED_OUT" || !sbSession) {
          clearSession();
          setSession(null);
        } else if (sbSession?.user) {
          void resolveCurrentSupabaseSession().then((resolved) => {
            if (resolved) setSession(resolved);
          });
        }
      });
      authListener = data;
    }

    return () => {
      window.removeEventListener(SESSION_EVENT, syncSession);
      window.removeEventListener("storage", syncSession);
      if (authListener?.subscription) {
        authListener.subscription.unsubscribe();
      }
    };
  }, []);

  return <SessionContext.Provider value={session}>{children}</SessionContext.Provider>;
}

export function useSession() {
  return useContext(SessionContext);
}

/** Persist auth user to localStorage (client-side only). */
export function saveSession(user: AuthUser): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEYS.session, JSON.stringify(user));
    window.dispatchEvent(new CustomEvent(SESSION_EVENT));
  } catch {
    // ignore storage errors
  }
}

/** Remove auth session from localStorage. */
export function clearSession(): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(STORAGE_KEYS.session);
    window.dispatchEvent(new CustomEvent(SESSION_EVENT));
  } catch {
    // ignore
  }
}

/** Read the persisted auth user from localStorage. Returns null if not found. */
export function readSession(): AuthUser | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEYS.session);
    return raw ? (JSON.parse(raw) as AuthUser) : null;
  } catch {
    return null;
  }
}

