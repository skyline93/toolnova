import type { Metadata } from "next";
import { ToolShell } from "@/components/tool-shell";

const title = "PDF Merge";
const description =
  "Merge multiple PDF documents into a single file. Uploads are processed on the server only for the duration of the request.";

export const metadata: Metadata = {
  title: "PDF Merge Online Free",
  description,
  alternates: { canonical: "/pdf-merge" },
  openGraph: { title: "PDF Merge Online Free", description },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <ToolShell
      path="/pdf-merge"
      title={title}
      description={description}
      intro="Combine reports or scanned pages in the order you select. Avoid uploading confidential PDFs if you require zero server-side handling."
      category="UtilitiesApplication"
    >
      {children}
    </ToolShell>
  );
}
