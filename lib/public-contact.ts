/** Contact details from RAW_DATA.md — public site only. */
export const PUBLIC_CONTACT = {
  email: "reservations@hathorcruise.com",
  phone: "+201270496896",
  phoneDisplay: "+20 127 049 6896",
  whatsappUrl: "https://wa.me/201270496896",
  address:
    "One Kattamiya, Tower 211, Floor 11, Flat 111, Ring Road, Cairo, Egypt",
  workingHours: "Daily working hours: 09:00 – 17:00",
  dayOff: "Day off: Friday",
} as const;

export const PUBLIC_NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/cruises", label: "Cruises" },
  { href: "/wellness", label: "Wellness" },
  { href: "/gastronomy", label: "Gastronomy" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
] as const;
