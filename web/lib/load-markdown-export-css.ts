import { readFileSync } from "fs";
import { join } from "path";

let cached: string | null = null;

/** Export stylesheet; same content as services/markdown-pdf/assets/markdown-export.css (keep in sync). */
export function loadMarkdownExportCss(): string {
  if (cached !== null) {
    return cached;
  }
  const filePath = join(process.cwd(), "assets", "markdown-export.css");
  cached = readFileSync(filePath, "utf8");
  return cached;
}
