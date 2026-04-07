import { AdSlot } from "@/components/ad-slot";
import { ConditionalAnalytics } from "@/components/conditional-analytics";
import { ConsentProvider } from "@/components/consent-context";
import { CookieBanner } from "@/components/cookie-banner";
import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import { routing } from "@/i18n/routing";
import { geistMono, geistSans } from "@/app/fonts";
import { getSiteUrl, siteName } from "@/lib/site";
import type { Metadata } from "next";
import { SiteThemeProvider } from "@/components/site-theme-provider";
import { SITE_THEME_STORAGE_KEY, serverHtmlIsDark } from "@/lib/site-theme";
import { hasLocale, NextIntlClientProvider } from "next-intl";
import { getMessages, getTranslations, setRequestLocale } from "next-intl/server";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";

const siteUrl = getSiteUrl();

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "rootMeta" });
  const ogLocale = locale === "zh-CN" ? "zh_CN" : "en_US";
  return {
    metadataBase: new URL(siteUrl),
    title: {
      default: t("titleDefault", { siteName }),
      template: `%s | ${siteName}`,
    },
    description: t("description"),
    openGraph: {
      type: "website",
      locale: ogLocale,
      siteName,
      url: siteUrl,
    },
    twitter: {
      card: "summary_large_image",
    },
    alternates: {
      canonical: locale === routing.defaultLocale ? "/" : `/${locale}`,
      languages: {
        en: "/",
        "zh-CN": "/zh-CN",
        "x-default": "/",
      },
    },
  };
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  setRequestLocale(locale);

  const messages = await getMessages();

  const cookieStore = await cookies();
  const themeCookie = cookieStore.get(SITE_THEME_STORAGE_KEY)?.value;
  const htmlDark = serverHtmlIsDark(themeCookie);

  return (
    <html
      lang={locale === "zh-CN" ? "zh-CN" : "en"}
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased${htmlDark ? " dark" : ""}`}
      suppressHydrationWarning
    >
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Noto+Sans+SC:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-full">
        <NextIntlClientProvider messages={messages}>
          <ConsentProvider>
            <SiteThemeProvider
              localeClass={locale === "zh-CN" ? "locale-zh-cn" : "locale-en"}
              serverThemeCookie={themeCookie}
            >
              <Header />
              <div className="min-h-0 flex-1">{children}</div>
              <AdSlot />
              <Footer />
              <CookieBanner />
              <ConditionalAnalytics />
            </SiteThemeProvider>
          </ConsentProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
