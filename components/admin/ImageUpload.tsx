"use client";

import { useEffect, useRef, useState } from "react";
import {
  AlertCircle,
  CheckCircle2,
  ImageIcon,
  Loader2,
  Trash2,
  Upload,
} from "lucide-react";
import { ADMIN_UPLOAD_TIMEOUT_MS } from "@/lib/admin-fetch";
import { MAX_IMAGE_BYTES } from "@/lib/image-upload";

const ACCEPTED_TYPES = "image/jpeg,image/png,image/webp";

type ImageUploadProps = {
  label: string;
  value: string | null;
  onChange: (url: string | null) => void;
  onDataUrlChange?: (dataUrl: string | null) => void;
  folder?: string;
  helperText?: string;
  variant?: "default" | "admin";
  allowClear?: boolean;
};

type UploadResponse = {
  publicUrl?: string;
  signedUrl?: string;
  error?: string;
};

function validateClientFile(file: File): string | null {
  if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
    return "Only JPG, PNG, and WebP images are allowed.";
  }

  if (file.size > MAX_IMAGE_BYTES) {
    return `Image must be ${MAX_IMAGE_BYTES / (1024 * 1024)} MB or smaller.`;
  }

  return null;
}

async function parseUploadResponse(response: Response): Promise<UploadResponse> {
  const text = await response.text();
  if (!text) return {};

  try {
    return JSON.parse(text) as UploadResponse;
  } catch {
    return {
      error: text.startsWith("Request Entity")
        ? "Upload is too large for the server route. Try again or choose a smaller image."
        : "Upload failed: invalid server response.",
    };
  }
}

async function requestSignedUpload(file: File, folder: string): Promise<UploadResponse> {
  const response = await fetch("/api/admin/upload/sign", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "same-origin",
    body: JSON.stringify({
      folder,
      fileName: file.name,
      contentType: file.type || "application/octet-stream",
      fileSize: file.size,
    }),
  });

  const data = await parseUploadResponse(response);
  if (!response.ok || !data.signedUrl || !data.publicUrl) {
    throw new Error(data.error || "Could not start upload");
  }

  return data;
}

function uploadFileToSignedUrl(
  file: File,
  signedUrl: string,
  onProgress: (progress: number) => void,
): Promise<void> {
  return new Promise((resolve, reject) => {
    const request = new XMLHttpRequest();

    request.open("PUT", signedUrl);
    request.timeout = ADMIN_UPLOAD_TIMEOUT_MS;

    request.upload.onprogress = (event) => {
      if (!event.lengthComputable) return;
      const percent = 5 + Math.round((event.loaded / event.total) * 90);
      onProgress(Math.min(percent, 95));
    };

    request.onload = () => {
      if (request.status < 200 || request.status >= 300) {
        reject(
          new Error(
            `Upload to storage failed (${request.status}). Please try again.`,
          ),
        );
        return;
      }

      onProgress(100);
      resolve();
    };

    request.onerror = () => {
      reject(new Error("Upload failed. Check your connection and try again."));
    };

    request.ontimeout = () => {
      reject(
        new Error("Upload timed out. Try a smaller image or a stronger connection."),
      );
    };

    request.onabort = () => {
      reject(new Error("Upload cancelled."));
    };

    request.setRequestHeader("Content-Type", file.type || "application/octet-stream");
    request.send(file);
  });
}

