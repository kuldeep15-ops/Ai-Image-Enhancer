import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AI Photo Enhancer",
  description: "Enhance photos or remove backgrounds with Replicate",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
