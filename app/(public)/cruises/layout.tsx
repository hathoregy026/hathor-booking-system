import type { ReactNode } from "react";

export default function CruisesLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return <div className="test-scroll-reveal-route">{children}</div>;
}
