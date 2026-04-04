import type { ToolCategory } from "./tools";

export type ToolRoute = {
  path: string;
  /** Key under `toolDefs` and top-level namespace in tools.json */
  messageKey: string;
  category: ToolCategory;
};

/** Pathnames without locale prefix; `Link` / `getPathname` add locale. */
export const toolRoutes: ToolRoute[] = [
  { path: "/json-formatter", messageKey: "jsonFormatter", category: "developer" },
  { path: "/uuid-generator", messageKey: "uuidGenerator", category: "developer" },
  { path: "/base64-encode-decode", messageKey: "base64", category: "developer" },
  { path: "/timestamp-converter", messageKey: "timestamp", category: "developer" },
  { path: "/jwt-decoder", messageKey: "jwt", category: "developer" },
  { path: "/time-zone-converter", messageKey: "timeZone", category: "time" },
  { path: "/date-calculator", messageKey: "dateCalculator", category: "calculators" },
  { path: "/age-calculator", messageKey: "ageCalculator", category: "calculators" },
  { path: "/image-compressor", messageKey: "imageCompressor", category: "file" },
  { path: "/pdf-merge", messageKey: "pdfMerge", category: "file" },
];
