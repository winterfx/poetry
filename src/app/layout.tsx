import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "古韵今思",
  description: "感受千年文化，品味诗词之美",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Noto+Serif+SC:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-serif antialiased">{children}</body>
    </html>
  );
}
