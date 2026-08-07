import type { ReactNode } from "react";

/** Assets for /cruises (MaskRevealBoot + CSS). Route itself redirects. */
export default function MaskRevealLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return children;
}
