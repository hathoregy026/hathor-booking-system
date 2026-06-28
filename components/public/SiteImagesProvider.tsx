"use client";

import {
  createContext,
  useCallback,
  useContext,
  type ReactNode,
} from "react";
import { getDefaultSiteImage } from "@/lib/site-image-slots";
import type { ResolvedSiteImage, SiteImageMap } from "@/lib/resolve-site-images";

type SiteImagesContextValue = {
  getImage: (name: string) => ResolvedSiteImage;
};

const SiteImagesContext = createContext<SiteImagesContextValue | null>(null);

type SiteImagesProviderProps = {
  images: SiteImageMap;
  children: ReactNode;
};

export function SiteImagesProvider({ images, children }: SiteImagesProviderProps) {
  const getImage = useCallback(
    (name: string): ResolvedSiteImage => images[name] ?? getDefaultSiteImage(name),
    [images],
  );

  return (
    <SiteImagesContext.Provider value={{ getImage }}>
      {children}
    </SiteImagesContext.Provider>
  );
}

export function useSiteImage(name: string): ResolvedSiteImage {
  const context = useContext(SiteImagesContext);
  if (!context) {
    return getDefaultSiteImage(name);
  }
  return context.getImage(name);
}
