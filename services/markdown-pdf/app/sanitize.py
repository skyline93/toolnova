from __future__ import annotations

import nh3

# GFM-ish output from react-markdown + remark-gfm
_ALLOWED_TAGS = frozenset(
    {
        "a",
        "b",
        "blockquote",
        "br",
        "code",
        "del",
        "div",
        "em",
        "h1",
        "h2",
        "h3",
        "h4",
        "h5",
        "h6",
        "hr",
        "i",
        "img",
        "input",
        "li",
        "ol",
        "p",
        "pre",
        "span",
        "strong",
        "table",
        "tbody",
        "td",
        "th",
        "thead",
        "tr",
        "ul",
    }
)

_ALLOWED_ATTRIBUTES: dict[str, set[str]] = {tag: {"class", "id"} for tag in _ALLOWED_TAGS}
_ALLOWED_ATTRIBUTES["a"].update({"href", "title", "rel", "target"})
_ALLOWED_ATTRIBUTES["img"].update({"src", "alt", "title"})
_ALLOWED_ATTRIBUTES["input"].update({"type", "checked", "disabled"})
_ALLOWED_ATTRIBUTES["pre"].update({"tabindex"})
_ALLOWED_ATTRIBUTES["th"].update({"colspan", "rowspan", "align"})
_ALLOWED_ATTRIBUTES["td"].update({"colspan", "rowspan", "align"})

_URL_SCHEMES = frozenset({"http", "https", "mailto", "data", ""})


def sanitize_html_fragment(fragment: str) -> str:
    return nh3.clean(
        fragment,
        tags=_ALLOWED_TAGS,
        attributes=_ALLOWED_ATTRIBUTES,
        url_schemes=_URL_SCHEMES,
        strip_comments=True,
        link_rel=None,
        generic_attribute_prefixes=frozenset({"data-", "aria-"}),
    )
