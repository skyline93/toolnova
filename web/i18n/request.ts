import { hasLocale } from "next-intl";
import { getRequestConfig } from "next-intl/server";
import { routing } from "./routing";

export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale;
  const locale = hasLocale(routing.locales, requested)
    ? requested
    : routing.defaultLocale;

  const [common, tools] = await Promise.all([
    import(`../messages/${locale}/common.json`),
    import(`../messages/${locale}/tools.json`),
  ]);

  return {
    locale,
    messages: { ...common.default, ...tools.default },
  };
});
