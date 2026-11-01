"use client";

import DefaultGlobalError from "next/dist/client/components/builtin/global-error";
import { usePathname } from "next/navigation";
import { ERROR_COPY } from "@/lib/i18n/system-pages-copy";
import { splitLocalePath } from "@/lib/i18n/locale";

type GlobalErrorProps = { error: Error & { digest?: string }; reset?: () => void };

/**
 * When a layout itself fails. English keeps Next's own screen, unchanged;
 * other languages get the same plain page in their words. Inline styles:
 * nothing else has loaded at this point.
 */
export default function GlobalError({ error }: GlobalErrorProps) {
  const pathname = usePathname();
  const { locale } = splitLocalePath(pathname);
  if (locale === "en") {
    return <DefaultGlobalError error={error} />;
  }
  const t = ERROR_COPY[locale];
  return (
    <html lang={locale}>
      <head>
        <title>{t.pageTitle}</title>
      </head>
      <body
        style={{
          margin: 0,
          minHeight: "100svh",
          display: "grid",
          placeContent: "center",
          gap: "1rem",
          padding: "1.25rem",
          textAlign: "center",
          fontFamily: "Georgia, 'Times New Roman', serif",
          background: "#f4efe6",
          color: "#2c2824",
        }}
      >
        <h1 style={{ margin: 0, fontWeight: 400 }}>{t.title}</h1>
        <p style={{ margin: 0, maxWidth: "32rem" }}>{t.lede} reservations@hathorcruise.com.</p>
        <p style={{ margin: 0 }}>
          <a href={`/${locale}`} style={{ color: "inherit" }}>
            {t.home}
          </a>
        </p>
      </body>
    </html>
  );
}
