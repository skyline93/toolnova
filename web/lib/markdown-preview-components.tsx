"use client";

import type { Components } from "react-markdown";
import { Children, isValidElement, type ReactNode } from "react";

import { MermaidPreviewBlock } from "@/components/mermaid-preview-block";

/** `react-markdown` code blocks often pass nested elements; `String(children)` yields `[object Object]`. */
function reactNodeToPlainText(node: ReactNode): string {
  if (node == null || typeof node === "boolean") return "";
  if (typeof node === "string" || typeof node === "number") return String(node);
  if (Array.isArray(node)) return node.map(reactNodeToPlainText).join("");
  if (isValidElement(node)) {
    const props = node.props as { children?: ReactNode };
    return reactNodeToPlainText(props.children);
  }
  return "";
}

function mermaidSourceFromPreChildren(children: ReactNode): string | null {
  const walk = (node: ReactNode): string | null => {
    for (const child of Children.toArray(node)) {
      if (!isValidElement(child)) continue;
      const props = child.props as { className?: string; children?: ReactNode };
      const cls = String(props.className ?? "");
      if (/\blanguage-mermaid\b/.test(cls)) {
        return reactNodeToPlainText(props.children).replace(/\n$/, "");
      }
      const inner = walk(props.children);
      if (inner !== null) return inner;
    }
    return null;
  };
  return walk(children);
}

export function createMarkdownPreviewComponents(colorMode: "light" | "dark"): Components {
  return {
    a: ({ href, children, ...rest }) => {
      if (!href || href.toLowerCase().startsWith("javascript:") || href.toLowerCase().startsWith("data:")) {
        return <span>{children}</span>;
      }
      const external = href.startsWith("http://") || href.startsWith("https://");
      return (
        <a href={href} {...rest} target={external ? "_blank" : undefined} rel={external ? "noopener noreferrer" : undefined}>
          {children}
        </a>
      );
    },
    pre: ({ children, ...rest }) => {
      const source = mermaidSourceFromPreChildren(children);
      if (source !== null) {
        return <MermaidPreviewBlock source={source} colorMode={colorMode} />;
      }
      return <pre {...rest}>{children}</pre>;
    },
  };
}
