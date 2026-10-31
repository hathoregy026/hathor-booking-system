import type { Metadata } from "next";
import { ItalianNotFoundScreen } from "@/components/public/ItalianSystemScreens";
import { NOT_FOUND_METADATA_IT } from "@/lib/i18n/not-found-it";
import "../../it-not-found.css";

export const metadata: Metadata = NOT_FOUND_METADATA_IT;

/** Italian 404 for every /it address that has no page, inside the public site chrome. */
export default function ItalianNotFound() {
  return <ItalianNotFoundScreen />;
}
