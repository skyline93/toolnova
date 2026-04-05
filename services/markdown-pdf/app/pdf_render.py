from __future__ import annotations

from typing import TYPE_CHECKING

if TYPE_CHECKING:
    from playwright.async_api import Browser


async def render_pdf_bytes(
    browser: Browser,
    *,
    html: str,
    paper: str,
    print_background: bool,
    timeout_ms: int,
) -> bytes:
    context = await browser.new_context()
    try:
        page = await context.new_page()
        await page.set_content(html, wait_until="load", timeout=timeout_ms)
        fmt = "A4" if paper == "A4" else "Letter"
        return await page.pdf(
            format=fmt,
            print_background=print_background,
            margin={"top": "12mm", "bottom": "12mm", "left": "14mm", "right": "14mm"},
        )
    finally:
        await context.close()
