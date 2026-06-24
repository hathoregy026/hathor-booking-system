import { Inter } from "next/font/google";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-booking-sans",
  weight: ["300", "400", "500", "600", "700"],
});

export default function BookLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className={inter.variable}>{children}</div>;
}
