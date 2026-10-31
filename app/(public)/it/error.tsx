"use client";

import { LocaleErrorScreen } from "@/components/public/LocaleErrorScreen";
import "../../locale-not-found.css";

/** Any failure on a Italian page in the public site, inside the site chrome. */
export default function ItalianPublicError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return <LocaleErrorScreen locale="it" digest={error.digest} reset={reset} />;
}
