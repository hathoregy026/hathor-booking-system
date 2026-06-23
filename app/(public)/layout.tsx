import { DM_Sans, Playfair_Display } from "next/font/google";
import { PublicLayout } from "@/components/public/PublicLayout";
import "../public.css";

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-booking-serif",
  weight: ["400", "500", "600", "700"],
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-booking-sans",
  weight: ["400", "500", "600", "700"],
});

export default function PublicSiteLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className={`${playfair.variable} ${dmSans.variable}`}>
      <PublicLayout>{children}</PublicLayout>
    </div>
  );
}
