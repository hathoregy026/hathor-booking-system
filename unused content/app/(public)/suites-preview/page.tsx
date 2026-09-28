import type { Metadata } from "next";
import { SuitesNativeBoot } from "@/components/suites-native/SuitesNativeBoot";
import { SuitesNativePage } from "@/components/suites-native/SuitesNativePage";
import { SUITES_NATIVE_SLOT_DEFAULTS } from "@/lib/suites-native-content";
import { resolveSiteImageMap } from "@/lib/resolve-site-images";
import { SUITES_DASHBOARD_SLOT_NAMES } from "@/lib/site-image-usage";
import "../../suites-native.css";

export const metadata: Metadata = {
  title: "Suites Native Preview",
  description:
    "Internal preview of the native Suites rebuild. Production /suites is unchanged.",
  robots: {
    index: false,
    follow: false,
  },
};

export const dynamic = "force-dynamic";

async function loadSuitesImages(): Promise<Record<string, string>> {
  const images: Record<string, string> = { ...SUITES_NATIVE_SLOT_DEFAULTS };
  try {
    const map = await resolveSiteImageMap();
    for (const name of SUITES_DASHBOARD_SLOT_NAMES) {
      const resolved = map[name]?.src?.trim();
      if (resolved) images[name] = resolved;
    }
  } catch {
    /* keep defaults */
  }
  return images;
}

export default async function SuitesPreviewPage() {
  const images = await loadSuitesImages();

  return (
    <SuitesNativeBoot>
      <SuitesNativePage images={images} />
    </SuitesNativeBoot>
  );
}
