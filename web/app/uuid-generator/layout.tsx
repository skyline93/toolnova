import type { Metadata } from "next";
import { ToolShell } from "@/components/tool-shell";

const title = "UUID Generator";
const description =
  "Generate RFC 4122 UUID v4 identifiers in bulk. Cryptographically random values for APIs and databases.";

export const metadata: Metadata = {
  title: "UUID Generator Online Free",
  description,
  alternates: { canonical: "/uuid-generator" },
  openGraph: { title: "UUID Generator Online Free", description },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <ToolShell
      path="/uuid-generator"
      title={title}
      description={description}
      intro="Create version 4 UUIDs using your browser's secure random source. Copy a single value or generate a batch for seed data."
      category="DeveloperApplication"
    >
      {children}
    </ToolShell>
  );
}
