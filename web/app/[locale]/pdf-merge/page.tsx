"use client";

import { Card, Flex, Heading, Text } from "@radix-ui/themes";
import { useTranslations } from "next-intl";
import { useCallback, useState } from "react";

export default function PdfMergePage() {
  const t = useTranslations("pdfMerge");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const merge = useCallback(
    async (files: FileList | null) => {
      setError(null);
      if (!files || files.length === 0) {
        setError(t("errorNone"));
        return;
      }
      setBusy(true);
      try {
        const form = new FormData();
        Array.from(files).forEach((f) => form.append("files", f));
        const res = await fetch("/api/merge-pdf", {
          method: "POST",
          body: form,
        });
        if (!res.ok) {
          const data = (await res.json().catch(() => null)) as { error?: string } | null;
          setError(data?.error ?? t("errorFail"));
          return;
        }
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "merged.pdf";
        a.click();
        URL.revokeObjectURL(url);
      } catch {
        setError(t("errorNetwork"));
      } finally {
        setBusy(false);
      }
    },
    [t],
  );

  return (
    <Flex direction="column" gap="6">
      <Flex direction="column" gap="2">
        <Text size="2" weight="medium">
          {t("files")}
        </Text>
        <input
          type="file"
          accept="application/pdf,.pdf"
          multiple
          className="radix-file-input"
          disabled={busy}
          onChange={(e) => void merge(e.target.files)}
        />
      </Flex>
      <Text size="2" color="gray">
        {t("limits")}
      </Text>
      {error ? (
        <Text size="2" color="red" role="alert">
          {error}
        </Text>
      ) : null}
      {busy ? (
        <Text size="2" color="gray">
          {t("merging")}
        </Text>
      ) : null}
      <Card size="3" variant="surface">
        <Heading as="h2" size="4" highContrast>
          {t("howTitle")}
        </Heading>
        <Text as="p" size="2" color="gray" mt="3" wrap="pretty">
          {t("howBody")}
        </Text>
      </Card>
    </Flex>
  );
}
