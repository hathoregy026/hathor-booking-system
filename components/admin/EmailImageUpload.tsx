"use client";

import { useRef, useState } from "react";
import { AlertCircle, ImageIcon, Loader2, Upload } from "lucide-react";
import { adminFetch, ADMIN_UPLOAD_TIMEOUT_MS } from "@/lib/admin-fetch";
import { validateEmailImageFile } from "@/lib/image-upload";

const ACCEPT = "image/jpeg,image/png,image/webp";

type EmailImageUploadProps = {
  label: string;
  /** Only hero is changeable — logo is locked in the dashboard. */
  field: "heroImageUrl";
  value: string | null;
  onUploaded: (url: string) => void;
};

export function EmailImageUpload({
  label,
  field,
  value,
  onUploaded,
}: EmailImageUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [previewBust, setPreviewBust] = useState(0);

  const handleUpload = async (file: File) => {
    setError(null);
    setIsUploading(true);

    try {
      const validationError = validateEmailImageFile(file);
      if (validationError) {
        throw new Error(validationError);
      }

      const form = new FormData();
      form.append("field", field);
      form.append("file", file, file.name);

      const response = await adminFetch(
        "/api/admin/email-templates/upload",
        {
          method: "POST",
          body: form,
          cache: "no-store",
        },
        ADMIN_UPLOAD_TIMEOUT_MS,
      );

      const data = (await response.json()) as {
        url?: string;
        error?: string;
      };

      if (!response.ok || !data.url) {
        throw new Error(data.error ?? "Upload failed");
      }

      setPreviewBust(Date.now());
      onUploaded(data.url);
    } catch (uploadError) {
      setError(
        uploadError instanceof Error ? uploadError.message : "Upload failed",
      );
    } finally {
      setIsUploading(false);
      if (inputRef.current) {
        inputRef.current.value = "";
      }
    }
  };

  const previewSrc = value
    ? `${value}${value.includes("?") ? "&" : "?"}cb=${previewBust || "1"}`
    : null;

  return (
    <div className="space-y-3">
      <span
        className="block text-sm font-medium"
        style={{ color: "var(--text-primary)" }}
      >
        {label}
      </span>

      {previewSrc ? (
        <div
          className="overflow-hidden rounded-2xl border"
          style={{ borderColor: "var(--border)", background: "var(--input-bg)" }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            key={previewSrc}
            src={previewSrc}
            alt={`${label} preview`}
            className="max-h-40 w-full object-contain p-2"
            onError={(event) => {
              event.currentTarget.style.display = "none";
              const fallback = event.currentTarget.nextElementSibling;
              if (fallback instanceof HTMLElement) {
                fallback.hidden = false;
              }
            }}
          />
          <div
            hidden
            className="flex h-28 flex-col items-center justify-center gap-1 text-sm"
            style={{ color: "var(--text-muted)" }}
          >
            <ImageIcon className="h-8 w-8" aria-hidden />
            <span>Preview broken — re-upload</span>
          </div>
        </div>
      ) : (
        <div
          className="flex h-28 items-center justify-center rounded-2xl border border-dashed"
          style={{
            borderColor: "var(--border)",
            background: "var(--input-bg)",
            color: "var(--text-muted)",
          }}
        >
          <ImageIcon className="h-8 w-8" aria-hidden />
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept={ACCEPT}
        className="hidden"
        id={`email-upload-${field}`}
        onChange={(event) => {
          const next = event.target.files?.[0];
          if (next) void handleUpload(next);
        }}
      />

      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={isUploading}
        className="btn-primary inline-flex items-center gap-2 px-3 py-2 text-sm disabled:opacity-60"
      >
        {isUploading ? (
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
        ) : (
          <Upload className="h-4 w-4" aria-hidden />
        )}
        {isUploading ? "Uploading…" : `Replace ${label}`}
      </button>

      <p className="text-xs" style={{ color: "var(--text-muted)" }}>
        JPG, PNG, or WebP — max 5 MB. Stored in Supabase. Replacing deletes the
        previous hero file completely.
      </p>

      {error ? (
        <p className="flex items-center gap-1.5 text-sm text-red-600">
          <AlertCircle className="h-4 w-4 shrink-0" aria-hidden />
          {error}
        </p>
      ) : null}
    </div>
  );
}
