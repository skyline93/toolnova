from __future__ import annotations

from typing import TYPE_CHECKING

from app.document import html_includes_mermaid_pre

if TYPE_CHECKING:
    from playwright.async_api import Browser


# Sync init (startOnLoad: false) is injected in document.build_pdf_html before `load`.
# Clear data-processed so a stray auto-run cannot block this pass.
_MERMAID_RUN_JS = """
async () => {
  if (typeof globalThis.mermaid === "undefined") return;
  const pres = document.querySelectorAll("pre.mermaid");
  if (pres.length === 0) return;
  for (const el of pres) {
    el.removeAttribute("data-processed");
  }
  await globalThis.mermaid.run({ nodes: Array.from(pres) });
}
"""


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
        if html_includes_mermaid_pre(html):
            # Library is inlined in HTML (no CDN); no wait_for_function needed.
            await page.evaluate(_MERMAID_RUN_JS)
        fmt = "A4" if paper == "A4" else "Letter"
        return await page.pdf(
            format=fmt,
            print_background=print_background,
            margin={"top": "12mm", "bottom": "12mm", "left": "14mm", "right": "14mm"},
        )
    finally:
        await context.close()
