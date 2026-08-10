"use client";

import { useRef } from "react";
import Link from "next/link";
import { useSuitesComfortTheatre } from "@/hooks/useSuitesComfortTheatre";
import {
  SUITES_NATIVE_CTAS,
  resolveSuitesImage,
  resolveSuitesNativeView,
} from "@/lib/suites-native-content";

type ComfortCopy = ReturnType<typeof resolveSuitesNativeView>["comfort"];

type Props = {
  images: Record<string, string>;
  comfort: ComfortCopy;
};

export function SuitesComfortExperience({ images, comfort }: Props) {
  const trackRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const layerRefs = useRef<(HTMLElement | null)[]>([]);
  const bodyRef = useRef<HTMLParagraphElement>(null);

  const { activeIndex, goToIndex } = useSuitesComfortTheatre({
    trackRef,
    stageRef,
    layerRefs,
    bodyRef,
    amenityCount: comfort.amenities.length,
  });

  const current = comfort.amenities[activeIndex] ?? comfort.amenities[0];

  return (
    <section
      ref={trackRef}
      className="sn-comfort"
      id="suites-comfort"
      aria-label="Suite comfort"
    >
      <div className="sn-comfort__track">
        <div ref={stageRef} className="sn-comfort__stage">
          <div className="sn-comfort__visual" aria-hidden="true">
            {comfort.amenities.map((amenity, index) => (
              <div
                key={amenity.id}
                className={`sn-comfort__layer${index === activeIndex ? " is-active" : ""}`}
                ref={(node) => {
                  layerRefs.current[index] = node;
                }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={resolveSuitesImage(images, amenity.imageSlot)}
                  alt=""
                  decoding="async"
                />
              </div>
            ))}
            <div className="sn-comfort__fog" />
          </div>

          <div className="sn-comfort__panel">
            <p className="sn-eyebrow">{comfort.eyebrow}</p>
            <h2 className="sn-display sn-display--section">{comfort.title}</h2>
            <p className="sn-body">{comfort.lead}</p>

            <div
              className="sn-comfort__rail"
              role="tablist"
              aria-label="Suite amenities"
            >
              {comfort.amenities.map((amenity, index) => (
                <button
                  key={amenity.id}
                  type="button"
                  role="tab"
                  aria-selected={index === activeIndex}
                  className={`sn-comfort__rail-btn${index === activeIndex ? " is-active" : ""}`}
                  onClick={() => goToIndex(index)}
                >
                  {amenity.label}
                </button>
              ))}
            </div>

            <p className="sn-body sn-comfort__body" ref={bodyRef} key={current.id}>
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
      </div>
    </section>
  );
}
