import type { Metadata } from "next";
import { ToolShell } from "@/components/tool-shell";

const title = "Time Zone Converter";
const description =
  "Compare local times across IANA time zones and convert a specific instant between regions.";

export const metadata: Metadata = {
  title: "Time Zone Converter Online Free",
  description,
  alternates: { canonical: "/time-zone-converter" },
  openGraph: { title: "Time Zone Converter Online Free", description },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <ToolShell
      path="/time-zone-converter"
      title={title}
      description={description}
      intro="Plan meetings and deploy windows with accurate daylight saving handling. Pick two zones and anchor everything to a single instant."
      category="UtilitiesApplication"
    >
      {children}
    </ToolShell>
  );
}
