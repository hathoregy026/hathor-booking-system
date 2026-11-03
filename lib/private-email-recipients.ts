/** Personal mail uses one To address and at most four CC addresses. */
export const PRIVATE_EMAIL_RECIPIENT_LIMIT = 5;
export function privateRecipientAddresses(value: string): string[] {
  return value.split(",").map(address => address.trim().toLowerCase()).filter(Boolean);
}
