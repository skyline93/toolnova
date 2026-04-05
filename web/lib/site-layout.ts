/**
 * 站点主内容列：与 Radix `<Container size="4">` 一致（`--container-4`）。
 * 页眉、页脚、广告位等请用 `SiteChromeFrame`（外层 padding + 内层 max-width），勿在同一节点上同时写 max-width 与 px。
 * 正文请用 `SitePageContainer`，或 `<Container size="4" px={SITE_CONTENT_PADDING_X}>`.
 */
export const SITE_CONTENT_MAX_WIDTH = "var(--container-4)";

export const SITE_CONTENT_PADDING_X = { initial: "4", sm: "6" } as const;
