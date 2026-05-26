const HUNK_CONTEXT = 3;

export type SplitDiffCellKind = "context" | "del" | "add" | "empty";

export type SplitDiffRow = {
  oldLineNum: number | null;
  newLineNum: number | null;
  oldText: string;
  newText: string;
  leftKind: SplitDiffCellKind;
  rightKind: SplitDiffCellKind;
};

export type SplitDiffHunk = {
  header: string;
  rows: SplitDiffRow[];
};

export type SplitDiffModel = {
  changedLineCount: number;
  hunks: SplitDiffHunk[];
  isEmpty: boolean;
};

function splitLines(text: string): string[] {
  const lines = text.split("\n");
  if (text.endsWith("\n")) lines.push("");
  return lines;
}

function isLineChanged(oldLines: string[], newLines: string[], index: number): boolean {
  return (oldLines[index] ?? "") !== (newLines[index] ?? "");
}

function buildHunkRanges(oldLines: string[], newLines: string[]): Array<{ start: number; end: number }> {
  const n = Math.max(oldLines.length, newLines.length);
  const changed: number[] = [];
  for (let i = 0; i < n; i++) {
    if (isLineChanged(oldLines, newLines, i)) changed.push(i);
  }
  if (changed.length === 0) {
    return n === 0 ? [] : [{ start: 0, end: n - 1 }];
  }

  const ranges: Array<{ start: number; end: number }> = [];
  let start = Math.max(0, changed[0]! - HUNK_CONTEXT);
  let end = Math.min(n - 1, changed[0]! + HUNK_CONTEXT);

  for (let c = 1; c < changed.length; c++) {
    const idx = changed[c]!;
    const nextStart = Math.max(0, idx - HUNK_CONTEXT);
    const nextEnd = Math.min(n - 1, idx + HUNK_CONTEXT);
    if (nextStart <= end + 1) {
      end = nextEnd;
    } else {
      ranges.push({ start, end });
      start = nextStart;
      end = nextEnd;
    }
  }
  ranges.push({ start, end });
  return ranges;
}

function countHunkLines(oldLines: string[], newLines: string[], start: number, end: number) {
  let oldCount = 0;
  let newCount = 0;
  for (let i = start; i <= end; i++) {
    const o = oldLines[i] ?? "";
    const n = newLines[i] ?? "";
    if (o === n) {
      oldCount++;
      newCount++;
    } else {
      if (o !== "") oldCount++;
      if (n !== "") newCount++;
    }
  }
  return { oldCount, newCount };
}

function rowForIndex(oldLines: string[], newLines: string[], index: number): SplitDiffRow {
  const oldL = oldLines[index] ?? "";
  const newL = newLines[index] ?? "";
  const lineNum = index + 1;

  if (oldL === newL) {
    return {
      oldLineNum: lineNum,
      newLineNum: lineNum,
      oldText: oldL,
      newText: newL,
      leftKind: "context",
      rightKind: "context",
    };
  }

  return {
    oldLineNum: oldL === "" ? null : lineNum,
    newLineNum: newL === "" ? null : lineNum,
    oldText: oldL,
    newText: newL,
    leftKind: oldL === "" ? "empty" : "del",
    rightKind: newL === "" ? "empty" : "add",
  };
}

export function buildSplitDiffModel(original: string, masked: string): SplitDiffModel {
  const oldLines = splitLines(original);
  const newLines = splitLines(masked);
  const count = Math.max(oldLines.length, newLines.length);
  let changedLineCount = 0;

  for (let i = 0; i < count; i++) {
    if (isLineChanged(oldLines, newLines, i)) changedLineCount++;
  }

  if (oldLines.length === 0 && newLines.length === 0) {
    return { changedLineCount, hunks: [], isEmpty: true };
  }

  const hunks = buildHunkRanges(oldLines, newLines).map((hunk) => {
    const { oldCount, newCount } = countHunkLines(oldLines, newLines, hunk.start, hunk.end);
    const rows: SplitDiffRow[] = [];
    for (let i = hunk.start; i <= hunk.end; i++) {
      rows.push(rowForIndex(oldLines, newLines, i));
    }
    return {
      header: `@@ -${hunk.start + 1},${oldCount} +${hunk.start + 1},${newCount} @@`,
      rows,
    };
  });

  return { changedLineCount, hunks, isEmpty: false };
}
