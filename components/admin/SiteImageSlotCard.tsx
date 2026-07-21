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

type SiteImageSlotCardProps = {
  item: SiteImageAdminItem;
  pageTitle: string;
  url: string;
  altText: string;
  onAltTextChange: (altText: string) => void;
  onUrlChange: (url: string | null, meta?: { suggestedAltText?: string }) => void;
};

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
}: SiteImageSlotCardProps) {
  const hasImage = Boolean(url?.trim());
  const [altOpen, setAltOpen] = useState(false);
  const [thumbBroken, setThumbBroken] = useState(false);
  const [localPreview, setLocalPreview] = useState<string | null>(null);
  const [remoteSrc, setRemoteSrc] = useState(url);
  const retryRef = useRef(0);
  const retryTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const replaceTriggerRef = useRef<HTMLButtonElement>(null);

  const displaySrc = localPreview || remoteSrc;
  const showThumb = Boolean(displaySrc?.trim()) && !thumbBroken;

  useEffect(() => {
    setThumbBroken(false);
    setRemoteSrc(url);
    retryRef.current = 0;
  }, [url]);

  /* After upload, keep the instant blob for a moment then switch to the live URL */
  useEffect(() => {
    if (!localPreview || !url?.trim()) return;
    const timer = setTimeout(() => {
      setRemoteSrc(withCacheBust(url, 1));
      setLocalPreview((current) => {
        if (current?.startsWith("blob:")) URL.revokeObjectURL(current);
        return null;
      });
    }, 1200);
    return () => clearTimeout(timer);
  }, [localPreview, url]);

  useEffect(() => {
    return () => {
      if (retryTimerRef.current) clearTimeout(retryTimerRef.current);
    };
  }, []);

  const handleThumbError = () => {
    /* Prefer keeping the local blob preview while remote CDN catches up */
    if (localPreview) {
      if (retryRef.current >= 5) return;
      retryRef.current += 1;
      retryTimerRef.current = setTimeout(() => {
        setRemoteSrc(withCacheBust(url, retryRef.current));
      }, 400 * retryRef.current);
      return;
    }

    if (!url?.trim() || retryRef.current >= 5) {
      setThumbBroken(true);
      return;
    }

    retryRef.current += 1;
    retryTimerRef.current = setTimeout(() => {
      setThumbBroken(false);
      setRemoteSrc(withCacheBust(url, retryRef.current));
    }, 350 * retryRef.current);
  };

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
              referrerPolicy="no-referrer"
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
            <span>{hasImage ? "Preview unavailable" : "Upload Image"}</span>
          </button>
        )}
      </div>

      <div className="vcc-card__body">
        <div className="vcc-card__top">
          <div className="vcc-card__title-row">
            <h4 className="vcc-card__title">{item.label}</h4>
            <span
              className={`vcc-status${hasImage ? " vcc-status--published" : " vcc-status--empty"}`}
            >
              {hasImage ? "Published" : "Empty"}
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
                if (meta?.localPreviewUrl) {
                  setLocalPreview(meta.localPreviewUrl);
                } else if (!nextUrl) {
                  setLocalPreview(null);
                }
                onUrlChange(nextUrl, meta);
              }}
              onLocalPreviewChange={setLocalPreview}
              pageName={pageTitle}
              imageTitle={altText}
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
