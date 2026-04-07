from __future__ import annotations

from typing import Literal

from pydantic import BaseModel, Field


class PdfExportRequest(BaseModel):
    html: str = Field(..., max_length=2_000_000, description="Preview-equivalent HTML fragment")
    color_mode: Literal["light", "dark"] = Field(..., description="Matches site preview theme")
    filename: str = Field(
        default="export.pdf",
        max_length=120,
        pattern=r"^[a-zA-Z0-9._-]+\.pdf$",
        description="ASCII-safe download filename",
    )
    paper: Literal["A4", "Letter"] = "A4"
    print_background: bool = True
    font_override_css: str = Field(
        default="",
        max_length=16_384,
        description="Optional CSS after base export styles (e.g. font sizes from Next.js env)",
    )
