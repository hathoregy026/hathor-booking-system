"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Loader2, Mail, Save, Send } from "lucide-react";
import { CmsPageHeader } from "@/components/admin/CmsPageHeader";
import {
  EmailTemplatePreviewButton,
  EmailTemplatePreviewModal,
} from "@/components/admin/EmailTemplatePreviewModal";
import { EmailImageUpload } from "@/components/admin/EmailImageUpload";
import { EmailHeroFramerPanel } from "@/components/admin/EmailHeroFramer";
import { useToast } from "@/components/admin/ToastProvider";
import { adminFetch } from "@/lib/admin-fetch";
import {
  EMAIL_TEMPLATE_NAMES,
  type EmailTemplateName,
  type EmailTemplateRecord,
} from "@/lib/email-templates";
import {
  DEFAULT_EMAIL_FOOTER,
  EMAIL_FOOTER_LIMITS,
  resolveEmailFooterCopyright,
  type EmailFooterSettings,
} from "@/lib/email-footer";
import { emailColors, emailFonts } from "@/emails/styles";

type SharedBranding = {
  logoUrl: string | null;
  heroImageUrl: string | null;
  primaryColor: string;
  backgroundColor: string;
};

type TemplateCopy = {
  name: EmailTemplateName;
  subject: string;
  heroHeading: string;
  bodyText: string;
};

const TEMPLATE_META: Record<
  EmailTemplateName,
  { label: string; description: string }
> = {
  BookingReceived: {
    label: "Booking Received",
    description: "Sent to guests when they submit a booking request.",
  },
  BookingInvoice: {
    label: "Invoice",
    description:
      "Sent when you press Confirm on a request: the deposit due, your payment instructions and the payment schedule. Use {bookingCode} in the subject.",
  },
  BookingConfirmed: {
    label: "Booking Confirmed",
    description:
      "Sent automatically once a recorded payment covers the deposit: the amount received and the remaining schedule.",
  },
  BookingDeclined: {
    label: "Booking Declined",
    description: "Sent when you decline a request. Your optional note is added below this text.",
  },
  BookingMessage: {
    label: "Team Reply",
    description: "Frames the replies your team writes from a booking. The text here is the closing line under your message.",
  },
  AdminAlert: {
    label: "Admin Alert",
    description: "Notifies your team of new booking requests.",
  },
  ContactReceived: {
    label: "Contact Reply",
    description:
      "Sent to guests after they contact us. Edit the thank-you heading and message here.",
  },
  ContactAlert: {
    label: "Contact Alert",
    description:
      "Your team's copy of every contact and charter message: the guest's details and message, with a Reply button. Use {inquiryType} for “Contact inquiry” or “Charter request”.",
  },
};

/** The footer's editable lines, in the order the email shows them. */
const FOOTER_FIELDS: {
  key: keyof EmailFooterSettings;
  label: string;
  hint: string;
  multiline?: boolean;
}[] = [
  { key: "tagline", label: "Tagline", hint: "The gold italic line under HATHOR." },
  { key: "email", label: "Email address", hint: "Shown underlined; guests can tap it to write to you." },
  { key: "phone", label: "Phone number", hint: "Shown under the email address." },
  {
    key: "replyNote",
    label: "Reply note",
    hint: "On the invoice, confirmation, decline and team-reply emails.",
    multiline: true,
  },
  { key: "copyright", label: "Copyright line", hint: "Small gold capitals at the bottom. {year} becomes the current year." },
  { key: "adminTitle", label: "Team alert title", hint: "Top line of the footer on your team's own alerts (new bookings, contact messages)." },
];

/** The footer as it appears at the end of a guest email, from the form. */
function FooterPreview({ footer, gold }: { footer: EmailFooterSettings; gold: string }) {
  const copyright = resolveEmailFooterCopyright(footer.copyright);
  return (
    <div
      className="flex h-full flex-col items-center justify-center rounded-2xl px-6 py-10 text-center"
      style={{ background: emailColors.dark }}
      aria-label="Footer preview"
    >
      <span
        className="text-[28px] uppercase leading-tight tracking-[0.04em]"
        style={{ color: emailColors.copyOnDark, fontFamily: emailFonts.display }}
      >
        Hathor
      </span>
      {footer.tagline ? (
        <span className="mt-2 text-[15px] italic" style={{ color: gold, fontFamily: emailFonts.editorial }}>
          {footer.tagline}
        </span>
      ) : null}
      {footer.email ? (
        <span className="mt-7 text-[13px] underline" style={{ color: emailColors.copyOnDark, fontFamily: emailFonts.body }}>
          {footer.email}
        </span>
      ) : null}
      {footer.phone ? (
        <span
          className={`${footer.email ? "mt-1" : "mt-7"} text-[13px] font-light`}
          style={{ color: "rgba(246, 239, 223, 0.72)", fontFamily: emailFonts.body }}
        >
          {footer.phone}
        </span>
      ) : null}
      {footer.replyNote ? (
        <span
          className="mt-6 max-w-xs text-[12px] font-light leading-relaxed"
          style={{ color: "rgba(246, 239, 223, 0.62)", fontFamily: emailFonts.body }}
        >
          {footer.replyNote}
        </span>
      ) : null}
      {copyright ? (
        <span
          className="mt-6 text-[10px] font-medium uppercase tracking-[0.18em]"
          style={{ color: gold, fontFamily: emailFonts.body }}
        >
          {copyright}
        </span>
      ) : null}
    </div>
  );
}

