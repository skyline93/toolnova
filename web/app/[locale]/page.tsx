import { Link } from "@/i18n/navigation";
import { toolRoutes } from "@/lib/tool-routes";
import { siteName } from "@/lib/site";
import { Box, Button, Card, Container, Flex, Grid, Heading, Text } from "@radix-ui/themes";
import { getMessages, getTranslations } from "next-intl/server";

type ToolDefCopy = { title: string; description: string };

export default async function HomePage() {
  const t = await getTranslations("home");
  const eyebrow = t("eyebrow");
  const messages = await getMessages();
  const toolDefs = messages.toolDefs as Record<string, ToolDefCopy>;

  const featured = toolRoutes.slice(0, 4);

  return (
    <Box asChild>
      <main>
        <Container size="4" px={{ initial: "4", sm: "6" }} py={{ initial: "9", sm: "12" }}>
          <Text
            size="2"
            weight="medium"
            color="blue"
            highContrast
            aria-hidden={!eyebrow}
            style={{ letterSpacing: "0.2em", textTransform: "uppercase" }}
          >
            {eyebrow || "\u00a0"}
          </Text>
          <Heading as="h1" size="8" mt="3" wrap="balance" style={{ maxWidth: "42rem" }} highContrast>
            {t("headline")}
          </Heading>
          <Text as="p" size="5" color="gray" mt="5" wrap="pretty" style={{ maxWidth: "42rem" }}>
            {t("lead", { siteName })}
          </Text>
          <Flex gap="3" mt="8" wrap="wrap">
            <Button asChild size="3" variant="solid" highContrast>
              <Link href="/tools">{t("browseTools")}</Link>
            </Button>
            <Button asChild size="3" variant="outline" color="gray">
              <Link href="/markdown-preview">{t("openMarkdownPreview")}</Link>
            </Button>
          </Flex>
          <Box mt="9">
            <Heading as="h2" size="3" color="gray" style={{ letterSpacing: "0.06em", textTransform: "uppercase" }}>
              {t("featured")}
            </Heading>
            <Grid role="list" columns={{ initial: "1", sm: "2" }} gap="4" mt="6">
              {featured.map((route) => {
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
        </Container>
      </main>
    </Box>
  );
}
