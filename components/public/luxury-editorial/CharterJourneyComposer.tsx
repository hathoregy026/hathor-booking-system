"use client";

import { useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ManagedImage } from "@/components/ui/ManagedImage";
import { LuxuryMedia } from "@/components/public/luxury-editorial/LuxuryMedia";

gsap.registerPlugin(ScrollTrigger);

export type ComposerStory = {
  id: string;
  title: string;
  body: string;
  imageSlot: string;
  imageAlt: string;
  objectPosition?: string;
};

type Props = {
  stories: ComposerStory[];
};

function setActiveIndex(root: HTMLElement, index: number) {
  root.querySelectorAll<HTMLElement>("[data-composer-story]").forEach((el) => {
    const on = Number(el.dataset.index) === index;
    el.toggleAttribute("data-active", on);
    if (on) el.setAttribute("aria-current", "true");
    else el.removeAttribute("aria-current");
  });
  root.querySelectorAll<HTMLElement>("[data-composer-slide]").forEach((el) => {
    el.toggleAttribute("data-active", Number(el.dataset.index) === index);
  });
}

export function CharterJourneyComposer({ stories }: Props) {
  const sectionRef = useRef<HTMLElement>(null);

  useLayoutEffect(() => {
    const root = sectionRef.current;
    if (!root || !stories.length) return;

    setActiveIndex(root, 0);

    const mm = gsap.matchMedia();
    mm.add("(min-width: 1025px)", () => {
      const trigger = ScrollTrigger.create({
        trigger: root,
        start: "top top",
        end: "bottom bottom",
        scrub: true,
        onUpdate: (self) => {
          const idx = Math.min(
            stories.length - 1,
            Math.floor(self.progress * stories.length),
          );
          setActiveIndex(root, idx);
        },
      });
      return () => trigger.kill();
    });

    return () => mm.revert();
  }, [stories.length]);

  if (!stories.length) return null;

  return (
    <section
      ref={sectionRef}
      className="charterComposer"
      aria-labelledby="charter-composer-heading"
    >
      <div
        className="charterComposer__runway"
        style={{ ["--composer-stories" as string]: stories.length }}
      >
        <div className="luxShell luxSection luxSection--compact">
          <p className="luxMeta">03 / JOURNEY COMPOSER</p>
          <h2
            id="charter-composer-heading"
            className="luxDisplay luxDisplay--md"
            style={{ maxWidth: "14ch", marginTop: "1rem" }}
          >
            <span className="luxLineMask">
              <span data-lux-line="">Privileges of</span>
            </span>
            <span className="luxLineMask">
              <span data-lux-line="">total possession</span>
            </span>
          </h2>
        </div>

        <div className="charterComposer__sticky">
          <div className="charterComposer__stage">
            <div className="charterComposer__panel">
              {stories.map((story, index) => (
                <button
                  key={story.id}
                  type="button"
                  className="charterComposer__story"
                  data-composer-story=""
                  data-index={index}
                  data-active={index === 0 ? "true" : "false"}
                  onClick={() => {
                    const root = sectionRef.current;
                    if (root) setActiveIndex(root, index);
                  }}
                >
                  <span className="charterComposer__num">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <p className="charterComposer__title">{story.title}</p>
                  <p className="charterComposer__body">{story.body}</p>
                </button>
              ))}
            </div>

            <div className="charterComposer__media" aria-live="polite">
              {stories.map((story, index) => (
                <div
                  key={story.id}
                  className="charterComposer__slide"
                  data-composer-slide=""
                  data-index={index}
                  data-active={index === 0 ? "true" : "false"}
                >
                  <ManagedImage
                    name={story.imageSlot}
                    alt={story.imageAlt}
                    fill
                    sizes="(max-width: 1024px) 100vw, 58vw"
                    className="object-cover"
                    previewAnchor={index === 0}
                    style={
                      story.objectPosition
                        ? { objectPosition: story.objectPosition }
                        : undefined
                    }
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="charterComposer__stack luxShell luxSection">
        {stories.map((story, index) => (
          <article key={story.id} id={`composer-${story.id}`}>
            <p className="luxMeta">
              {String(index + 1).padStart(2, "0")} /{" "}
              {String(stories.length).padStart(2, "0")}
            </p>
            <h3
              className="luxDisplay luxDisplay--md"
              style={{ fontSize: "clamp(2rem, 6vw, 3rem)", marginTop: "0.75rem" }}
            >
              {story.title}
            </h3>
            <p className="luxBody" style={{ marginBlock: "1rem 1.5rem" }}>
              {story.body}
            </p>
            <LuxuryMedia
              name={story.imageSlot}
              alt={story.imageAlt}
              sizes="100vw"
              className="luxMedia--3x4"
              objectPosition={story.objectPosition}
              previewAnchor={false}
            />
          </article>
        ))}
      </div>
    </section>
  );
}
