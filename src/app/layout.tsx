import type { Metadata } from "next";
import { Fraunces, Inter } from "next/font/google";

import { siteConfig } from "@/lib/site-config";
import { getSiteSettings } from "@/lib/site-settings/get-site-settings";

import "./globals.css";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
});

const fraunces = Fraunces({
  variable: "--font-serif",
  subsets: ["latin"],
  display: "swap",
});

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings();
  const icons = settings.faviconUrl
    ? { icon: [{ url: settings.faviconUrl }] }
    : undefined;

  return {
    title: {
      default: settings.siteName,
      template: `%s · ${settings.siteName}`,
    },
    description: settings.description,
    metadataBase: new URL(siteConfig.url),
    applicationName: settings.siteName,
    authors: [{ name: settings.schoolName }],
    keywords: [
      "ONU",
      "Agenda 2030",
      "Obiettivo 16",
      "Obiettivo 17",
      "Educazione Civica",
      settings.siteName,
    ],
    openGraph: {
      title: settings.siteName,
      description: settings.description,
      locale: siteConfig.locale,
      type: "website",
      siteName: settings.siteName,
    },
    twitter: {
      card: "summary_large_image",
      title: settings.siteName,
      description: settings.description,
    },
    robots: {
      index: true,
      follow: true,
    },
    alternates: {
      canonical: siteConfig.url,
    },
    icons,
  };
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="it" suppressHydrationWarning>
      <body className={`${inter.variable} ${fraunces.variable} font-sans antialiased`}>
        {children}
      </body>
    </html>
  );
}
