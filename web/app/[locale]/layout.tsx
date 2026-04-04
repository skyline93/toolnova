import { AdSlot } from "@/components/ad-slot";
import { ConditionalAnalytics } from "@/components/conditional-analytics";
import { ConsentProvider } from "@/components/consent-context";
import { CookieBanner } from "@/components/cookie-banner";
import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import { routing } from "@/i18n/routing";
import { getSiteUrl, siteName } from "@/lib/site";
import { Geist, Geist_Mono } from "next/font/google";
import { Noto_Sans_SC } from "next/font/google";
import type { Metadata } from "next";
import { hasLocale, NextIntlClientProvider } from "next-intl";
import { getMessages, getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const notoSansSc = Noto_Sans_SC({
  variable: "--font-noto-sc",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

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

  return (
    <html
      lang={locale === "zh-CN" ? "zh-CN" : "en"}
      className={`${geistSans.variable} ${geistMono.variable} ${notoSansSc.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body
        className={`min-h-full flex flex-col ${locale === "zh-CN" ? "locale-zh-cn" : "locale-en"}`}
      >
        <NextIntlClientProvider messages={messages}>
          <ConsentProvider>
            <Header />
            <div className="flex-1">{children}</div>
            <AdSlot />
            <Footer />
            <CookieBanner />
            <ConditionalAnalytics />
          </ConsentProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
