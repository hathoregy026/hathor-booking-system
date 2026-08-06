"use client";

import { createContext, useContext, type ReactNode } from "react";
import {
  DEFAULT_PAGE_VISIBILITY_SETTINGS,
  type PageVisibilitySettings,
} from "@/lib/page-visibility-shared";

const PageVisibilityContext = createContext<PageVisibilitySettings | null>(
  null,
);

type PageVisibilityProviderProps = {
  settings: PageVisibilitySettings;
  children: ReactNode;
};

export function PageVisibilityProvider({
  settings,
  children,
}: PageVisibilityProviderProps) {
  return (
    <PageVisibilityContext.Provider value={settings}>
      {children}
    </PageVisibilityContext.Provider>
  );
}

export function usePageVisibilitySettings(): PageVisibilitySettings {
  return useContext(PageVisibilityContext) ?? DEFAULT_PAGE_VISIBILITY_SETTINGS;
}
