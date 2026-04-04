import { Link } from "@/i18n/navigation";
import { categoryOrder } from "@/lib/tools";
import { toolRoutes } from "@/lib/tool-routes";
import type { Metadata } from "next";
import { getLocale, getMessages, getTranslations } from "next-intl/server";
import { getPathname } from "@/i18n/navigation";

type ToolDefCopy = { title: string; description: string };

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const t = await getTranslations({ locale, namespace: "toolsIndex" });
  const path = await getPathname({ locale, href: "/tools" });
  const title = t("title");
  const description = t("description");
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: { title, description },
  };
}

export default async function ToolsIndexPage() {
  const t = await getTranslations("toolsIndex");
  const tc = await getTranslations("categories");
  const messages = await getMessages();
  const toolDefs = messages.toolDefs as Record<string, ToolDefCopy>;

  const grouped = categoryOrder.map((c) => ({
    category: c,
    label: tc(c),
    items: toolRoutes.filter((r) => r.category === c),
  }));

  return (
    <main className="mx-auto max-w-5xl px-4 py-10 sm:px-6 sm:py-14">
      <h1 className="text-3xl font-semibold tracking-tight">{t("title")}</h1>
      <p className="mt-3 max-w-2xl text-pretty leading-relaxed text-[var(--muted)]">
        {t("lead")}
      </p>
      <div className="mt-12 space-y-12">
        {grouped.map((g) => (
          <section key={g.category}>
            <h2 className="text-sm font-semibold uppercase tracking-wide text-[var(--muted)]">
              {g.label}
            </h2>
            <ul className="mt-4 grid gap-4 sm:grid-cols-2">
              {g.items.map((route) => {
                const def = toolDefs[route.messageKey];
                return (
                  <li key={route.path}>
                    <Link
                      href={route.path}
                      className="tool-card block p-5 transition hover:border-[var(--accent)]/35"
                    >
                      <span className="font-semibold">{def.title}</span>
                      <p className="mt-2 text-sm leading-relaxed text-[var(--muted)]">
                        {def.description}
                      </p>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </section>
        ))}
      </div>
    </main>
  );
}
