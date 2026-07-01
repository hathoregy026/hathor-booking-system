import type { Metadata, Viewport } from "next";
import Script from "next/script";
import { Geist, Geist_Mono } from "next/font/google";
import { HATHOR_BRAND_NAME, HATHOR_FAVICON_SRC } from "@/lib/branding";
import { PUBLIC_THEME_STORAGE_KEY } from "@/lib/public-theme";
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
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Script id="hathor-public-theme-init" strategy="beforeInteractive">
          {`(function(){try{var k="${PUBLIC_THEME_STORAGE_KEY}";var t=localStorage.getItem(k);document.documentElement.setAttribute("data-public-theme",t==="night"?"night":"day");}catch(e){document.documentElement.setAttribute("data-public-theme","day");}})();`}
        </Script>
        {children}
      </body>
    </html>
  );
}
