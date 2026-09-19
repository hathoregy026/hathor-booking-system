/** Line icons for the booking journey, drawn to one weight and sized by font. */

type IconProps = { className?: string };

function Svg({ children, className }: IconProps & { children: React.ReactNode }) {
  return (
    <svg className={`hj-icon${className ? ` ${className}` : ""}`} viewBox="0 0 24 24" aria-hidden focusable="false">
      {children}
    </svg>
  );
}

export function IconTemple(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M3 20h18M5 20V9m4 11V9m6 11V9m4 11V9M3 9h18L12 4 3 9Z" />
    </Svg>
  );
}

export function IconSail(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M3 18h18l-2 3H5l-2-3ZM12 16V3L5 16h7Zm0 0h6l-6-9" />
    </Svg>
  );
}

export function IconRoute(props: IconProps) {
  return (
    <Svg {...props}>
      <circle cx="6" cy="6" r="2.2" />
      <circle cx="18" cy="18" r="2.2" />
      <path d="M8 6h6a4 4 0 0 1 0 8h-4a4 4 0 0 0 0 8" />
    </Svg>
  );
}

export function IconCalendar(props: IconProps) {
  return (
    <Svg {...props}>
      <rect x="3.5" y="5" width="17" height="15" rx="2" />
      <path d="M3.5 10h17M8 3v4m8-4v4" />
    </Svg>
  );
}

export function IconGuests(props: IconProps) {
  return (
    <Svg {...props}>
      <circle cx="9" cy="8" r="3.2" />
      <path d="M3.5 20a5.5 5.5 0 0 1 11 0M16 5.5a3.2 3.2 0 0 1 0 6.4M17.5 20a5.6 5.6 0 0 0-2.2-4.4" />
    </Svg>
  );
}

export function IconBed(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M3 19v-9m0 4h18m0 5v-6a3 3 0 0 0-3-3H9v5" />
      <circle cx="6.5" cy="11.5" r="1.8" />
    </Svg>
  );
}

export function IconSize(props: IconProps) {
  return (
    <Svg {...props}>
      <rect x="4" y="4" width="16" height="16" rx="1.5" />
      <path d="M8 8h3M8 8v3m8 5h-3m3 0v-3" />
    </Svg>
  );
}

export function IconInfo(props: IconProps) {
  return (
    <Svg {...props}>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 11v5M12 8.2v.2" />
    </Svg>
  );
}

export function IconLock(props: IconProps) {
  return (
    <Svg {...props}>
      <rect x="5" y="10.5" width="14" height="9.5" rx="2" />
      <path d="M8.5 10.5V8a3.5 3.5 0 0 1 7 0v2.5" />
    </Svg>
  );
}

export function IconMail(props: IconProps) {
  return (
    <Svg {...props}>
      <rect x="3.5" y="5.5" width="17" height="13" rx="2" />
      <path d="m4 7 8 6 8-6" />
    </Svg>
  );
}

export function IconPrice(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M12 3v18M8 8.5c0-1.6 1.7-2.8 4-2.8s4 1.2 4 2.8-1.7 2.8-4 2.8-4 1.1-4 2.8 1.7 2.8 4 2.8 4-1.2 4-2.8" />
    </Svg>
  );
}

export function IconCard(props: IconProps) {
  return (
    <Svg {...props}>
      <rect x="3" y="6" width="18" height="12" rx="1.8" />
      <path d="M3 10h18" />
    </Svg>
  );
}

export function IconBank(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M4 10h16M6 10v8m4-8v8m4-8v8m4-8v8M3 18h18M12 4 3 9h18L12 4Z" />
    </Svg>
  );
}

export function IconPhone(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M7.5 3.8h9A1.7 1.7 0 0 1 18.2 5.5v13a1.7 1.7 0 0 1-1.7 1.7h-9A1.7 1.7 0 0 1 5.8 18.5v-13A1.7 1.7 0 0 1 7.5 3.8Z" />
      <path d="M10 17.2h4" />
    </Svg>
  );
}

export function IconAdult(props: IconProps) {
  return (
    <Svg {...props}>
      <circle cx="12" cy="6.2" r="2.7" />
      <path d="M6.5 20.5v-5.2a5.5 5.5 0 0 1 11 0v5.2" />
    </Svg>
  );
}

export function IconChild(props: IconProps) {
  return (
    <Svg {...props}>
      <circle cx="12" cy="9" r="2.2" />
      <path d="M8.2 20.5v-3.6a3.8 3.8 0 0 1 7.6 0v3.6" />
    </Svg>
  );
}

export function IconView(props: IconProps) {
  return (
    <Svg {...props}>
      <rect x="3.5" y="4.5" width="17" height="15" rx="1.5" />
      <path d="M3.5 15.5 9 11l4 3.2 2.6-2 4.9 3.8M15.5 8.6v.2" />
    </Svg>
  );
}

export function IconWifi(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M3.5 9.5a12.5 12.5 0 0 1 17 0M6.5 12.8a8 8 0 0 1 11 0M9.6 16a3.5 3.5 0 0 1 4.8 0" />
      <path d="M12 19.2v.1" />
    </Svg>
  );
}

export function IconBath(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M3.5 12h17v2.5a4.5 4.5 0 0 1-4.5 4.5H8a4.5 4.5 0 0 1-4.5-4.5V12ZM6 12V6.2A2.2 2.2 0 0 1 10.2 5M7.5 19l-1 2m10-2 1 2" />
    </Svg>
  );
}

export function IconLink(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1.2 1.2M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1.2-1.2" />
    </Svg>
  );
}

export function IconWand(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="m4 20 11-11m-2-2 2 2M17 3v3m-1.5-1.5h3M20 8v2m-1-1h2M8.5 4v2m-1-1h2" />
    </Svg>
  );
}

export function IconCheck(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="m5 12.5 4.2 4L19 7" />
    </Svg>
  );
}

export function IconChevron({ direction = "right", ...props }: IconProps & { direction?: "left" | "right" | "up" | "down" }) {
  const d = { right: "m9 5 7 7-7 7", left: "m15 5-7 7 7 7", up: "m5 15 7-7 7 7", down: "m5 9 7 7 7-7" }[direction];
  return (
    <Svg {...props}>
      <path d={d} />
    </Svg>
  );
}

export function IconClose(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M7 7l10 10M17 7 7 17" />
    </Svg>
  );
}
