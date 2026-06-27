/** Resend sandbox only allows sending to the account owner's verified email. */
export const RESEND_SANDBOX_RECIPIENT = "hathoregy026@gmail.com";

export function getResendFromAddress(): string {
  return (
    process.env.RESEND_FROM_EMAIL?.trim() ??
    "Hathor Dahabiya <onboarding@resend.dev>"
  );
}

export function getAdminNotificationEmail(): string {
  return (
    process.env.ADMIN_EMAIL?.trim() ||
    process.env.RESEND_TEST_EMAIL?.trim() ||
    RESEND_SANDBOX_RECIPIENT
  );
}

/** Test emails must go to the Resend-verified address while on onboarding@resend.dev. */
export function getTestEmailRecipient(): string {
  return (
    process.env.RESEND_TEST_EMAIL?.trim() ||
    process.env.ADMIN_EMAIL?.trim() ||
    RESEND_SANDBOX_RECIPIENT
  );
}
