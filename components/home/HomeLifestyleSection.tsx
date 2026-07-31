"use client";

import Link from "next/link";
import { ArrowRight, Heart, Sun, HandHeart } from "lucide-react";
import { ManagedImage } from "@/components/ui/ManagedImage";
import { HOMEPAGE_LIFESTYLE } from "@/lib/homepage-content";
import type { SiteImageName } from "@/lib/site-image-slots";
import { siteImageAnchorId } from "@/lib/site-image-preview";

type LifestyleFeatureIcon = (typeof HOMEPAGE_LIFESTYLE.features)[number]["icon"];

function EyeOfHorusIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d="M8 30c8-12 20-18 24-18s16 6 24 18c-8 12-20 18-24 18S16 42 8 30Z"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinejoin="round"
      />
      <circle cx="32" cy="30" r="7.5" stroke="currentColor" strokeWidth="1.75" />
      <path
        d="M32 37.5V48M24 44c4 4 10 6 16 4"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function FeatureIcon({
  name,
  className,
}: {
  name: LifestyleFeatureIcon;
  className?: string;
}) {
  if (name === "heart") return <Heart className={className} strokeWidth={1.5} aria-hidden />;
  if (name === "sun") return <Sun className={className} strokeWidth={1.5} aria-hidden />;
  if (name === "hands") return <HandHeart className={className} strokeWidth={1.5} aria-hidden />;
  return <EyeOfHorusIcon className={className} />;
}

function splitLifestyleBody(body: string): string[] {
  const trimmed = body.trim();
  if (!trimmed) return [];
  const parts = trimmed.split(/\n\n+/).map((p) => p.trim()).filter(Boolean);
  if (parts.length >= 2) return parts.slice(0, 2);

  const sentences = trimmed.match(/[^.!?]+[.!?]+(?:\s+|$)|[^.!?]+$/g);
  if (!sentences || sentences.length < 2) return [trimmed];

  const mid = Math.ceil(sentences.length / 2);
  const first = sentences.slice(0, mid).join("").trim();
  const second = sentences.slice(mid).join("").trim();
  return [first, second].filter(Boolean);
}

type HomeLifestyleSectionProps = {
  title: string;
  body: string;
  cta: string;
  href: string;
  /** Optional second CTA — omitted when empty so no empty button renders. */
  secondaryCta?: string;
  secondaryHref?: string;
  imageName: SiteImageName;
  imageAlt: string;
  previewAnchor?: boolean;
};

export function HomeLifestyleSection({
  title,
  body,
  cta,
  href,
  secondaryCta,
  secondaryHref,
  imageName,
  imageAlt,
  previewAnchor = false,
}: HomeLifestyleSectionProps) {
  const titleLines = title
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
  const lineOne = titleLines[0] ?? title;
  const lineTwo = titleLines.slice(1).join(" ").trim();
  const paragraphs = splitLifestyleBody(body);
  const headingId = "home-lifestyle-heading";
  const showSecondary = Boolean(secondaryCta?.trim() && secondaryHref?.trim());

  return (
    <section
      className="home-lifestyle ex-content-section"
      id="escape"
      aria-labelledby={headingId}
    >
      <div className="home-lifestyle__inner">
        <div className="home-lifestyle__grid">
          <div className="home-lifestyle__copy">
            {HOMEPAGE_LIFESTYLE.eyebrow ? (
              <div className="home-lifestyle__eyebrow-block">
                <p className="home-lifestyle__eyebrow">
                  <span className="home-lifestyle__eyebrow-rule" aria-hidden />
                  <span className="home-lifestyle__eyebrow-text">
                    {HOMEPAGE_LIFESTYLE.eyebrow}
                  </span>
                  <span className="home-lifestyle__eyebrow-rule" aria-hidden />
                </p>
              </div>
            ) : null}

            <div className="home-lifestyle__heading">
              <h2 id={headingId} className="typo-page-title">
                <span className="home-lifestyle__title-line home-lifestyle__title-line--primary">
                  {lineOne}
                </span>
                {lineTwo ? (
                  <span className="home-lifestyle__title-line home-lifestyle__title-line--gold">
                    {lineTwo}
                  </span>
                ) : null}
              </h2>
            </div>

            <div className="home-lifestyle__divider" aria-hidden>
              <span className="home-lifestyle__divider-mark" />
            </div>

            {paragraphs.length > 0 ? (
              <div className="home-lifestyle__body typo-body-text">
                {paragraphs.map((paragraph) => (
                  <p key={paragraph.slice(0, 48)}>{paragraph}</p>
                ))}
              </div>
            ) : null}

            {cta || showSecondary ? (
              <div className="home-lifestyle__actions">
                {cta ? (
                  <Link
                    className="home-lifestyle__cta home-lifestyle__cta--primary btn"
                    href={href}
                  >
                    <span>{cta}</span>
                    <ArrowRight className="home-lifestyle__cta-icon" aria-hidden />
                  </Link>
                ) : null}
                {showSecondary ? (
                  <Link
                    className="home-lifestyle__cta home-lifestyle__cta--secondary btn"
                    href={secondaryHref!}
                  >
                    <span>{secondaryCta}</span>
                    <ArrowRight className="home-lifestyle__cta-icon" aria-hidden />
                  </Link>
                ) : null}
              </div>
            ) : null}
          </div>

          <div className="home-lifestyle__media home-text-img-parent">
            <Link
              href={href}
              className="home-lifestyle__media-link home-text-img-container media-hover"
              aria-label={cta}
              id={previewAnchor ? siteImageAnchorId(imageName) : undefined}
              data-site-image={previewAnchor ? imageName : undefined}
            >
              <ManagedImage
                name={imageName}
                alt={imageAlt}
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 62vw, 980px"
                unoptimized={false}
                className="object-cover object-center"
                previewAnchor={false}
              />
            </Link>
          </div>
        </div>

        {HOMEPAGE_LIFESTYLE.features.length > 0 ? (
          <ul className="home-lifestyle__features" role="list">
            {HOMEPAGE_LIFESTYLE.features.map((feature) => (
              <li className="home-lifestyle__feature" key={feature.id}>
                <span className="home-lifestyle__feature-icon" aria-hidden>
                  <FeatureIcon name={feature.icon} />
                </span>
                <div className="home-lifestyle__feature-copy">
                  <p className="home-lifestyle__feature-title">{feature.title}</p>
                  <p className="home-lifestyle__feature-body">{feature.body}</p>
                </div>
              </li>
            ))}
          </ul>
        ) : null}
      </div>
    </section>
  );
}
