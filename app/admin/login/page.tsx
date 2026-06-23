import { Plus_Jakarta_Sans } from "next/font/google";
import { LoginForm } from "@/components/admin/LoginForm";

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
  const params = await searchParams;

  return (
    <div className={plusJakarta.variable}>
      <LoginForm redirectTo={params.from ?? "/admin"} />
    </div>
  );
}
