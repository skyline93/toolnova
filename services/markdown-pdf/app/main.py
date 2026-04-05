from __future__ import annotations

import asyncio
import logging
import os
from contextlib import asynccontextmanager
from fastapi import FastAPI, Header, HTTPException, Response
from fastapi.responses import JSONResponse
from playwright.async_api import async_playwright

from app.document import build_pdf_html
from app.models import PdfExportRequest
from app.pdf_render import render_pdf_bytes
from app.sanitize import sanitize_html_fragment

logger = logging.getLogger(__name__)

PDF_TIMEOUT_MS = int(os.getenv("PDF_TIMEOUT_MS", "28000"))
PDF_MAX_CONCURRENT = max(1, int(os.getenv("PDF_MAX_CONCURRENT", "2")))
INTERNAL_API_TOKEN = os.getenv("INTERNAL_API_TOKEN", "").strip()
CHROMIUM_ARGS = (
    "--no-sandbox",
    "--disable-dev-shm-usage",
    "--disable-gpu",
    "--font-render-hinting=none",
)


@asynccontextmanager
async def lifespan(app: FastAPI):
    playwright = await async_playwright().start()
    browser = await playwright.chromium.launch(
        headless=True,
        args=list(CHROMIUM_ARGS),
    )
    app.state.playwright = playwright
    app.state.browser = browser
    app.state.pdf_semaphore = asyncio.Semaphore(PDF_MAX_CONCURRENT)
    logger.info("Playwright Chromium ready (max concurrent=%s)", PDF_MAX_CONCURRENT)
    yield
    await browser.close()
    await playwright.stop()
    logger.info("Playwright stopped")


app = FastAPI(title="Markdown PDF", version="1.0.0", lifespan=lifespan)


def _verify_internal_token(x_internal_token: str | None) -> None:
    if not INTERNAL_API_TOKEN:
        return
    if (x_internal_token or "") != INTERNAL_API_TOKEN:
        raise HTTPException(status_code=401, detail="Unauthorized")


@app.get("/healthz")
async def healthz() -> dict[str, str]:
    browser = getattr(app.state, "browser", None)
    if browser is None:
        return {"status": "starting"}
    return {"status": "ok"}


@app.post("/v1/pdf")
async def export_pdf(
    body: PdfExportRequest,
    x_internal_token: str | None = Header(default=None, alias="X-Internal-Token"),
) -> Response:
    _verify_internal_token(x_internal_token)

    safe_inner = sanitize_html_fragment(body.html)
    if not safe_inner.strip():
        raise HTTPException(status_code=422, detail="HTML body is empty after sanitization")

    full_html = build_pdf_html(body_inner_html=safe_inner, color_mode=body.color_mode)
    browser = app.state.browser
    semaphore: asyncio.Semaphore = app.state.pdf_semaphore

    async with semaphore:
        try:
            pdf_bytes = await render_pdf_bytes(
                browser,
                html=full_html,
                paper=body.paper,
                print_background=body.print_background,
                timeout_ms=PDF_TIMEOUT_MS,
            )
        except Exception:
            logger.exception("PDF render failed")
            return JSONResponse(
                status_code=504,
                content={"detail": "PDF generation timed out or failed"},
            )

    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={
            "Content-Disposition": f'attachment; filename="{body.filename}"',
            "Cache-Control": "no-store",
        },
    )
