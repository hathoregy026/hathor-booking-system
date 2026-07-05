import type { ReactNode } from "react";

export default function CruisesLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return <div className="cruises-scroll-route">{children}</div>;
}
