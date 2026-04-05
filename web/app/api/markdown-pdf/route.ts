import { markdownToPreviewHtmlFragment } from "@/lib/markdown-to-preview-html";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

const MAX_MARKDOWN_CHARS = 1_000_000;
const SAFE_FILENAME = /^[a-zA-Z0-9._-]+\.pdf$/;

function normalizeFilename(name: unknown): string {
  if (typeof name !== "string" || !SAFE_FILENAME.test(name)) {
    return "export.pdf";
  }
  return name;
}

export async function POST(request: Request) {
  const pdfBase = process.env.PDF_SERVICE_URL?.trim();
  if (!pdfBase) {
    return NextResponse.json({ error: "PDF_SERVICE_URL is not configured" }, { status: 503 });
  }

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

  let html: string;
  try {
    html = markdownToPreviewHtmlFragment(markdown, colorMode);
  } catch {
    return NextResponse.json({ error: "Could not render Markdown" }, { status: 400 });
  }

  const pdfUrl = `${pdfBase.replace(/\/$/, "")}/v1/pdf`;
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  const secret = process.env.PDF_SERVICE_SECRET?.trim();
  if (secret) {
    headers["X-Internal-Token"] = secret;
  }

  let pdfRes: Response;
  try {
    pdfRes = await fetch(pdfUrl, {
      method: "POST",
      headers,
      body: JSON.stringify({
        html,
        color_mode: colorMode,
        filename,
        paper: "A4",
        print_background: true,
      }),
      signal: AbortSignal.timeout(60_000),
    });
  } catch {
    return NextResponse.json({ error: "Could not reach PDF service" }, { status: 502 });
  }

  if (!pdfRes.ok) {
    let detail: string | undefined;
    try {
      const errJson = (await pdfRes.json()) as { detail?: unknown };
      if (typeof errJson.detail === "string") {
        detail = errJson.detail;
      }
    } catch {
      /* ignore */
    }
    return NextResponse.json(
      { error: "PDF service returned an error", detail, status: pdfRes.status },
      { status: 502 },
    );
  }

  const cd = pdfRes.headers.get("Content-Disposition");
  const outHeaders = new Headers();
  outHeaders.set("Content-Type", "application/pdf");
  outHeaders.set("Cache-Control", "no-store");
  if (cd) {
    outHeaders.set("Content-Disposition", cd);
  } else {
    outHeaders.set("Content-Disposition", `attachment; filename="${filename}"`);
  }

  return new NextResponse(pdfRes.body, { status: 200, headers: outHeaders });
}
