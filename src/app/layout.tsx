import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ClarityProvider } from "@/components/clarity-provider";
import { GoogleAdSense } from "@/components/GoogleAdSense";
import { GoogleAnalytics } from "@/components/GoogleAnalytics";
import { isAdminAuthenticated } from "@/lib/admin/auth/server";
import { buildDefaultMetadata } from "@/lib/seo/metadata";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = buildDefaultMetadata();

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const hasAdminSession = await isAdminAuthenticated();

  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        <GoogleAdSense />
      </head>
      <body className="min-h-full flex flex-col">
        <GoogleAnalytics hasAdminSession={hasAdminSession} />
        <ClarityProvider />
        {children}
      </body>
    </html>
  );
}
