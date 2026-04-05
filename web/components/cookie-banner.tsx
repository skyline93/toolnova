"use client";

import { Link } from "@/i18n/navigation";
import { useConsent } from "@/components/consent-context";
import { Box, Button, Flex, Text } from "@radix-ui/themes";
import { useTranslations } from "next-intl";
import { useEffect } from "react";

export function CookieBanner() {
  const t = useTranslations("consentBanner");
  const { tier, hydrated, acceptAnalytics, acceptEssentialOnly } = useConsent();

  useEffect(() => {
    if (!hydrated || tier !== "unknown") return;
    const prev = document.body.style.paddingBottom;
    document.body.style.paddingBottom = "calc(7.5rem + env(safe-area-inset-bottom, 0px))";
    return () => {
      document.body.style.paddingBottom = prev;
    };
  }, [hydrated, tier]);

  if (!hydrated || tier !== "unknown") {
    return null;
  }

  return (
    <Box
      position="fixed"
      bottom="0"
      left="0"
      right="0"
      p="3"
      style={{
        zIndex: 200,
        borderTop: "1px solid var(--gray-a6)",
        backgroundColor: "var(--color-panel-solid)",
        boxShadow: "0 -4px 24px rgba(15, 23, 42, 0.08)",
      }}
      role="dialog"
      aria-modal="false"
      aria-labelledby="cookie-banner-title"
    >
      <Flex
        direction={{ initial: "column", sm: "row" }}
        align={{ sm: "center" }}
        justify={{ sm: "between" }}
        gap="4"
        mx="auto"
        style={{ maxWidth: "64rem" }}
      >
        <Flex direction="column" gap="2" className="min-w-0 flex-1">
          <Text id="cookie-banner-title" size="2" weight="bold" highContrast>
            {t("title")}
          </Text>
          <Text size="2" color="gray">
            {t("body")}
          </Text>
          <Text asChild size="2" color="blue" highContrast>
            <Link href="/privacy" style={{ textDecoration: "underline", textUnderlineOffset: "2px" }}>
              {t("privacyLink")}
            </Link>
          </Text>
        </Flex>
        <Flex direction={{ initial: "column", sm: "row" }} gap="2" className="shrink-0">
          <Button size="2" variant="solid" highContrast className="w-full sm:w-auto" onClick={acceptAnalytics}>
            {t("acceptAll")}
          </Button>
          <Button size="2" variant="outline" color="gray" className="w-full sm:w-auto" onClick={acceptEssentialOnly}>
            {t("essentialOnly")}
          </Button>
        </Flex>
      </Flex>
    </Box>
  );
}
