import { LanguageSwitcher } from "@/components/language-switcher";
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
        backgroundColor: "var(--color-panel-translucent)",
        backdropFilter: "blur(12px)",
      }}
    >
      <header>
        <Flex align="center" justify="between" gap="4" wrap="wrap" px={{ initial: "4", sm: "6" }} py="3" mx="auto" style={{ maxWidth: "64rem" }}>
          <Text asChild weight="bold" size="4" highContrast>
            <Link href="/" style={{ textDecoration: "none", color: "inherit" }}>
              {siteName}
            </Link>
          </Text>
          <Flex align="center" gap={{ initial: "3", sm: "4" }} wrap="wrap">
            <Flex align="center" gap="4" wrap="wrap">
              <Text asChild size="2" color="gray">
                <Link href="/tools" style={{ textDecoration: "none" }}>
                  {t("tools")}
                </Link>
              </Text>
              <Text asChild size="2" color="gray">
                <Link href="/privacy" style={{ textDecoration: "none" }}>
                  {t("privacy")}
                </Link>
              </Text>
              <Text asChild size="2" color="gray">
                <Link href="/terms" style={{ textDecoration: "none" }}>
                  {t("terms")}
                </Link>
              </Text>
            </Flex>
            <Separator orientation="vertical" size="2" />
            <LanguageSwitcher />
          </Flex>
        </Flex>
      </header>
    </Box>
  );
}
