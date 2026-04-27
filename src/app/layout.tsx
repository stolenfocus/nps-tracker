import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "NPS Tracker",
  description: "Track National Pension Service investments",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html>
      <body>{children}</body>
    </html>
  );
}
