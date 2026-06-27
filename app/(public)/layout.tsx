import { Inter, Playfair_Display } from "next/font/google";
import { PublicLayout } from "@/components/public/PublicLayout";
import "../public.css";
import "../booking-modal.css";

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-booking-serif",
  weight: ["400", "500", "600", "700"],
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-booking-sans",
  weight: ["300", "400", "500", "600", "700"],
});

export default function PublicSiteLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className={`${playfair.variable} ${inter.variable}`}>
      <PublicLayout>{children}</PublicLayout>
    </div>
  );
}
