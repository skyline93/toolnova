import type { ToolCategory } from "./tools";

export type ToolRoute = {
  path: string;
  /** Key under `toolDefs` and top-level namespace in tools.json */
  messageKey: string;
  category: ToolCategory;
};

/** Pathnames without locale prefix; `Link` / `getPathname` add locale. */
export const toolRoutes: ToolRoute[] = [
  { path: "/markdown-preview", messageKey: "markdownPreview", category: "developer" },
  { path: "/json-formatter", messageKey: "jsonFormatter", category: "developer" },
  { path: "/sql-formatter", messageKey: "sqlFormatter", category: "developer" },
  { path: "/uuid-generator", messageKey: "uuidGenerator", category: "developer" },
  { path: "/base64-encode-decode", messageKey: "base64", category: "developer" },
  { path: "/timestamp-converter", messageKey: "timestamp", category: "developer" },
  { path: "/jwt-decoder", messageKey: "jwt", category: "developer" },
  { path: "/regex-tester", messageKey: "regexTester", category: "developer" },
  { path: "/diff-checker", messageKey: "diffChecker", category: "developer" },
  { path: "/json-to-csv", messageKey: "jsonToCsv", category: "developer" },
  { path: "/cron-expression-generator", messageKey: "cronGenerator", category: "developer" },
  { path: "/time-zone-converter", messageKey: "timeZone", category: "time" },
  { path: "/date-calculator", messageKey: "dateCalculator", category: "calculators" },
  { path: "/age-calculator", messageKey: "ageCalculator", category: "calculators" },
  { path: "/loan-calculator", messageKey: "loanCalculator", category: "calculators" },
  { path: "/roi-calculator", messageKey: "roiCalculator", category: "calculators" },
  { path: "/nd-calculator", messageKey: "ndCalculator", category: "calculators" },
  { path: "/image-compressor", messageKey: "imageCompressor", category: "file" },
  { path: "/pdf-merge", messageKey: "pdfMerge", category: "file" },
  { path: "/color-wheel", messageKey: "colorWheel", category: "daily" },
];
