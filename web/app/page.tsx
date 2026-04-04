import Link from "next/link";
import { siteName } from "@/lib/site";
import { tools } from "@/lib/tools";

export default function Home() {
  return (
    <main className="mx-auto max-w-5xl px-4 py-16 sm:px-6 sm:py-24">
      <p className="text-sm font-medium uppercase tracking-[0.2em] text-[var(--accent)]">
        Free utilities
      </p>
      <h1 className="mt-3 max-w-2xl text-4xl font-semibold tracking-tight text-balance sm:text-5xl">
        Practical tools for developers, files, and everyday dates
      </h1>
      <p className="mt-5 max-w-2xl text-lg leading-relaxed text-[var(--muted)] text-pretty">
        {siteName} runs lightweight utilities in your browser whenever possible. No
        accounts are required for the core toolkit—start with JSON formatting,
        timestamps, time zones, PDF merge, and image compression.
      </p>
      <div className="mt-10 flex flex-wrap gap-3">
        <Link href="/tools" className="tool-btn">
          Browse all tools
        </Link>
        <Link href="/json-formatter" className="tool-btn tool-btn-secondary">
          Open JSON formatter
        </Link>
      </div>
      <section className="mt-20">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-[var(--muted)]">
          Featured
        </h2>
        <ul className="mt-6 grid gap-4 sm:grid-cols-2">
          {tools.slice(0, 4).map((t) => (
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
    </main>
  );
}
