"use client";

import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type RefObject,
} from "react";
import {
  AlertCircle,
  CheckCircle2,
  ImageIcon,
  Loader2,
  Trash2,
  Upload,
} from "lucide-react";
import { ADMIN_UPLOAD_TIMEOUT_MS, adminFetch } from "@/lib/admin-fetch";
import { MAX_IMAGE_BYTES } from "@/lib/image-upload";
import {
  parseImageProcessKind,
  resolveImageProcessKind,
  shouldCompressImage,
  type ImageProcessKind,
} from "@/lib/image-size-policy";

const ACCEPTED_TYPES = "image/jpeg,image/png,image/webp";

type ImageUploadMeta = {
  suggestedAltText?: string;
};

type ImageUploadProps = {
  label: string;
  value: string | null;
  onChange: (url: string | null, meta?: ImageUploadMeta) => void;
  onDataUrlChange?: (dataUrl: string | null) => void;
  folder?: string;
  /** Page or category name shown in the dashboard, e.g. "Cruises", "Luxury Rooms". */
  pageName?: string;
  /** User-entered title for this image (Alt Text, Title, or Name field). */
  imageTitle?: string;
  /** Slot label fallback when imageTitle is empty. */
  imageLabel?: string;
  /** hero | gallery | content — drives size policy when compressing. */
  imageKind?: ImageProcessKind;
  /** Site image layout kind from admin cards (maps to imageKind). */
  layoutKind?: "hero" | "gallery" | "standard";
  helperText?: string;
  variant?: "default" | "admin";
  allowClear?: boolean;
  /**
   * default = preview + controls
   * compact = no large preview
   * actions-only = primary Replace button for Visual Context Cards
   */
  layout?: "default" | "compact" | "actions-only";
  /** Lets a parent card trigger the hidden file picker. */
  chooseButtonRef?: RefObject<HTMLButtonElement | null>;
};

type UploadResponse = {
  publicUrl?: string;
  url?: string;
  signedUrl?: string;
  suggestedAltText?: string;
  error?: string;
};

function validateClientFile(file: File): string | null {
  if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
    return "Only JPG, PNG, and WebP images are allowed.";
  }

  if (file.size > MAX_IMAGE_BYTES) {
    return `Image must be ${Math.round(MAX_IMAGE_BYTES / (1024 * 1024))} MB or smaller (over 3 MB will be compressed to 3 MB).`;
  }

  return null;
}

