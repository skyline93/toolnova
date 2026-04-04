import type { Metadata } from "next";
import { ToolShell } from "@/components/tool-shell";

const title = "JSON Formatter";
const description =
  "Format, validate, and minify JSON online for free. Your text stays in the browser by default.";

export const metadata: Metadata = {
  title: "JSON Formatter Online Free",
  description,
  alternates: { canonical: "/json-formatter" },
  openGraph: { title: "JSON Formatter Online Free", description },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <ToolShell
      path="/json-formatter"
      title={title}
      description={description}
      intro="Paste JSON to beautify it, catch syntax errors, or minify payloads before shipping them to an API. Processing happens locally in your browser."
      category="DeveloperApplication"
    >
      {children}
    </ToolShell>
  );
}
