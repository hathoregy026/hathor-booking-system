export const BULK_RECIPIENT_LIMIT = 100;
export const BULK_UPLOAD_LIMIT = 2 * 1024 * 1024;
export type BulkJournalImage = { show: boolean; url?: string; alt: string };
export type BulkJournalTemplate = {
  mastheadLabel: string;
  mastheadLocation: string;
  introImage: BulkJournalImage;
  features: Array<{ title: string; body: string }>;
  galleryHeading: string;
  galleryBody: string;
  galleryCaption: string;
  galleryMainImage: BulkJournalImage;
  galleryUpperImage: BulkJournalImage;
  galleryLowerImage: BulkJournalImage;
  journeyHeading: string;
  journeyBody: string;
  discoverButton: { label: string; url: string };
  journeyButton: { label: string; url: string };
  address: string;
  preferencesLabel: string;
  preferencesUrl: string;
};
export type BulkEmailTemplate = {
  eyebrow: string;
  heading: string;
  showBanner: boolean;
  /** Optional campaign-only upload. Absent means the shared Hathor banner. */
  heroImageUrl?: string;
  signature?: string;
  primaryColor: string;
  backgroundColor: string;
  footer: { tagline: string; email: string; phone: string; replyNote: string; copyright: string };
  /** Campaign-only journal content. Omitted in older saved campaigns. */
  journal?: BulkJournalTemplate;
};

export type RecipientImport = {
  emails: string[];
  duplicates: number;
  invalid: string[];
  warnings: string[];
};
export type BulkRecipient = {
  email: string;
  status: "pending" | "accepted" | "simulated" | "skipped";
  providerId?: string;
};
export type BulkCampaign = {
  id: string;
  subject: string;
  message: string;
  template?: BulkEmailTemplate;
  mode: "preview" | "send";
  status: "queued" | "sending" | "accepted" | "simulated" | "failed" | "uncertain" | "cancelled";
  recipients: BulkRecipient[];
  createdAt: string;
  updatedAt: string;
  /** Deleted history keeps only a minimal marker to prevent duplicate sending. */
  deletedAt?: string;
  firstAttemptAt?: string;
  leaseUntil?: number;
  error?: string;
  createdBySession: string;
  previewHtml?: string;
  payload: Array<{ from: string; to: string; subject: string; html: string; text: string; reply_to?: string; headers: Record<string, string> }>;
};
export type BulkCampaignView = Omit<BulkCampaign, "payload" | "createdBySession" | "leaseUntil" | "previewHtml">;
export type BulkSettings = { mode: "preview" | "send"; from: string; replyTo: string; recipientLimit: number };
