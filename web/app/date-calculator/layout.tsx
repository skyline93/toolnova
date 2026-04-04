import type { Metadata } from "next";
import { ToolShell } from "@/components/tool-shell";

const title = "Date Calculator";
const description =
  "Add or subtract days from a date and measure the difference between two calendar dates.";

export const metadata: Metadata = {
  title: "Date Calculator Online Free",
  description,
  alternates: { canonical: "/date-calculator" },
  openGraph: { title: "Date Calculator Online Free", description },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <ToolShell
      path="/date-calculator"
      title={title}
      description={description}
      intro="Plan sprints, contracts, and shipping windows using clear day-based math. Calculations use your browser clock and plain calendar dates (no time-of-day)."
      category="UtilitiesApplication"
    >
      {children}
    </ToolShell>
  );
}
