export const CONSENT_STORAGE_KEY = "toolnova-cookie-consent";

export type ConsentTier = "unknown" | "analytics" | "essential";

export function readStoredConsent(): ConsentTier {
  if (typeof window === "undefined") return "unknown";
  const v = localStorage.getItem(CONSENT_STORAGE_KEY);
  if (v === "analytics" || v === "essential") return v;
  return "unknown";
}

export function writeStoredConsent(tier: "analytics" | "essential") {
  localStorage.setItem(CONSENT_STORAGE_KEY, tier);
}
