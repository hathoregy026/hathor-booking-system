import { z } from "zod";

export const mailboxIdSchema = z.enum(["ceo", "acc", "sales", "reservations", "reception", "info"]);
export type MailboxId = z.infer<typeof mailboxIdSchema>;
export const EMAIL_MAILBOXES: { id: MailboxId; label: string; address: string; forwardingAddress: string; color: string }[] = [
  { id: "ceo", label: "CEO", address: "ceo@hathorcruise.com", forwardingAddress: "ceo@reply.hathorcruise.com", color: "#e6bd58" },
  { id: "acc", label: "ACC", address: "acc@hathorcruise.com", forwardingAddress: "acc@reply.hathorcruise.com", color: "#42cda4" },
  { id: "sales", label: "SALES", address: "sales@hathorcruise.com", forwardingAddress: "sales@reply.hathorcruise.com", color: "#ff9064" },
  { id: "reservations", label: "RESERVATIONS", address: "reservations@hathorcruise.com", forwardingAddress: "reservations@reply.hathorcruise.com", color: "#58cdec" },
  { id: "reception", label: "RECEPTION", address: "reception@hathorcruise.com", forwardingAddress: "reception@reply.hathorcruise.com", color: "#bba2f5" },
  { id: "info", label: "INFO", address: "info@hathorcruise.com", forwardingAddress: "info@reply.hathorcruise.com", color: "#f388ad" },
];

export function emailMailbox(id: MailboxId) {
  return EMAIL_MAILBOXES.find(mailbox => mailbox.id === id)!;
}

export const mailboxSettingsSchema = z.object({
  mailboxId: mailboxIdSchema,
  handlerName: z.string().trim().max(80).refine(value => !/[\u0000-\u001f\u007f<>]/.test(value), "Use a name without control characters"),
}).strict();

export type MailboxSummary = ReturnType<typeof emailMailbox> & { handlerName: string; total: number; unread: number };
