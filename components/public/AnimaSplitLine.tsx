"use client";

import type { CSSProperties } from "react";

type AnimaSplitLineProps = {
  children: string;
  /** Even lines rise from below; odd lines fall from above — Suites anima__title. */
  line?: number;
  className?: string;
};

/**
 * One clipped title line with per-character nodes for the Suites scroll rise.
 */
export function AnimaSplitLine({
  children,
  line = 0,
  className = "",
}: AnimaSplitLineProps) {
  const direction = line % 2 === 0 ? 1 : -1;
  const words = children.split(/(\s+)/);

  return (
    <span
      className={`anima-split-line ${className}`.trim()}
      aria-label={children}
      data-anima-line={line}
    >
      {words.map((token, wordIndex) => {
        if (!token) return null;
        if (/^\s+$/.test(token)) {
          return (
            <span key={`space-${wordIndex}`} aria-hidden="true">
              {"\u00a0"}
            </span>
          );
        }
        return (
          <span
            key={`${token}-${wordIndex}`}
            className="anima-split-word"
            aria-hidden="true"
          >
            {Array.from(token).map((character, charIndex) => (
              <span
                key={`${character}-${charIndex}`}
                className="anima-split-char"
                style={
                  {
                    "--char-index": charIndex,
                    "--char-direction": direction,
                  } as CSSProperties
                }
              >
                {character}
              </span>
            ))}
          </span>
        );
      })}
    </span>
  );
}
