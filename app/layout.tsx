import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "./providers";

export const metadata: Metadata = {
  title: "FarmGuard — Smart Irrigation & Harvest Intelligence",
  description:
    "FarmGuard automates irrigation with IoT sensors and delivers harvest forecasting for agricultural buyers.",
  authors: [{ name: "FarmGuard" }],
  openGraph: {
    title: "FarmGuard — Smart Irrigation & Harvest Intelligence",
    description:
      "IoT irrigation automation for Indian farms and verified harvest forecasts for buyers.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap"
        />
        <link rel="icon" href="/farmguard-logo.png" type="image/png" />
        <link rel="apple-touch-icon" href="/farmguard-logo.png" />
      </head>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
