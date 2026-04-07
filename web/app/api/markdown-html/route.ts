import { buildMarkdownExportFullHtml } from "@/lib/markdown-export-document";
import { buildMarkdownExportFontOverrideCss, getMarkdownExportBaseFontPx } from "@/lib/markdown-export-font";
import { loadMarkdownExportCss } from "@/lib/load-markdown-export-css";
import { markdownToPreviewHtmlFragment } from "@/lib/markdown-to-preview-html";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

const MAX_MARKDOWN_CHARS = 1_000_000;
const SAFE_FILENAME = /^[a-zA-Z0-9._-]+\.html$/;

function normalizeFilename(name: unknown): string {
  if (typeof name !== "string" || !SAFE_FILENAME.test(name)) {
    return "export.html";
  }
  return name;
}

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Expected JSON object" }, { status: 400 });
  }

  const rec = body as Record<string, unknown>;
  const markdown = typeof rec.markdown === "string" ? rec.markdown : "";
  const colorMode = rec.color_mode === "dark" ? "dark" : rec.color_mode === "light" ? "light" : null;
  const filename = normalizeFilename(rec.filename);

  if (!colorMode) {
    return NextResponse.json({ error: "color_mode must be \"light\" or \"dark\"" }, { status: 400 });
  }
  if (markdown.length === 0) {
    return NextResponse.json({ error: "markdown must be non-empty" }, { status: 400 });
  }
  if (markdown.length > MAX_MARKDOWN_CHARS) {
    return NextResponse.json({ error: "markdown is too long" }, { status: 400 });
  }

  let fragment: string;
  try {
    fragment = markdownToPreviewHtmlFragment(markdown, colorMode);
  } catch {
    return NextResponse.json({ error: "Could not render Markdown" }, { status: 400 });
  }

  let css: string;
  try {
    css = loadMarkdownExportCss();
  } catch {
    return NextResponse.json({ error: "Export stylesheet is missing" }, { status: 500 });
  }

  const baseFontPx = getMarkdownExportBaseFontPx();
  const fontOverrideCss = buildMarkdownExportFontOverrideCss(baseFontPx);
  const fullHtml = buildMarkdownExportFullHtml(fragment, colorMode, css, fontOverrideCss);

  return new NextResponse(fullHtml, {
    status: 200,
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "no-store",
    },
  });
}
