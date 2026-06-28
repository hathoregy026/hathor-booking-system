import type { Metadata } from "next";
import { ContactPageContent } from "@/components/pages/ContactPageContent";

export const metadata: Metadata = {
  title: "Contact Us | Hathor Dahabiya Nile Cruise Egypt",
  description:
    "Contact Hathor Dahabiya reservations — Cairo office, phone, email, and inquiry form. Daily 09:00–17:00, closed Fridays.",
  openGraph: {
    title: "Contact Hathor Dahabiya",
    description: "Reach our reservations team for cruise enquiries and personalized offers.",
  },
};

export default function ContactPage() {
  return <ContactPageContent />;
}
