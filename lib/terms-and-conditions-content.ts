/**
 * Hathor Terms & Conditions — single source for public copy and anchor IDs.
 * Update TERMS_LAST_UPDATED when legal approves a new effective date.
 */

/** Display date for hero and metadata — one field, not duplicated in markup. */
export const TERMS_LAST_UPDATED = "29 August 2026";
export const TERMS_LAST_UPDATED_ISO = "2026-08-29";

export const TERMS_CANONICAL_PATH = "/terms-and-conditions";

export const TERMS_PRODUCTION_URL =
  "https://www.hathorcruise.com/terms-and-conditions";

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
          "By 60 days before embarkation, total payments must equal 50% of the total booking value.",
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
      "No refund shall be provided for unused meals, unused nights or other unused portions of the booked voyage after the journey has commenced.",
      "Where a refund is due under the cancellation schedule above, the amount refundable shall be calculated after applying the relevant cancellation charge to the total booking value.",
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
      { text: "Soft All-Inclusive service." },
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
    paragraphs: ["Hathor Dahabiya undertakes responsibility for:"],
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
      "This responsibility is limited to services provided onboard Hathor Dahabiya and does not extend to external factors beyond the company's reasonable control.",
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
      "Hathor Dahabiya shall bear no liability for delays, itinerary modifications, route changes or cancellations caused by adverse weather conditions, including but not limited to wind, fog, storms or Nile water-level variations.",
      "Any disruption resulting from natural or environmental circumstances classified as force majeure shall not constitute grounds for refunds, compensation or claims of any nature, except where required by applicable law.",
    ],
  },
  {
    id: "government-regulations",
    number: 11,
    title: "Governmental Regulations, Inspections & Authorities",
    paragraphs: [
      "Hathor Dahabiya shall not be responsible for delays, interruptions, route changes or cancellations resulting from:",
    ],
    list: [
      { text: "Government-mandated inspections." },
      { text: "Security checks." },
      {
        text: "Decisions, restrictions or orders imposed by Egyptian governmental or regulatory authorities.",
      },
    ],
    paragraphsAfterList: [
      "Such circumstances do not entitle guests to a refund, compensation or claim, except where required by applicable law.",
    ],
  },
  {
    id: "itinerary-changes",
    number: 12,
    title: "Itinerary Changes & Operational Adjustments",
    paragraphs: [
      "Hathor Dahabiya reserves the right to amend itineraries, schedules, docking locations or services when deemed necessary for operational, navigational or safety reasons.",
      "Substitute services or activities of comparable value may be provided at the company's discretion.",
      "Such amendments shall not be considered a breach of contract and do not warrant refunds or compensation, except where required by applicable law.",
    ],
  },
  {
    id: "company-cancellations",
    number: 13,
    title: "Company-Initiated Cancellations",
    paragraphs: [
      "In exceptional cases of force majeure or operational necessity, Hathor Dahabiya reserves the right to cancel the trip.",
      "The company may, at its sole discretion, offer:",
    ],
    list: [
      { text: "A rescheduled departure date; or" },
      { text: "A non-refundable credit voucher for future use." },
    ],
    paragraphsAfterList: [
      "Cash refunds are not guaranteed, except where required by applicable law.",
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
      "Hathor Dahabiya's liability is limited to the amount paid for the booked services, except where such limitation is prohibited by applicable law.",
      "To the fullest extent permitted by law, Hathor Dahabiya shall not be liable for indirect, incidental or consequential damages.",
    ],
  },
  {
    id: "governing-law",
    number: 18,
    title: "Governing Law & Jurisdiction",
    paragraphs: [
      "These Terms & Conditions shall be governed by and construed in accordance with the laws of the Arab Republic of Egypt.",
      "Any disputes shall be subject to the exclusive jurisdiction of the Egyptian courts, unless applicable law requires otherwise.",
    ],
  },
  {
    id: "acceptance",
    number: 19,
    title: "Acceptance of Terms",
    paragraphs: [
      "By confirming a booking, the guest acknowledges, accepts and agrees to be bound by these Terms & Conditions.",
      "Where a reservation is made on behalf of more than one guest, the person making the reservation is responsible for ensuring that all members of the travelling party are made aware of the applicable Terms & Conditions.",
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
