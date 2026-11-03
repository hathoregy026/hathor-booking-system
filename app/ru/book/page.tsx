import { redirect } from "next/navigation";

/** The old booking entry address, in Russian. */
export default function LegacyRussianBookPage() {
  redirect("/ru/booking");
}
