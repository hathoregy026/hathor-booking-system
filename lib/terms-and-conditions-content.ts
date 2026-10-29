import { CUSTOM_DOMAIN_ORIGIN } from "@/lib/public-url";
/**
 * Hathor Terms & Conditions — single source for public copy and anchor IDs.
 * Update TERMS_LAST_UPDATED when legal approves a new effective date.
 */

/** Display date for hero and metadata — one field, not duplicated in markup. */
export const TERMS_LAST_UPDATED = "29 August 2026";
export const TERMS_LAST_UPDATED_ISO = "2026-08-29";

export const TERMS_CANONICAL_PATH = "/terms-and-conditions";

export const TERMS_PRODUCTION_URL = `${CUSTOM_DOMAIN_ORIGIN}${TERMS_CANONICAL_PATH}`;

export type TermsTocItem = {
  id: string;
  label: string;
};

export type TermsListItem = {
  emphasis?: string;
  text: string;
};

export type TermsSection = {
  id: string;
  number: number;
  title: string;
  paragraphs?: readonly string[];
  list?: readonly TermsListItem[];
  paragraphsAfterList?: readonly string[];
  /** Special inline blocks keyed for the page renderer. */
  variant?: "vat-note" | "contact";
};

export const TERMS_TOC: readonly TermsTocItem[] = [
  { id: "booking-payment", label: "Booking & Payment" },
  { id: "cancellation-refunds", label: "Cancellation, No-Show & Refunds" },
  { id: "children-policy", label: "Children" },
  { id: "pets-policy", label: "Pets" },
  { id: "inclusions", label: "Inclusions" },
  { id: "exclusions", label: "Exclusions" },
  { id: "taxes-service", label: "Taxes & Service Charges" },
  { id: "company-responsibility", label: "Company Responsibility" },
  { id: "health-medical-dietary", label: "Health, Medical & Dietary Disclosure" },
  { id: "weather-natural-events", label: "Weather Conditions & Natural Events" },
  {
    id: "government-regulations",
    label: "Governmental Regulations, Inspections & Authorities",
  },
  { id: "itinerary-changes", label: "Itinerary Changes & Operational Adjustments" },
  { id: "company-cancellations", label: "Company-Initiated Cancellations" },
  { id: "force-majeure", label: "Force Majeure" },
  { id: "guest-conduct", label: "Guest Conduct & Liability" },
  { id: "personal-property", label: "Personal Property" },
  { id: "limitation-liability", label: "Limitation of Liability" },
  { id: "governing-law", label: "Governing Law & Jurisdiction" },
  { id: "acceptance", label: "Acceptance of Terms" },
  { id: "contact", label: "Contact" },
] as const;

export const TERMS_INTRO = [
  "These Terms & Conditions set out the booking, payment, travel, onboard and guest policies that apply to journeys aboard Hathor Dahabiya.",
  "Hathor operates luxury Nile voyages between Luxor and Aswan, including private charter and shared-departure experiences. By confirming a booking, each guest acknowledges and agrees to be bound by the applicable Terms & Conditions set out below.",
] as const;

