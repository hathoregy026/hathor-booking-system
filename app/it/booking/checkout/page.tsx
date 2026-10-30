import { redirect } from "next/navigation";

/** The old checkout address, in Italian. */
export default function LegacyItalianCheckoutPage() {
  redirect("/it/booking");
}
