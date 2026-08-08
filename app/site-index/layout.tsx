import { Footer } from "@/components/layout/Footer";

export default function SiteIndexLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {children}
      <Footer />
    </>
  );
}
