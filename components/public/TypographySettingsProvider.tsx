"use client";

import {
  createContext,
  useContext,
  useEffect,
  useLayoutEffect,
  useState,
  type ReactNode,
} from "react";
import { combineDesktopAndPhoneCss } from "@/lib/admin-device-preview";
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

function applyLiveCss(
  desktop: TypographySettings,
  mobile: TypographySettings,
) {
  if (typeof document === "undefined") return;
  let el = document.getElementById(STYLE_ID) as HTMLStyleElement | null;
  if (!el) {
    el = document.createElement("style");
    el.id = STYLE_ID;
    document.head.appendChild(el);
  }
  el.textContent = combineDesktopAndPhoneCss(
    typographyToImportantCss(desktop),
    typographyToImportantCss(mobile),
  );
  /* Keep last in <head> so it beats bundled page CSS. */
  document.head.appendChild(el);
}

function useIsPhoneViewport() {
  const [isPhone, setIsPhone] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px)");
    const sync = () => setIsPhone(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  return isPhone;
}

export function TypographySettingsProvider({
  initial,
  initialMobile,
  children,
}: {
  initial?: TypographySettings;
  initialMobile?: TypographySettings;
  children: ReactNode;
}) {
  const [desktop, setDesktop] = useState<TypographySettings>(
    initial ?? DEFAULT_TYPOGRAPHY_SETTINGS,
  );
  const [mobile, setMobile] = useState<TypographySettings>(
    initialMobile ?? initial ?? DEFAULT_TYPOGRAPHY_SETTINGS,
  );
  const isPhone = useIsPhoneViewport();

  useEffect(() => {
    if (initial) setDesktop(initial);
  }, [initial]);

  useEffect(() => {
    if (initialMobile) setMobile(initialMobile);
    else if (initial) setMobile(initial);
  }, [initial, initialMobile]);

  /* Apply before paint so homepage never flashes ink/uppercase defaults. */
  useLayoutEffect(() => {
    applyLiveCss(desktop, mobile);
  }, [desktop, mobile]);

  /* Trust SSR typography when provided — client refetch morphs old→new and reads as a flashback. */
  useEffect(() => {
    if (initial) return;

    let cancelled = false;
    const load = async () => {
      try {
        const res = await fetch(`/api/typography?t=${Date.now()}`, {
          cache: "no-store",
        });
        if (!res.ok) return;
        const data = (await res.json()) as {
          settings?: unknown;
          settingsMobile?: unknown;
        };
        if (cancelled) return;
        const next = parseTypographySettings(data.settings);
        setDesktop(next);
        setMobile(
          data.settingsMobile
            ? parseTypographySettings(data.settingsMobile)
            : next,
        );
      } catch {
        /* keep defaults */
      }
    };
    void load();
    return () => {
      cancelled = true;
    };
  }, [initial]);

  const active = isPhone ? mobile : desktop;

  return (
    <TypographySettingsContext.Provider value={active}>
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
