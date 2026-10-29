import { requireAdminPage } from "@/lib/admin-server-auth";
import { redirect } from "next/navigation";

export default async function AdminInventoryPage() {
  await requireAdminPage("cruises.view");
  redirect("/admin/cruises");
}