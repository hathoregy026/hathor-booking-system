import { permanentRedirect } from "next/navigation";

/** Former Home 3 edition now lives at `/`. */
export default function HomeThreeRedirect() {
  permanentRedirect("/");
}
