import Link from "next/link";
import { siteName } from "@/lib/site";

export function Footer() {
  return (
    <footer className="mt-auto border-t border-[var(--border)] bg-[var(--surface)]">
      <div className="mx-auto flex max-w-5xl flex-col gap-2 px-4 py-8 text-sm text-[var(--muted)] sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <p>
          © {new Date().getFullYear()} {siteName}. Free online utilities.
        </p>
        <div className="flex flex-wrap gap-4">
          <Link href="/tools" className="hover:text-[var(--foreground)]">
            All tools
          </Link>
          <Link href="/privacy" className="hover:text-[var(--foreground)]">
            Privacy
          </Link>
          <Link href="/terms" className="hover:text-[var(--foreground)]">
            Terms
          </Link>
        </div>
      </div>
    </footer>
  );
}
