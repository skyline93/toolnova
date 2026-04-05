import { JsonLd, webApplicationJsonLd } from "@/components/json-ld";
import { getPathname, Link } from "@/i18n/navigation";
import { getSiteUrl } from "@/lib/site";
import { Box, Container, Heading, Text } from "@radix-ui/themes";
import { getLocale, getTranslations } from "next-intl/server";

export async function ToolShell({
  href,
  title,
  description,
  intro,
  category,
  children,
}: {
  href: string;
  title: string;
  description: string;
  intro: string;
  category?: string;
  children: React.ReactNode;
}) {
  const locale = await getLocale();
  const pathname = await getPathname({ locale, href });
  const url = `${getSiteUrl()}${pathname}`;
  const t = await getTranslations({ locale, namespace: "common" });

  return (
    <>
      <JsonLd
        data={webApplicationJsonLd({
          name: title,
          description,
          url,
          category,
        })}
      />
      <Box asChild>
        <main>
          <Container size="4" px={{ initial: "4", sm: "6" }} py={{ initial: "8", sm: "9" }}>
            <Text asChild size="2" weight="medium" color="indigo" highContrast>
              <Link href="/tools" style={{ textDecoration: "none" }}>
                {t("allToolsLink")}
              </Link>
            </Text>
            <Heading as="h1" size="7" mt="4" wrap="balance" highContrast>
              {title}
            </Heading>
            <Text as="p" size="4" color="gray" mt="3" style={{ maxWidth: "48rem" }} wrap="pretty">
              {intro}
            </Text>
            <Box mt="8">{children}</Box>
          </Container>
        </main>
      </Box>
    </>
  );
}
