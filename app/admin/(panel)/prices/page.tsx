import { requireAdminPage } from "@/lib/admin-server-auth";
import PageView from "./PageView";

export default async function Page() {
  await requireAdminPage("prices.view");
  return <PageView />;
}
