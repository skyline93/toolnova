import type { Metadata } from "next";
import { ToolShell } from "@/components/tool-shell";

const title = "JWT Decoder";
const description =
  "Decode JWT headers and payloads for debugging. This tool does not verify signatures or secrets.";

export const metadata: Metadata = {
  title: "JWT Decoder Online Free",
  description,
  alternates: { canonical: "/jwt-decoder" },
  openGraph: { title: "JWT Decoder Online Free", description },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <ToolShell
      path="/jwt-decoder"
      title={title}
      description={description}
      intro="Inspect JSON Web Tokens without sending them to a server. Decoding is for troubleshooting only—never treat output as trusted without signature verification."
      category="DeveloperApplication"
    >
      {children}
    </ToolShell>
  );
}