function resolveUploadKind(options: {
  imageKind?: ImageProcessKind;
  layoutKind?: "hero" | "gallery" | "standard";
  folder: string;
}): ImageProcessKind {
  if (options.imageKind) return parseImageProcessKind(options.imageKind);
  const slotName = options.folder.startsWith("site-images/")
    ? options.folder.slice("site-images/".length)
    : null;
  return resolveImageProcessKind({
    layoutKind: options.layoutKind,
    slotName,
  });
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

async function uploadProcessedViaServer(
  file: File,
  folder: string,
  naming: {
    pageName?: string;
    imageTitle?: string;
    imageLabel?: string;
    imageKind: ImageProcessKind;
    layoutKind?: string;
  },
  onProgress: (progress: number) => void,
): Promise<UploadResponse> {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("folder", folder);
  formData.append("pageName", naming.pageName ?? folder);
  formData.append("imageTitle", naming.imageTitle ?? "");
  formData.append("imageLabel", naming.imageLabel ?? "");
  formData.append("imageKind", naming.imageKind);
  if (naming.layoutKind) formData.append("layoutKind", naming.layoutKind);

  onProgress(12);
  const response = await adminFetch(
    "/api/admin/upload",
    {
      method: "POST",
      body: formData,
      credentials: "same-origin",
    },
    ADMIN_UPLOAD_TIMEOUT_MS,
  );
  onProgress(92);

  const data = await parseUploadResponse(response);
  if (!response.ok || !(data.url || data.publicUrl)) {
    throw new Error(data.error || "Could not upload image");
  }

  return {
    ...data,
    publicUrl: data.publicUrl ?? data.url,
  };
}

async function requestSignedUpload(
  file: File,
  folder: string,
  naming: {
    pageName?: string;
    imageTitle?: string;
    imageLabel?: string;
  },
): Promise<UploadResponse> {
  const response = await fetch("/api/admin/upload/sign", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "same-origin",
    body: JSON.stringify({
      folder,
      fileName: file.name,
      contentType: file.type || "application/octet-stream",
      fileSize: file.size,
      pageName: naming.pageName,
      imageTitle: naming.imageTitle,
      imageLabel: naming.imageLabel,
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
  pageName,
  imageTitle,
  imageLabel,
  imageKind,
  layoutKind,
  helperText,
  variant = "default",
  allowClear = true,
  layout = "default",
  chooseButtonRef,
}: ImageUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const chooseRef = useRef<HTMLButtonElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [uploadComplete, setUploadComplete] = useState(false);

  const policyHint = `Full original quality up to 3 MB. Larger files are compressed to 3 MB automatically so pages stay fast.`;

  useLayoutEffect(() => {
    if (!chooseButtonRef) return;
    chooseButtonRef.current = chooseRef.current;
    return () => {
      chooseButtonRef.current = null;
    };
  });

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
      const kind = resolveUploadKind({ imageKind, layoutKind, folder });

      if (shouldCompressImage(selectedFile.size)) {
        const processedUpload = await uploadProcessedViaServer(
          selectedFile,
          folder,
          {
            pageName: pageName ?? folder,
            imageTitle: imageTitle ?? label,
            imageLabel,
            imageKind: kind,
            layoutKind,
          },
          setUploadProgress,
        );

        onChange(processedUpload.publicUrl ?? null, {
          suggestedAltText: processedUpload.suggestedAltText,
        });
      } else {
        const signedUpload = await requestSignedUpload(selectedFile, folder, {
          pageName: pageName ?? folder,
          imageTitle: imageTitle ?? label,
          imageLabel,
        });

        if (!signedUpload.signedUrl || !signedUpload.publicUrl) {
          throw new Error("Upload could not start. No signed URL was returned.");
        }

        await uploadFileToSignedUrl(
          selectedFile,
          signedUpload.signedUrl,
          setUploadProgress,
        );

        onChange(signedUpload.publicUrl, {
          suggestedAltText: signedUpload.suggestedAltText,
        });
      }

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
  const isCompact = layout === "compact" || layout === "actions-only";
  const isActionsOnly = layout === "actions-only";
  const showLargePreview = !isCompact && Boolean(displayUrl);
  const showEmptyPlaceholder = !isCompact && !displayUrl;
  const uploadStatusText =
    uploadProgress !== null && uploadProgress >= 95 && uploadProgress < 100
      ? "Saving image..."
      : `Uploading... ${uploadProgress ?? 0}%`;
  const showUploadProgress = uploadProgress !== null && (isUploading || uploadComplete);

  return (
    <div className={isCompact ? "space-y-2" : "space-y-3"}>
      {!isCompact ? (
        <span
          className="block text-sm font-medium"
          style={isAdmin ? { color: "var(--text-primary)" } : undefined}
        >
          {label}
        </span>
      ) : null}

      {showLargePreview ? (
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
            src={displayUrl ?? ""}
            alt={`${label} preview`}
            className="max-h-48 w-full object-cover"
          />
        </div>
      ) : null}

      {showEmptyPlaceholder ? (
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
      ) : null}

      {isCompact && !isActionsOnly ? (
        <span
          className="block text-xs font-medium uppercase tracking-wide"
          style={isAdmin ? { color: "var(--text-muted)" } : undefined}
        >
          {label}
        </span>
      ) : null}

      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED_TYPES}
        onChange={handleFileChange}
        className="hidden"
        id={`image-upload-${folder}-${label.replace(/\s+/g, "-").toLowerCase()}`}
      />

      <div className={`flex flex-wrap items-center gap-2${isActionsOnly ? " vcc-upload-actions" : ""}`}>
        <button
          ref={chooseRef}
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={isUploading}
          className={
            isActionsOnly
              ? "vcc-card__replace-btn"
              : isAdmin
                ? "admin-btn-outline inline-flex items-center gap-2 px-3 py-2 text-sm disabled:opacity-60"
                : "inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-60"
          }
        >
          <Upload className="h-4 w-4" aria-hidden />
          {isActionsOnly ? label : "Choose Image"}
        </button>

        {selectedFile && (
          <button
            type="button"
            onClick={handleUpload}
            disabled={isUploading}
            className={
              isActionsOnly
                ? "vcc-card__upload-btn"
                : isAdmin
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
              isActionsOnly
                ? "vcc-card__remove-btn"
                : isAdmin
                  ? "admin-btn-outline inline-flex items-center gap-2 px-3 py-2 text-sm text-red-600 disabled:opacity-60"
                  : "inline-flex items-center gap-2 rounded-lg border border-red-200 bg-white px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 disabled:opacity-60"
            }
          >
            <Trash2 className="h-4 w-4" aria-hidden />
            {isActionsOnly ? "Delete" : "Remove"}
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
          KB)
          {shouldCompressImage(selectedFile.size)
            ? " — over 3 MB, will be compressed to ≤ 3 MB on upload."
            : " — under 3 MB, kept at original quality."}
        </p>
      )}

      {helperText !== "" ? (
        <p
          className="text-xs"
          style={isAdmin ? { color: "var(--text-muted)" } : undefined}
        >
          {helperText ?? policyHint}
        </p>
      ) : null}

      {value && !selectedFile && !isCompact ? (
        <p
          className="truncate text-xs"
          style={isAdmin ? { color: "var(--text-muted)" } : undefined}
          title={value}
        >
          {isAdmin ? "Image uploaded." : `Current URL: ${value}`}
        </p>
      ) : null}

      {error && (
        <p className="flex items-center gap-1.5 text-sm text-red-600">
          <AlertCircle className="h-4 w-4 shrink-0" aria-hidden />
          {error}
        </p>
      )}
    </div>
  );
}
