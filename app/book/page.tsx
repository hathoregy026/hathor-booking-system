import { BookingWizard } from "@/components/booking/BookingWizard";
import { BookingPageLayout } from "@/components/booking/BookingPageLayout";

export const metadata = {
  title: "Book Your Cruise | Hathor Dahabiya",
  description: "Reserve your luxury Nile cruise aboard Hathor Dahabiya.",
};

export default function BookPage() {
  return (
    <BookingPageLayout>
      <div className="booking-premium-intro">
        <p className="booking-premium-eyebrow">Ultra Luxury Dahabiya Cruise</p>
        <h1 className="booking-serif booking-premium-title">
          Reserve Your Nile Journey
        </h1>
        <p className="booking-premium-subtitle">
          Search sailings, choose your cabin, and secure your place on Egypt&apos;s
          most elegant river cruise.
        </p>
      </div>

      <BookingWizard />
    </BookingPageLayout>
  );
}
