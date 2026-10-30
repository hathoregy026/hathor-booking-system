import type { Metadata } from "next";
import { LocaleSuitesPage, localeSuitesMetadata } from "@/components/pages/locale/LocaleSuitesPage";

import "../../page-visibility.css";
import "../../site-coming-soon.css";
import "../../suites-normal-clone.css";

export function generateMetadata(): Promise<Metadata> {
  return localeSuitesMetadata("de");
}

export default function GermanSuitesPage() {
  return <LocaleSuitesPage locale="de" />;
}
