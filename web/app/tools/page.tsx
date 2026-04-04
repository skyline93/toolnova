import type { Metadata } from "next";
import Link from "next/link";
import {
  categoryLabels,
  tools,
  type ToolCategory,
} from "@/lib/tools";

export const metadata: Metadata = {
  title: "All tools",
  description:
    "Browse free online utilities: JSON, Base64, UUID, JWT, timestamps, time zones, calculators, PDF merge, and image compression.",
  alternates: { canonical: "/tools" },
};

const order: ToolCategory[] = ["developer", "time", "calculators", "file"];

export default function ToolsIndexPage() {
  const grouped = order.map((c) => ({
    category: c,
    label: categoryLabels[c],
    items: tools.filter((t) => t.category === c),
  }));

  return (
    <main className="mx-auto max-w-5xl px-4 py-10 sm:px-6 sm:py-14">
      <h1 className="text-3xl font-semibold tracking-tight">All tools</h1>
      <p className="mt-3 max-w-2xl text-pretty leading-relaxed text-[var(--muted)]">
        Every tool has its own page for clearer SEO and faster loading. Pick a
        category or jump straight into a utility.
      </p>
      <div className="mt-12 space-y-12">
        {grouped.map((g) => (
          <section key={g.category}>
            <h2 className="text-sm font-semibold uppercase tracking-wide text-[var(--muted)]">
              {g.label}
            </h2>
            <ul className="mt-4 grid gap-4 sm:grid-cols-2">
              {g.items.map((t) => (
                <li key={t.href}>
                  <Link
                    href={t.href}
                    className="tool-card block p-5 transition hover:border-[var(--accent)]/35"
                  >
                    <span className="font-semibold">{t.title}</span>
                    <p className="mt-2 text-sm leading-relaxed text-[var(--muted)]">
                      {t.description}
                    </p>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </main>
  );
}