/** The words each email fills in for you. */
function variablesFor(name: EmailTemplateName): string {
  if (name === "ContactReceived") return "{guestName}";
  if (name === "ContactAlert") return "{guestName}, {inquiryType}";
  return "{guestName}, {bookingCode}";
}

function pickShared(templates: EmailTemplateRecord[]): SharedBranding {
  const first = templates[0];
  return {
    logoUrl: "/email/hathor-email-icon.png",
    heroImageUrl: first?.heroImageUrl ?? null,
    primaryColor: first?.primaryColor ?? "#b69f64",
    backgroundColor: first?.backgroundColor ?? "#ece4da",
  };
}

function toCopy(template: EmailTemplateRecord): TemplateCopy {
  return {
    name: template.name,
    subject: template.subject,
    heroHeading: template.heroHeading ?? "",
    bodyText: template.bodyText ?? "",
  };
}

export default function AdminEmailTemplatesPage() {
  const { showToast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isSendingTest, setIsSendingTest] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<EmailTemplateName>("BookingReceived");
  const [shared, setShared] = useState<SharedBranding>({
    logoUrl: null,
    heroImageUrl: null,
    primaryColor: "#b69f64",
    backgroundColor: "#ece4da",
  });
  const [copies, setCopies] = useState<TemplateCopy[]>([]);
  /* The footer wording every email shares. */
  const [footer, setFooter] = useState<EmailFooterSettings>(DEFAULT_EMAIL_FOOTER);

  const activeCopy = useMemo(
    () => copies.find((entry) => entry.name === activeTab) ?? copies[0],
    [copies, activeTab],
  );

  const previewDraft = useMemo(
    () => ({
      shared,
      templates: copies,
      footer,
    }),
    [shared, copies, footer],
  );

  const loadTemplates = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await adminFetch("/api/admin/email-templates");
      const data = await response.json();
      if (!response.ok && !data.templates) {
        throw new Error(data.error ?? "Failed to load");
      }
      const templates = data.templates as EmailTemplateRecord[];
      setShared(pickShared(templates));
      setCopies(templates.map(toCopy));
      if (data.footer) setFooter(data.footer as EmailFooterSettings);
    } catch {
      showToast("error", "Failed to load email templates");
    } finally {
      setIsLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    void loadTemplates();
  }, [loadTemplates]);

  const updateCopy = (name: EmailTemplateName, patch: Partial<TemplateCopy>) => {
    setCopies((current) =>
      current.map((entry) =>
        entry.name === name ? { ...entry, ...patch } : entry,
      ),
    );
  };

  const handleSaveAll = async () => {
    if (copies.some((entry) => !entry.subject.trim())) {
      showToast("error", "Every template needs a subject line");
      return;
    }

    setIsSaving(true);
    try {
      const response = await adminFetch("/api/admin/email-templates", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          shared,
          templates: copies.map((entry) => ({
            name: entry.name,
            subject: entry.subject,
            heroHeading: entry.heroHeading || null,
            bodyText: entry.bodyText || null,
          })),
          footer,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error ?? "Save failed");
      }

      showToast("success", "All email templates saved");
      const templates = data.templates as EmailTemplateRecord[];
      setShared(pickShared(templates));
      setCopies(templates.map(toCopy));
      if (data.footer) setFooter(data.footer as EmailFooterSettings);
    } catch (error) {
      showToast(
        "error",
        error instanceof Error ? error.message : "Failed to save templates",
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleSendTest = async () => {
    setIsSendingTest(true);
    try {
      const response = await adminFetch("/api/admin/test-email");
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error ?? "Test email failed");
      }
      showToast("success", `Test email sent to ${data.to}`);
    } catch (error) {
      showToast(
        "error",
        error instanceof Error ? error.message : "Failed to send test email",
      );
    } finally {
      setIsSendingTest(false);
    }
  };

  if (isLoading) {
    return (
      <div
        className="flex items-center justify-center gap-2 py-16"
        style={{ color: "var(--text-secondary)" }}
      >
        <Loader2 className="h-5 w-5 animate-spin" aria-hidden />
        Loading email templates...
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <CmsPageHeader
        title="Email Templates"
        description="Brand and copy for booking emails and the contact-form reply"
        icon={Mail}
        action={
          <div className="flex flex-wrap gap-2">
            <EmailTemplatePreviewButton onClick={() => setPreviewOpen(true)} />
            <button
              type="button"
              onClick={() => void handleSendTest()}
              disabled={isSendingTest}
              className="btn-outline h-10 px-4 text-sm disabled:opacity-60"
            >
              {isSendingTest ? (
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
              ) : (
                <Send className="h-4 w-4" aria-hidden />
              )}
              Send test email
            </button>
            <button
              type="button"
              onClick={() => void handleSaveAll()}
              disabled={isSaving}
              className="btn-primary h-10 px-4 text-sm disabled:opacity-60"
            >
              {isSaving ? (
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
              ) : (
                <Save className="h-4 w-4" aria-hidden />
              )}
              Save all templates
            </button>
          </div>
        }
      />

      <section className="card space-y-6 p-4 sm:p-6">
        <div>
          <h2 className="admin-heading text-lg">Shared branding</h2>
          <p className="mt-1 text-sm" style={{ color: "var(--text-secondary)" }}>
            Hero image and colors apply to booking emails. The contact reply uses
            the same logo and colors, without a hero image. The logo icon is
            fixed.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div className="space-y-3">
            <span
              className="block text-sm font-medium"
              style={{ color: "var(--text-primary)" }}
            >
              Logo
            </span>
            <div
              className="flex h-40 items-center justify-center overflow-hidden rounded-2xl border"
              style={{
                borderColor: "var(--border)",
                background: "#ece4da",
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/email/hathor-email-icon.png?v=transparent"
                alt="Hathor icon"
                className="h-16 w-16 object-contain"
              />
            </div>
            <p className="text-xs" style={{ color: "var(--text-muted)" }}>
              Locked brand mark — the Hathor ring icon is used on every email.
            </p>
          </div>
          <EmailImageUpload
            label="Hero image"
            field="heroImageUrl"
            value={shared.heroImageUrl}
            onUploaded={(url) => {
              setShared((current) => ({
                ...current,
                heroImageUrl: url,
              }));
              showToast(
                "success",
                "Hero replaced in Supabase — previous file deleted",
              );
              void loadTemplates();
            }}
          />
        </div>

        <EmailHeroFramerPanel
          heroImageUrl={shared.heroImageUrl}
          onSaved={(url) => {
            setShared((current) => ({ ...current, heroImageUrl: url }));
            showToast("success", "Banner framing saved — every email now uses it");
          }}
        />

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <label className="block text-sm">
            <span
              className="mb-1 block font-medium"
              style={{ color: "var(--text-primary)" }}
            >
              Primary color (gold)
            </span>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={shared.primaryColor}
                onChange={(event) =>
                  setShared((current) => ({
                    ...current,
                    primaryColor: event.target.value,
                  }))
                }
                className="h-10 w-12 cursor-pointer rounded border p-1"
                style={{ borderColor: "var(--border)" }}
              />
              <input
                value={shared.primaryColor}
                onChange={(event) =>
                  setShared((current) => ({
                    ...current,
                    primaryColor: event.target.value,
                  }))
                }
                className="input min-w-0 flex-1 px-3 py-2"
              />
            </div>
          </label>

          <label className="block text-sm">
            <span
              className="mb-1 block font-medium"
              style={{ color: "var(--text-primary)" }}
            >
              Background color
            </span>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={shared.backgroundColor}
                onChange={(event) =>
                  setShared((current) => ({
                    ...current,
                    backgroundColor: event.target.value,
                  }))
                }
                className="h-10 w-12 cursor-pointer rounded border p-1"
                style={{ borderColor: "var(--border)" }}
              />
              <input
                value={shared.backgroundColor}
                onChange={(event) =>
                  setShared((current) => ({
                    ...current,
                    backgroundColor: event.target.value,
                  }))
                }
                className="input min-w-0 flex-1 px-3 py-2"
              />
            </div>
          </label>
        </div>
      </section>

      <section className="card space-y-6 p-4 sm:p-6">
        <div>
          <h2 className="admin-heading text-lg">Footer</h2>
          <p className="mt-1 text-sm" style={{ color: "var(--text-secondary)" }}>
            The signature at the bottom of every email. The HATHOR wordmark and
            the colors stay fixed; clear a line to leave it out.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div className="space-y-4">
            {FOOTER_FIELDS.map((field) => (
              <label key={field.key} className="block text-sm">
                <span
                  className="mb-1 block font-medium"
                  style={{ color: "var(--text-primary)" }}
                >
                  {field.label}
                </span>
                {field.multiline ? (
                  <textarea
                    value={footer[field.key]}
                    maxLength={EMAIL_FOOTER_LIMITS[field.key]}
                    onChange={(event) =>
                      setFooter((current) => ({ ...current, [field.key]: event.target.value }))
                    }
                    rows={2}
                    className="input w-full px-3 py-2"
                  />
                ) : (
                  <input
                    value={footer[field.key]}
                    maxLength={EMAIL_FOOTER_LIMITS[field.key]}
                    onChange={(event) =>
                      setFooter((current) => ({ ...current, [field.key]: event.target.value }))
                    }
                    className="input w-full px-3 py-2"
                  />
                )}
                <span
                  className="mt-1 block text-xs"
                  style={{ color: "var(--text-secondary)" }}
                >
                  {field.hint}
                </span>
              </label>
            ))}
          </div>
          <FooterPreview footer={footer} gold={shared.primaryColor} />
        </div>
      </section>

      <section className="card p-4 sm:p-6">
        <div className="mb-4 flex flex-wrap gap-2 border-b pb-4" style={{ borderColor: "var(--border)" }}>
          {EMAIL_TEMPLATE_NAMES.map((name) => (
            <button
              key={name}
              type="button"
              onClick={() => setActiveTab(name)}
              className={
                activeTab === name
                  ? "btn-primary px-4 py-2 text-sm"
                  : "btn-outline px-4 py-2 text-sm"
              }
            >
              {TEMPLATE_META[name].label}
            </button>
          ))}
        </div>

        {activeCopy ? (
          <div className="space-y-4">
            <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
              {TEMPLATE_META[activeCopy.name].description}
            </p>

            <label className="block text-sm">
              <span
                className="mb-1 block font-medium"
                style={{ color: "var(--text-primary)" }}
              >
                Subject line
              </span>
              <input
                value={activeCopy.subject}
                onChange={(event) =>
                  updateCopy(activeCopy.name, { subject: event.target.value })
                }
                className="input w-full px-3 py-2"
              />
              <span
                className="mt-1 block text-xs"
                style={{ color: "var(--text-secondary)" }}
              >
                You can use {variablesFor(activeCopy.name)} in the subject, heading and text; they are filled in for each email.
              </span>
            </label>

            <label className="block text-sm">
              <span
                className="mb-1 block font-medium"
                style={{ color: "var(--text-primary)" }}
              >
                {activeCopy.name === "ContactReceived"
                  ? "Thank you heading"
                  : "Hero heading"}
              </span>
              <input
                value={activeCopy.heroHeading}
                onChange={(event) =>
                  updateCopy(activeCopy.name, { heroHeading: event.target.value })
                }
                className="input w-full px-3 py-2"
                placeholder="Thank you, {guestName}"
              />
            </label>

            <label className="block text-sm">
              <span
                className="mb-1 block font-medium"
                style={{ color: "var(--text-primary)" }}
              >
                {activeCopy.name === "ContactReceived"
                  ? "Thank you message"
                  : "Body text"}
              </span>
              <textarea
                value={activeCopy.bodyText}
                onChange={(event) =>
                  updateCopy(activeCopy.name, { bodyText: event.target.value })
                }
                rows={5}
                className="input w-full px-3 py-2"
              />
            </label>
          </div>
        ) : null}
      </section>

      <div
        className="card flex items-center gap-3 p-4 text-sm"
        style={{ color: "var(--text-secondary)" }}
      >
        <Mail className="h-4 w-4 shrink-0" aria-hidden />
        Images upload to Supabase for the hero only. The Hathor icon is locked.
        Click &ldquo;Save all templates&rdquo; after editing copy, colors or the
        footer. Use Preview or Send test email to verify.
      </div>

      <EmailTemplatePreviewModal
        open={previewOpen}
        onClose={() => setPreviewOpen(false)}
        draft={previewDraft}
        initialTemplate={activeTab}
      />
    </div>
  );
}
