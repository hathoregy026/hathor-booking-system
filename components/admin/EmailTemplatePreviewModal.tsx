"use client";

import { useCallback, useEffect, useState } from "react";
import { Eye, Loader2, Monitor, Smartphone, X } from "lucide-react";
import { adminFetch } from "@/lib/admin-fetch";
import type { EmailTemplateName } from "@/lib/email-templates";

type EmailPreview = {
  name: EmailTemplateName;
  subject: string;
  html: string;
};

const TEMPLATE_LABELS: Record<EmailTemplateName, string> = {
  BookingReceived: "Booking Received",
  BookingConfirmed: "Booking Confirmed",
  AdminAlert: "Admin Alert",
};

type EmailTemplatePreviewModalProps = {
  open: boolean;
  onClose: () => void;
};

export function EmailTemplatePreviewModal({
  open,
  onClose,
}: EmailTemplatePreviewModalProps) {
  const [previews, setPreviews] = useState<EmailPreview[]>([]);
  const [activeName, setActiveName] = useState<EmailTemplateName>("BookingReceived");
  const [viewport, setViewport] = useState<"desktop" | "mobile">("desktop");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadPreviews = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await adminFetch("/api/admin/email-templates/preview");
      const data = await response.json();
      if (!response.ok && !data.previews) {
        throw new Error(data.error ?? "Failed to load previews");
      }
      setPreviews(data.previews as EmailPreview[]);
      if (data.warning) {
        setError(data.warning);
      }
    } catch (loadError) {
      setError(
        loadError instanceof Error ? loadError.message : "Failed to load previews",
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (open) {
      loadPreviews();
    }
  }, [open, loadPreviews]);

  if (!open) return null;

  const activePreview =
    previews.find((preview) => preview.name === activeName) ?? previews[0];

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center p-0 sm:items-center sm:p-4">
      <button
        type="button"
        className="absolute inset-0 bg-black/50 backdrop-blur-[2px]"
        aria-label="Close preview"
        onClick={onClose}
      />
      <div
        className="relative flex max-h-[min(94vh,920px)] w-full max-w-6xl flex-col overflow-hidden rounded-t-2xl shadow-2xl sm:rounded-2xl"
        style={{
          background: "var(--bg-primary)",
          border: "1px solid var(--border)",
        }}
        role="dialog"
        aria-modal="true"
        aria-labelledby="email-preview-title"
      >
        <div
          className="flex flex-col gap-3 border-b px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6"
          style={{ borderColor: "var(--border)" }}
        >
          <div className="min-w-0">
            <p
              className="text-xs font-semibold uppercase tracking-wider"
              style={{ color: "var(--accent)" }}
            >
              Email Preview
            </p>
            <h2 id="email-preview-title" className="admin-heading text-lg">
              Preview Emails
            </h2>
            {activePreview ? (
              <p
                className="mt-1 truncate text-sm"
                style={{ color: "var(--text-secondary)" }}
                title={activePreview.subject}
              >
                Subject: {activePreview.subject}
              </p>
            ) : null}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div
              className="inline-flex rounded-lg p-1"
              style={{ background: "var(--bg-secondary)" }}
            >
              <button
                type="button"
                onClick={() => setViewport("desktop")}
                className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold transition-colors ${
                  viewport === "desktop" ? "admin-btn-primary" : ""
                }`}
                style={
                  viewport !== "desktop"
                    ? { color: "var(--text-secondary)" }
                    : undefined
                }
              >
                <Monitor className="h-3.5 w-3.5" aria-hidden />
                Desktop
              </button>
              <button
                type="button"
                onClick={() => setViewport("mobile")}
                className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold transition-colors ${
                  viewport === "mobile" ? "admin-btn-primary" : ""
                }`}
                style={
                  viewport !== "mobile"
                    ? { color: "var(--text-secondary)" }
                    : undefined
                }
              >
                <Smartphone className="h-3.5 w-3.5" aria-hidden />
                Mobile
              </button>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="admin-header-icon-btn"
              aria-label="Close"
            >
              <X className="h-4 w-4" aria-hidden />
            </button>
          </div>
        </div>

        <div
          className="flex gap-1 overflow-x-auto border-b px-4 py-2 sm:px-6"
          style={{ borderColor: "var(--border)" }}
        >
          {(["BookingReceived", "BookingConfirmed", "AdminAlert"] as const).map(
            (name) => (
              <button
                key={name}
                type="button"
                onClick={() => setActiveName(name)}
                className={`shrink-0 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                  activeName === name ? "admin-btn-primary" : "admin-btn-outline"
                }`}
              >
                {TEMPLATE_LABELS[name]}
              </button>
            ),
          )}
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-4 sm:px-6">
          {isLoading ? (
            <div
              className="flex items-center justify-center gap-2 py-20"
              style={{ color: "var(--text-secondary)" }}
            >
              <Loader2 className="h-5 w-5 animate-spin" aria-hidden />
              Rendering email previews...
            </div>
          ) : error && previews.length === 0 ? (
            <div className="py-16 text-center text-sm text-red-600">{error}</div>
          ) : activePreview ? (
            <div className="flex justify-center">
              <div
                className={`email-preview-frame email-preview-frame--${viewport}`}
                style={{
                  background: "var(--bg-secondary)",
                  border: "1px solid var(--border)",
                }}
              >
                <iframe
                  title={`${TEMPLATE_LABELS[activePreview.name]} preview`}
                  srcDoc={activePreview.html}
                  className="h-full w-full border-0 bg-white"
                  sandbox="allow-same-origin"
                />
              </div>
            </div>
          ) : null}

          {error && previews.length > 0 ? (
            <p
              className="mt-3 text-center text-xs"
              style={{ color: "var(--text-secondary)" }}
            >
              {error}
            </p>
          ) : null}
        </div>
      </div>
    </div>
  );
}

export function EmailTemplatePreviewButton({
  onClick,
}: {
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="admin-btn-outline inline-flex w-full items-center justify-center gap-2 px-4 py-2.5 text-sm sm:w-auto"
    >
      <Eye className="h-4 w-4" aria-hidden />
      Preview Emails
    </button>
  );
}
