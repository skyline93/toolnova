"use client";

import CodeMirror from "@uiw/react-codemirror";
import { sql } from "@codemirror/lang-sql";
import { EditorView } from "@codemirror/view";
import { codemirrorEditorChrome } from "@/lib/codemirror-editor-chrome";
import { useGithubCodemirrorTheme } from "@/lib/use-github-codemirror-theme";
import type { SqlToolDialectId } from "@/lib/sql-tool-dialects";
import { getSqlDialectCm } from "@/lib/sql-tool-dialects";
import { useMemo } from "react";

type SqlCodeEditorProps = {
  value: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  readOnly?: boolean;
  dialectId: SqlToolDialectId;
  "aria-label"?: string;
};

export function SqlCodeEditor({
  value,
  onChange,
  placeholder,
  readOnly = false,
  dialectId,
  "aria-label": ariaLabel,
}: SqlCodeEditorProps) {
  const githubTheme = useGithubCodemirrorTheme();
  const extensions = useMemo(() => {
    const dialect = getSqlDialectCm(dialectId);
    return [sql({ dialect }), githubTheme, codemirrorEditorChrome, EditorView.lineWrapping];
  }, [dialectId, githubTheme]);

  return (
    <div className="sql-code-editor w-full" aria-label={ariaLabel}>
      <div className="json-code-editor-shell">
        <CodeMirror
          value={value}
          height="100%"
          theme="none"
          className="min-h-0 flex-1"
          extensions={extensions}
          placeholder={placeholder}
          readOnly={readOnly}
          /* Keep contenteditable so users can drag-select and copy; readOnly facet blocks edits */
          editable
          basicSetup={{
            lineNumbers: true,
            foldGutter: true,
            highlightActiveLine: !readOnly,
            highlightActiveLineGutter: !readOnly,
            autocompletion: false,
            /* Theme ships `syntaxHighlighting`; disable basic-setup default */
            syntaxHighlighting: false,
            drawSelection: false,
          }}
          onChange={readOnly ? undefined : onChange}
        />
      </div>
    </div>
  );
}
