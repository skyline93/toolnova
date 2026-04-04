import type { Metadata } from "next";
import Link from "next/link";
import { siteName } from "@/lib/site";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: `Terms for using ${siteName} free online tools.`,
  alternates: { canonical: "/terms" },
};

export default function TermsPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-10 sm:px-6 sm:py-14">
      <h1 className="text-3xl font-semibold tracking-tight">Terms of Service</h1>
      <p className="mt-3 text-sm text-[var(--muted)]">Last updated: April 4, 2026</p>
      <div className="prose prose-neutral mt-8 max-w-none space-y-4 text-[var(--muted)] dark:prose-invert">
        <p className="text-[var(--foreground)]">
          By using {siteName}, you agree to these terms. If you disagree, do not
          use the site.
        </p>
        <h2 className="text-lg font-semibold text-[var(--foreground)]">
          No warranties
        </h2>
        <p>
          Tools are provided &quot;as is&quot; without warranties of any kind. We are
          not liable for damages arising from use of the services, including data
          loss or incorrect calculations.
        </p>
        <h2 className="text-lg font-semibold text-[var(--foreground)]">
          Acceptable use
        </h2>
        <p>
          Do not use the services to violate laws, infringe copyrights, upload
          malware, or abuse infrastructure. We may rate-limit or block traffic that
          appears automated or harmful.
        </p>
        <h2 className="text-lg font-semibold text-[var(--foreground)]">Changes</h2>
        <p>
          We may update these terms or discontinue features. Continued use after
          changes means you accept the revised terms.
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
