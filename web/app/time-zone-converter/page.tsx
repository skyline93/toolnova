"use client";

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

function formatInZone(iso: string, zone: string) {
  const d = new Date(iso);
  return new Intl.DateTimeFormat("en-US", {
    timeZone: zone,
    dateStyle: "full",
    timeStyle: "long",
  }).format(d);
}

export default function TimeZoneConverterPage() {
  const zones = useMemo(() => getZones(), []);
  const [a, setA] = useState("America/New_York");
  const [b, setB] = useState("Europe/London");
  const [iso, setIso] = useState("");

  useLayoutEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- post-mount init; clock differs SSR vs client
    setIso(new Date().toISOString().slice(0, 16));
  }, []);

  const instant = useMemo(() => {
    const d = new Date(iso);
    return Number.isNaN(d.getTime()) ? null : d;
  }, [iso]);

  return (
    <div className="space-y-6">
      <label className="block max-w-md space-y-2">
        <span className="text-sm font-medium text-[var(--muted)]">
          Local datetime (interpreted in your browser zone)
        </span>
        <input
          type="datetime-local"
          className="tool-input"
          value={iso}
          onChange={(e) => setIso(e.target.value)}
        />
      </label>
      <div className="grid gap-4 lg:grid-cols-2">
        <label className="space-y-2">
          <span className="text-sm font-medium text-[var(--muted)]">Time zone A</span>
          <select className="tool-input" value={a} onChange={(e) => setA(e.target.value)}>
            {zones.map((z) => (
              <option key={z} value={z}>
                {z}
              </option>
            ))}
          </select>
        </label>
        <label className="space-y-2">
          <span className="text-sm font-medium text-[var(--muted)]">Time zone B</span>
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
        <p className="text-sm text-[var(--muted)]">Loading…</p>
      ) : !instant ? (
        <p className="text-sm text-[var(--danger)]">Pick a valid date and time.</p>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          <div className="tool-card p-4 text-sm leading-relaxed">
            <p className="font-semibold text-[var(--foreground)]">{a}</p>
            <p className="mt-2 text-[var(--muted)]">{formatInZone(instant.toISOString(), a)}</p>
          </div>
          <div className="tool-card p-4 text-sm leading-relaxed">
            <p className="font-semibold text-[var(--foreground)]">{b}</p>
            <p className="mt-2 text-[var(--muted)]">{formatInZone(instant.toISOString(), b)}</p>
          </div>
        </div>
      )}
      <section className="tool-card space-y-3 p-5 text-sm leading-relaxed text-[var(--muted)]">
        <h2 className="font-semibold text-[var(--foreground)]">How to use</h2>
        <p>
          Choose a calendar moment using the datetime control, then select two IANA
          zones. We render the same instant in both locations so you can see DST
          offsets without manual math.
        </p>
      </section>
    </div>
  );
}
