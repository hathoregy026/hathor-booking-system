"use client";

import { useEffect, useRef, useState } from "react";
import { AlertCircle, ImageIcon, Loader2, Trash2, Upload } from "lucide-react";

const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
const ACCEPTED_TYPES = "image/jpeg,image/png,image/webp";

type ImageUploadProps = {
  label: string;
  value: string | null;
  onChange: (url: string | null) => void;
  folder?: string;
  helperText?: string;
  variant?: "default" | "admin";
  allowClear?: boolean;
};

function validateClientFile(file: File): string | null {
  if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
    return "Only JPG, PNG, and WebP images are allowed.";
  }

  if (file.size > MAX_IMAGE_BYTES) {
    return "Image must be 5 MB or smaller.";
  }

  return null;
}

export function ImageUpload({
  label,
  value,
  onChange,
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

    try {
      const formData = new FormData();
      formData.append("file", selectedFile);
      formData.append("folder", folder);

      const response = await fetch("/api/admin/upload", {
        method: "POST",
        body: formData,
      });

      const data = (await response.json()) as { url?: string; error?: string };

      if (!response.ok) {
        throw new Error(data.error || "Upload failed");
      }

      if (!data.url) {
        throw new Error("Upload succeeded but no URL was returned");
      }

      onChange(data.url);
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
    onChange(null);
    if (inputRef.current) {
      inputRef.current.value = "";
    }
  };

  const isAdmin = variant === "admin";

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
            className={
              isAdmin
                ? "max-h-48 w-full object-cover"
                : "max-h-48 w-full object-cover"
            }
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

      {selectedFile && !isUploading && (
        <p
          className="text-xs"
          style={isAdmin ? { color: "var(--text-muted)" } : undefined}
        >
          {!isAdmin && (
            <>
              Selected: {selectedFile.name} ({(selectedFile.size / 1024).toFixed(0)}{" "}
              KB) — click Upload, then Save Changes to store the URL.
            </>
          )}
          {isAdmin && (
            <>
              Selected: {selectedFile.name} ({(selectedFile.size / 1024).toFixed(0)}{" "}
              KB) — click Upload, then Save Template.
            </>
          )}
        </p>
      )}

      {value && !selectedFile && (
        <p
          className="truncate text-xs"
          style={isAdmin ? { color: "var(--text-muted)" } : undefined}
          title={value}
        >
          {isAdmin ? "Image uploaded — save template to apply." : `Current URL: ${value}`}
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
