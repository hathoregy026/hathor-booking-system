"use client";
import { createContext, useContext, useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { hasAdminPermission, type AdminRequirement } from "@/lib/admin-permissions";
export type AdminAccessSnapshot = {
  userId: string; displayName: string; isOwner: boolean; roleName: string | null; permissions: string[]; mailboxViewIds: string[]; mailboxSendIds: string[];
};
const empty: AdminAccessSnapshot = { userId: "", displayName: "", isOwner: false, roleName: null, permissions: [], mailboxViewIds: [], mailboxSendIds: [] };
const AccessContext = createContext(empty);
export const useAdminAccess = () => useContext(AccessContext);
export function useAdminPermission(requirement: AdminRequirement) {
  return hasAdminPermission(useAdminAccess(), requirement);
}
export function AdminAccessProvider({ initial, children }: { initial: AdminAccessSnapshot; children: React.ReactNode }) {
  const [access, setAccess] = useState(initial);
  const pathname = usePathname();
  useEffect(() => {
    const controller = new AbortController();
    let loading = false;
    const refresh = async () => {
      if (loading || document.visibilityState === "hidden") return;
      loading = true;
      try {
        const response = await fetch("/api/admin/access", { cache: "no-store", signal: controller.signal });
        if (response.status === 401) { window.location.replace("/admin/login"); return; }
        if (response.ok && !controller.signal.aborted) setAccess(await response.json());
      } catch { /* Server guards remain authoritative while offline. */ }
      finally { loading = false; }
    };
    void refresh();
    const timer = window.setInterval(refresh, 60_000);
    window.addEventListener("focus", refresh);
    return () => { controller.abort(); window.clearInterval(timer); window.removeEventListener("focus", refresh); };
  }, [pathname]);
  return <AccessContext.Provider value={access}>{children}</AccessContext.Provider>;
}
