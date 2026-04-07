export const siteName = "Toolnova";

/** Public contact for privacy / site inquiries (mailto in footer & privacy page). */
export const siteContactEmail = "greene9832@gmail.com";

export function getSiteUrl(): string {
  const raw = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (raw) return raw.replace(/\/$/, "");
  return "http://localhost:3000";
}
