import { BookingFlow } from "@/components/booking/BookingFlow";

export const metadata = {
  title: "Book Your Cruise | Hathor Dahabiya",
  description:
    "Select your cabin and complete your luxury Nile cruise reservation aboard Hathor Dahabiya.",
};

export default function BookingPage() {
  return <BookingFlow />;
}
