"use client";

import { useEffect, useState } from "react";
import { ManagedImage } from "@/components/ui/ManagedImage";
import type { SiteImageName } from "@/lib/site-image-slots";

type StackCardMediaProps = {
  imageName: SiteImageName;
  alt: string;
  index: number;
  previewAnchor?: boolean;
  pinTotal: number;
};

/**
 * Stack cards share one pinned viewport, so native lazy-load treats every
 * card as "in view". Only mount media once the section is near AND
 * `data-stack-unlock` reaches this index.
 */
export function StackCardMedia({
  imageName,
  alt,
  index,
  previewAnchor = false,
  pinTotal,
}: StackCardMediaProps) {
  const [near, setNear] = useState(false);
  const [unlock, setUnlock] = useState(-1);

  useEffect(() => {
    const section = document.querySelector(".ex-stack-scroll");
    if (!section) return;

    const readUnlock = () => {
      const raw = section.getAttribute("data-stack-unlock");
      const next = raw == null ? -1 : Number(raw);
      if (Number.isFinite(next)) setUnlock(next);
    };

    let observer: IntersectionObserver | null = null;
    if (typeof IntersectionObserver !== "undefined") {
      observer = new IntersectionObserver(
        ([entry]) => {
          if (!entry?.isIntersecting) return;
          setNear(true);
          if (!section.hasAttribute("data-stack-unlock")) {
            section.setAttribute("data-stack-unlock", "0");
          }
          readUnlock();
          observer?.disconnect();
          observer = null;
        },
        { rootMargin: "160px 0px", threshold: 0.01 },
      );
      observer.observe(section);
    } else {
      setNear(true);
      if (!section.hasAttribute("data-stack-unlock")) {
        section.setAttribute("data-stack-unlock", "0");
      }
      readUnlock();
    }

    const mutations = new MutationObserver(readUnlock);
    mutations.observe(section, {
      attributes: true,
      attributeFilter: ["data-stack-unlock"],
    });
    readUnlock();

    return () => {
      observer?.disconnect();
      mutations.disconnect();
    };
  }, []);

  const unlocked = near && unlock >= index;

  return (
    <div
      className="ex-stack-scroll__card-media"
      id={previewAnchor ? `site-image-${imageName}` : undefined}
      data-site-image={previewAnchor ? imageName : undefined}
      data-site-image-pin-index={String(index)}
      data-site-image-pin-total={String(pinTotal)}
    >
      {unlocked ? (
        <ManagedImage
          name={imageName}
          alt={alt}
          fill
          sizes="100vw"
          quality={78}
          unoptimized={false}
          loading={index === 0 ? "eager" : "lazy"}
          fetchPriority="low"
          className="object-cover object-center"
          previewAnchor={false}
        />
      ) : null}
    </div>
  );
}