export const TERMS_SECTIONS: readonly TermsSection[] = [
  {
    id: "booking-payment",
    number: 1,
    title: "Booking & Payment",
    paragraphs: [
      "Bookings must be made in advance and are confirmed according to the following payment schedule:",
    ],
    list: [
      { emphasis: "30% of the total booking value is due upon confirmation.", text: "" },
      {
        emphasis:
          "By 60 days before embarkation, total payments must reach at least 50% of the total booking value.",
        text: "",
      },
      {
        emphasis: "The remaining 50% balance is due 45 days before embarkation.",
        text: "",
      },
    ],
    paragraphsAfterList: [
      "A booking is considered confirmed only when the required initial payment has been received and the reservation has been accepted by Hathor Dahabiya.",
      "Failure to complete the required payments by the applicable deadlines may result in cancellation of the reservation, subject to the cancellation terms below.",
    ],
  },
  {
    id: "cancellation-refunds",
    number: 2,
    title: "Cancellation, No-Show & Refunds",
    paragraphs: [
      "All cancellations must be submitted in writing.",
      "The following cancellation charges apply:",
    ],
    list: [
      {
        emphasis: "90 days or more before embarkation:",
        text: " no cancellation fee.",
      },
      {
        emphasis: "61 to 89 days before embarkation:",
        text: " 25% of the total booking value.",
      },
      {
        emphasis: "46 to 60 days before embarkation:",
        text: " 50% of the total booking value.",
      },
      {
        emphasis: "45 days or less before embarkation:",
        text: " 100% of the total booking value.",
      },
      {
        emphasis: "No-show or early departure:",
        text: " 100% of the total booking value.",
      },
    ],
    paragraphsAfterList: [
      "No refund shall be provided for meals, nights or other portions of the booked voyage that the guest chooses not to use after the journey has commenced.",
      "Where a refund is due under the cancellation schedule above, the amount refundable shall be calculated after applying the relevant cancellation charge to the total booking value.",
      "No cancellation charge applies if unavoidable and extraordinary circumstances at the destination or in its immediate vicinity, such as a closure of the Nile to navigation or a serious security situation, significantly affect the voyage. In that case Hathor Dahabiya refunds all payments made in full within 14 days, without further compensation.",
      "The guest may transfer the booking to another person who meets all the conditions of the voyage by informing Hathor Dahabiya in writing at least 7 days before embarkation. The original guest and the new guest are jointly responsible for any balance still due and for any reasonable additional costs of the transfer, which Hathor Dahabiya will state and justify.",
    ],
  },
  {
    id: "children-policy",
    number: 3,
    title: "Children Policy",
    paragraphs: ["Children are charged at the adult rate."],
  },
  {
    id: "pets-policy",
    number: 4,
    title: "Pets Policy",
    paragraphs: ["Pets are not allowed on board Hathor Dahabiya."],
  },
  {
    id: "inclusions",
    number: 5,
    title: "Inclusions",
    paragraphs: [
      "Unless otherwise stated in the confirmed itinerary or booking, the Hathor voyage package includes:",
    ],
    list: [
      {
        text: "Soft All-Inclusive service, which covers all meals and soft drinks (tea, coffee, soft drinks and fresh juices); alcoholic drinks are not included (see Exclusions).",
      },
      {
        text: "Three meals daily, beginning with lunch on the day of embarkation and ending with breakfast on the day of disembarkation.",
      },
      { text: "Tea, coffee, soft drinks and fresh juices." },
      { text: "Sightseeing tours included in the selected itinerary." },
      { text: "Transportation and transfers included in the selected package." },
      { text: "Applicable taxes and service charges." },
      { text: "Professional cruise staff." },
      {
        text: "One complimentary welcome Champagne drink for each cabin and suite, served once per stay.",
      },
    ],
  },
  {
    id: "exclusions",
    number: 6,
    title: "Exclusions",
    paragraphs: [
      "Unless specifically included in the confirmed itinerary or booking, the following are excluded:",
    ],
    list: [
      { text: "Optional excursions not included in the itinerary." },
      { text: "Personal expenses." },
      { text: "Gratuities." },
      {
        text: "Alcoholic beverages, whether local or international, except for the complimentary welcome Champagne served once per stay for each cabin and suite.",
      },
    ],
  },
  {
    id: "taxes-service",
    number: 7,
    title: "Taxes & Service Charges",
    paragraphs: [
      "The published Dahabiya price includes applicable taxes and service charges.",
    ],
    variant: "vat-note",
  },
  {
    id: "company-responsibility",
    number: 8,
    title: "Company Responsibility",
    paragraphs: [
      "Hathor Dahabiya is responsible for the performance of all travel services included in the confirmed booking, including transfers and sightseeing tours, whether they are provided by Hathor Dahabiya or by its partners.",
      "In particular, Hathor Dahabiya undertakes responsibility for:",
    ],
    list: [
      {
        text: "Providing food and beverages prepared in accordance with applicable health, hygiene and safety standards.",
      },
      {
        text: "Maintaining cleanliness and sanitation of cabins, common areas and onboard facilities.",
      },
      {
        text: "Operating the Dahabiya in compliance with applicable Egyptian maritime, tourism and health regulations.",
      },
    ],
    paragraphsAfterList: [
      "This responsibility does not extend to services that the guest arranges separately and that are not part of the confirmed booking.",
    ],
  },
  {
    id: "health-medical-dietary",
    number: 9,
    title: "Health, Medical & Dietary Disclosure",
    paragraphs: [
      "Guests are responsible for disclosing any medical conditions, allergies, dietary restrictions or special health requirements prior to departure.",
      "Hathor Dahabiya shall not be held liable for illness, injury or medical complications arising from:",
    ],
    list: [
      { text: "Undisclosed medical conditions." },
      { text: "Failure to follow safety instructions or crew guidance." },
    ],
    paragraphsAfterList: [
      "Hathor Dahabiya reserves the right to deny participation in activities or services where a guest's condition may pose a risk to themselves, other guests or crew members, without entitlement to refund or compensation.",
    ],
  },
  {
    id: "weather-natural-events",
    number: 10,
    title: "Weather Conditions & Natural Events",
    paragraphs: [
      "Adverse weather conditions, including but not limited to wind, fog, storms or Nile water-level variations, may cause delays, itinerary modifications, route changes or cancellations.",
      "Hathor Dahabiya does not pay compensation for disruption caused by such unavoidable and extraordinary circumstances. This does not affect the guest's rights to a price reduction or to cancel with a full refund, set out in sections 2, 12 and 13.",
    ],
  },
  {
    id: "government-regulations",
    number: 11,
    title: "Governmental Regulations, Inspections & Authorities",
    paragraphs: [
      "Delays, interruptions, route changes or cancellations may result from:",
    ],
    list: [
      { text: "Government-mandated inspections." },
      { text: "Security checks." },
      {
        text: "Decisions, restrictions or orders imposed by Egyptian governmental or regulatory authorities.",
      },
    ],
    paragraphsAfterList: [
      "Hathor Dahabiya does not pay compensation for such circumstances. This does not affect the guest's rights set out in sections 2, 12 and 13.",
    ],
  },
  {
    id: "itinerary-changes",
    number: 12,
    title: "Itinerary Changes & Operational Adjustments",
    paragraphs: [
      "Hathor Dahabiya may make minor changes to itineraries, schedules, docking locations or services when necessary for operational, navigational or safety reasons. Minor changes are not a breach of contract, and Hathor Dahabiya will inform the guest of them clearly and promptly.",
      "If Hathor Dahabiya has to change a main feature of the voyage significantly before departure, it will inform the guest without undue delay. The guest may accept the change or cancel the booking without a cancellation charge and receive a full refund of all payments made within 14 days.",
      "If a service included in the booking cannot be provided as agreed during the voyage, Hathor Dahabiya will offer, where possible, a substitute of comparable or higher quality at no extra cost. Where a service is not provided, or a substitute is of lower quality, the guest is entitled to an appropriate price reduction.",
      "Compensation beyond a price reduction is not due where the change or failure is caused by the guest, by a third party unconnected with the booked services, or by unavoidable and extraordinary circumstances.",
    ],
  },
  {
    id: "company-cancellations",
    number: 13,
    title: "Company-Initiated Cancellations",
    paragraphs: [
      "Hathor Dahabiya may cancel a voyage before departure in exceptional cases of force majeure or operational necessity.",
      "If Hathor Dahabiya cancels, the guest receives a full refund of all payments made within 14 days of the cancellation. If the guest prefers, Hathor Dahabiya can instead offer:",
    ],
    list: [
      { text: "A rescheduled departure date; or" },
      { text: "A credit voucher for a future voyage." },
    ],
    paragraphsAfterList: [
      "Where Hathor Dahabiya cancels for operational reasons rather than because of unavoidable and extraordinary circumstances, the guest may also be entitled to appropriate compensation.",
    ],
  },
  {
    id: "force-majeure",
    number: 14,
    title: "Force Majeure",
    paragraphs: [
      "Hathor Dahabiya shall not be liable for failure or delay in the performance of its obligations due to events beyond its reasonable control, including but not limited to:",
    ],
    list: [
      { text: "Acts of God." },
      { text: "Governmental actions or restrictions." },
      { text: "Epidemics or pandemics." },
      { text: "River navigation closures." },
      { text: "Security situations." },
      {
        text: "Other natural, environmental or operational circumstances outside the company's reasonable control.",
      },
    ],
    paragraphsAfterList: [
      "This does not affect the guest's rights to a refund or a price reduction under sections 2, 12 and 13.",
    ],
  },
  {
    id: "guest-conduct",
    number: 15,
    title: "Guest Conduct & Liability",
    paragraphs: [
      "Guests are required to comply with all onboard rules and to respect crew members, other guests and property.",
      "Any damage, loss or misconduct caused by a guest may be charged to the responsible party.",
      "Hathor Dahabiya reserves the right to terminate the journey of any guest whose behaviour is deemed unsafe, disruptive or inappropriate, without refund or compensation.",
    ],
  },
  {
    id: "personal-property",
    number: 16,
    title: "Personal Property",
    paragraphs: [
      "Hathor Dahabiya assumes no responsibility for the loss, theft or damage of personal belongings onboard or during excursions, except where liability cannot legally be excluded.",
      "Guests are advised to secure valuables at all times.",
    ],
  },
  {
    id: "limitation-liability",
    number: 17,
    title: "Limitation of Liability",
    paragraphs: [
      "Except for personal injury and damage caused intentionally or negligently, Hathor Dahabiya's liability is limited to three times the total price of the booking.",
      "To the fullest extent permitted by law, Hathor Dahabiya shall not be liable for indirect, incidental or consequential damages.",
    ],
  },
  {
    id: "governing-law",
    number: 18,
    title: "Governing Law & Jurisdiction",
    paragraphs: [
      "These Terms & Conditions shall be governed by and construed in accordance with the laws of the Arab Republic of Egypt.",
      "Any disputes shall be subject to the jurisdiction of the Egyptian courts.",
      "If the guest is a consumer resident in another country, this does not deprive the guest of the protection of the mandatory rules of the law of their country of residence, and the guest may also bring proceedings in the courts of that country.",
    ],
  },
  {
    id: "acceptance",
    number: 19,
    title: "Acceptance of Terms",
    paragraphs: [
      "By confirming a booking, the guest acknowledges, accepts and agrees to be bound by these Terms & Conditions.",
      "Where a reservation is made on behalf of more than one guest, the person making the reservation is responsible for ensuring that all members of the travelling party are made aware of the applicable Terms & Conditions.",
      "These Terms & Conditions are published in English and Italian. The Italian version is provided for convenience. If the two versions differ, the English version prevails, unless the law applicable to the booking requires otherwise.",
    ],
  },
  {
    id: "contact",
    number: 20,
    title: "Contact",
    paragraphs: [
      "For questions regarding a reservation or these Terms & Conditions, please contact Hathor Dahabiya.",
    ],
    variant: "contact",
  },
] as const;
