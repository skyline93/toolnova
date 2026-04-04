import type { Metadata } from "next";
import { ToolShell } from "@/components/tool-shell";

const title = "Image Compressor";
const description =
  "Compress JPG, PNG, and WebP images in the browser before upload. Optional max width and quality controls.";

export const metadata: Metadata = {
  title: "Image Compressor Online Free",
  description,
  alternates: { canonical: "/image-compressor" },
  openGraph: { title: "Image Compressor Online Free", description },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <ToolShell
      path="/image-compressor"
      title={title}
      description={description}
      intro="Shrink photos for email attachments or faster web uploads. Files stay on-device; we never persist your originals."
      category="UtilitiesApplication"
    >
      {children}
    </ToolShell>
  );
}
