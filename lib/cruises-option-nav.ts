import type { NavLink } from "@/lib/public-nav";

export const CRUISES_OPTION_LINKS: NavLink[] = [
  {
    href: "/cruises",
    label: "Cruises (live)",
    description: "Current production cruises page",
  },
  {
    href: "/cruises/option-1",
    label: "Option 1 — Spa style",
    description: "Hero blinds + dome, content fades in below",
  },
  {
    href: "/cruises/option-2",
    label: "Option 2 — One elevator",
    description: "All content rides the cream sheet together",
  },
  {
    href: "/cruises/option-3",
    label: "Option 3 — Two layers",
    description: "Split animation layer + synced content layer",
  },
  {
    href: "/cruises/option-4",
    label: "Option 4 — Hybrid spa",
    description: "Venetian sticky rise + listings in normal flow (recommended)",
  },
];
