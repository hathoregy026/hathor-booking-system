import { redirect } from "next/navigation";
import { arrivedFromItalian } from "@/lib/i18n/arrived-from-italian";

export default async function LegacyCheckoutPage() {
  redirect((await arrivedFromItalian()) ? "/it/booking" : "/booking");
}
