import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "NPS Tracker — National Pension Service (Korea) Holdings",
  description:
    "Track Korea's National Pension Service (NPS) stock holdings: 1,200+ Korean companies via DART, 561 US stocks via SEC 13F, backtested momentum strategies, global superinvestor cross-reference.",
};

const siteJsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      "@id": "https://stolenfocus.github.io/nps-tracker/#website",
      url: "https://stolenfocus.github.io/nps-tracker/",
      name: "NPS Tracker",
      description:
        "Comprehensive tracker for Korea's National Pension Service holdings (DART + SEC 13F).",
      inLanguage: ["ko", "en"],
    },
    {
      "@type": "Organization",
      "@id": "https://stolenfocus.github.io/nps-tracker/#org",
      name: "NPS Tracker (stolenfocus)",
      url: "https://stolenfocus.github.io/nps-tracker/",
      sameAs: ["https://github.com/stolenfocus/nps-tracker"],
    },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(siteJsonLd) }}
        />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}
