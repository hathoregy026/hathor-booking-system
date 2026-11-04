/** A charter request sent through the website's charter form. */
export type CharterRequestDto = { id: string; name: string; email: string; subject: string; preview: string; createdAt: string; read: boolean };
/** A whole-ship charter closed by hand on Availability. */
export type CharterManualDto = { blockKey: string; name: string; voyage: string | null; startsAt: string; endsAt: string; createdAt: string };
export type ChartersSnapshot = { requests: CharterRequestDto[]; manual: CharterManualDto[] };

/** Opens the charter request in Emails. */
export const charterRequestHref = (id: string) => `/admin/inbox?source=general&message=${encodeURIComponent(id)}`;
