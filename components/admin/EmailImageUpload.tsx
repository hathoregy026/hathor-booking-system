"use client";

import { useRef, useState } from "react";
import { AlertCircle, ImageIcon, Loader2, Upload } from "lucide-react";
import { adminFetch } from "@/lib/admin-fetch";
import {
  STORAGE_CACHE_CONTROL,
  validateEmailImageFile,
} from "@/lib/image-upload";

const ACCEPT = "image/jpeg,image/png,image/webp";

type EmailImageUploadProps = {
  label: string;
  field: "logoUrl" | "heroImageUrl";
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

  const handleUpload = async (file: File) => {
    setError(null);
    setIsUploading(true);

    try {
      const validationError = validateEmailImageFile(file);
      if (validationError) {
        throw new Error(validationError);
      }

      const signResponse = await adminFetch("/api/admin/email-templates/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          field,
          fileName: file.name,
          contentType: file.type || "application/octet-stream",
          fileSize: file.size,
        }),
      });

      const signData = (await signResponse.json()) as {
        signedUrl?: string;
        publicUrl?: string;
        error?: string;
      };

      if (!signResponse.ok || !signData.signedUrl || !signData.publicUrl) {
        throw new Error(signData.error ?? "Could not start upload");
      }

      const form = new FormData();
      form.append("cacheControl", STORAGE_CACHE_CONTROL);
      form.append("", file);
      const uploadResponse = await fetch(signData.signedUrl, {
        method: "PUT",
        body: form,
      });

      if (!uploadResponse.ok) {
        throw new Error(
          `Upload to storage failed (${uploadResponse.status}). Try a smaller JPG or PNG under 5 MB.`,
        );
      }

      const saveResponse = await adminFetch("/api/admin/email-templates/upload", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          field,
          publicUrl: signData.publicUrl,
        }),
      });

      const saveData = (await saveResponse.json()) as {
        url?: string;
        error?: string;
      };

      if (!saveResponse.ok || !saveData.url) {
        throw new Error(saveData.error ?? "Failed to save image URL");
      }

      onUploaded(saveData.url);
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

  return (
    <div className="space-y-3">
      <span
        className="block text-sm font-medium"
        style={{ color: "var(--text-primary)" }}
      >
        {label}
      </span>

      {value ? (
        <div
          className="overflow-hidden rounded-2xl border"
          style={{ borderColor: "var(--border)", background: "var(--input-bg)" }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={value}
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
          const file = event.target.files?.[0];
          if (file) void handleUpload(file);
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
        {isUploading ? "Uploading…" : `Upload ${label}`}
      </button>

      <p className="text-xs" style={{ color: "var(--text-muted)" }}>
        JPG, PNG, or WebP — max 5 MB. Uploads directly to Supabase and applies to all
        email templates.
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
