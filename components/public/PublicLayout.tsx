import { PublicFooter } from "@/components/public/PublicFooter";
import { PublicHeader } from "@/components/public/PublicHeader";
import { FloatingActions } from "@/components/public/FloatingActions";

type PublicLayoutProps = {
  children: React.ReactNode;
};

export function PublicLayout({ children }: PublicLayoutProps) {
  return (
    <div className="public-site">
      <PublicHeader />
      <main className="public-main public-main--with-fab public-wave-bg">{children}</main>
      <PublicFooter />
      <FloatingActions />
    </div>
  );
}
