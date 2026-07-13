import { redirect } from "next/navigation";

/** Legacy /ex URL — home now lives at /. */
export default function ExLegacyRedirect() {
  redirect("/");
}
