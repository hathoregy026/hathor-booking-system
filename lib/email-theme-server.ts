import "server-only";

import type {
  EmailTemplateOverrides,
  EmailTemplateRecord,
} from "@/lib/email-templates";
import { EMAIL_LOGO_URL } from "@/emails/styles";
import { toAbsolutePublicUrl } from "@/lib/public-url";

/** Theme overrides for server-side email render/send (hosted image URLs). */
export function toEmailThemeOverridesForSend(
  template: EmailTemplateRecord | null | undefined,
): EmailTemplateOverrides | undefined {
  if (!template) return undefined;

  return {
    logoUrl: toAbsolutePublicUrl(template.logoUrl) ?? EMAIL_LOGO_URL,
    heroImageUrl: toAbsolutePublicUrl(template.heroImageUrl),
    primaryColor: template.primaryColor,
    backgroundColor: template.backgroundColor,
    heroHeading: template.heroHeading,
    bodyText: template.bodyText,
  };
}
