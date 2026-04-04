import { PDFDocument } from "pdf-lib";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

const MAX_FILES = 8;
const MAX_FILE_BYTES = 12 * 1024 * 1024;
const MAX_TOTAL_BYTES = 40 * 1024 * 1024;

export async function POST(request: Request) {
  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return NextResponse.json({ error: "Invalid form data" }, { status: 400 });
  }

  const files = form.getAll("files").filter((v): v is File => v instanceof File);
  if (files.length === 0) {
    return NextResponse.json({ error: "No PDF files provided" }, { status: 400 });
  }
  if (files.length > MAX_FILES) {
    return NextResponse.json(
      { error: `Too many files (max ${MAX_FILES})` },
      { status: 400 },
    );
  }

  let total = 0;
  for (const file of files) {
    const looksPdf =
      file.name.toLowerCase().endsWith(".pdf") || file.type === "application/pdf";
    if (!looksPdf) {
      return NextResponse.json(
        { error: "Only PDF files are supported" },
        { status: 400 },
      );
    }
    if (file.size > MAX_FILE_BYTES) {
      return NextResponse.json(
        { error: `Each file must be under ${MAX_FILE_BYTES / (1024 * 1024)}MB` },
        { status: 400 },
      );
    }
    total += file.size;
  }
  if (total > MAX_TOTAL_BYTES) {
    return NextResponse.json({ error: "Combined upload size too large" }, { status: 400 });
  }

  try {
    const merged = await PDFDocument.create();
    for (const file of files) {
      const bytes = new Uint8Array(await file.arrayBuffer());
      const doc = await PDFDocument.load(bytes, { ignoreEncryption: true });
      const copied = await merged.copyPages(doc, doc.getPageIndices());
      copied.forEach((page) => merged.addPage(page));
    }
    const pdfBytes = await merged.save();
    return new NextResponse(pdfBytes as unknown as BodyInit, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": 'attachment; filename="merged.pdf"',
        "Cache-Control": "no-store",
      },
    });
  } catch {
    return NextResponse.json(
      { error: "Could not merge PDFs. Files may be encrypted or corrupted." },
      { status: 422 },
    );
  }
}
