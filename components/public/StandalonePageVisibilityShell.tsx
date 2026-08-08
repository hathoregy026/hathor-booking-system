import type { ReactNode } from "react";
import { PageUnderConstruction } from "@/components/public/PageUnderConstruction";
import {
  isPageLive,
  type PageVisibilitySettings,
} from "@/lib/page-visibility-shared";

type StandalonePageVisibilityShellProps = {
  path: string;
  pageLabel: string;
  settings: PageVisibilitySettings;
  children: ReactNode;
};

/** For routes outside `(public)` that still need CMS page visibility. */
export function StandalonePageVisibilityShell({
  path,
  settings,
  children,
}: StandalonePageVisibilityShellProps) {
  if (!isPageLive(path, settings)) {
    return (
      <div className="hathor-page-construction--standalone">
        <PageUnderConstruction />
      </div>
    );
  }

  return <>{children}</>;
}
