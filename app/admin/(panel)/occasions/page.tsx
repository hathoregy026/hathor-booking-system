import { PartyPopper } from "lucide-react";
import { requireAdminPage } from "@/lib/admin-server-auth";
import { hasAdminPermission } from "@/lib/admin-permissions";
import { CmsPageHeader } from "@/components/admin/CmsPageHeader";
import { OccasionsPanel } from "@/components/admin/OccasionsPanel";

export default async function AdminOccasionsPage() {
  const identity = await requireAdminPage("website.view");
  return (
    <div className="mx-auto max-w-[100rem] space-y-6">
      <CmsPageHeader
        title="Occasions"
        description="Dress the public site for a date — New Year, Christmas, Ramadan, a guest country's national day — and it removes itself afterward."
        icon={PartyPopper}
      />
      <OccasionsPanel canManage={hasAdminPermission(identity, "website.manage")} />
    </div>
  );
}
