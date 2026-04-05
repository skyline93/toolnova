import { LanguageSwitcher } from "@/components/language-switcher";
import { SiteChromeFrame } from "@/components/site-chrome-frame";
import { Link } from "@/i18n/navigation";
import { siteName } from "@/lib/site";
import { Box, Flex, Separator, Text } from "@radix-ui/themes";
import { getTranslations } from "next-intl/server";

export async function Header() {
  const t = await getTranslations("nav");

  return (
    <Box
      asChild
      style={{
        borderBottom: "1px solid var(--gray-a6)",
        backgroundColor: "var(--color-panel-solid)",
        boxShadow: "0 1px 3px rgba(15, 23, 42, 0.06)",
      }}
    >
      <header>
        <SiteChromeFrame>
          <Flex align="center" justify="between" gap="4" wrap="wrap" py="3">
            <Text asChild weight="bold" size="4" highContrast>
              <Link href="/" style={{ textDecoration: "none", color: "inherit" }}>
                {siteName}
              </Link>
            </Text>
            <Flex align="center" gap={{ initial: "3", sm: "4" }} wrap="wrap">
              <Text asChild size="2" color="gray">
                <Link href="/tools" style={{ textDecoration: "none" }}>
                  {t("tools")}
                </Link>
              </Text>
              <Separator orientation="vertical" size="2" />
              <LanguageSwitcher />
            </Flex>
          </Flex>
        </SiteChromeFrame>
      </header>
    </Box>
  );
}
