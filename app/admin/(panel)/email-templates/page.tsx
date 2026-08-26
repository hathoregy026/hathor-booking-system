"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Loader2, Mail, Save, Send } from "lucide-react";
import { CmsPageHeader } from "@/components/admin/CmsPageHeader";
import {
  EmailTemplatePreviewButton,
  EmailTemplatePreviewModal,
} from "@/components/admin/EmailTemplatePreviewModal";
import { EmailImageUpload } from "@/components/admin/EmailImageUpload";
import { useToast } from "@/components/admin/ToastProvider";
import { adminFetch } from "@/lib/admin-fetch";
import {
  EMAIL_TEMPLATE_NAMES,
  type EmailTemplateName,
  type EmailTemplateRecord,
} from "@/lib/email-templates";

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
  BookingConfirmed: {
    label: "Booking Confirmed",
    description: "Sent to guests when their cruise is confirmed.",
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
};

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

  const activeCopy = useMemo(
    () => copies.find((entry) => entry.name === activeTab) ?? copies[0],
    [copies, activeTab],
  );

  const previewDraft = useMemo(
    () => ({
      shared,
      templates: copies,
    }),
    [shared, copies],
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
                Use {"{guestName}"} where needed.
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
        Click &ldquo;Save all templates&rdquo; after editing copy or colors. Use
        Preview or Send test email to verify.
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
