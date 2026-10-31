import { redirect } from "next/navigation";

/** The old booking entry address, in German. */
export default function LegacyGermanBookPage() {
  redirect("/de/booking");
}
