"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import {
  DEFAULT_TYPOGRAPHY_SETTINGS,
  parseTypographySettings,
  typographyToImportantCss,
  typographyToInlineStyle,
  type TypographyRole,
  type TypographySettings,
  type TypographyTextStyle,
} from "@/lib/typography-settings-shared";

const STYLE_ID = "hathor-typography-live";

const TypographySettingsContext = createContext<TypographySettings>(
  DEFAULT_TYPOGRAPHY_SETTINGS,
);

function applyLiveCss(settings: TypographySettings) {
  if (typeof document === "undefined") return;
  let el = document.getElementById(STYLE_ID) as HTMLStyleElement | null;
  if (!el) {
    el = document.createElement("style");
    el.id = STYLE_ID;
    document.head.appendChild(el);
  }
  el.textContent = typographyToImportantCss(settings);
  /* Keep last in <head> so it beats bundled page CSS. */
  document.head.appendChild(el);
}

export function TypographySettingsProvider({
  initial,
  children,
}: {
  initial?: TypographySettings;
  children: ReactNode;
}) {
  const [settings, setSettings] = useState<TypographySettings>(
    initial ?? DEFAULT_TYPOGRAPHY_SETTINGS,
  );

  useEffect(() => {
    if (initial) setSettings(initial);
  }, [initial]);

  useEffect(() => {
    applyLiveCss(settings);
  }, [settings]);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const res = await fetch(`/api/typography?t=${Date.now()}`, {
          cache: "no-store",
        });
        if (!res.ok) return;
        const data = (await res.json()) as { settings?: unknown };
        if (cancelled) return;
        setSettings(parseTypographySettings(data.settings));
      } catch {
        /* keep SSR / defaults */
      }
    };
    void load();

    const onVisible = () => {
      if (document.visibilityState === "visible") void load();
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      cancelled = true;
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, []);

  return (
    <TypographySettingsContext.Provider value={settings}>
      {children}
    </TypographySettingsContext.Provider>
  );
}

export function useTypographySettings(): TypographySettings {
  return useContext(TypographySettingsContext);
}

export function useTypographyStyle(role: TypographyRole): TypographyTextStyle {
  return useTypographySettings()[role];
}

export function useTypographyInlineStyle(role: TypographyRole) {
  return typographyToInlineStyle(useTypographyStyle(role));
}
