"use client";

import { useCallback, useEffect, useState } from "react";
import { Loader2, Mail, Pencil, Save, X } from "lucide-react";
import {
  EmailTemplatePreviewButton,
  EmailTemplatePreviewModal,
} from "@/components/admin/EmailTemplatePreviewModal";
import { ImageUpload } from "@/components/admin/ImageUpload";
import { useToast } from "@/components/admin/ToastProvider";
import { adminFetch } from "@/lib/admin-fetch";
import type { EmailTemplateName, EmailTemplateRecord } from "@/lib/email-templates";

type TemplateForm = {
  subject: string;
  logoUrl: string | null;
  heroImageUrl: string | null;
  primaryColor: string;
  backgroundColor: string;
  heroHeading: string;
  bodyText: string;
};

const TEMPLATE_META: Record<
  EmailTemplateName,
  { label: string; description: string; audience: string }
> = {
  BookingReceived: {
    label: "Booking Received",
    description: "Sent to guests immediately after they submit a booking request.",
    audience: "Guest",
  },
  BookingConfirmed: {
    label: "Booking Confirmed",
    description: "Sent to guests when their cruise reservation is confirmed.",
    audience: "Guest",
  },
  AdminAlert: {
    label: "Admin Alert",
    description: "Notifies your team when a new booking request arrives.",
    audience: "Admin",
  },
};

function toForm(template: EmailTemplateRecord): TemplateForm {
  return {
    subject: template.subject,
    logoUrl: template.logoUrl,
    heroImageUrl: template.heroImageUrl,
    primaryColor: template.primaryColor,
    backgroundColor: template.backgroundColor,
    heroHeading: template.heroHeading ?? "",
    bodyText: template.bodyText ?? "",
  };
}

