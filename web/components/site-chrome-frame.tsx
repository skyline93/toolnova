import { SITE_CONTENT_MAX_WIDTH, SITE_CONTENT_PADDING_X } from "@/lib/site-layout";
import { Box } from "@radix-ui/themes";

/**
 * 与 Radix Container 一致：外层全宽 + 横向 padding，内层 max-width 居中。
 * 用于顶栏、页脚、广告条等，避免「padding 与 max-width 同一层」导致与正文错位。
 */
export function SiteChromeFrame({ children }: { children: React.ReactNode }) {
  return (
    <Box width="100%" px={SITE_CONTENT_PADDING_X}>
      <Box mx="auto" width="100%" style={{ maxWidth: SITE_CONTENT_MAX_WIDTH }}>
        {children}
      </Box>
    </Box>
  );
}
