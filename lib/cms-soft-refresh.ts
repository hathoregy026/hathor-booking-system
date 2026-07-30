/**
 * Opt-in CMS soft-refresh for admin preview only.
 * Normal visitors rely on ISR + revalidatePath after admin saves.
 */
export function shouldSoftRefreshCms(): boolean {
  if (typeof window === "undefined") return false;
  try {
    const params = new URLSearchParams(window.location.search);
    if (params.get("cmsRefresh") === "1") return true;
    if (params.get("logoTune") === "1") return true;
    return sessionStorage.getItem("hathor-cms-soft-refresh") === "1";
  } catch {
    return false;
  }
}
