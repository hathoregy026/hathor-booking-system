import { redirect } from "next/navigation";

/** The old checkout address, in Russian. */
export default function LegacyRussianCheckoutPage() {
  redirect("/ru/booking");
}
