import type { CSSProperties, ReactNode } from "react";
import { Plus_Jakarta_Sans } from "next/font/google";

/*
 * The ship editor draws the homepage deck plan itself, so it loads the same
 * faces the public site gives it — otherwise its letters, labels and pop-ups
 * fall back to the dashboard's own font and no longer match the live section.
 */
const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-hathor-body",
  weight: ["400", "500", "600"],
});

export default function ShipExperienceLayout({ children }: { children: ReactNode }) {
  return (
    <div className={plusJakarta.variable} style={{ ["--font-hathor-display" as string]: '"Gamgote", Georgia, serif' } as CSSProperties}>
      {children}
    </div>
  );
}
