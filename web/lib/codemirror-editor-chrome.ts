import { EditorView } from "@codemirror/view";

/** Radix-aligned shell on top of `@uiw/codemirror-theme-github` (font, border, canvas). */
export const codemirrorEditorChrome = EditorView.theme({
  "&": { fontSize: "13px" },
  ".cm-editor": {
    borderRadius: "var(--radius-3)",
    outline: "none",
  },
  ".cm-editor.cm-focused": {
    outline: "2px solid var(--focus-8)",
    outlineOffset: "1px",
  },
  ".cm-scroller": {
    fontFamily: "var(--font-geist-mono), ui-monospace, monospace",
    border: "1px solid var(--gray-a6)",
    borderRadius: "var(--radius-3)",
    backgroundColor: "var(--color-background)",
  },
  ".cm-content": {
    caretColor: "var(--accent-11)",
    padding: "0.65rem 0 0.65rem 0.2rem",
  },
  ".cm-placeholder": {
    color: "var(--gray-11)",
    opacity: 0.9,
  },
  ".cm-gutters": {
    backgroundColor: "var(--gray-2)",
    color: "var(--gray-11)",
    border: "none",
    borderRight: "1px solid var(--gray-a6)",
    borderRadius: "var(--radius-3) 0 0 var(--radius-3)",
  },
  ".cm-lineNumbers .cm-gutterElement": {
    padding: "0 0.35rem 0 0.5rem",
    minWidth: "1.75rem",
  },
  ".cm-activeLineGutter": {
    backgroundColor: "var(--accent-a3)",
  },
  ".cm-activeLine": {
    backgroundColor: "var(--accent-a2)",
  },
  ".cm-cursor, .cm-dropCursor": {
    borderLeftColor: "var(--accent-11)",
  },
  ".cm-line ::selection": {
    backgroundColor: "var(--focus-a5) !important",
  },
  ".cm-foldPlaceholder": {
    backgroundColor: "var(--gray-a3)",
    border: "1px solid var(--gray-a6)",
    color: "var(--gray-11)",
  },
});
