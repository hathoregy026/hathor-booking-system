"use client";

import {
  createContext,
  useCallback,
  useContext,
  type ReactNode,
} from "react";
import { getDefaultSiteImage } from "@/lib/site-image-slots";
import type { ResolvedSiteImage, SiteImageMap } from "@/lib/resolve-site-images";
import { preferLocalOptimizedSiteImage } from "@/lib/local-optimized-site-images";

type SiteImagesContextValue = {
  getImage: (name: string) => ResolvedSiteImage;
};

const SiteImagesContext = createContext<SiteImagesContextValue | null>(null);

type SiteImagesProviderProps = {
  images: SiteImageMap;
  children: ReactNode;
};

/**
 * Keep origin URLs (https://… or /media/…) in context.
 * Do NOT pre-wrap with `/_next/image?…` — that breaks `next/image` during
 * static prerender (localPatterns) and double-optimizes ManagedImage.
 * Native `<img>` / CSS callers should use `toVercelOptimizedSrc` themselves.
 */
export function SiteImagesProvider({ images, children }: SiteImagesProviderProps) {
  const getImage = useCallback(
    (name: string): ResolvedSiteImage => {
      const image = images[name] ?? getDefaultSiteImage(name);
      return {
        ...image,
        src: preferLocalOptimizedSiteImage(name, image.src),
      };
    },
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
    const image = getDefaultSiteImage(name);
    return {
      ...image,
      src: preferLocalOptimizedSiteImage(name, image.src),
    };
  }
  return context.getImage(name);
}
