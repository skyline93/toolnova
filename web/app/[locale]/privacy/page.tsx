import { Link } from "@/i18n/navigation";
import { getPathname } from "@/i18n/navigation";
import { siteName } from "@/lib/site";
import { Box, Container, Flex, Heading, Text } from "@radix-ui/themes";
import type { Metadata } from "next";
import { getLocale, getTranslations } from "next-intl/server";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const t = await getTranslations({ locale, namespace: "privacyPage" });
  const path = await getPathname({ locale, href: "/privacy" });
  return {
    title: t("title"),
    description: t("metaDescription", { siteName }),
    alternates: { canonical: path },
  };
}

export default async function PrivacyPage() {
  const t = await getTranslations("privacyPage");

  return (
    <Box asChild>
      <main>
        <Container size="2" px={{ initial: "4", sm: "6" }} py={{ initial: "8", sm: "9" }}>
          <Heading as="h1" size="7" highContrast>
            {t("title")}
          </Heading>
          <Text size="2" color="gray" mt="3">
            {t("updated")}
          </Text>
          <Flex direction="column" gap="4" mt="8">
            <Text size="3" color="gray" highContrast>
              {t("intro", { siteName })}
            </Text>
            <Box>
              <Heading as="h2" size="4" mb="2" highContrast>
                {t("hLocal")}
              </Heading>
              <Text size="3" color="gray">
                {t("pLocal")}
              </Text>
            </Box>
            <Box>
              <Heading as="h2" size="4" mb="2" highContrast>
                {t("hPdf")}
              </Heading>
              <Text size="3" color="gray">
                {t("pPdf")}
              </Text>
            </Box>
            <Box>
              <Heading as="h2" size="4" mb="2" highContrast>
                {t("hAnalytics")}
              </Heading>
              <Text size="3" color="gray">
                {t("pAnalytics")}
              </Text>
            </Box>
            <Box>
              <Heading as="h2" size="4" mb="2" highContrast>
                {t("hConsent")}
              </Heading>
              <Text size="3" color="gray">
                {t("pConsent")}
              </Text>
            </Box>
            <Box>
              <Heading as="h2" size="4" mb="2" highContrast>
                {t("hAdvertising")}
              </Heading>
              <Text size="3" color="gray">
                {t("pAdvertising")}
              </Text>
            </Box>
            <Box>
              <Heading as="h2" size="4" mb="2" highContrast>
                {t("hContact")}
              </Heading>
              <Text size="3" color="gray">
                {t("pContact")}
              </Text>
            </Box>
            <Text asChild size="3" color="blue" highContrast>
              <Link href="/" style={{ textDecoration: "underline", textUnderlineOffset: "2px" }}>
                {t("backHome")}
              </Link>
            </Text>
          </Flex>
        </Container>
      </main>
    </Box>
  );
}
