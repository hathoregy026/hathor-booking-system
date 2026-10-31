"use client";

import { ItalianErrorScreen } from "@/components/public/ItalianSystemScreens";
import "../../it-not-found.css";

/** Any failure on an Italian page in the public site, inside the site chrome. */
export default function ItalianPublicError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return <ItalianErrorScreen digest={error.digest} reset={reset} />;
}
