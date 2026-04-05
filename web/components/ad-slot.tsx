"use client";

import { SiteChromeFrame } from "@/components/site-chrome-frame";
import { useConsent } from "@/components/consent-context";
import { Box, Flex, Text } from "@radix-ui/themes";
import { useTranslations } from "next-intl";
import { useEffect, useRef } from "react";

declare global {
  interface Window {
    adsbygoogle?: Record<string, unknown>[];
  }
}

const adsenseClient = process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID?.trim();
const adsenseSlot = process.env.NEXT_PUBLIC_ADSENSE_SLOT_FOOTER?.trim();

/** Reserved display unit (~leaderboard). Fixed min-height reduces CLS when ads load. */
export function AdSlot() {
  const t = useTranslations("adSlot");
  const { tier, hydrated } = useConsent();
  const pushed = useRef(false);

  const showAd = hydrated && tier === "analytics" && Boolean(adsenseClient && adsenseSlot);

  useEffect(() => {
    if (!showAd || pushed.current) return;
    let attempts = 0;
    const id = window.setInterval(() => {
      attempts += 1;
      if (window.adsbygoogle) {
        try {
          window.adsbygoogle.push({});
          pushed.current = true;
        } catch {
          /* ad block or fill error */
        }
        window.clearInterval(id);
      } else if (attempts > 100) {
        window.clearInterval(id);
      }
    }, 100);
    return () => window.clearInterval(id);
  }, [showAd]);

  return (
    <Box asChild aria-label={t("ariaLabel")}>
      <aside>
        <SiteChromeFrame>
          <Box py="4">
            <Box
              data-ad-slot-root
              style={{
                display: "flex",
                minHeight: "120px",
                width: "100%",
                alignItems: "center",
                justifyContent: "center",
                overflow: "hidden",
                borderRadius: "var(--radius-3)",
                border: "1px dashed var(--gray-a7)",
                backgroundColor: "var(--color-background)",
                boxShadow: "0 1px 3px rgba(15, 23, 42, 0.06)",
              }}
            >
              {showAd ? (
                <ins
                  className="adsbygoogle block w-full min-h-[100px] max-w-[728px]"
                  style={{ display: "block" }}
                  data-ad-client={adsenseClient}
                  data-ad-slot={adsenseSlot}
                  data-ad-format="horizontal"
                  data-full-width-responsive="true"
                />
              ) : (
                <Flex align="center" justify="center" px="4" py="8">
                  <Text size="1" color="gray" align="center">
                    {t("placeholder")}
                  </Text>
                </Flex>
              )}
            </Box>
          </Box>
        </SiteChromeFrame>
      </aside>
    </Box>
  );
}
