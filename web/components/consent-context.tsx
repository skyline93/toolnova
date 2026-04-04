"use client";

import { type ConsentTier, readStoredConsent, writeStoredConsent } from "@/lib/consent-storage";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  startTransition,
} from "react";

type ConsentContextValue = {
  tier: ConsentTier;
  hydrated: boolean;
  acceptAnalytics: () => void;
  acceptEssentialOnly: () => void;
};

const ConsentContext = createContext<ConsentContextValue | null>(null);

export function ConsentProvider({ children }: { children: React.ReactNode }) {
  const [tier, setTier] = useState<ConsentTier>("unknown");
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    startTransition(() => {
      setTier(readStoredConsent());
      setHydrated(true);
    });
  }, []);

  const acceptAnalytics = useCallback(() => {
    writeStoredConsent("analytics");
    setTier("analytics");
  }, []);

  const acceptEssentialOnly = useCallback(() => {
    writeStoredConsent("essential");
    setTier("essential");
  }, []);

  const value = useMemo(
    () => ({
      tier,
      hydrated,
      acceptAnalytics,
      acceptEssentialOnly,
    }),
    [tier, hydrated, acceptAnalytics, acceptEssentialOnly],
  );

  return <ConsentContext.Provider value={value}>{children}</ConsentContext.Provider>;
}

export function useConsent() {
  const ctx = useContext(ConsentContext);
  if (!ctx) {
    throw new Error("useConsent must be used within ConsentProvider");
  }
  return ctx;
}
