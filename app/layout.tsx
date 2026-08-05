import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { HATHOR_BRAND_NAME, HATHOR_FAVICON_SRC } from "@/lib/branding";
import {
  PUBLIC_THEME_DEFAULT,
  getPublicThemeBlockingScript,
  getHomeBootCriticalStyle,
  getHomeScrollPendingBlockingScript,
  getPublicHeroBootCriticalStyle,
  getWelcomeSplashCriticalStyle,
} from "@/lib/public-theme";
import { getTouchDeviceBlockingScript } from "@/lib/touch-device";
import { TouchDeviceBootstrap } from "@/components/public/TouchDeviceBootstrap";
import "./hathor-fonts.css";
import "./globals.css";
import "./mobile-touch.css";

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
  maximumScale: 5,
  userScalable: true,
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
      style={{ ["--font-playfair" as string]: '"Gamgote", Georgia, serif' }}
      /* Blocking scripts set data-public-theme + touch/home classes on <html> before hydrate. */
      suppressHydrationWarning
    >
      <head>
        <script
          dangerouslySetInnerHTML={{ __html: getPublicThemeBlockingScript() }}
        />
        <style
          dangerouslySetInnerHTML={{
            __html:
              getHomeBootCriticalStyle() +
              getPublicHeroBootCriticalStyle() +
              getWelcomeSplashCriticalStyle(),
          }}
        />
        <script
          dangerouslySetInnerHTML={{
            __html: getHomeScrollPendingBlockingScript(),
          }}
        />
        <script
          dangerouslySetInnerHTML={{
            __html: getTouchDeviceBlockingScript(),
          }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <TouchDeviceBootstrap />
        {children}
      </body>
    </html>
  );
}
