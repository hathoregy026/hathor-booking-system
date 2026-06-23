/** Days soft-deleted records stay in the recycle bin before permanent removal. */
export const BIN_RETENTION_DAYS = 7;

/** @deprecated Use BIN_RETENTION_DAYS */
export const BOOKING_BIN_RETENTION_DAYS = BIN_RETENTION_DAYS;

export function getPermanentDeleteDate(deletedAt: Date): Date {
  const date = new Date(deletedAt);
  date.setUTCDate(date.getUTCDate() + BIN_RETENTION_DAYS);
  return date;
}
