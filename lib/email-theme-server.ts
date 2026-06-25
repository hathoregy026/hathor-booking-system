import "server-only";

import type {
  EmailTemplateOverrides,
  EmailTemplateRecord,
} from "@/lib/email-templates";
import { isEmailImageDataUrl } from "@/lib/email-image-shared";
import { resolveEmailLogoSrcForSend } from "@/lib/email-image-data.server";
import { toAbsolutePublicUrl } from "@/lib/public-url";

/** Theme overrides for server-side email render/send (embedded logos). */
export function toEmailThemeOverridesForSend(
  template: EmailTemplateRecord | null | undefined,
): EmailTemplateOverrides | undefined {
  if (!template) return undefined;

  const previewLogoUrl = toAbsolutePublicUrl(template.logoUrl);
  const previewHeroUrl = toAbsolutePublicUrl(template.heroImageUrl);

  return {
    logoUrl: resolveEmailLogoSrcForSend(template.logoDataUrl, previewLogoUrl),
    logoDataUrl: template.logoDataUrl,
    heroImageUrl:
      (isEmailImageDataUrl(template.heroImageDataUrl)
        ? template.heroImageDataUrl
        : previewHeroUrl) ?? null,
    heroImageDataUrl: template.heroImageDataUrl,
    primaryColor: template.primaryColor,
    backgroundColor: template.backgroundColor,
    heroHeading: template.heroHeading,
    bodyText: template.bodyText,
  };
}
