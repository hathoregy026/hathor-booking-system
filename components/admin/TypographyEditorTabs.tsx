"use client";

import { useState } from "react";
import { AmenitiesSequenceTypographyPanel } from "@/components/admin/AmenitiesSequenceTypographyPanel";
import { GastronomyTypographyPanel } from "@/components/admin/GastronomyTypographyPanel";
import { TypographyStylesPanel } from "@/components/admin/TypographyStylesPanel";

type TypographyEditor = "site" | "amenities" | "dining";

export function TypographyEditorTabs() {
  const [editor, setEditor] = useState<TypographyEditor>("site");

  return (
    <div className="typo-easy">
      <div
        className="typo-easy__row"
        role="tablist"
        aria-label="Typography editor"
      >
        <button
          type="button"
          role="tab"
          aria-selected={editor === "site"}
          className={`typo-stage__align-btn${editor === "site" ? " typo-stage__align-btn--on" : ""}`}
          onClick={() => setEditor("site")}
        >
          Site typography
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={editor === "amenities"}
          className={`typo-stage__align-btn${editor === "amenities" ? " typo-stage__align-btn--on" : ""}`}
          onClick={() => setEditor("amenities")}
        >
          Amenities sequence
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={editor === "dining"}
          className={`typo-stage__align-btn${editor === "dining" ? " typo-stage__align-btn--on" : ""}`}
          onClick={() => setEditor("dining")}
        >
          Dining typography
        </button>
      </div>
      {editor === "site" ? (
        <TypographyStylesPanel />
      ) : editor === "amenities" ? (
        <AmenitiesSequenceTypographyPanel />
      ) : (
        <GastronomyTypographyPanel />
      )}
    </div>
  );
}
