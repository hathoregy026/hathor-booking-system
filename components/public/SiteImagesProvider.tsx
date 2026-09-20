"use client";

import {
  createContext,
  useCallback,
  useContext,
  type ReactNode,
} from "react";
import { usePathname } from "next/navigation";
import { getDefaultSiteImage } from "@/lib/site-image-slots";
import type { ResolvedSiteImage, SiteImageMap } from "@/lib/resolve-site-images";
import { preferLocalOptimizedSiteImage } from "@/lib/local-optimized-site-images";
import {
  getPageScopedSiteImageName,
  getSiteImageSourceName,
} from "@/lib/site-image-page-scope";

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
  const pathname = usePathname();
  const getImage = useCallback(
    (name: string): ResolvedSiteImage => {
      /* Next can expose an internal/prerender pathname to a layout-level client
         provider. The browser URL is the authoritative route after hydration,
         including client-side navigation, so page-owned slots cannot fall back
         to their former shared source on the live site. */
      const livePathname =
        typeof window === "undefined" ? pathname : window.location.pathname;
      const effectiveName = getPageScopedSiteImageName(livePathname, name);
      const sourceName = getSiteImageSourceName(effectiveName);
      const image =
        images[effectiveName] ?? images[sourceName] ?? getDefaultSiteImage(effectiveName);
      return {
        ...image,
        slot: effectiveName,
        src: preferLocalOptimizedSiteImage(sourceName, image.src),
      };
    },
    [images, pathname],
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
      slot: name,
      src: preferLocalOptimizedSiteImage(name, image.src),
    };
  }
  return context.getImage(name);
}
