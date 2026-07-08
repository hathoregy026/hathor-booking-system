import { Bodoni_Moda, Inter } from "next/font/google";
import type { ReactNode } from "react";
import "./highlights-gallery.css";

const bodoni = Bodoni_Moda({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--hg-display",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  weight: ["300", "400"],
  variable: "--hg-body",
  display: "swap",
});

export default function HighlightsLayout({ children }: { children: ReactNode }) {
  return (
    <div className={`${bodoni.variable} ${inter.variable}`}>{children}</div>
  );
}
