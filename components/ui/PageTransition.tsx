import type { ReactNode } from "react";

type PageTransitionProps = {
  children: ReactNode;
};

/** Plain wrapper — motion transforms on ancestors break position:sticky scroll sections. */
export function PageTransition({ children }: PageTransitionProps) {
  return <div className="page-transition">{children}</div>;
}
