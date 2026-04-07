from __future__ import annotations

from pathlib import Path

_SERVICE_ROOT = Path(__file__).resolve().parent.parent
_CSS_PATH = _SERVICE_ROOT / "assets" / "markdown-export.css"


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
</body>
</html>"""
