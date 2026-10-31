"use client";

import { LocaleErrorScreen } from "@/components/public/LocaleErrorScreen";
import "../../locale-not-found.css";

/** Any failure on a German page in the public site, inside the site chrome. */
export default function GermanPublicError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return <LocaleErrorScreen locale="de" digest={error.digest} reset={reset} />;
}
