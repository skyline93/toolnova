import { readFileSync } from "node:fs";
import path from "node:path";
import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

function readPackageVersion(): string {
  try {
    const pkgPath = path.join(process.cwd(), "package.json");
    const raw = readFileSync(pkgPath, "utf8");
    const pkg = JSON.parse(raw) as { version?: string };
    return typeof pkg.version === "string" && pkg.version.length > 0
      ? pkg.version
      : "0.0.0";
  } catch {
    return "0.0.0";
  }
}

const appVersion = readPackageVersion();

const nextConfig: NextConfig = {
  output: "standalone",
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [{ key: "X-Toolnova-Version", value: appVersion }],
      },
    ];
  },
};

const withNextIntl = createNextIntlPlugin("./i18n/request.ts");
export default withNextIntl({
  ...nextConfig,
  allowedDevOrigins: ['127.0.0.1', '10.168.1.161', '10.168.1.169'],
});