export function ImageUpload({
  label,
  value,
  onChange,
  onDataUrlChange,
  folder = "general",
  helperText,
  variant = "default",
  allowClear = true,
}: ImageUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [uploadComplete, setUploadComplete] = useState(false);

  useEffect(() => {
    if (!selectedFile) {
      setPreviewUrl(null);
      return;
    }

    const objectUrl = URL.createObjectURL(selectedFile);
    setPreviewUrl(objectUrl);

    return () => {
      URL.revokeObjectURL(objectUrl);
    };
  }, [selectedFile]);

  const displayUrl = previewUrl ?? value;

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    setError(null);
    setUploadProgress(null);
    setUploadComplete(false);

    if (!file) {
      setSelectedFile(null);
      return;
    }

    const validationError = validateClientFile(file);
    if (validationError) {
      setError(validationError);
      setSelectedFile(null);
      event.target.value = "";
      return;
    }

    setSelectedFile(file);
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setIsUploading(true);
    setError(null);
    setUploadProgress(0);
    setUploadComplete(false);

    try {
      setUploadProgress(5);
      const signedUpload = await requestSignedUpload(selectedFile, folder);

      if (!signedUpload.signedUrl || !signedUpload.publicUrl) {
        throw new Error("Upload could not start. No signed URL was returned.");
      }

      await uploadFileToSignedUrl(
        selectedFile,
        signedUpload.signedUrl,
        setUploadProgress,
      );

      onChange(signedUpload.publicUrl);
      onDataUrlChange?.(null);
      setUploadProgress(100);
      setUploadComplete(true);
      setSelectedFile(null);
      if (inputRef.current) {
        inputRef.current.value = "";
      }
    } catch (uploadError) {
      setError(
        uploadError instanceof Error ? uploadError.message : "Upload failed",
      );
    } finally {
      setIsUploading(false);
    }
  };

  const handleClear = () => {
    setError(null);
    setSelectedFile(null);
    setUploadProgress(null);
    setUploadComplete(false);
    onChange(null);
    onDataUrlChange?.(null);
    if (inputRef.current) {
      inputRef.current.value = "";
    }
  };

  const isAdmin = variant === "admin";
  const showUploadProgress = uploadProgress !== null && (isUploading || uploadComplete);
  const uploadStatusText =
    uploadProgress !== null && uploadProgress >= 95 && uploadProgress < 100
      ? "Saving image..."
      : `Uploading... ${uploadProgress ?? 0}%`;

  return (
    <div className="space-y-3">
      <span
        className="block text-sm font-medium"
        style={isAdmin ? { color: "var(--text-primary)" } : undefined}
      >
        {label}
      </span>

      {displayUrl ? (
        <div
          className={
            isAdmin
              ? "overflow-hidden rounded-2xl border"
              : "overflow-hidden rounded-lg border border-slate-200 bg-slate-50"
          }
          style={
            isAdmin
              ? { borderColor: "var(--border)", background: "var(--input-bg)" }
              : undefined
          }
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={displayUrl}
            alt={`${label} preview`}
            className="max-h-48 w-full object-cover"
          />
        </div>
      ) : (
        <div
          className={
            isAdmin
              ? "flex h-32 items-center justify-center rounded-2xl border border-dashed"
              : "flex h-32 items-center justify-center rounded-lg border border-dashed border-slate-300 bg-slate-50 text-slate-400"
          }
          style={
            isAdmin
              ? {
                  borderColor: "var(--border)",
                  background: "var(--input-bg)",
                  color: "var(--text-muted)",
                }
              : undefined
          }
        >
          <ImageIcon className="h-8 w-8" aria-hidden />
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED_TYPES}
        onChange={handleFileChange}
        className="hidden"
        id={`image-upload-${folder}-${label.replace(/\s+/g, "-").toLowerCase()}`}
      />

      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={isUploading}
          className={
            isAdmin
              ? "admin-btn-outline inline-flex items-center gap-2 px-3 py-2 text-sm disabled:opacity-60"
              : "inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-60"
          }
        >
          <Upload className="h-4 w-4" aria-hidden />
          Choose Image
        </button>

        {selectedFile && (
          <button
            type="button"
            onClick={handleUpload}
            disabled={isUploading}
            className={
              isAdmin
                ? "admin-btn-primary inline-flex items-center gap-2 px-3 py-2 text-sm disabled:opacity-60"
                : "inline-flex items-center gap-2 rounded-lg bg-slate-900 px-3 py-2 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-60"
            }
          >
            {isUploading ? (
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
            ) : (
              <Upload className="h-4 w-4" aria-hidden />
            )}
            Upload
          </button>
        )}

        {allowClear && value && !selectedFile && (
          <button
            type="button"
            onClick={handleClear}
            disabled={isUploading}
            className={
              isAdmin
                ? "admin-btn-outline inline-flex items-center gap-2 px-3 py-2 text-sm text-red-600 disabled:opacity-60"
                : "inline-flex items-center gap-2 rounded-lg border border-red-200 bg-white px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 disabled:opacity-60"
            }
          >
            <Trash2 className="h-4 w-4" aria-hidden />
            Remove
          </button>
        )}
      </div>

      {showUploadProgress && (
        <div
          className="space-y-2 rounded-xl border p-3"
          style={
            isAdmin
              ? { borderColor: "var(--border)", background: "var(--input-bg)" }
              : undefined
          }
        >
          <div className="flex items-center justify-between gap-3 text-xs">
            <span
              className="inline-flex items-center gap-1.5 font-medium"
              style={isAdmin ? { color: "var(--text-primary)" } : undefined}
            >
              {uploadComplete ? (
                <>
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" aria-hidden />
                  Upload complete
                </>
              ) : (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                  {uploadStatusText}
                </>
              )}
            </span>
            <span style={isAdmin ? { color: "var(--text-muted)" } : undefined}>
              {uploadProgress ?? 0}%
            </span>
          </div>
          <div
            className="h-2 overflow-hidden rounded-full"
            style={{
              background: isAdmin ? "var(--border)" : "rgb(226 232 240)",
            }}
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={uploadProgress ?? 0}
            aria-label={`${label} upload progress`}
          >
            <div
              className="h-full rounded-full transition-all duration-300 ease-out"
              style={{
                width: `${uploadProgress ?? 0}%`,
                background: uploadComplete
                  ? "#059669"
                  : "linear-gradient(90deg, #b69f64, #d8c17f)",
              }}
            />
          </div>
        </div>
      )}

      {selectedFile && !isUploading && (
        <p
          className="text-xs"
          style={isAdmin ? { color: "var(--text-muted)" } : undefined}
        >
          Selected: {selectedFile.name} ({(selectedFile.size / 1024).toFixed(0)}{" "}
          KB) — uploads directly to Supabase Storage.
        </p>
      )}

      {value && !selectedFile && (
        <p
          className="truncate text-xs"
          style={isAdmin ? { color: "var(--text-muted)" } : undefined}
          title={value}
        >
          {isAdmin ? "Image uploaded." : `Current URL: ${value}`}
        </p>
      )}

      {helperText && (
        <p
          className="text-xs"
          style={isAdmin ? { color: "var(--text-muted)" } : undefined}
        >
          {helperText}
        </p>
      )}

      {error && (
        <p className="flex items-center gap-1.5 text-sm text-red-600">
          <AlertCircle className="h-4 w-4 shrink-0" aria-hidden />
          {error}
        </p>
      )}
    </div>
  );
}
