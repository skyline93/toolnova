import { Link } from "@/i18n/navigation";
import { getPathname } from "@/i18n/navigation";
import { siteName } from "@/lib/site";
import { Box, Container, Flex, Heading, Text } from "@radix-ui/themes";
import type { Metadata } from "next";
import { getLocale, getTranslations } from "next-intl/server";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const t = await getTranslations({ locale, namespace: "termsPage" });
  const path = await getPathname({ locale, href: "/terms" });
  return {
    title: t("title"),
    description: t("metaDescription", { siteName }),
    alternates: { canonical: path },
  };
}

export default async function TermsPage() {
  const t = await getTranslations("termsPage");

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
                {t("hWarranty")}
              </Heading>
              <Text size="3" color="gray">
                {t("pWarranty")}
              </Text>
            </Box>
            <Box>
              <Heading as="h2" size="4" mb="2" highContrast>
                {t("hAcceptable")}
              </Heading>
              <Text size="3" color="gray">
                {t("pAcceptable")}
              </Text>
            </Box>
            <Box>
              <Heading as="h2" size="4" mb="2" highContrast>
                {t("hChanges")}
              </Heading>
              <Text size="3" color="gray">
                {t("pChanges")}
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
