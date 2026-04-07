export function buildMarkdownExportFullHtml(
  bodyInnerHtml: string,
  colorMode: "light" | "dark",
  css: string,
  fontOverrideCss: string,
): string {
  return `<!DOCTYPE html>
<html lang="en" data-color-mode="${colorMode}">
<head>
  <meta charset="utf-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1"/>
  <style>
${css}
  </style>
  <style>
${fontOverrideCss}
  </style>
</head>
<body>
${bodyInnerHtml}
</body>
</html>`;
}
