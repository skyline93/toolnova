import type { Metadata } from "next";
import { ToolShell } from "@/components/tool-shell";

const title = "Base64 Encode / Decode";
const description =
  "Encode text or binary strings to Base64 and decode safely with UTF-8 support.";

export const metadata: Metadata = {
  title: "Base64 Encoder Decoder Online Free",
  description,
  alternates: { canonical: "/base64-encode-decode" },
  openGraph: { title: "Base64 Encoder Decoder Online Free", description },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <ToolShell
      path="/base64-encode-decode"
      title={title}
      description={description}
      intro="Use Base64 for data URLs, HTTP headers, and quick sharing of short payloads. All transformations run locally in your browser."
      category="DeveloperApplication"
    >
      {children}
    </ToolShell>
  );
}
