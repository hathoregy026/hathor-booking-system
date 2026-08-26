"use client";

import type { ReactNode } from "react";
import { TypographySettingsProvider } from "@/components/public/TypographySettingsProvider";
import { WebsiteTextPageScope } from "@/components/public/WebsiteTextPageScope";
import { WebsiteTextProvider } from "@/components/public/WebsiteTextProvider";
import type { TypographySettings } from "@/lib/typography-settings-shared";
import type { WebsiteText } from "@/lib/website-text-shared";

/** CMS copy + typography for routes outside the public layout group. */
export function PublicCmsTextRuntime({
  websiteText,
  websiteTextMobile,
  typography,
  typographyMobile,
  children,
}: {
  websiteText?: WebsiteText;
  websiteTextMobile?: WebsiteText;
  typography?: TypographySettings;
  typographyMobile?: TypographySettings;
  children: ReactNode;
}) {
  return (
    <TypographySettingsProvider
      initial={typography}
      initialMobile={typographyMobile}
    >
      <WebsiteTextProvider
        initial={websiteText}
        initialMobile={websiteTextMobile}
      >
        <WebsiteTextPageScope />
        {children}
      </WebsiteTextProvider>
    </TypographySettingsProvider>
  );
}
