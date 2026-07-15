"use client";

import { useState } from "react";
import { ChevronDown, ImageIcon } from "lucide-react";
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

  return (
    <article className="site-image-slot-card">
      <div className="site-image-slot-card__body">
        <div className="site-image-slot-card__thumb-col">
          {hasImage ? (
            <div className="site-image-slot-card__thumb-wrap">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={url}
                alt={altText || item.label}
                className="site-image-slot-card__thumb"
              />
            </div>
          ) : (
            <div
              className="site-image-slot-card__thumb-wrap site-image-slot-card__thumb-wrap--empty"
              aria-hidden
            >
              <ImageIcon className="site-image-slot-card__empty-icon" />
              <span className="site-image-slot-card__thumb-placeholder">
                No image yet
              </span>
            </div>
          )}
        </div>

        <div className="site-image-slot-card__content">
          <div className="site-image-slot-card__header">
            <h4 className="site-image-slot-card__title">{item.label}</h4>
            <p className="site-image-slot-card__location-badge">
              <span className="site-image-slot-card__location-label">Location:</span>{" "}
              {item.locationHint}
            </p>
          </div>

          <ImageUpload
            label="Change Image"
            value={url || null}
            onChange={(nextUrl, meta) => onUrlChange(nextUrl, meta)}
            pageName={pageTitle}
            imageTitle={altText}
            imageLabel={item.label}
            folder={`site-images/${item.name}`}
            variant="admin"
            layout="compact"
            helperText="Pick a new photo, then click Save Changes at the bottom."
          />

          <div className="site-image-slot-card__alt">
            <button
              type="button"
              className="site-image-slot-card__alt-toggle"
              aria-expanded={altOpen}
              onClick={() => setAltOpen((open) => !open)}
            >
              <span>Optional: Image description (SEO)</span>
              <ChevronDown
                className={`site-image-slot-card__alt-chevron${altOpen ? " is-open" : ""}`}
                aria-hidden
              />
            </button>
            {altOpen ? (
              <label className="site-image-slot-card__alt-field">
                <span className="site-image-slot-card__alt-caption">
                  Short description of what’s in the photo
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
