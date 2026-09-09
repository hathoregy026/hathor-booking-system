"use client";
import { useRef, useState, type ReactNode } from "react";
import { useHomeFourFlow } from "./useHomeFourFlow";

export function HomeFourExperience({ children }: { children: ReactNode }) {
  const root = useRef<HTMLDivElement>(null);
  const [staticView, setStaticView] = useState(false);
  useHomeFourFlow(root, staticView);
  return <div ref={root} className="home-four" data-h4-static={staticView}>
    <div className="h4-progress" aria-hidden="true"><i /></div>
    <div className="h4-reading-control"><button type="button" aria-pressed={staticView} onClick={() => setStaticView(!staticView)}>{staticView ? "Cinematic view" : "Read without motion"}</button></div>
    {children}
  </div>;
}
