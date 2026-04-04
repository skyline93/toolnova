"use client";

import CodeMirror from "@uiw/react-codemirror";
import { json } from "@codemirror/lang-json";
import { HighlightStyle, syntaxHighlighting } from "@codemirror/language";
import { tags as t } from "@lezer/highlight";
import { EditorView } from "@codemirror/view";
import { useMemo } from "react";

const jsonHighlight = HighlightStyle.define([
  { tag: t.propertyName, color: "var(--cm-json-key)" },
  { tag: t.string, color: "var(--cm-json-string)" },
  { tag: t.number, color: "var(--cm-json-number)" },
  { tag: t.bool, color: "var(--cm-json-bool)" },
  { tag: t.null, color: "var(--cm-json-null)" },
  { tag: t.separator, color: "var(--cm-json-punct)" },
  { tag: [t.squareBracket, t.brace], color: "var(--cm-json-bracket)" },
]);

const jsonEditorTheme = EditorView.theme({
  "&": { fontSize: "13px" },
  ".cm-editor": {
    borderRadius: "calc(var(--radius) - 4px)",
    outline: "none",
  },
  ".cm-editor.cm-focused": {
    outline: "2px solid var(--cm-json-focus-ring)",
    outlineOffset: "1px",
  },
  ".cm-scroller": {
    fontFamily: "var(--font-geist-mono), ui-monospace, monospace",
    border: "1px solid var(--border)",
    borderRadius: "calc(var(--radius) - 4px)",
    backgroundColor: "var(--background)",
  },
  ".cm-content": {
    caretColor: "var(--cm-json-caret)",
    padding: "0.65rem 0 0.65rem 0.2rem",
  },
  ".cm-placeholder": {
    color: "var(--cm-json-placeholder)",
    opacity: 0.9,
  },
  ".cm-gutters": {
    backgroundColor: "var(--surface)",
    color: "var(--cm-json-placeholder)",
    border: "none",
    borderRight: "1px solid var(--border)",
    borderRadius: "calc(var(--radius) - 4px) 0 0 calc(var(--radius) - 4px)",
  },
  ".cm-lineNumbers .cm-gutterElement": {
    padding: "0 0.35rem 0 0.5rem",
    minWidth: "1.75rem",
  },
  ".cm-activeLineGutter": {
    backgroundColor: "var(--cm-json-active-line-gutter)",
  },
  ".cm-activeLine": {
    backgroundColor: "var(--cm-json-active-line)",
  },
  ".cm-cursor, .cm-dropCursor": {
    borderLeftColor: "var(--cm-json-caret)",
  },
  "&.cm-focused .cm-selectionBackground, .cm-selectionBackground, ::selection": {
    backgroundColor: "var(--cm-json-selection) !important",
  },
  ".cm-foldPlaceholder": {
    backgroundColor: "color-mix(in srgb, var(--cm-json-placeholder) 12%, var(--background))",
    border: "1px solid var(--border)",
    color: "var(--cm-json-placeholder)",
  },
});

const jsonEditorExtensions = [
  json(),
  syntaxHighlighting(jsonHighlight),
  jsonEditorTheme,
  EditorView.lineWrapping,
];

type JsonCodeEditorProps = {
  value: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  readOnly?: boolean;
  "aria-label"?: string;
};

export function JsonCodeEditor({
  value,
  onChange,
  placeholder,
  readOnly = false,
  "aria-label": ariaLabel,
}: JsonCodeEditorProps) {
  const extensions = useMemo(() => jsonEditorExtensions, []);

  return (
    <div className="json-code-editor w-full" aria-label={ariaLabel}>
      <div className="json-code-editor-shell">
        <CodeMirror
          value={value}
          height="100%"
          theme="none"
          className="min-h-0 flex-1"
          extensions={extensions}
          placeholder={placeholder}
          readOnly={readOnly}
          editable={!readOnly}
          basicSetup={{
            lineNumbers: true,
            foldGutter: true,
            highlightActiveLine: !readOnly,
            highlightActiveLineGutter: !readOnly,
            autocompletion: false,
          }}
          onChange={readOnly ? undefined : onChange}
        />
      </div>
    </div>
  );
}
