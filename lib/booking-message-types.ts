export type BookingAttachment = {
  id: string;
  filename: string;
  contentType: string;
  storagePath?: string;
};

export type BookingMessageDto = {
  id: string;
  direction: "INBOUND" | "OUTBOUND";
  status: "PENDING" | "SENT" | "FAILED" | "RECEIVED";
  sender: string;
  subject: string;
  bodyText: string;
  senderMatchesGuest: boolean;
  attachments: BookingAttachment[];
  createdAt: string;
};