export default function AdminEmailTemplatesPage() {
  const { showToast } = useToast();
  const [templates, setTemplates] = useState<EmailTemplateRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingName, setEditingName] = useState<EmailTemplateName | null>(null);
  const [form, setForm] = useState<TemplateForm | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);

  const loadTemplates = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await adminFetch("/api/admin/email-templates");
      const data = await response.json();
      if (!response.ok && !data.templates) {
        throw new Error(data.error ?? "Failed to load");
      }
      setTemplates(data.templates as EmailTemplateRecord[]);
    } catch {
      showToast("error", "Failed to load email templates");
    } finally {
      setIsLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    loadTemplates();
  }, [loadTemplates]);

  const openEditor = (template: EmailTemplateRecord) => {
    setEditingName(template.name);
    setForm(toForm(template));
  };

  const closeEditor = () => {
    if (isSaving) return;
    setEditingName(null);
    setForm(null);
  };

  const updateForm = (patch: Partial<TemplateForm>) => {
    setForm((current) => (current ? { ...current, ...patch } : current));
  };

  const handleSave = async () => {
    if (!editingName || !form) return;

    setIsSaving(true);
    try {
      const response = await fetch("/api/admin/email-templates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: editingName,
          subject: form.subject,
          logoUrl: form.logoUrl,
          heroImageUrl: form.heroImageUrl,
          primaryColor: form.primaryColor,
          backgroundColor: form.backgroundColor,
          heroHeading: form.heroHeading || null,
          bodyText: form.bodyText || null,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error ?? "Save failed");
      }

      showToast("success", "Email template saved");
      closeEditor();
      await loadTemplates();
    } catch (error) {
      showToast(
        "error",
        error instanceof Error ? error.message : "Failed to save template",
      );
    } finally {
      setIsSaving(false);
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
    <div className="mx-auto max-w-6xl space-y-4 sm:space-y-6">
      <div className="admin-card p-4 sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="admin-heading text-xl sm:text-2xl">Email Templates</h1>
            <p
              className="mt-2 max-w-2xl text-sm leading-relaxed"
              style={{ color: "var(--text-secondary)" }}
            >
              Customize subject lines, branding, hero imagery, and messaging for
              automated booking emails. Changes apply to new emails only. If the
              database is unavailable, the system falls back to the built-in luxury
              design.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <EmailTemplatePreviewButton onClick={() => setPreviewOpen(true)} />
            <div
              className="inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold"
              style={{
                background: "var(--bg-secondary)",
                color: "var(--text-secondary)",
              }}
            >
              <Mail className="h-3.5 w-3.5" aria-hidden />
              {templates.length} templates
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:gap-6 lg:grid-cols-3">
        {templates.map((template) => {
          const meta = TEMPLATE_META[template.name];
          return (
            <section key={template.name} className="admin-card flex flex-col p-4 sm:p-6">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p
                    className="text-xs font-semibold uppercase tracking-wider"
                    style={{ color: "var(--accent)" }}
                  >
                    {meta.audience}
                  </p>
                  <h2 className="admin-heading mt-1 text-lg">{meta.label}</h2>
                </div>
                <span
                  className="rounded-md px-2 py-1 text-[10px] font-bold uppercase tracking-wide"
                  style={{
                    background: "var(--bg-secondary)",
                    color: "var(--text-secondary)",
                  }}
                >
                  {template.name}
                </span>
              </div>

              {template.heroImageUrl ? (
                <div
                  className="mt-4 overflow-hidden rounded-xl border"
                  style={{ borderColor: "var(--border)" }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={template.heroImageUrl}
                    alt={`${meta.label} hero`}
                    className="h-24 w-full object-cover"
                  />
                </div>
              ) : null}

              <p
                className="mt-3 flex-1 text-sm leading-relaxed"
                style={{ color: "var(--text-secondary)" }}
              >
                {meta.description}
              </p>

              <div
                className="mt-4 space-y-2 rounded-lg p-3 text-sm"
                style={{ background: "var(--bg-secondary)" }}
              >
                <p style={{ color: "var(--text-primary)" }}>
                  <span style={{ color: "var(--text-secondary)" }}>Subject: </span>
                  {template.subject}
                </p>
                {template.heroHeading ? (
                  <p style={{ color: "var(--text-primary)" }}>
                    <span style={{ color: "var(--text-secondary)" }}>Heading: </span>
                    {template.heroHeading}
                  </p>
                ) : null}
              </div>

              <div className="mt-4 flex items-center gap-2">
                {template.logoUrl ? (
                  <div
                    className="h-8 w-8 overflow-hidden rounded border"
                    style={{ borderColor: "var(--border)" }}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={template.logoUrl}
                      alt=""
                      className="h-full w-full object-contain"
                    />
                  </div>
                ) : null}
                <span
                  className="h-5 w-5 rounded-full border"
                  style={{
                    backgroundColor: template.backgroundColor,
                    borderColor: "var(--border)",
                  }}
                  title="Background color"
                />
                <span
                  className="h-5 w-5 rounded-full border"
                  style={{
                    backgroundColor: template.primaryColor,
                    borderColor: "var(--border)",
                  }}
                  title="Primary color"
                />
                {template.updatedAt ? (
                  <span
                    className="ml-auto text-xs"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    Updated {new Date(template.updatedAt).toLocaleDateString()}
                  </span>
                ) : (
                  <span
                    className="ml-auto text-xs italic"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    Using defaults
                  </span>
                )}
              </div>

              <button
                type="button"
                onClick={() => openEditor(template)}
                className="admin-btn-outline mt-5 flex w-full items-center justify-center gap-2 px-4 py-2.5 text-sm"
              >
                <Pencil className="h-4 w-4" aria-hidden />
                Edit Template
              </button>
            </section>
          );
        })}
      </div>

      {editingName && form ? (
        <div className="fixed inset-0 z-50 flex items-end justify-center p-0 sm:items-center sm:p-4">
          <button
            type="button"
            className="absolute inset-0 bg-black/50 backdrop-blur-[2px]"
            aria-label="Close editor"
            onClick={closeEditor}
          />
          <div
            className="relative flex max-h-[min(92vh,900px)] w-full max-w-2xl flex-col overflow-hidden rounded-t-2xl shadow-2xl sm:rounded-2xl"
            style={{
              background: "var(--bg-primary)",
              border: "1px solid var(--border)",
            }}
            role="dialog"
            aria-modal="true"
            aria-labelledby="email-template-editor-title"
          >
            <div
              className="flex items-center justify-between border-b px-4 py-4 sm:px-6"
              style={{ borderColor: "var(--border)" }}
            >
              <div>
                <p
                  className="text-xs font-semibold uppercase tracking-wider"
                  style={{ color: "var(--accent)" }}
                >
                  Edit Template
                </p>
                <h2 id="email-template-editor-title" className="admin-heading text-lg">
                  {TEMPLATE_META[editingName].label}
                </h2>
              </div>
              <button
                type="button"
                onClick={closeEditor}
                className="admin-header-icon-btn"
                aria-label="Close"
              >
                <X className="h-4 w-4" aria-hidden />
              </button>
            </div>

            <div className="flex-1 space-y-4 overflow-y-auto px-4 py-4 sm:px-6">
              <label className="block text-sm">
                <span
                  className="mb-1 block font-medium"
                  style={{ color: "var(--text-primary)" }}
                >
                  Subject Line
                </span>
                <input
                  value={form.subject}
                  onChange={(event) => updateForm({ subject: event.target.value })}
                  className="admin-input w-full px-3 py-2"
                  placeholder="Email subject"
                />
                <span
                  className="mt-1 block text-xs"
                  style={{ color: "var(--text-secondary)" }}
                >
                  Use {"{guestName}"} for the guest&apos;s name where applicable.
                </span>
              </label>

              <ImageUpload
                label="Logo"
                value={form.logoUrl}
                onChange={(url) => updateForm({ logoUrl: url })}
                folder="email-templates"
                variant="admin"
                helperText="Upload your brand logo. Leave empty to use the default Hathor logo."
              />

              <ImageUpload
                label="Hero Banner Image"
                value={form.heroImageUrl}
                onChange={(url) => updateForm({ heroImageUrl: url })}
                folder="email-templates"
                variant="admin"
                helperText="Optional wide banner shown at the top of the email."
              />

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <label className="block text-sm">
                  <span
                    className="mb-1 block font-medium"
                    style={{ color: "var(--text-primary)" }}
                  >
                    Primary Color
                  </span>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={form.primaryColor}
                      onChange={(event) =>
                        updateForm({ primaryColor: event.target.value })
                      }
                      className="h-10 w-12 cursor-pointer rounded border p-1"
                      style={{ borderColor: "var(--border)" }}
                    />
                    <input
                      value={form.primaryColor}
                      onChange={(event) =>
                        updateForm({ primaryColor: event.target.value })
                      }
                      className="admin-input min-w-0 flex-1 px-3 py-2"
                    />
                  </div>
                </label>

                <label className="block text-sm">
                  <span
                    className="mb-1 block font-medium"
                    style={{ color: "var(--text-primary)" }}
                  >
                    Background Color
                  </span>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={form.backgroundColor}
                      onChange={(event) =>
                        updateForm({ backgroundColor: event.target.value })
                      }
                      className="h-10 w-12 cursor-pointer rounded border p-1"
                      style={{ borderColor: "var(--border)" }}
                    />
                    <input
                      value={form.backgroundColor}
                      onChange={(event) =>
                        updateForm({ backgroundColor: event.target.value })
                      }
                      className="admin-input min-w-0 flex-1 px-3 py-2"
                    />
                  </div>
                </label>
              </div>

              <label className="block text-sm">
                <span
                  className="mb-1 block font-medium"
                  style={{ color: "var(--text-primary)" }}
                >
                  Hero Heading
                </span>
                <input
                  value={form.heroHeading}
                  onChange={(event) => updateForm({ heroHeading: event.target.value })}
                  className="admin-input w-full px-3 py-2"
                  placeholder="Thank You, {guestName}"
                />
              </label>

              <label className="block text-sm">
                <span
                  className="mb-1 block font-medium"
                  style={{ color: "var(--text-primary)" }}
                >
                  Body Text
                </span>
                <textarea
                  value={form.bodyText}
                  onChange={(event) => updateForm({ bodyText: event.target.value })}
                  rows={5}
                  className="admin-input w-full px-3 py-2"
                  placeholder="Main message shown in the email body"
                />
              </label>
            </div>

            <div
              className="flex flex-col-reverse gap-2 border-t px-4 py-4 sm:flex-row sm:justify-end sm:px-6"
              style={{ borderColor: "var(--border)" }}
            >
              <button
                type="button"
                onClick={closeEditor}
                disabled={isSaving}
                className="admin-btn-outline px-5 py-2.5 text-sm disabled:opacity-60"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSave}
                disabled={isSaving || !form.subject.trim()}
                className="admin-btn-primary flex items-center justify-center gap-2 px-5 py-2.5 text-sm disabled:opacity-60"
              >
                {isSaving ? (
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                ) : (
                  <Save className="h-4 w-4" aria-hidden />
                )}
                Save Template
              </button>
            </div>
          </div>
        </div>
      ) : null}

      <EmailTemplatePreviewModal
        open={previewOpen}
        onClose={() => setPreviewOpen(false)}
      />
    </div>
  );
}
