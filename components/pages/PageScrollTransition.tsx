"use client";

import Link from "next/link";
import { useEffect, type ReactNode } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useSiteImage } from "@/components/public/SiteImagesProvider";

export type PageScrollTransitionProps = {
  title: string;
  subtitle?: string;
  breadcrumb: string;
  parentBreadcrumb?: { label: string; href: string };
  imageName: string;
  imageAlt?: string;
  variant?: "default" | "blog";
  children: ReactNode;
};

const PT_CREAM = "#ECE8DF";
const PT_GOLD = "#C9A96E";
const PT_NAV_NONE = "___pt-nav-none___";

let transitionScriptPromise: Promise<void> | null = null;

function loadTransitionScript(): Promise<void> {
  if (typeof window === "undefined") {
    return Promise.resolve();
  }

  if (window.TransitionForPages) {
    return Promise.resolve();
  }

  if (!transitionScriptPromise) {
    transitionScriptPromise = new Promise((resolve, reject) => {
      const existing = document.querySelector<HTMLScriptElement>(
        'script[data-transition-for-pages="true"]',
      );
      if (existing) {
        existing.addEventListener("load", () => resolve(), { once: true });
        existing.addEventListener("error", () => reject(new Error("Transition script failed")), {
          once: true,
        });
        return;
      }

      const script = document.createElement("script");
      script.src = "/js/transition-for-pages.js";
      script.async = true;
      script.dataset.transitionForPages = "true";
      script.onload = () => resolve();
      script.onerror = () => reject(new Error("Transition script failed"));
      document.body.appendChild(script);
    });
  }

  return transitionScriptPromise;
}

export function PageScrollTransition({
  title,
  subtitle,
  breadcrumb,
  parentBreadcrumb,
  imageName,
  imageAlt,
  variant = "default",
  children,
}: PageScrollTransitionProps) {
  const image = useSiteImage(imageName);

  useEffect(() => {
    let cancelled = false;

    document.body.classList.add("has-page-scroll-transition");
    document.body.style.backgroundColor = PT_CREAM;

    const boot = async () => {
      window.gsap = gsap;
      window.ScrollTrigger = ScrollTrigger;
      gsap.registerPlugin(ScrollTrigger);

      await loadTransitionScript();
      if (cancelled || !window.TransitionForPages) return;

      window.TransitionForPages.init({
        colors: { gold: PT_GOLD, cream: PT_CREAM },
        nav: PT_NAV_NONE,
        lenis: false,
      });
    };

    void boot();

    return () => {
      cancelled = true;
      window.TransitionForPages?.destroy();
      document.body.classList.remove("has-page-scroll-transition");
      document.body.style.backgroundColor = "";
    };
  }, [imageName, title]);

  return (
    <section
      data-page-transition
      className={`hathor-page-scroll-transition hathor-page-hero${
        variant === "blog" ? " hathor-page-hero--blog" : ""
      }`}
    >
      <div className="pt-stage">
        <div className="pt-hero">
          <div className="pt-hero__media">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={image.src}
              alt={imageAlt ?? image.alt}
              fetchPriority="high"
              decoding="async"
              onLoad={() => window.TransitionForPages?.refresh()}
            />
            <div className="pt-hero__overlay" aria-hidden />
          </div>
          <div className="pt-mask" aria-hidden="true" />
          <div className="pt-hero__copy">
            <div className="hathor-container hathor-page-hero__content">
              <nav className="hathor-breadcrumb" aria-label="Breadcrumb">
                <Link href="/">Home</Link>
                <span aria-hidden>/</span>
                {parentBreadcrumb ? (
                  <>
                    <Link href={parentBreadcrumb.href}>{parentBreadcrumb.label}</Link>
                    <span aria-hidden>/</span>
                  </>
                ) : null}
                <span aria-current="page">{breadcrumb}</span>
              </nav>
              <h1 className="hathor-page-hero__title">{title}</h1>
              {subtitle ? (
                <p className="hathor-page-hero__subtitle">{subtitle}</p>
              ) : null}
              <div className="hathor-gold-line" />
            </div>
          </div>
        </div>
        <div className="pt-sheet">{children}</div>
      </div>
    </section>
  );
}
