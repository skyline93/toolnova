export type ToolCategory = "developer" | "file" | "time" | "calculators";

export type ToolDef = {
  href: string;
  title: string;
  description: string;
  category: ToolCategory;
};

export const tools: ToolDef[] = [
  {
    href: "/json-formatter",
    title: "JSON Formatter",
    description: "Format, validate, and minify JSON in your browser.",
    category: "developer",
  },
  {
    href: "/uuid-generator",
    title: "UUID Generator",
    description: "Generate random UUID v4 identifiers instantly.",
    category: "developer",
  },
  {
    href: "/base64-encode-decode",
    title: "Base64 Encode / Decode",
    description: "Encode or decode Base64 with proper UTF-8 handling.",
    category: "developer",
  },
  {
    href: "/timestamp-converter",
    title: "Timestamp Converter",
    description: "Convert Unix time, milliseconds, and ISO-8601 strings.",
    category: "developer",
  },
  {
    href: "/jwt-decoder",
    title: "JWT Decoder",
    description: "Inspect JWT header and payload (decode only, no verification).",
    category: "developer",
  },
  {
    href: "/time-zone-converter",
    title: "Time Zone Converter",
    description: "Compare times across IANA time zones with DST awareness.",
    category: "time",
  },
  {
    href: "/date-calculator",
    title: "Date Calculator",
    description: "Add or subtract days and compute the difference between dates.",
    category: "calculators",
  },
  {
    href: "/age-calculator",
    title: "Age Calculator",
    description: "Calculate exact age from a birth date.",
    category: "calculators",
  },
  {
    href: "/image-compressor",
    title: "Image Compressor",
    description: "Shrink JPG, PNG, and WebP images locally in your browser.",
    category: "file",
  },
  {
    href: "/pdf-merge",
    title: "PDF Merge",
    description: "Combine multiple PDF files into one download.",
    category: "file",
  },
];

export const categoryLabels: Record<ToolCategory, string> = {
  developer: "Developer tools",
  file: "File tools",
  time: "Time & date",
  calculators: "Calculators",
};
