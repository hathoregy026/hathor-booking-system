"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { useIsPhoneViewport } from "@/hooks/useIsPhoneViewport";
import {
  DEFAULT_WEBSITE_TEXT,
  parseWebsiteText,
  type WebsiteText,
} from "@/lib/website-text-shared";

const WebsiteTextContext = createContext<WebsiteText>(DEFAULT_WEBSITE_TEXT);

export function WebsiteTextProvider({
  initial,
  initialMobile,
  children,
}: {
  initial?: WebsiteText;
  initialMobile?: WebsiteText;
  children: ReactNode;
}) {
  const [desktop, setDesktop] = useState<WebsiteText>(
    initial ?? DEFAULT_WEBSITE_TEXT,
  );
  const [mobile, setMobile] = useState<WebsiteText>(
    initialMobile ?? initial ?? DEFAULT_WEBSITE_TEXT,
  );
  const isPhone = useIsPhoneViewport();

  useEffect(() => {
    if (initial) setDesktop(initial);
  }, [initial]);

  useEffect(() => {
    if (initialMobile) setMobile(initialMobile);
    else if (initial) setMobile(initial);
  }, [initial, initialMobile]);

  /* Soft refresh so admin phone saves appear even if ISR HTML is briefly stale. */
  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const res = await fetch(`/api/website-text?t=${Date.now()}`, {
          cache: "no-store",
        });
        if (!res.ok) return;
        const data = (await res.json()) as {
          settings?: unknown;
          settingsMobile?: unknown;
        };
        if (cancelled) return;
        const next = parseWebsiteText(data.settings);
        setDesktop(next);
        setMobile(
          data.settingsMobile ? parseWebsiteText(data.settingsMobile) : next,
        );
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
    <WebsiteTextContext.Provider value={isPhone ? mobile : desktop}>
      {children}
    </WebsiteTextContext.Provider>
  );
}

export function useWebsiteText(): WebsiteText {
  return useContext(WebsiteTextContext);
}
