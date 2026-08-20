import type { Metadata } from "next";
import { Geist, Geist_Mono, Inter, Bricolage_Grotesque } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "600", "700", "800", "900"],
});

const bricolageGrotesque = Bricolage_Grotesque({
  variable: "--font-bricolage-grotesque",
  subsets: ["latin"],
  // weight: variable font does not need weights
});

export const metadata: Metadata = {
  metadataBase: new URL("https://codevolt.in"),
  title: "Codevolt 2.0 | 3-Day Startup Sprint",
  description: "Build a startup in 3 Days. From 0s and 1s to 0→1. 9–11 September 2026, VIT, Vellore.",
  icons: {
    icon: "/brand/favicon_mark.png",
    shortcut: "/brand/favicon_mark.png",
    apple: "/brand/favicon_mark.png",
  },
  openGraph: {
    title: "Codevolt 2.0 | 3-Day Startup Sprint",
    description: "Build a startup in 3 Days. From 0s and 1s to 0→1. 9–11 September 2026, VIT, Vellore.",
    images: ["/brand/logo_orange.png"],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Codevolt 2.0 | 3-Day Startup Sprint",
    description: "Build a startup in 3 Days. From 0s and 1s to 0→1. 9–11 September 2026, VIT, Vellore.",
    images: ["/brand/logo_orange.png"],
  },
};

import { ConditionalNav, ConditionalFooter } from "@/components/ConditionalNav";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} ${inter.variable} ${bricolageGrotesque.variable} antialiased`}>
      <head>
        <link rel="icon" href="/brand/favicon_mark.png" type="image/png" />
        <link rel="shortcut icon" href="/brand/favicon_mark.png" type="image/png" />
        <link rel="apple-touch-icon" href="/brand/favicon_mark.png" />
      </head>
      <body>
        <ConditionalNav />
        {children}
        <ConditionalFooter />
      </body>
    </html>
  );
}
