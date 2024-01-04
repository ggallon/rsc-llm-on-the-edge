import type { Viewport, Metadata } from "next";

import { urlHost } from "./lib/url";

import "./globals.css";

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#000000" },
    { media: "(prefers-color-scheme: dark)", color: "#ffffff" },
  ],
};

export const metadata: Metadata = {
  metadataBase: new URL(urlHost()),
  title: "React Server Component LLM streaming on the Edge",
  description: "Vercel AI SDK on the Edge",
  twitter: {
    card: "summary_large_image",
    title: "Vercel AI SDK on the Edge",
    description: "React Server Component streaming an LLM response on the Edge",
    creator: "@proactice",
  },
  openGraph: {
    type: "website",
    title: "Vercel AI SDK on the Edge",
    description: "React Server Component streaming an LLM response on the Edge",
    url: new URL(urlHost()),
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        {/* <NavigationSwitcher /> */}
        {children}
      </body>
    </html>
  );
}
