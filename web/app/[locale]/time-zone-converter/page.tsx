"use client";

import { useLocale, useTranslations } from "next-intl";
import { useLayoutEffect, useMemo, useState } from "react";

function getZones(): string[] {
  try {
    const fn = (
      Intl as unknown as { supportedValuesOf?: (k: string) => string[] }
    ).supportedValuesOf;
    if (typeof fn === "function") return fn("timeZone").slice().sort();
  } catch {
    /* ignore */
  }
  return [
    "UTC",
    "America/New_York",
    "America/Los_Angeles",
    "Europe/London",
    "Europe/Paris",
    "Asia/Tokyo",
    "Asia/Shanghai",
    "Australia/Sydney",
  ];
}

function formatInZone(iso: string, zone: string, locale: string) {
  const d = new Date(iso);
  const loc = locale === "zh-CN" ? "zh-CN" : "en-US";
  return new Intl.DateTimeFormat(loc, {
    timeZone: zone,
    dateStyle: "full",
    timeStyle: "long",
  }).format(d);
}

export default function TimeZoneConverterPage() {
  const t = useTranslations("timeZone");
  const tc = useTranslations("common");
  const locale = useLocale();
  const zones = useMemo(() => getZones(), []);
  const [a, setA] = useState("America/New_York");
  const [b, setB] = useState("Europe/London");
  const [iso, setIso] = useState("");

  useLayoutEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- post-mount init
    setIso(new Date().toISOString().slice(0, 16));
  }, []);

  const instant = useMemo(() => {
    const d = new Date(iso);
    return Number.isNaN(d.getTime()) ? null : d;
  }, [iso]);

  return (
    <div className="space-y-6">
      <label className="block max-w-md space-y-2">
        <span className="text-sm font-medium text-[var(--muted)]">{t("labelDt")}</span>
        <input
          type="datetime-local"
          className="tool-input"
          value={iso}
          onChange={(e) => setIso(e.target.value)}
        />
      </label>
      <div className="grid gap-4 lg:grid-cols-2">
        <label className="space-y-2">
          <span className="text-sm font-medium text-[var(--muted)]">{t("zoneA")}</span>
          <select className="tool-input" value={a} onChange={(e) => setA(e.target.value)}>
            {zones.map((z) => (
              <option key={z} value={z}>
                {z}
              </option>
            ))}
          </select>
        </label>
        <label className="space-y-2">
          <span className="text-sm font-medium text-[var(--muted)]">{t("zoneB")}</span>
          <select className="tool-input" value={b} onChange={(e) => setB(e.target.value)}>
            {zones.map((z) => (
              <option key={z} value={z}>
                {z}
              </option>
            ))}
          </select>
        </label>
      </div>
      {iso === "" ? (
        <p className="text-sm text-[var(--muted)]">{tc("loading")}</p>
      ) : !instant ? (
        <p className="text-sm text-[var(--danger)]">{t("invalid")}</p>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          <div className="tool-card p-4 text-sm leading-relaxed">
            <p className="font-semibold text-[var(--foreground)]">{a}</p>
            <p className="mt-2 text-[var(--muted)]">
              {formatInZone(instant.toISOString(), a, locale)}
            </p>
          </div>
          <div className="tool-card p-4 text-sm leading-relaxed">
            <p className="font-semibold text-[var(--foreground)]">{b}</p>
            <p className="mt-2 text-[var(--muted)]">
              {formatInZone(instant.toISOString(), b, locale)}
            </p>
          </div>
        </div>
      )}
      <section className="tool-card space-y-3 p-5 text-sm leading-relaxed text-[var(--muted)]">
        <h2 className="font-semibold text-[var(--foreground)]">{t("howTitle")}</h2>
        <p>{t("howBody")}</p>
      </section>
    </div>
  );
}
