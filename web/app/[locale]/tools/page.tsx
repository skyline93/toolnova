import { SitePageContainer } from "@/components/site-page-container";
import { Link } from "@/i18n/navigation";
import { getPathname } from "@/i18n/navigation";
import { categoryOrder } from "@/lib/tools";
import { toolRoutes } from "@/lib/tool-routes";
import { Box, Card, Flex, Grid, Heading, Text } from "@radix-ui/themes";
import type { Metadata } from "next";
import { getLocale, getMessages, getTranslations } from "next-intl/server";

type ToolDefCopy = { title: string; description: string };

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const t = await getTranslations({ locale, namespace: "toolsIndex" });
  const path = await getPathname({ locale, href: "/tools" });
  const title = t("title");
  const description = t("description");
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: { title, description },
  };
}

export default async function ToolsIndexPage() {
  const t = await getTranslations("toolsIndex");
  const tc = await getTranslations("categories");
  const messages = await getMessages();
  const toolDefs = messages.toolDefs as Record<string, ToolDefCopy>;

  const grouped = categoryOrder.map((c) => ({
    category: c,
    label: tc(c),
    items: toolRoutes.filter((r) => r.category === c),
  }));

  return (
    <Box asChild>
      <main>
        <SitePageContainer py={{ initial: "8", sm: "9" }}>
          <Heading as="h1" size="7" highContrast>
            {t("title")}
          </Heading>
          <Text as="p" size="4" color="gray" mt="3" wrap="pretty" style={{ maxWidth: "42rem" }}>
            {t("lead")}
          </Text>
          <Flex direction="column" gap="9" mt="9">
            {grouped.map((g) => (
              <Box key={g.category}>
                <Heading as="h2" size="3" color="gray" style={{ letterSpacing: "0.06em", textTransform: "uppercase" }}>
                  {g.label}
                </Heading>
                <Grid role="list" columns={{ initial: "1", sm: "2" }} gap="4" mt="4">
                  {g.items.map((route) => {
                    const def = toolDefs[route.messageKey];
                    return (
                      <Box key={route.path} role="listitem">
                        <Card asChild size="3" variant="surface">
                          <Link href={route.path} style={{ textDecoration: "none", color: "inherit", display: "block" }}>
                            <Text as="p" weight="bold" size="3" highContrast>
                              {def.title}
                            </Text>
                            <Text as="p" size="2" color="gray" mt="2" wrap="pretty">
                              {def.description}
                            </Text>
                          </Link>
                        </Card>
                      </Box>
                    );
                  })}
                </Grid>
              </Box>
            ))}
          </Flex>
        </SitePageContainer>
      </main>
    </Box>
  );
}
