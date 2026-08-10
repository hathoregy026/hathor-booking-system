"use client";

import type { ReactNode } from "react";
import { PageVisibilityChrome } from "@/components/public/PageVisibilityChrome";

type PageVisibilityGateProps = {
  children: ReactNode;
};

/** @deprecated Prefer PageVisibilityChrome — kept for existing imports. */
export function PageVisibilityGate({ children }: PageVisibilityGateProps) {
  return <PageVisibilityChrome>{children}</PageVisibilityChrome>;
}
