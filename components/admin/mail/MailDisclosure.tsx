"use client";
import { useLayoutEffect, useRef, type ReactNode } from "react";

/** Keep desktop controls exposed; give phone users native, keyboard accessible disclosures. */
export function MailDisclosure({ title, children, tools = false, phoneOpen = false }: { title: string; children: ReactNode; tools?: boolean; phoneOpen?: boolean }) {
  const disclosure = useRef<HTMLDetailsElement>(null);
  useLayoutEffect(() => {
    const media = window.matchMedia("(max-width: 767px)");
    const update = () => { if (disclosure.current) disclosure.current.open = media.matches ? phoneOpen : true; };
    update(); media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, [phoneOpen]);
  return <details ref={disclosure} open className={tools ? "mail-tools" : "mail-template-part"}><summary>{title}</summary><div>{children}</div></details>;
}
