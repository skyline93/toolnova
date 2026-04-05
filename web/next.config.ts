import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const nextConfig: NextConfig = {
  output: "standalone",
};

const withNextIntl = createNextIntlPlugin("./i18n/request.ts");
export default withNextIntl({
  ...nextConfig,
  allowedDevOrigins: ['127.0.0.1', '10.168.1.161'],
});
