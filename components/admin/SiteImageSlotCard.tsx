"use client";

import { useEffect, useRef, useState } from "react";
import {
  ChevronDown,
  ExternalLink,
  ImageIcon,
  Upload,
} from "lucide-react";
import { ImageUpload } from "@/components/admin/ImageUpload";
import type { SiteImageAdminItem } from "@/lib/site-image-admin";
import { getSiteImageSlot } from "@/lib/site-image-slots";

type SiteImageSlotCardProps = {
  item: SiteImageAdminItem;
  pageTitle: string;
  url: string;
  altText: string;
  onAltTextChange: (altText: string) => void;
  onUrlChange: (url: string | null, meta?: { suggestedAltText?: string }) => void;
  /** Optional opacity control (0–1), used for home-wheel-stage parchment. */
  opacity?: number;
  onOpacityChange?: (opacity: number) => void;
  onOpacityCommit?: () => void;
  opacitySaving?: boolean;
};

const MAX_REMOTE_RETRIES = 5;

function withCacheBust(src: string, attempt: number): string {
  if (!src || src.startsWith("blob:") || src.startsWith("data:")) return src;
  const sep = src.includes("?") ? "&" : "?";
  return `${src}${sep}_preview=${attempt}`;
}

export function SiteImageSlotCard({
  item,
  pageTitle,
  url,
  altText,
  onAltTextChange,
  onUrlChange,
  opacity,
  onOpacityChange,
  onOpacityCommit,
  opacitySaving = false,
}: SiteImageSlotCardProps) {
  const hasImage = Boolean(url?.trim());
  const slotDefaultUrl = getSiteImageSlot(item.name)?.url?.trim() || "";
  const [altOpen, setAltOpen] = useState(false);
  const [thumbBroken, setThumbBroken] = useState(false);
  const [localPreview, setLocalPreview] = useState<string | null>(null);
  const [remoteSrc, setRemoteSrc] = useState(url);
  const [usedFallback, setUsedFallback] = useState(false);
  const [syncedUrl, setSyncedUrl] = useState(url);
  const retryRef = useRef(0);
  const retryTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const replaceTriggerRef = useRef<HTMLButtonElement>(null);

  /* Sync preview state when the saved CMS URL changes (render-time adjust). */
  if (url !== syncedUrl) {
    setSyncedUrl(url);
    setThumbBroken(false);
    setUsedFallback(false);
    setRemoteSrc(url);
  }

  useEffect(() => {
    retryRef.current = 0;
  }, [url]);

  const displaySrc = localPreview || remoteSrc;
  const showThumb = Boolean(displaySrc?.trim()) && !thumbBroken;

  /* After upload, keep the instant blob until the remote URL actually loads */
  useEffect(() => {
    if (!localPreview || !url?.trim()) return;
    const probe = new Image();
    let cancelled = false;
    const failSafe = setTimeout(() => {
      if (cancelled) return;
      setRemoteSrc(withCacheBust(url, 1));
      setLocalPreview((current) => {
        if (current?.startsWith("blob:")) URL.revokeObjectURL(current);
        return null;
      });
    }, 8000);

    probe.onload = () => {
      if (cancelled) return;
      clearTimeout(failSafe);
      setThumbBroken(false);
      setRemoteSrc(withCacheBust(url, 1));
      setLocalPreview((current) => {
        if (current?.startsWith("blob:")) URL.revokeObjectURL(current);
        return null;
      });
    };
    probe.onerror = () => {
      /* Keep blob preview; remote retry handled by handleThumbError */
    };
    probe.src = withCacheBust(url, 1);

    return () => {
      cancelled = true;
      clearTimeout(failSafe);
    };
  }, [localPreview, url]);

  useEffect(() => {
    return () => {
      if (retryTimerRef.current) clearTimeout(retryTimerRef.current);
    };
  }, []);

  const handleThumbError = () => {
    /* Prefer keeping the local blob preview while remote CDN catches up */
    if (localPreview) {
      if (retryRef.current >= MAX_REMOTE_RETRIES) return;
      retryRef.current += 1;
      retryTimerRef.current = setTimeout(() => {
        setRemoteSrc(withCacheBust(url, retryRef.current));
      }, 400 * retryRef.current);
      return;
    }

    if (url?.trim() && retryRef.current < MAX_REMOTE_RETRIES) {
      retryRef.current += 1;
      retryTimerRef.current = setTimeout(() => {
        setThumbBroken(false);
        setRemoteSrc(withCacheBust(url, retryRef.current));
      }, 350 * retryRef.current);
      return;
    }

    /* CMS URL failed — try the built-in slot default so the card isn't blank */
    if (
      !usedFallback &&
      slotDefaultUrl &&
      slotDefaultUrl !== url.trim()
    ) {
      setUsedFallback(true);
      setThumbBroken(false);
      setRemoteSrc(slotDefaultUrl);
      return;
    }

    setThumbBroken(true);
  };

  const previewFailed = hasImage && thumbBroken;

  return (
    <article className="vcc-card vcc-card--gallery">
      <div className="vcc-card__media">
        {showThumb ? (
          <div className="vcc-card__thumb">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              key={displaySrc}
              src={displaySrc}
              alt={altText || item.label}
              className="vcc-card__thumb-img"
              style={
                typeof opacity === "number"
                  ? { opacity: Math.min(1, Math.max(0, opacity)) }
                  : undefined
              }
              loading="lazy"
              decoding="async"
              onError={handleThumbError}
              onLoad={() => {
                setThumbBroken(false);
              }}
            />
          </div>
        ) : (
          <button
            type="button"
            className="vcc-card__thumb vcc-card__thumb--empty"
            onClick={() => replaceTriggerRef.current?.click()}
          >
            {hasImage ? (
              <ImageIcon className="vcc-card__empty-icon" aria-hidden />
            ) : (
              <Upload className="vcc-card__empty-icon" aria-hidden />
            )}
            <span>
              {previewFailed
                ? "Preview broken — re-upload"
                : hasImage
                  ? "Preview unavailable"
                  : "Upload Image"}
            </span>
          </button>
        )}
      </div>

      <div className="vcc-card__body">
        <div className="vcc-card__top">
          <div className="vcc-card__title-row">
            <h4 className="vcc-card__title">{item.label}</h4>
            <span
              className={`vcc-status${
                previewFailed
                  ? " vcc-status--broken"
                  : hasImage
                    ? " vcc-status--published"
                    : " vcc-status--empty"
              }`}
            >
              {previewFailed ? "Broken" : hasImage ? "Published" : "Empty"}
            </span>
          </div>
          <p className="vcc-card__info">
            {item.layoutLabel}
            <span aria-hidden> · </span>
            {item.name}
          </p>
        </div>

        <div className="vcc-card__footer">
          <div className="vcc-card__replace">
            <ImageUpload
              label="Upload / Replace"
              value={url || null}
              onChange={(nextUrl, meta) => {
                retryRef.current = 0;
                setThumbBroken(false);
                setUsedFallback(false);
                if (meta?.localPreviewUrl) {
                  setLocalPreview(meta.localPreviewUrl);
                } else if (!nextUrl) {
                  setLocalPreview(null);
                }
                onUrlChange(nextUrl, meta);
              }}
              onLocalPreviewChange={setLocalPreview}
              pageName={pageTitle}
              imageTitle={item.label}
              imageLabel={item.label}
              layoutKind={item.layoutKind}
              imageKind={
                item.layoutKind === "standard" ? "content" : item.layoutKind
              }
              folder={`site-images/${item.name}`}
              variant="admin"
              layout="actions-only"
              allowClear={hasImage}
              chooseButtonRef={replaceTriggerRef}
              helperText=""
            />
          </div>
        </div>

        {typeof opacity === "number" && onOpacityChange ? (
          <div className="vcc-card__opacity mt-3 space-y-2 rounded-xl border border-[color:var(--border)] bg-[color:var(--surface-2,#f7f4ee)] px-3 py-3">
            <div className="flex items-center justify-between gap-3">
              <label
                htmlFor={`opacity-${item.name}`}
                className="text-sm font-medium text-[color:var(--text)]"
              >
                Background opacity
              </label>
              <span className="tabular-nums text-sm text-[color:var(--muted)]">
                {Math.round(opacity * 100)}%
                {opacitySaving ? " · saving…" : ""}
              </span>
            </div>
            <input
              id={`opacity-${item.name}`}
              type="range"
              min={0}
              max={100}
              step={1}
              value={Math.round(Math.min(1, Math.max(0, opacity)) * 100)}
              onChange={(event) =>
                onOpacityChange(Number(event.target.value) / 100)
              }
              onPointerUp={() => onOpacityCommit?.()}
              onKeyUp={(event) => {
                if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
                  onOpacityCommit?.();
                }
              }}
              className="w-full accent-[color:var(--gold,#c9a96e)]"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={Math.round(opacity * 100)}
              aria-label="Wheel background opacity"
            />
            <p className="text-xs text-[color:var(--muted)]">
              How strong the parchment behind the wheel appears on the homepage.
              Saves when you release the slider.
            </p>
          </div>
        ) : null}

        <div className="vcc-card__links">
          {item.livePath ? (
            <a
              href={item.livePath}
              target="_blank"
              rel="noopener noreferrer"
              className="vcc-card__live-btn"
            >
              <ExternalLink className="vcc-card__live-icon" aria-hidden />
              View on live site
            </a>
          ) : (
            <span
              className="vcc-card__live-muted"
              title="This slot is editable but not used on the current live pages"
            >
              Not shown on live site
            </span>
          )}
        </div>

        <div className="vcc-card__alt">
          <button
            type="button"
            className="vcc-card__alt-toggle"
            aria-expanded={altOpen}
            onClick={() => setAltOpen((open) => !open)}
          >
            <span>Optional: photo description (SEO)</span>
            <ChevronDown
              className={`vcc-card__alt-chevron${altOpen ? " is-open" : ""}`}
              aria-hidden
            />
          </button>
          {altOpen ? (
            <label className="vcc-card__alt-field">
              <span className="vcc-card__alt-caption">
                Describe what&apos;s in the photo
              </span>
              <input
                value={altText}
                onChange={(event) => onAltTextChange(event.target.value)}
                className="admin-input w-full px-3 py-2"
                placeholder="e.g. Luxury suite with Nile view"
              />
            </label>
          ) : null}
        </div>
      </div>
    </article>
  );
}
