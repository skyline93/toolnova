"use client";

import imageCompression from "browser-image-compression";
import { Button, Card, Flex, Grid, Heading, Text, TextField } from "@radix-ui/themes";
import { useTranslations } from "next-intl";
import { useCallback, useState } from "react";

const MAX_BYTES = 10 * 1024 * 1024;

export default function ImageCompressorPage() {
  const t = useTranslations("imageCompressor");
  const tc = useTranslations("common");
  const [quality, setQuality] = useState(0.8);
  const [maxWidth, setMaxWidth] = useState(1920);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [beforeSize, setBeforeSize] = useState<number | null>(null);
  const [afterSize, setAfterSize] = useState<number | null>(null);
  const [url, setUrl] = useState<string | null>(null);

  const onFile = useCallback(
    async (file: File) => {
      setError(null);
      if (!file.type.startsWith("image/")) {
        setError(t("errorType"));
        return;
      }
      if (file.size > MAX_BYTES) {
        setError(t("errorSize", { mb: MAX_BYTES / (1024 * 1024) }));
        return;
      }
      setBusy(true);
      if (url) URL.revokeObjectURL(url);
      setUrl(null);
      setBeforeSize(file.size);
      setAfterSize(null);
      try {
        const compressed = await imageCompression(file, {
          maxWidthOrHeight: maxWidth,
          initialQuality: quality,
          useWebWorker: true,
        });
        setAfterSize(compressed.size);
        setUrl(URL.createObjectURL(compressed));
      } catch {
        setError(t("errorCompress"));
      } finally {
        setBusy(false);
      }
    },
    [maxWidth, quality, url, t],
  );

  return (
    <Flex direction="column" gap="6">
      <Grid columns={{ initial: "1", sm: "2" }} gap="4">
        <Flex direction="column" gap="2">
          <Text size="2" weight="medium">
            {t("maxSize")}
          </Text>
          <TextField.Root
            type="number"
            size="2"
            min={320}
            max={8192}
            value={String(maxWidth)}
            onChange={(e) => setMaxWidth(Number(e.target.value))}
          />
        </Flex>
        <Flex direction="column" gap="2">
          <Text size="2" weight="medium">
            {t("quality")}
          </Text>
          <TextField.Root
            type="number"
            size="2"
            min={0.1}
            max={1}
            step={0.05}
            value={String(quality)}
            onChange={(e) => setQuality(Number(e.target.value))}
          />
        </Flex>
      </Grid>
      <Flex direction="column" gap="2">
        <Text size="2" weight="medium">
          {t("file")}
        </Text>
        <input
          type="file"
          accept="image/*"
          className="radix-file-input"
          disabled={busy}
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) void onFile(f);
          }}
        />
      </Flex>
      {error ? (
        <Text size="2" color="red" role="alert">
          {error}
        </Text>
      ) : null}
      {beforeSize !== null ? (
        <Text size="2" color="gray">
          {t("sizeOriginal")} {(beforeSize / 1024).toFixed(1)} KB
          {afterSize !== null ? (
            <>
              {" "}
              → {t("sizeCompressed")} {(afterSize / 1024).toFixed(1)} KB
            </>
          ) : null}
        </Text>
      ) : null}
      {url ? (
        <Flex direction="column" gap="3">
          <Card size="2" variant="surface" style={{ display: "inline-block", maxWidth: "fit-content" }}>
            {/* eslint-disable-next-line @next/next/no-img-element -- blob preview URL from compression */}
            <img src={url} alt={t("previewAlt")} style={{ maxHeight: "24rem", width: "auto", objectFit: "contain", display: "block" }} />
          </Card>
          <Button asChild size="2" variant="solid" highContrast>
            <a href={url} download="compressed.jpg">
              {tc("downloadResult")}
            </a>
          </Button>
        </Flex>
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
