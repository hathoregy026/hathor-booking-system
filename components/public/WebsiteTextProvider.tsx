"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import {
  DEFAULT_WEBSITE_TEXT,
  parseWebsiteText,
  type WebsiteText,
} from "@/lib/website-text-shared";

const WebsiteTextContext = createContext<WebsiteText>(DEFAULT_WEBSITE_TEXT);

export function WebsiteTextProvider({
  initial,
  children,
}: {
  initial?: WebsiteText;
  children: ReactNode;
}) {
  const [settings, setSettings] = useState<WebsiteText>(
    initial ?? DEFAULT_WEBSITE_TEXT,
  );

  useEffect(() => {
    if (initial) setSettings(initial);
  }, [initial]);

  useEffect(() => {
    if (initial) return;

    let cancelled = false;
    const load = async () => {
      try {
        const res = await fetch(`/api/website-text?t=${Date.now()}`, {
          cache: "no-store",
        });
        if (!res.ok) return;
        const data = (await res.json()) as { settings?: unknown };
        if (cancelled) return;
        setSettings(parseWebsiteText(data.settings));
      } catch {
        /* keep defaults */
      }
    };
    void load();
    return () => {
      cancelled = true;
    };
  }, [initial]);

  return (
    <WebsiteTextContext.Provider value={settings}>
      {children}
    </WebsiteTextContext.Provider>
  );
}

export function useWebsiteText(): WebsiteText {
  return useContext(WebsiteTextContext);
}
