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
  typographyToInlineStyle,
  type TypographyRole,
  type TypographySettings,
  type TypographyTextStyle,
} from "@/lib/typography-settings-shared";

const TypographySettingsContext = createContext<TypographySettings>(
  DEFAULT_TYPOGRAPHY_SETTINGS,
);

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
    return () => {
      cancelled = true;
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
