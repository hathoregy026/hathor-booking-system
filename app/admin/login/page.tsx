import { Plus_Jakarta_Sans } from "next/font/google";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { LoginForm } from "@/components/admin/LoginForm";
import { ADMIN_SESSION_COOKIE, getAdminIdentity } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-admin",
  weight: ["400", "500", "600", "700"],
});

type AdminLoginPageProps = {
  searchParams: Promise<{ from?: string }>;
};

export default async function AdminLoginPage({
  searchParams,
}: AdminLoginPageProps) {
  // Already signed in (checked against the database, not just the cookie).
  const token = (await cookies()).get(ADMIN_SESSION_COOKIE)?.value;
  if (token && (await getAdminIdentity(token).catch(() => null))) {
    redirect("/admin");
  }

  const params = await searchParams;

  return (
    <div className={plusJakarta.variable}>
      <LoginForm redirectTo={params.from ?? "/admin"} />
    </div>
  );
}
