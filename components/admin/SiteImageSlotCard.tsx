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
  const replaceTriggerRef = useRef<HTMLButtonElement>(null);
  const showThumb = hasImage && !thumbBroken;

  useEffect(() => {
    setThumbBroken(false);
  }, [url]);

  return (
    <article className="vcc-card vcc-card--gallery">
      <div className="vcc-card__media">
        {showThumb ? (
          <div className="vcc-card__thumb">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              key={url}
              src={url}
              alt={altText || item.label}
              className="vcc-card__thumb-img"
              onError={() => setThumbBroken(true)}
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
                setThumbBroken(false);
                onUrlChange(nextUrl, meta);
              }}
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
            <span className="vcc-card__live-muted" title="This slot is editable but not used on the current live pages">
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
