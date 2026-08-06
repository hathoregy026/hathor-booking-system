"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { PageUnderConstruction } from "@/components/public/PageUnderConstruction";
import { usePageVisibilitySettings } from "@/components/public/PageVisibilityProvider";
import {
  isPageLive,
  resolveManagedPublicPage,
} from "@/lib/page-visibility-shared";

type PageVisibilityGateProps = {
  children: ReactNode;
};

export function PageVisibilityGate({ children }: PageVisibilityGateProps) {
  const pathname = usePathname() ?? "/";
  const settings = usePageVisibilitySettings();
  const managed = resolveManagedPublicPage(pathname);
  const live = isPageLive(pathname, settings);

  if (!live && managed) {
    return <PageUnderConstruction pageLabel={managed.label} />;
  }

  return <>{children}</>;
}
