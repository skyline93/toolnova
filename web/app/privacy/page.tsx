import type { Metadata } from "next";
import Link from "next/link";
import { siteName } from "@/lib/site";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: `How ${siteName} handles analytics, uploads, and local processing.`,
  alternates: { canonical: "/privacy" },
};

export default function PrivacyPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-10 sm:px-6 sm:py-14">
      <h1 className="text-3xl font-semibold tracking-tight">Privacy Policy</h1>
      <p className="mt-3 text-sm text-[var(--muted)]">Last updated: April 4, 2026</p>
      <div className="prose prose-neutral mt-8 max-w-none space-y-4 text-[var(--muted)] dark:prose-invert">
        <p className="text-[var(--foreground)]">
          {siteName} (&quot;we&quot;) provides free online tools. This page explains
          what data may be collected and how uploads are handled.
        </p>
        <h2 className="text-lg font-semibold text-[var(--foreground)]">
          Local processing
        </h2>
        <p>
          Many utilities (JSON, Base64, UUID, timestamps, JWT decode, time zones,
          date math, image compression) run entirely in your browser. That
          processing does not leave your device unless you explicitly download a
          file.
        </p>
        <h2 className="text-lg font-semibold text-[var(--foreground)]">PDF merge</h2>
        <p>
          When you merge PDFs, files are sent to our server only for the duration
          of the request. We do not use your documents for training or marketing.
          Temporary data should be discarded immediately after the response is
          sent—avoid uploading sensitive documents if your threat model requires
          zero server transit.
        </p>
        <h2 className="text-lg font-semibold text-[var(--foreground)]">Analytics</h2>
        <p>
          We may use Google Analytics 4 to understand aggregate traffic. You can
          control cookies through your browser and any consent banner we enable when
          advertising partners are added.
        </p>
        <h2 className="text-lg font-semibold text-[var(--foreground)]">Contact</h2>
        <p>
          For privacy questions, contact the site operator using the address
          published on this domain once available.
        </p>
        <p>
          <Link href="/" className="text-[var(--accent)] hover:underline">
            Back to home
          </Link>
        </p>
      </div>
    </main>
  );
}
