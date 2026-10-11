import { requireAdminPage } from "@/lib/admin-server-auth";
import { redirect } from "next/navigation";

export default async function AdminImagesPage() {
  await requireAdminPage("website.view");
  redirect("/admin/content#site-images");
}
