import { redirect } from "next/navigation";

/** The old booking entry address, in Italian. */
export default function LegacyItalianBookPage() {
  redirect("/it/booking");
}
