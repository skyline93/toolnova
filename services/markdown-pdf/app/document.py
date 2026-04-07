from __future__ import annotations

import json
import re
from pathlib import Path

_SERVICE_ROOT = Path(__file__).resolve().parent.parent
_CSS_PATH = _SERVICE_ROOT / "assets" / "markdown-export.css"

# Bundled at assets/mermaid.min.js — run `npm run mermaid:sync-assets` in web/ after bumping mermaid.
_MERMAID_MIN_JS_PATH = _SERVICE_ROOT / "assets" / "mermaid.min.js"
_mermaid_min_js_cache: str | None = None

_MERMAID_PRE_IN_HTML = re.compile(r"<pre\s[^>]*\bmermaid\b", re.IGNORECASE)


def load_mermaid_min_js() -> str:
    global _mermaid_min_js_cache
    if _mermaid_min_js_cache is None:
        _mermaid_min_js_cache = _MERMAID_MIN_JS_PATH.read_text(encoding="utf-8")
    return _mermaid_min_js_cache


def mermaid_pdf_sync_init_script(*, color_mode: str) -> str:
    """
    mermaid.min.js registers `window.addEventListener("load", contentLoaded)` which auto-runs diagrams
    when getConfig().startOnLoad is true (default). That runs BEFORE Playwright can evaluate, may set
    data-processed / partial state so a second run() skips and PDF shows raw source. This script must
    run synchronously immediately after the bundle and before the document `load` event.
    """
    theme = "dark" if str(color_mode).lower() == "dark" else "default"
    cfg = json.dumps(
        {"startOnLoad": False, "theme": theme, "securityLevel": "loose"},
        separators=(",", ":"),
    )
    return f"  <script>\n  globalThis.mermaid.initialize({cfg});\n  </script>\n"


def html_includes_mermaid_pre(fragment: str) -> bool:
    return bool(_MERMAID_PRE_IN_HTML.search(fragment))


def load_export_css() -> str:
    return _CSS_PATH.read_text(encoding="utf-8")


def build_pdf_html(
    *,
    body_inner_html: str,
    color_mode: str,
    font_override_css: str = "",
) -> str:
    css = load_export_css()
    extra_block = ""
    stripped = font_override_css.strip()
    if stripped:
        extra_block = f"  <style>\n{stripped}\n  </style>\n"
    mermaid_script = ""
    if html_includes_mermaid_pre(body_inner_html):
        mermaid_script = (
            f"  <script>\n{load_mermaid_min_js()}\n  </script>\n"
            + mermaid_pdf_sync_init_script(color_mode=color_mode)
        )
    return f"""<!DOCTYPE html>
<html lang="en" data-color-mode="{color_mode}">
<head>
  <meta charset="utf-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1"/>
  <style>
{css}
  </style>
{extra_block}</head>
<body>
{body_inner_html}
{mermaid_script}</body>
</html>"""
