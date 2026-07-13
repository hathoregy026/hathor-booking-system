import { redirect } from "next/navigation";

/** Scheduled voyages — canonical fleet page lives at /cruises. */
export default function CruisesListPage() {
  redirect("/cruises");
}
