"use client";

import { useRef } from "react";
import { useSuitesNileTheatre } from "@/hooks/useSuitesNileTheatre";
import {
  resolveSuitesImage,
  resolveSuitesNativeView,
} from "@/lib/suites-native-content";

type NileCopy = ReturnType<typeof resolveSuitesNativeView>["nile"];

type Props = {
  images: Record<string, string>;
  nile: NileCopy;
};

export function SuitesNileStory({ images, nile }: Props) {
  const sectionRef = useRef<HTMLElement>(null);
  const titleRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLElement | null)[]>([]);

  useSuitesNileTheatre({ sectionRef, cardRefs, titleRef });

  return (
    <section
      ref={sectionRef}
      className="sn-section sn-section--cream sn-nile"
      id="suites-nile"
      aria-label="The Nile"
    >
      <div ref={titleRef} className="sn-nile__intro">
        <p className="sn-eyebrow">{nile.eyebrow}</p>
        <div className="sn-rule" style={{ marginInline: "auto" }} aria-hidden="true" />
        <h2 className="sn-display sn-display--section">{nile.title}</h2>
        <p className="sn-eyebrow" style={{ marginTop: "1rem" }}>
          {nile.subtitle}
        </p>
        <p className="sn-body" style={{ marginTop: "0.85rem" }}>
          {nile.body}
        </p>
      </div>
      <div className="sn-nile__grid">
        {nile.imageSlots.map((slot, index) => (
          <article
            key={slot}
            className="sn-nile__card"
            ref={(node) => {
              cardRefs.current[index] = node;
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={resolveSuitesImage(images, slot)}
              alt=""
              decoding="async"
            />
            <p>{nile.captions[index]}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
