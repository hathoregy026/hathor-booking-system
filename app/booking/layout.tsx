import { Inter, Playfair_Display } from "next/font/google";
import { BookingPageLayout } from "@/components/booking/BookingPageLayout";

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

export default function BookingFlowLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className={`${playfair.variable} ${inter.variable}`}>
      <BookingPageLayout brandTitle="Hathor Dahabiya">{children}</BookingPageLayout>
    </div>
  );
}
