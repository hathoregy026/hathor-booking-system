"use client";

import { useState } from "react";
import Link from "next/link";
import {
  SUITES_NATIVE_CONTENT,
  SUITES_NATIVE_CTAS,
  resolveSuitesImage,
} from "@/lib/suites-native-content";

type Props = { images: Record<string, string> };

export function SuitesComfortExperience({ images }: Props) {
  const { comfort } = SUITES_NATIVE_CONTENT;
  const [active, setActive] = useState(0);
  const current = comfort.amenities[active];

  return (
    <section className="sn-section sn-comfort" id="suites-comfort" aria-label="Suite comfort">
      <div className="sn-comfort__stage">
        <div className="sn-comfort__visual" aria-hidden="true">
          {comfort.amenities.map((amenity, index) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              key={amenity.id}
              src={resolveSuitesImage(images, amenity.imageSlot)}
              alt=""
              className={index === active ? "is-active" : undefined}
              decoding="async"
            />
          ))}
          <div className="sn-comfort__fog" />
        </div>

        <div className="sn-comfort__panel">
          <p className="sn-eyebrow">{comfort.eyebrow}</p>
          <h2 className="sn-display sn-display--section">{comfort.title}</h2>
          <p className="sn-body">{comfort.lead}</p>

          <div className="sn-comfort__rail" role="tablist" aria-label="Suite amenities">
            {comfort.amenities.map((amenity, index) => (
              <button
                key={amenity.id}
                type="button"
                role="tab"
                aria-selected={index === active}
                className={`sn-comfort__rail-btn${index === active ? " is-active" : ""}`}
                onClick={() => setActive(index)}
              >
                {amenity.label}
              </button>
            ))}
          </div>

          <p className="sn-body" key={current.id}>
            {current.body}
          </p>

          <div className="sn-actions">
            <Link
              href={SUITES_NATIVE_CTAS.viewSuiteDetails.href}
              className="sn-btn sn-btn--outline"
            >
              {SUITES_NATIVE_CTAS.viewSuiteDetails.label}
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
