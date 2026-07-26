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

  useEffect(() => {
    if (initial) return;

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
        /* keep defaults */
      }
    };
    void load();
    return () => {
      cancelled = true;
    };
  }, [initial]);

  return (
    <WebsiteTextContext.Provider value={isPhone ? mobile : desktop}>
      {children}
    </WebsiteTextContext.Provider>
  );
}

export function useWebsiteText(): WebsiteText {
  return useContext(WebsiteTextContext);
}
