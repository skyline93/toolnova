import { Link } from "@/i18n/navigation";
import { toolRoutes } from "@/lib/tool-routes";
import { siteName } from "@/lib/site";
import { getMessages, getTranslations } from "next-intl/server";

type ToolDefCopy = { title: string; description: string };

export default async function HomePage() {
  const t = await getTranslations("home");
  const messages = await getMessages();
  const toolDefs = messages.toolDefs as Record<string, ToolDefCopy>;

  const featured = toolRoutes.slice(0, 4);

  return (
    <main className="mx-auto max-w-5xl px-4 py-16 sm:px-6 sm:py-24">
      <p className="text-sm font-medium uppercase tracking-[0.2em] text-[var(--accent)]">
        {t("eyebrow")}
      </p>
      <h1 className="mt-3 max-w-2xl text-4xl font-semibold tracking-tight text-balance sm:text-5xl">
        {t("headline")}
      </h1>
      <p className="mt-5 max-w-2xl text-lg leading-relaxed text-[var(--muted)] text-pretty">
        {t("lead", { siteName })}
      </p>
      <div className="mt-10 flex flex-wrap gap-3">
        <Link href="/tools" className="tool-btn">
          {t("browseTools")}
        </Link>
        <Link href="/json-formatter" className="tool-btn tool-btn-secondary">
          {t("openJsonFormatter")}
        </Link>
      </div>
      <section className="mt-20">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-[var(--muted)]">
          {t("featured")}
        </h2>
        <ul className="mt-6 grid gap-4 sm:grid-cols-2">
          {featured.map((route) => {
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
    </main>
  );
}
