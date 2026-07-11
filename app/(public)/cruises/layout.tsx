import type { ReactNode } from "react";

/** Shared cruises segment — live page + option demos each bring their own layout. */
export default function CruisesSegmentLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return children;
}
