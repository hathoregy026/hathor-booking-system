import { render } from "@react-email/render";
import AdminAlertEmail from "@/emails/AdminAlert";
import BookingConfirmedEmail from "@/emails/BookingConfirmed";
import BookingReceivedEmail from "@/emails/BookingReceived";
import { sampleBookingDetails, sampleGuestName } from "@/emails/sample-data";
import {
  type EmailTemplateName,
  type EmailTemplateOverrides,
  type EmailTemplateRecord,
  interpolateEmailText,
  toEmailThemeOverrides,
} from "@/lib/email-templates";

async function renderTemplateHtml(
  name: EmailTemplateName,
  overrides: EmailTemplateOverrides,
): Promise<string> {
  switch (name) {
    case "BookingReceived":
      return render(
        BookingReceivedEmail({
          guestName: sampleGuestName,
          details: sampleBookingDetails,
          ...overrides,
        }),
      );
    case "BookingConfirmed":
      return render(
        BookingConfirmedEmail({
          guestName: sampleGuestName,
          details: sampleBookingDetails,
          ...overrides,
        }),
      );
    case "AdminAlert":
      return render(
        AdminAlertEmail({
          details: sampleBookingDetails,
          ...overrides,
        }),
      );
  }
}

export async function renderEmailTemplatePreview(
  template: EmailTemplateRecord,
): Promise<{ name: EmailTemplateName; subject: string; html: string }> {
  const overrides = toEmailThemeOverrides(template) ?? {};
  const subject = interpolateEmailText(template.subject, {
    guestName: sampleGuestName,
  });

  return {
    name: template.name,
    subject,
    html: await renderTemplateHtml(template.name, overrides),
  };
}

export async function renderAllEmailTemplatePreviews(
  templates: EmailTemplateRecord[],
): Promise<Array<{ name: EmailTemplateName; subject: string; html: string }>> {
  return Promise.all(templates.map((template) => renderEmailTemplatePreview(template)));
}
