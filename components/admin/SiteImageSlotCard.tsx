"use client";

import { useRef, useState } from "react";
import {
  ChevronDown,
  ExternalLink,
  GalleryHorizontal,
  ImageIcon,
  Layout,
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

function LayoutBadge({
  kind,
  label,
}: {
  kind: SiteImageAdminItem["layoutKind"];
  label: string;
}) {
  const Icon =
    kind === "hero" ? Layout : kind === "gallery" ? GalleryHorizontal : ImageIcon;

  return (
    <span className="vcc-layout-badge">
      <Icon className="vcc-layout-badge__icon" aria-hidden />
      <span>{label}</span>
    </span>
  );
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
  const replaceTriggerRef = useRef<HTMLButtonElement>(null);

  return (
    <article className="vcc-card">
      <div className="vcc-card__body">
        <div className="vcc-card__media">
          {hasImage ? (
            <div className="vcc-card__thumb">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={url}
                alt={altText || item.label}
                className="vcc-card__thumb-img"
              />
            </div>
          ) : (
            <button
              type="button"
              className="vcc-card__thumb vcc-card__thumb--empty"
              onClick={() => replaceTriggerRef.current?.click()}
            >
              <Upload className="vcc-card__empty-icon" aria-hidden />
              <span>Upload Image</span>
            </button>
          )}
        </div>

        <div className="vcc-card__context">
          <div className="vcc-card__top">
            <h4 className="vcc-card__title">{item.label}</h4>
            <LayoutBadge kind={item.layoutKind} label={item.layoutLabel} />
          </div>

          <div className="vcc-card__actions">
            <div className="vcc-card__replace">
              <ImageUpload
                label="Replace Image"
                value={url || null}
                onChange={(nextUrl, meta) => onUrlChange(nextUrl, meta)}
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

            <a
              href={item.livePath}
              target="_blank"
              rel="noopener noreferrer"
              className="vcc-card__live-btn"
            >
              <ExternalLink className="vcc-card__live-icon" aria-hidden />
              View on Live Site
            </a>
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
                  Describe what’s in the photo
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
      </div>
    </article>
  );
}
