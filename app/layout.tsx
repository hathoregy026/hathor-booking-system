import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { HATHOR_BRAND_NAME, HATHOR_FAVICON_SRC } from "@/lib/branding";
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
  title: `${HATHOR_BRAND_NAME} Cruise Booking`,
  description: "Book your luxury Hathor cruise experience",
  icons: {
    icon: HATHOR_FAVICON_SRC,
    apple: HATHOR_FAVICON_SRC,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
