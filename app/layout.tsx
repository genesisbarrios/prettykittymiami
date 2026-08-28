import { ReactNode } from "react";
import { Bebas_Neue, Inter } from "next/font/google";
import { Viewport } from "next";
import { getSEOTags, renderLocalBusinessSchema } from "@/libs/seo";
import config from "@/config";
import "./globals.css";

const body = Inter({ subsets: ["latin"], variable: "--font-body" });
const display = Bebas_Neue({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-display",
});

export const viewport: Viewport = {
  themeColor: config.colors.main,
  width: "device-width",
  initialScale: 1,
};

export const metadata = getSEOTags();

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html
      lang="en"
      data-theme={config.colors.theme}
      className={`${body.variable} ${display.variable}`}
    >
      <head>{renderLocalBusinessSchema()}</head>
      <body className="font-sans">{children}</body>
    </html>
  );
}
