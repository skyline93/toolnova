"use client";

import type { SplitDiffCellKind, SplitDiffModel } from "@/lib/text-desensitize-split-diff";
import styles from "./text-desensitize-split-diff.module.css";

function SplitCell({
  lineNum,
  text,
  kind,
}: {
  lineNum: number | null;
  text: string;
  kind: SplitDiffCellKind;
}) {
  const kindClass =
    kind === "del"
      ? styles.cellDel
      : kind === "add"
        ? styles.cellAdd
        : kind === "empty"
          ? styles.cellEmpty
          : styles.cellContext;

  return (
    <div className={`${styles.cell} ${kindClass}`}>
      <span className={styles.num}>{lineNum == null ? "" : String(lineNum)}</span>
      <span className={styles.code}>{text === "" && kind === "empty" ? "\u00a0" : text}</span>
    </div>
  );
}

export function TextDesensitizeSplitDiff({
  model,
  placeholder,
  fileLabel,
  leftColLabel,
  rightColLabel,
}: {
  model: SplitDiffModel | null;
  placeholder: string;
  fileLabel: string;
  leftColLabel: string;
  rightColLabel: string;
}) {
  if (!model) {
    return (
      <div className={styles.split} aria-label={placeholder}>
        <p className={styles.placeholder}>{placeholder}</p>
      </div>
    );
  }

  if (model.isEmpty) {
    return (
      <div className={styles.split}>
        <div className={styles.scroll}>
          <div className={styles.fileHeader}>{fileLabel}</div>
          <div className={styles.colHeaders}>
            <span>{leftColLabel}</span>
            <span>{rightColLabel}</span>
          </div>
          <p className={styles.placeholder} style={{ minHeight: "8rem" }}>
            —
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.split} aria-label={placeholder}>
      <div className={styles.scroll}>
        <div className={styles.fileHeader}>{fileLabel}</div>
        <div className={styles.colHeaders}>
          <span>{leftColLabel}</span>
          <span>{rightColLabel}</span>
        </div>
        <div>
          {model.hunks.map((hunk, hi) => (
            <div key={hi}>
              <div className={styles.hunk}>{hunk.header}</div>
              {hunk.rows.map((row, ri) => (
                <div key={ri} className={styles.row}>
                  <SplitCell lineNum={row.oldLineNum} text={row.oldText} kind={row.leftKind} />
                  <SplitCell lineNum={row.newLineNum} text={row.newText} kind={row.rightKind} />
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
