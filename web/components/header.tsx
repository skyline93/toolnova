import Link from "next/link";
import { siteName } from "@/lib/site";

export function Header() {
  return (
    <header className="border-b border-[var(--border)] bg-[var(--surface)]/80 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link
          href="/"
          className="font-semibold tracking-tight text-[var(--foreground)] hover:opacity-90"
        >
          {siteName}
        </Link>
        <nav className="flex items-center gap-4 text-sm font-medium text-[var(--muted)]">
          <Link href="/tools" className="hover:text-[var(--foreground)]">
            Tools
          </Link>
          <Link href="/privacy" className="hover:text-[var(--foreground)]">
            Privacy
          </Link>
          <Link href="/terms" className="hover:text-[var(--foreground)]">
            Terms
          </Link>
        </nav>
      </div>
    </header>
  );
}
