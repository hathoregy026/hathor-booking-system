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
