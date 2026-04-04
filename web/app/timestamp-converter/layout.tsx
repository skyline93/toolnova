import type { Metadata } from "next";
import { ToolShell } from "@/components/tool-shell";

const title = "Timestamp Converter";
const description =
  "Convert Unix seconds, milliseconds, and ISO-8601 timestamps with local and UTC views.";

export const metadata: Metadata = {
  title: "Unix Timestamp Converter Online Free",
  description,
  alternates: { canonical: "/timestamp-converter" },
  openGraph: { title: "Unix Timestamp Converter Online Free", description },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <ToolShell
      path="/timestamp-converter"
      title={title}
      description={description}
      intro="Debug APIs and logs by jumping between epoch values and human-readable dates. Everything is calculated locally."
      category="DeveloperApplication"
    >
      {children}
    </ToolShell>
  );
}
