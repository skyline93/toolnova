import type { Metadata } from "next";
import { ToolShell } from "@/components/tool-shell";

const title = "Age Calculator";
const description =
  "Calculate exact age in years, months, and days from a birth date through today or a custom date.";

export const metadata: Metadata = {
  title: "Age Calculator Online Free",
  description,
  alternates: { canonical: "/age-calculator" },
  openGraph: { title: "Age Calculator Online Free", description },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <ToolShell
      path="/age-calculator"
      title={title}
      description={description}
      intro="Answer how old someone is on a specific day using calendar-aware math. Useful for forms, games, and compliance checks."
      category="UtilitiesApplication"
    >
      {children}
    </ToolShell>
  );
}
