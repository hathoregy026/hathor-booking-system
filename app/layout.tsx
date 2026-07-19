import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { HATHOR_BRAND_NAME, HATHOR_FAVICON_SRC } from "@/lib/branding";
import {
  PUBLIC_THEME_DEFAULT,
  getPublicThemeBlockingScript,
} from "@/lib/public-theme";
import "./hathor-fonts.css";
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

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      data-public-theme={PUBLIC_THEME_DEFAULT}
      style={{ ["--font-playfair" as string]: '"Playfair Display", Georgia, serif' }}
      suppressHydrationWarning
    >
      <head>
        <script
          dangerouslySetInnerHTML={{ __html: getPublicThemeBlockingScript() }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
