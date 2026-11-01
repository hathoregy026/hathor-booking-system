import { redirect } from "next/navigation";

/** The old checkout address, in German. */
export default function LegacyGermanCheckoutPage() {
  redirect("/de/booking");
}
