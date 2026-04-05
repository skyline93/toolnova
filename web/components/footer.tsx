import { Link } from "@/i18n/navigation";
import { siteName } from "@/lib/site";
import { Box, Flex, Text } from "@radix-ui/themes";
import { getTranslations } from "next-intl/server";

export async function Footer() {
  const t = await getTranslations("footer");
  const tn = await getTranslations("nav");

  return (
    <Box
      asChild
      mt="auto"
      style={{
        borderTop: "1px solid var(--gray-a6)",
        backgroundColor: "var(--color-panel-solid)",
      }}
    >
      <footer>
        <Flex
          direction={{ initial: "column", sm: "row" }}
          align={{ sm: "center" }}
          justify={{ sm: "between" }}
          gap="2"
          px={{ initial: "4", sm: "6" }}
          py="3"
          mx="auto"
          style={{ maxWidth: "64rem" }}
        >
          <Text size="2" color="gray">
            © {new Date().getFullYear()} {siteName}. {t("tagline")}
          </Text>
          <Flex gap="4" wrap="wrap">
            <Text asChild size="2" color="gray">
              <Link href="/tools" style={{ textDecoration: "none" }}>
                {t("allTools")}
              </Link>
            </Text>
            <Text asChild size="2" color="gray">
              <Link href="/privacy" style={{ textDecoration: "none" }}>
                {tn("privacy")}
              </Link>
            </Text>
            <Text asChild size="2" color="gray">
              <Link href="/terms" style={{ textDecoration: "none" }}>
                {tn("terms")}
              </Link>
            </Text>
          </Flex>
        </Flex>
      </footer>
    </Box>
  );
}
