import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/react";
import { HATHOR_BRAND_NAME, HATHOR_FAVICON_SRC } from "@/lib/branding";
import {
  PUBLIC_THEME_DEFAULT,
  getPublicThemeBlockingScript,
  getHomeBootCriticalStyle,
  getHomeScrollPendingBlockingScript,
  getPublicHeroBootCriticalStyle,
  getWelcomeSplashBlockingScript,
  getWelcomeSplashCriticalStyle,
  getHeroTypeReadyBlockingScript,
} from "@/lib/public-theme";
import { getTouchDeviceBlockingScript } from "@/lib/touch-device";
import { TouchDeviceBootstrap } from "@/components/public/TouchDeviceBootstrap";
import { GlobalFloatingActions } from "@/components/public/GlobalFloatingActions";
import "./hathor-fonts.css";
import "./globals.css";
import "./mobile-touch.css";
import "./floating-actions.css";
import "./booking-modal.css";

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
        {/* Kill gold welcome splash before paint — including stale cached shells. */}
        <style
          dangerouslySetInnerHTML={{
            __html: getWelcomeSplashCriticalStyle(),
          }}
        />
        <script
          dangerouslySetInnerHTML={{
            __html: getWelcomeSplashBlockingScript(false),
          }}
        />
        <link
          rel="preload"
          href="/fonts/bitho-luxury-italic-1784552304-0/BithoLuxury-Italic-Exfont89bb.otf"
          as="font"
          type="font/otf"
          crossOrigin="anonymous"
        />
        <link
          rel="preload"
          href="/fonts/more-fonts/carista-calligraphy.otf"
          as="font"
          type="font/otf"
          crossOrigin="anonymous"
        />
        <link
          rel="preload"
          href="/fonts/Gabigaile.otf"
          as="font"
          type="font/otf"
          crossOrigin="anonymous"
        />
        <style
          dangerouslySetInnerHTML={{
            __html:
              getHomeBootCriticalStyle() +
              getPublicHeroBootCriticalStyle(),
          }}
        />
        <script
          dangerouslySetInnerHTML={{
            __html: getHomeScrollPendingBlockingScript(),
          }}
        />
        <script
          dangerouslySetInnerHTML={{
            __html: getHeroTypeReadyBlockingScript(),
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
        <GlobalFloatingActions />
        <Analytics />
      </body>
    </html>
  );
}
