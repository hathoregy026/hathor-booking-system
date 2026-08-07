import { redirect } from "next/navigation";

/** Former mask-reveal prototype — now the live Cruises page. */
export default function MaskRevealRedirectPage() {
  redirect("/cruises");
}
