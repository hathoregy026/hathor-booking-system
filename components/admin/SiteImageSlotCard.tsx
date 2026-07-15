"use client";

import { MapPin } from "lucide-react";
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

  return (
    <article className="site-image-slot-card admin-card overflow-hidden">
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
              <span className="site-image-slot-card__thumb-placeholder">No image</span>
            </div>
          )}
        </div>

        <div className="site-image-slot-card__content">
          <div className="site-image-slot-card__header">
            <h4 className="admin-heading text-base sm:text-lg">{item.label}</h4>
            <p className="site-image-slot-card__location">
              <MapPin className="site-image-slot-card__location-icon" aria-hidden />
              {item.locationHint}
            </p>
            <p className="site-image-slot-card__slot-id">{item.name}</p>
          </div>

          <label className="block text-sm">
            <span
              className="mb-1 block font-medium"
              style={{ color: "var(--text-primary)" }}
            >
              Alt Text
            </span>
            <input
              value={altText}
              onChange={(event) => onAltTextChange(event.target.value)}
              className="admin-input w-full px-3 py-2"
              placeholder="Describe this image for SEO and accessibility"
            />
          </label>

          <ImageUpload
            label="Replace Image"
            value={url || null}
            onChange={(nextUrl, meta) =>
              onUrlChange(nextUrl, meta)
            }
            pageName={pageTitle}
            imageTitle={altText}
            imageLabel={item.label}
            folder={`site-images/${item.name}`}
            variant="admin"
            layout="compact"
            helperText="Upload a new image, then click Save Changes at the bottom of the page."
          />
        </div>
      </div>
    </article>
  );
}
