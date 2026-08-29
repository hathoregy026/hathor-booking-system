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
  /** From server hostname — Vercel/localhost bypass per-page gates. */
  workHost?: boolean;
  children: ReactNode;
};

const WorkHostContext = createContext<boolean | undefined>(undefined);

export function PageVisibilityProvider({
  settings,
  workHost,
  children,
}: PageVisibilityProviderProps) {
  return (
    <WorkHostContext.Provider value={workHost}>
      <PageVisibilityContext.Provider value={settings}>
        {children}
      </PageVisibilityContext.Provider>
    </WorkHostContext.Provider>
  );
}

export function usePageVisibilityWorkHost(): boolean | undefined {
  return useContext(WorkHostContext);
}

export function usePageVisibilitySettings(): PageVisibilitySettings {
  return useContext(PageVisibilityContext) ?? DEFAULT_PAGE_VISIBILITY_SETTINGS;
}
