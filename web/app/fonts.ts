import localFont from "next/font/local";

/** 离线可变字体：运行 `bash scripts/download-geist-fonts.sh` 下载到本目录下。 */
export const geistSans = localFont({
  src: "./fonts/geist-sans/Geist-Variable.woff2",
  variable: "--font-geist-sans",
  weight: "100 900",
  display: "swap",
});

export const geistMono = localFont({
  src: "./fonts/geist-mono/GeistMono-Variable.woff2",
  variable: "--font-geist-mono",
  weight: "100 900",
  display: "swap",
});
